import requests
from ...config.settings import settings

def call_llm(prompt: str) -> str:
    res = requests.post(
        settings.OLLAMA_URL,
        json={
            "model": "llama3",
            "prompt": prompt,
            "stream": False
        },
        timeout=120
    )
    res.raise_for_status()
    return res.json()["response"].strip()