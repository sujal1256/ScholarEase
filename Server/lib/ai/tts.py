import hashlib
import json
import logging
import os
import re
import subprocess
import sys
import tempfile
from pathlib import Path

logger = logging.getLogger("tts")

# Stored in Rails public/ so they're served as static files automatically
AUDIO_DIR = Path(__file__).resolve().parents[2] / "public" / "audio"
MAX_CHUNK_CHARS = 4500


def _ensure_dir() -> None:
    AUDIO_DIR.mkdir(parents=True, exist_ok=True)


def _text_hash(text: str) -> str:
    return hashlib.sha256(text.encode("utf-8")).hexdigest()[:20]


def _split_chunks(text: str) -> list[str]:
    """Split at sentence boundaries, keeping each chunk under MAX_CHUNK_CHARS."""
    sentences = re.split(r"(?<=[.!?])\s+", text.strip())
    chunks, current = [], ""
    for sentence in sentences:
        if len(sentence) > MAX_CHUNK_CHARS:
            # Sentence itself is too long — split by words
            if current:
                chunks.append(current.strip())
                current = ""
            words = sentence.split()
            word_buf = ""
            for word in words:
                if len(word_buf) + len(word) + 1 > MAX_CHUNK_CHARS:
                    chunks.append(word_buf.strip())
                    word_buf = word + " "
                else:
                    word_buf += word + " "
            current = word_buf
        elif len(current) + len(sentence) + 1 > MAX_CHUNK_CHARS:
            chunks.append(current.strip())
            current = sentence + " "
        else:
            current += sentence + " "
    if current.strip():
        chunks.append(current.strip())
    return chunks or [text]


def _aiff_to_m4a(aiff_path: str, m4a_path: str) -> None:
    """Convert AIFF to M4A/AAC using macOS built-in afconvert."""
    result = subprocess.run(
        ["afconvert", "-f", "m4af", "-d", "aac", aiff_path, m4a_path],
        capture_output=True, text=True,
    )
    if result.returncode != 0:
        raise RuntimeError(f"afconvert failed: {result.stderr.strip()}")


def generate_audio(text: str, output_path: str = None) -> str:
    """
    Convert text to speech and save as M4A audio file.

    Returns the absolute path to the generated file.
    Cached by SHA-256 of the text — safe to call repeatedly.
    """
    text = (text or "").strip()
    if not text:
        raise ValueError("Cannot generate audio: text is empty")

    _ensure_dir()

    text_hash = _text_hash(text)
    if output_path is None:
        output_path = str(AUDIO_DIR / f"{text_hash}.m4a")

    # Cache hit — skip regeneration
    if os.path.exists(output_path) and os.path.getsize(output_path) > 0:
        return output_path

    import pyttsx3

    engine = pyttsx3.init()
    engine.setProperty("rate", 150)    # words per minute — comfortable for academic content
    engine.setProperty("volume", 1.0)

    chunks = _split_chunks(text)

    with tempfile.TemporaryDirectory() as tmpdir:
        aiff_files = []

        # Generate one AIFF per chunk
        for i, chunk in enumerate(chunks):
            aiff_path = os.path.join(tmpdir, f"chunk_{i:04d}.aiff")
            engine.save_to_file(chunk, aiff_path)
            aiff_files.append(aiff_path)

        engine.runAndWait()

        valid_aiffs = [f for f in aiff_files if os.path.exists(f) and os.path.getsize(f) > 0]
        if not valid_aiffs:
            raise RuntimeError("pyttsx3 produced no audio output — check TTS engine availability")

        if len(valid_aiffs) == 1:
            _aiff_to_m4a(valid_aiffs[0], output_path)
        else:
            # Concatenate chunks: convert each to raw PCM CAF, then join, then to M4A
            caf_files = []
            for i, aiff in enumerate(valid_aiffs):
                caf_path = os.path.join(tmpdir, f"chunk_{i:04d}.caf")
                subprocess.run(
                    ["afconvert", "-f", "caff", "-d", "LEI16@22050", aiff, caf_path],
                    check=True, capture_output=True,
                )
                caf_files.append(caf_path)

            # Use afconvert to join CAF files via a list (afconvert supports input lists)
            joined_caf = os.path.join(tmpdir, "joined.caf")
            cat_cmd = ["afconvert", "-f", "caff", "-d", "LEI16@22050"]
            # afconvert doesn't natively concatenate — use raw PCM cat approach
            raw_files = []
            for i, caf in enumerate(caf_files):
                raw_path = os.path.join(tmpdir, f"chunk_{i:04d}.raw")
                subprocess.run(
                    ["afconvert", "-f", "WAVE", "-d", "LEI16@22050", caf, raw_path],
                    check=True, capture_output=True,
                )
                raw_files.append(raw_path)

            # Concatenate raw PCM bytes (same sample rate / channels — safe to concat)
            concat_raw = os.path.join(tmpdir, "concat.raw")
            with open(concat_raw, "wb") as out:
                for raw in raw_files:
                    with open(raw, "rb") as inp:
                        out.write(inp.read())

            # Wrap concatenated PCM in a WAV container so afconvert can read it
            import wave, struct
            concat_wav = os.path.join(tmpdir, "concat.wav")
            sample_rate = 22050
            num_channels = 1
            sample_width = 2  # 16-bit
            with open(concat_raw, "rb") as raw_in:
                pcm_data = raw_in.read()
            with wave.open(concat_wav, "wb") as wf:
                wf.setnchannels(num_channels)
                wf.setsampwidth(sample_width)
                wf.setframerate(sample_rate)
                wf.writeframes(pcm_data)

            _aiff_to_m4a(concat_wav, output_path)

    if not os.path.exists(output_path) or os.path.getsize(output_path) == 0:
        raise RuntimeError(f"Audio file was not created at {output_path}")

    return output_path
