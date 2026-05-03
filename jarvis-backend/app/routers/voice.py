import shutil

from fastapi import APIRouter,UploadFile,File
from fastapi.responses import FileResponse

from ..services.voice_services.stt import speech_to_text
from ..services.voice_services.llm import call_llm
from ..services.voice_services.tts import text_to_speech
from ..services.memory_services.embeddings_helper import search_similar
from ..services.prompt_builder import build_prompt
from ..config.settings import settings

router = APIRouter(tags=["sync voice"])

    
    
@router.post("/voice")
async def voice_chat(file: UploadFile = File(...)):
    with open(settings.input_path_voice, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    user_text = speech_to_text(settings.input_path_voice)
    
    print("User:", user_text)


    return {"user_text": user_text}


@router.post("/tts")
async def tts(data: dict):
    text = data["text"]
    
    if not text or len(text.strip()) < 5:
        return {"error": "Text too short for TTS"}

    text_to_speech(text, settings.output_path_voice)

    return FileResponse(settings.output_path_voice, media_type="audio/wav")