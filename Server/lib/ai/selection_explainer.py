import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from llm_client import LLMClient, LLMError

MAX_SELECTED_TEXT = 2000
MAX_CONTEXT = 3000


def _validate(selected_text: str, context: str) -> str | None:
    if not selected_text or not selected_text.strip():
        return "selected_text is empty"
    if len(selected_text) > MAX_SELECTED_TEXT:
        return f"selected_text exceeds {MAX_SELECTED_TEXT} characters"
    return None


if __name__ == "__main__":
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError) as exc:
        print(json.dumps({"error": f"Invalid JSON input: {exc}", "retryable": False}), file=sys.stderr)
        sys.exit(1)

    selected_text = (data.get("selected_text") or "").strip()
    context = (data.get("context") or "").strip()[:MAX_CONTEXT]

    err = _validate(selected_text, context)
    if err:
        print(json.dumps({"error": err, "retryable": False}), file=sys.stderr)
        sys.exit(1)

    try:
        client = LLMClient()
        explanation = client.explain_selection(selected_text, context)
        print(json.dumps({
            "explanation": explanation,
            "selected_text": selected_text,
            "context_used": context[:300] + ("..." if len(context) > 300 else ""),
        }))
    except LLMError as exc:
        print(json.dumps({"error": str(exc), "retryable": exc.retryable}), file=sys.stderr)
        sys.exit(1)
    except Exception as exc:
        print(json.dumps({"error": str(exc), "retryable": False}), file=sys.stderr)
        sys.exit(1)
