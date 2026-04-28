from fastapi import APIRouter
from ..config.settings import settings
import requests

router = APIRouter(tags=["chat"])

@router.post('/chat')
async def chat(query:dict):
    msg = query["message"]
    
    response = response = requests.post(
        settings.OLLAMA_URL,
        json={
            "model": "llama3:8b",
            "prompt": msg,
            "stream": False
        }
    )     
    
    data = response.json()
    return {
        "response": data["response"]
    }
    