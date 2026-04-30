"""
Standalone audio-generation script.
Reads text from stdin, writes {"audio_path": "audio/xxx.m4a"} to stdout.
Used by the audio:backfill rake task and AudioRetryJob.
"""
import json
import os
import sys

sys.path.insert(0, os.path.dirname(__file__))

import tts

def main():
    text = sys.stdin.read().strip()
    if not text:
        print(json.dumps({"error": "empty input"}))
        sys.exit(1)

    try:
        abs_path = tts.generate_audio(text)
        relative = "audio/" + os.path.basename(abs_path)
        print(json.dumps({"audio_path": relative}))
    except Exception as exc:
        print(json.dumps({"error": str(exc)}))
        sys.exit(1)

if __name__ == "__main__":
    main()
