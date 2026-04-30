import json
import logging
import os
import sys
import threading
import time
import textwrap
from datetime import datetime
from enum import Enum
from typing import Callable, Optional

from openai import OpenAI

_handler = logging.StreamHandler(sys.stderr)
_handler.setFormatter(logging.Formatter("%(message)s"))
logger = logging.getLogger("llm_client")
logger.setLevel(logging.INFO)
logger.addHandler(_handler)
logger.propagate = False

RETRYABLE_SIGNALS = (
    "503", "unavailable", "rate limit", "rate_limit",
    "timeout", "overloaded", "quota", "resourceexhausted",
    "connection", "reset by peer", "eof occurred",
)


def _is_retryable(exc: Exception) -> bool:
    msg = str(exc).lower()
    return any(s in msg for s in RETRYABLE_SIGNALS)


def _log(event: str, **kwargs):
    logger.info(json.dumps({"event": event, "ts": datetime.utcnow().isoformat(), **kwargs}))


class LLMError(Exception):
    def __init__(self, message: str, retryable: bool = False):
        super().__init__(message)
        self.retryable = retryable


# ---------------------------------------------------------------------------
# Circuit breaker
# ---------------------------------------------------------------------------

class _State(Enum):
    CLOSED = "closed"
    OPEN = "open"
    HALF_OPEN = "half_open"


class CircuitBreaker:
    FAILURE_THRESHOLD = 5
    RECOVERY_TIMEOUT = 60

    def __init__(self, name: str):
        self.name = name
        self._state = _State.CLOSED
        self._failures = 0
        self._opened_at: Optional[datetime] = None
        self._lock = threading.Lock()

    @property
    def state(self) -> _State:
        with self._lock:
            if self._state == _State.OPEN and self._opened_at:
                elapsed = (datetime.now() - self._opened_at).total_seconds()
                if elapsed >= self.RECOVERY_TIMEOUT:
                    self._state = _State.HALF_OPEN
            return self._state

    def is_available(self) -> bool:
        return self.state in (_State.CLOSED, _State.HALF_OPEN)

    def record_success(self):
        with self._lock:
            if self._state != _State.CLOSED:
                _log("circuit_closed", provider=self.name)
            self._failures = 0
            self._state = _State.CLOSED

    def record_failure(self):
        with self._lock:
            self._failures += 1
            self._opened_at = datetime.now()
            if self._failures >= self.FAILURE_THRESHOLD and self._state != _State.OPEN:
                self._state = _State.OPEN
                _log("circuit_open", provider=self.name, failures=self._failures)


# ---------------------------------------------------------------------------
# LLM client
# ---------------------------------------------------------------------------

