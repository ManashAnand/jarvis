from fastapi import APIRouter
from ..config.settings import settings
import requests
from fastapi import UploadFile, File
import requests
import base64


router = APIRouter(tags=["test-apis"])


@router.post("/chat")
async def chat(query: dict):
    msg = query["message"]

    response = requests.post(
        settings.OLLAMA_URL, json={"model": "llama3:8b", "prompt": msg, "stream": False}
    )

    data = response.json()
    return {"response": data["response"]}




OLLAMA_URL = "http://localhost:11434/api/generate"


@router.post("/vision/analyze")
async def analyze_image(file: UploadFile = File(...)):

    image_bytes = await file.read()

    image_base64 = base64.b64encode(image_bytes).decode("utf-8")

    prompt = """
        Analyze this image.

        Return:
        - main subject
        - UI elements
        - errors if any
        - important text
        - short summary
        """

    payload = {
        "model": "minicpm-v",
        "prompt": prompt,
        "images": [image_base64],
        "stream": False,
    }

    response = requests.post(OLLAMA_URL, json=payload)

    return response.json()
