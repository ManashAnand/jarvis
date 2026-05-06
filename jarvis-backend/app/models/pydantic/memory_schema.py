from pydantic import BaseModel
from typing import Literal


class MemoryFact(BaseModel):
    subject: str
    relation: str
    object: str
    type: Literal[
        "personal",
        "relationship",
        "project",
        "preference",
        "work",
        "skill"
    ]
    confidence: float