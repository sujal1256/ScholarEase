#!/usr/bin/env python3
import sys
import json
from pypdf import PdfReader


def parse_pdf(file_path):
    """
    Parse PDF and extract text per page with position information.

    Returns JSON array with elements: {page_number, content, position}
    """
    try:
        reader = PdfReader(file_path)
        sections = []

        for page_num, page in enumerate(reader.pages, start=1):
            # Extract text from page
            text = page.extract_text()

            if text and text.strip():
                sections.append({
                    "page_number": page_num,
                    "content": text.strip(),
                    "position": page_num - 1  # 0-indexed position
                })

        # Output as JSON to stdout so Rails can capture it
        print(json.dumps(sections))

    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: pdf_parser.py <file_path>"}), file=sys.stderr)
        sys.exit(1)

    parse_pdf(sys.argv[1])
