import json
import requests

from pydantic import ValidationError

from ....config.settings import settings
from ....core.logger import logger
from ....models.pydantic.memory_schema import MemoryFact

MEMORY_EXTRACTION_PROMPT = """
You are a memory extraction system.

Extract durable long-term memory facts from the user message.

RULES:
- Return ONLY valid JSON.
- No markdown.
- No explanations.
- No extra text.
- Return [] if nothing important exists.

Only extract:
- long-term facts
- preferences
- relationships
- work info
- project info
- skills

Valid types:
- personal
- relationship
- project
- preference
- work
- skill

Allowed relations:
- works_at
- girlfriend
- boyfriend
- spouse
- uses
- prefers
- lives_in
- name
- studies_at
- works_with
- studied_at

Metadata rules:
- Extract extra contextual attributes into metadata.
- metadata must always be an object.
- Examples:
  - duration
  - since
  - timeframe
  - location
  - role

Valid JSON format:

[
  {
    "subject": "user",
    "relation": "works_at",
    "object": "Truffles.ai",

    "metadata": {
      "duration": "2 years"
    },

    "type": "work",
    "confidence": 0.95
  }
]

EXAMPLES:

User:
I work at Truffles.ai from past 2 years

Output:
[
  {
    "subject": "user",
    "relation": "works_at",
    "object": "Truffles.ai",

    "metadata": {
      "duration": "2 years"
    },

    "type": "work",
    "confidence": 0.95
  }
]

User:
My girlfriend is Aditi

Output:
[
  {
    "subject": "user",
    "relation": "girlfriend",
    "object": "Aditi",

    "metadata": {},

    "type": "relationship",
    "confidence": 0.95
  }
]

User:
I prefer pnpm over npm

Output:
[
  {
    "subject": "user",
    "relation": "prefers",
    "object": "pnpm",

    "metadata": {
      "over": "npm"
    },

    "type": "preference",
    "confidence": 0.91
  }
]
"""


async def extract_memories(message: str):

    logger.info(f"Starting memory extraction | " f"Message: {message}")

    prompt = MEMORY_EXTRACTION_PROMPT + f"""

User:
{message}

Output:
"""

    response = requests.post(
        settings.OLLAMA_URL,
        json={"model": "llama3:8b", "prompt": prompt, "stream": False},
    )

    data = response.json()

    raw_response = data["response"].replace("```json", "").replace("```", "").strip()

    logger.info(f"RAW MEMORY RESPONSE: {raw_response}")

    try:

        start = raw_response.find("[")
        end = raw_response.rfind("]") + 1

        json_part = raw_response[start:end]

        parsed = json.loads(json_part)

        validated_memories = []

        for item in parsed:

            if "metadata" not in item:
                item["metadata"] = {}

            memory = MemoryFact(**item)

            validated_memories.append(memory.dict())

        logger.info(
            f"Extracted {len(validated_memories)} memories | "
            f"Preview: {validated_memories[-2:]}"
        )

        return validated_memories

    except json.JSONDecodeError:

        logger.exception("Memory extraction JSON parsing failed")

        return []

    except ValidationError:

        logger.exception("Memory extraction validation failed")

        return []

    except Exception:

        logger.exception("Unexpected memory extraction error")

        return []
