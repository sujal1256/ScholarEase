import json
import logging
import os
import sys
import threading
import time
import textwrap
from datetime import datetime, timedelta
from enum import Enum
from typing import Callable, Optional

import langextract as lx
from google import genai

# Log structured JSON to stderr so Ruby captures it cleanly
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
    RECOVERY_TIMEOUT = 60  # seconds before allowing one probe through

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
    BACKOFF_BASE = 1.0  # seconds; doubles each attempt: 1, 2, 4, 8, 16

    # Class-level so breakers persist across instances within the same process
    _breakers: dict[str, CircuitBreaker] = {}
    _breakers_lock = threading.Lock()

    # Shared prompt and examples — defined once, reused every call
    PROMPT = textwrap.dedent("""
        You are an academic tutor. Explain the following section of a research paper
        in simple, everyday English. Use analogies to explain complex jargon.
        Keep the explanation grounded strictly in the provided text.
    """).strip()

    EXAMPLES = [
        lx.data.ExampleData(
            text="The model utilizes a multi-head attention mechanism to weigh input importance.",
            extractions=[
                lx.data.Extraction(
                    extraction_class="explanation",
                    extraction_text=(
                        "Imagine a group of experts looking at a sentence. Each expert (head) "
                        "focuses on a different part — one looks at grammar, another at meaning. "
                        "They then combine their notes to understand the whole sentence better."
                    ),
                )
            ],
        )
    ]

    def __init__(self):
        raw = os.getenv("GEMINI_API_KEY", "")
        self.api_key = raw.encode("ascii", errors="ignore").decode("ascii").strip()
        if not self.api_key:
            raise LLMError("GEMINI_API_KEY is not set", retryable=False)

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
        """
        Explain text using the primary provider (langextract + gemini-2.5-flash),
        falling back to a direct Gemini call on exhausted retries or open circuit.
        """
        t0 = time.monotonic()
        primary = self._breaker("gemini-langextract")
        fallback = self._breaker("gemini-direct")

        if primary.is_available():
            try:
                result, attempts = self._with_retry(self._primary, text, provider="gemini-langextract")
                primary.record_success()
                _log("llm_success", provider="gemini-langextract",
                     latency_s=round(time.monotonic() - t0, 3), retries=attempts)
                return result
            except LLMError as exc:
                primary.record_failure()
                if not exc.retryable:
                    raise
                _log("primary_exhausted", error=str(exc)[:300], switching_to="gemini-direct")
        else:
            _log("circuit_open_skip", provider="gemini-langextract")

        if fallback.is_available():
            try:
                result, attempts = self._with_retry(self._fallback, text, provider="gemini-direct")
                fallback.record_success()
                _log("llm_success", provider="gemini-direct",
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
    # Providers
    # ------------------------------------------------------------------

    def _primary(self, text: str) -> str:
        """langextract structured extraction via gemini-2.5-flash."""
        try:
            result = lx.extract(
                text_or_documents=text,
                prompt_description=self.PROMPT,
                examples=self.EXAMPLES,
                model_id="gemini-2.5-flash",
                api_key=self.api_key,
            )
            if not result.extractions:
                raise LLMError("langextract returned no extractions", retryable=False)
            return result.extractions[0].extraction_text
        except LLMError:
            raise
        except Exception as exc:
            raise LLMError(str(exc), retryable=_is_retryable(exc)) from exc

    def _fallback(self, text: str) -> str:
        """Direct google-genai call via gemini-1.5-flash — bypasses langextract overhead."""
        try:
            client = genai.Client(api_key=self.api_key)
            full_prompt = f"{self.PROMPT}\n\nText:\n{text}"
            response = client.models.generate_content(
                model="gemini-1.5-flash",
                contents=full_prompt,
            )
            output = (response.text or "").strip()
            if not output:
                raise LLMError("Fallback returned empty response", retryable=False)
            return output
        except LLMError:
            raise
        except Exception as exc:
            raise LLMError(str(exc), retryable=_is_retryable(exc)) from exc

    def _direct_generate(self, prompt: str, model: str = "gemini-2.5-flash") -> str:
        """Raw generate_content call — used when we own the full prompt."""
        try:
            client = genai.Client(api_key=self.api_key)
            response = client.models.generate_content(model=model, contents=prompt)
            output = (response.text or "").strip()
            if not output:
                raise LLMError("Empty response from model", retryable=False)
            return output
        except LLMError:
            raise
        except Exception as exc:
            raise LLMError(str(exc), retryable=_is_retryable(exc)) from exc

    # ------------------------------------------------------------------
    # Selection explain — custom prompt, direct API (no langextract)
    # ------------------------------------------------------------------

    _SELECTION_PROMPT = textwrap.dedent("""
        You are an academic reading assistant. Explain the selected text in simple, clear terms.

        Selected text:
        "{selected_text}"

        Context from the document:
        "{context}"

        Instructions:
        - Use the context to improve your explanation
        - Write for a curious non-expert — no jargon unless you immediately define it
        - Do not invent facts beyond what the context contains
        - Add one short real-world analogy or example if it helps clarity
        - Keep the response under 150 words
    """).strip()

    def explain_selection(self, selected_text: str, context: str) -> str:
        """Explain a user-selected text snippet using surrounding document context."""
        if not selected_text.strip():
            raise LLMError("Selected text is empty", retryable=False)

        prompt = self._SELECTION_PROMPT.format(
            selected_text=selected_text.strip(),
            context=context.strip(),
        )

        t0 = time.monotonic()
        primary = self._breaker("gemini-direct-selection")
        fallback = self._breaker("gemini-direct-selection-fallback")

        if primary.is_available():
            try:
                result, attempts = self._with_retry(
                    lambda p: self._direct_generate(p, model="gemini-2.5-flash"),
                    prompt, provider="gemini-direct-selection",
                )
                primary.record_success()
                _log("llm_success", provider="gemini-direct-selection",
                     latency_s=round(time.monotonic() - t0, 3), retries=attempts)
                return result
            except LLMError as exc:
                primary.record_failure()
                if not exc.retryable:
                    raise
                _log("primary_exhausted", error=str(exc)[:300], switching_to="gemini-direct-selection-fallback")

        if fallback.is_available():
            try:
                result, attempts = self._with_retry(
                    lambda p: self._direct_generate(p, model="gemini-1.5-flash"),
                    prompt, provider="gemini-direct-selection-fallback",
                )
                fallback.record_success()
                _log("llm_success", provider="gemini-direct-selection-fallback",
                     latency_s=round(time.monotonic() - t0, 3), retries=attempts)
                return result
            except LLMError as exc:
                fallback.record_failure()
                raise LLMError(f"Selection explain failed: {exc}", retryable=exc.retryable) from exc

        raise LLMError("All providers unavailable — circuit breakers open", retryable=True)
