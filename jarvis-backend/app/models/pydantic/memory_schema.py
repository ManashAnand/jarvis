from pydantic import BaseModel
from typing import Literal,Optional


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
    metadata: Optional[dict] = None
    confidence: float