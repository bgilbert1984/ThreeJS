# claude_integration.py
import anthropic
import os

client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))

def get_claude_response(prompt):
    message = client.messages.create(
        model="claude-3-7-sonnet-20250219",
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}],
    )
    return message.content

if __name__ == "__main__":
    prompt = "Suggest optimizations for processing QuestDB timeseries data for a Three.js visualization."
    response = get_claude_response(prompt)
    print("Claude Response:", response)
