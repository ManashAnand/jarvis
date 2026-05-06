


import requests
import json

from ....config.settings import settings
from ....models.pydantic.memory_schema import MemoryFact
from pydantic import ValidationError

MEMORY_EXTRACTION_PROMPT = """
Extract durable long-term memory facts from the user message.

Rules:
- Only extract useful long-term facts.
- Ignore casual messages.
- Return ONLY valid JSON.
- Return an empty array [] if nothing important exists.

Valid types:
- personal
- relationship
- project
- preference
- work
- skill

JSON format:
[
  {
    "subject": "user",
    "relation": "works_at",
    "object": "Truffles.ai",
    "type": "work",
    "confidence": 0.95
  }
]

User Message:
"""


async def extract_memories(message: str):
    prompt = MEMORY_EXTRACTION_PROMPT + f"""
    Extract durable memory facts.

    Return ONLY valid JSON array.

    Message:
    {message}
    """

    response = requests.post(
        settings.OLLAMA_URL,
        json={
            "model": "llama3:8b",
            "prompt": prompt,
            "stream": False
        }
    )

    data = response.json()

    raw_response = (
        data["response"]
        .replace("```json", "")
        .replace("```", "")
        .strip()
    )
    print("RAW MEMORY RESPONSE:")
    print(raw_response)
    
    try:
        start = raw_response.find("[")
        end = raw_response.rfind("]") + 1

        json_part = raw_response[start:end]

        parsed = json.loads(json_part)

        validated_memories = []

        for item in parsed:
            memory = MemoryFact(**item)
            validated_memories.append(memory.dict())

        return validated_memories

    except json.JSONDecodeError as e:
        print("JSON ERROR:", e)
        return []

    except ValidationError as e:
        print("VALIDATION ERROR:", e)
        return []