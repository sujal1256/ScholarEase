import sys
import textwrap
import langextract as lx
import os

api_key =  os.getenv("GEMINI_API_KEY")

def explain(text):
    prompt = textwrap.dedent("""
        You are an academic tutor. Explain the following section of a research paper 
        in simple, everyday English. Use analogies to explain complex jargon.
        Keep the explanation grounded strictly in the provided text.
    """)

    # LangExtract loves examples (Few-Shot) to stay "on rails"
    examples = [
        lx.data.ExampleData(
            text="The model utilizes a multi-head attention mechanism to weigh input importance.",
            extractions=[
                lx.data.Extraction(
                    extraction_class="explanation",
                    extraction_text="Imagine a group of experts looking at a sentence. Each expert (head) focuses on a different part—one looks at grammar, another at meaning. They then combine their notes to understand the whole sentence better."
                )
            ]
        )
    ]

    result = lx.extract(
        text_or_documents=text,
        prompt_description=prompt,
        examples=examples,
        model_id="gemini-2.5-flash", # Best free-tier option
        api_key=api_key
    )

    if result.extractions:
        # Output only the text so Ruby can capture it
        print(result.extractions[0].extraction_text)

if __name__ == "__main__":
    if len(sys.argv) > 1:
        explain(sys.argv[1])