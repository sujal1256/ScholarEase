import json
import logging
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

from llm_client import LLMClient, LLMError

logger = logging.getLogger("explainer")


def explain(text: str) -> dict:
    """
    Generate an explanation for the given text and convert it to audio.
    Returns {"text": str, "audio_path": str | None}
    """
    client = LLMClient()
    explanation = client.explain(text)

    audio_relative_path = None
    try:
        import tts
        abs_path = tts.generate_audio(explanation)
        # Store path relative to public/ so Rails can build the URL easily
        audio_relative_path = "audio/" + os.path.basename(abs_path)
    except Exception as exc:
        # TTS failure is non-fatal — explanation is still saved
        logger.warning(json.dumps({"event": "tts_failed", "error": str(exc)[:300]}))

    return {"text": explanation, "audio_path": audio_relative_path}


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: explainer.py <text>"}), file=sys.stderr)
        sys.exit(1)

    try:
        result = explain(sys.argv[1])
        print(json.dumps(result))
    except LLMError as exc:
        print(json.dumps({"error": str(exc), "retryable": exc.retryable}), file=sys.stderr)
        sys.exit(1)
    except Exception as exc:
        print(json.dumps({"error": str(exc), "retryable": False}), file=sys.stderr)
        sys.exit(1)