class LLMClient:
    MAX_RETRIES = 5
    BACKOFF_BASE = 1.0

    _breakers: dict[str, CircuitBreaker] = {}
    _breakers_lock = threading.Lock()

    SYSTEM_PROMPT = textwrap.dedent("""
        You are an academic tutor. Explain the following section of a research paper
        in simple, everyday English. Use analogies to explain complex jargon.
        Keep the explanation grounded strictly in the provided text.
        Respond with only the explanation text, nothing else.
    """).strip()

    # Few-shot examples included as conversation turns
    EXAMPLES = [
        (
            "The model utilizes a multi-head attention mechanism to weigh input importance.",
            "Imagine a group of experts looking at a sentence. Each expert (head) focuses on a "
            "different part — one looks at grammar, another at meaning. They then combine their "
            "notes to understand the whole sentence better.",
        )
    ]

    def __init__(self):
        api_key = os.getenv("OPENAI_API_KEY", "").strip()
        if not api_key:
            raise LLMError("OPENAI_API_KEY is not set", retryable=False)
        self.client = OpenAI(api_key=api_key)

    @classmethod
    def _breaker(cls, name: str) -> CircuitBreaker:
        with cls._breakers_lock:
            if name not in cls._breakers:
                cls._breakers[name] = CircuitBreaker(name)
            return cls._breakers[name]

    # ------------------------------------------------------------------
    # Public API
    # ------------------------------------------------------------------

    def explain(self, text: str) -> str:
        t0 = time.monotonic()
        primary = self._breaker("openai-gpt-4o-mini")
        fallback = self._breaker("openai-gpt-3.5-turbo")

        if primary.is_available():
            try:
                result, attempts = self._with_retry(
                    lambda t: self._chat(t, model="gpt-4o-mini"),
                    text, provider="openai-gpt-4o-mini",
                )
                primary.record_success()
                _log("llm_success", provider="openai-gpt-4o-mini",
                     latency_s=round(time.monotonic() - t0, 3), retries=attempts)
                return result
            except LLMError as exc:
                primary.record_failure()
                if not exc.retryable:
                    raise
                _log("primary_exhausted", error=str(exc)[:300], switching_to="openai-gpt-3.5-turbo")
        else:
            _log("circuit_open_skip", provider="openai-gpt-4o-mini")

        if fallback.is_available():
            try:
                result, attempts = self._with_retry(
                    lambda t: self._chat(t, model="gpt-3.5-turbo"),
                    text, provider="openai-gpt-3.5-turbo",
                )
                fallback.record_success()
                _log("llm_success", provider="openai-gpt-3.5-turbo",
                     latency_s=round(time.monotonic() - t0, 3), retries=attempts)
                return result
            except LLMError as exc:
                fallback.record_failure()
                raise LLMError(f"All providers failed. Last error: {exc}", retryable=exc.retryable) from exc

        raise LLMError("All providers unavailable — circuit breakers open", retryable=True)

    # ------------------------------------------------------------------
    # Retry wrapper
    # ------------------------------------------------------------------

    def _with_retry(self, fn: Callable[[str], str], text: str, provider: str) -> tuple[str, int]:
        last_exc: Optional[LLMError] = None
        for attempt in range(self.MAX_RETRIES + 1):
            try:
                return fn(text), attempt
            except LLMError as exc:
                last_exc = exc
                if not exc.retryable or attempt == self.MAX_RETRIES:
                    raise
                wait = self.BACKOFF_BASE * (2 ** attempt)
                _log("retry", provider=provider, attempt=attempt + 1,
                     max=self.MAX_RETRIES, wait_s=wait, reason=str(exc)[:300])
                time.sleep(wait)
        assert last_exc is not None
        raise last_exc

    # ------------------------------------------------------------------
    # Core chat methods
    # ------------------------------------------------------------------

    def _chat(self, text: str, model: str = "gpt-4o-mini") -> str:
        """Chat with few-shot examples — used for section explanation."""
        try:
            messages = [{"role": "system", "content": self.SYSTEM_PROMPT}]
            for user_ex, assistant_ex in self.EXAMPLES:
                messages.append({"role": "user", "content": user_ex})
                messages.append({"role": "assistant", "content": assistant_ex})
            messages.append({"role": "user", "content": text})

            response = self.client.chat.completions.create(
                model=model,
                messages=messages,
                temperature=0.3,
            )
            output = (response.choices[0].message.content or "").strip()
            if not output:
                raise LLMError("Empty response from model", retryable=False)
            return output
        except LLMError:
            raise
        except Exception as exc:
            raise LLMError(str(exc), retryable=_is_retryable(exc)) from exc

    def _chat_raw(self, user_message: str, system: str, model: str = "gpt-4o-mini") -> str:
        """Simple single-turn chat with a custom system prompt."""
        try:
            response = self.client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": user_message},
                ],
                temperature=0.3,
            )
            output = (response.choices[0].message.content or "").strip()
            if not output:
                raise LLMError("Empty response from model", retryable=False)
            return output
        except LLMError:
            raise
        except Exception as exc:
            raise LLMError(str(exc), retryable=_is_retryable(exc)) from exc

    # ------------------------------------------------------------------
    # Selection explain
    # ------------------------------------------------------------------

    _SELECTION_PROMPT = textwrap.dedent("""
        You are an academic reading assistant. Explain the selected text in simple, clear terms.

        Instructions:
        - Use the context to improve your explanation
        - Write for a curious non-expert — no jargon unless you immediately define it
        - Do not invent facts beyond what the context contains
        - Add one short real-world analogy or example if it helps clarity
        - Keep the response under 150 words
    """).strip()

    def explain_selection(self, selected_text: str, context: str) -> str:
        if not selected_text.strip():
            raise LLMError("Selected text is empty", retryable=False)

        user_message = (
            f"Selected text:\n\"{selected_text.strip()}\"\n\n"
            f"Context from the document:\n\"{context.strip()}\""
        )

        t0 = time.monotonic()
        primary = self._breaker("openai-selection-primary")
        fallback = self._breaker("openai-selection-fallback")

        if primary.is_available():
            try:
                result, attempts = self._with_retry(
                    lambda t: self._chat_raw(t, system=self._SELECTION_PROMPT, model="gpt-4o-mini"),
                    user_message, provider="openai-selection-primary",
                )
                primary.record_success()
                _log("llm_success", provider="openai-selection-primary",
                     latency_s=round(time.monotonic() - t0, 3), retries=attempts)
                return result
            except LLMError as exc:
                primary.record_failure()
                if not exc.retryable:
                    raise
                _log("primary_exhausted", error=str(exc)[:300], switching_to="openai-selection-fallback")

        if fallback.is_available():
            try:
                result, attempts = self._with_retry(
                    lambda t: self._chat_raw(t, system=self._SELECTION_PROMPT, model="gpt-3.5-turbo"),
                    user_message, provider="openai-selection-fallback",
                )
                fallback.record_success()
                _log("llm_success", provider="openai-selection-fallback",
                     latency_s=round(time.monotonic() - t0, 3), retries=attempts)
                return result
            except LLMError as exc:
                fallback.record_failure()
                raise LLMError(f"Selection explain failed: {exc}", retryable=exc.retryable) from exc

        raise LLMError("All providers unavailable — circuit breakers open", retryable=True)
