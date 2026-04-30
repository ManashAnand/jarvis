import shutil
import base64

from fastapi import APIRouter,UploadFile,File
from fastapi.responses import JSONResponse

from ..services.voice_services.stt import speech_to_text
from ..services.voice_services.llm import call_llm
from ..services.voice_services.tts import text_to_speech
from ..config.settings import settings

router = APIRouter(tags=["sync voice"])

    
    
@router.post("/voice")
async def voice_chat(file: UploadFile = File(...)):
    with open(settings.input_path_voice, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
        user_text = speech_to_text(settings.input_path_voice)
        print("User:", user_text)

        response_text = call_llm(user_text)
        print("Bot:", response_text)

        # TTS
        text_to_speech(response_text, settings.output_path_voice)
        
        with open(settings.output_path_voice, "rb") as f:
            audio_bytes = f.read()

        audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")

        return JSONResponse({
            "user_text": user_text,
            "response_text": response_text,
            "audio": audio_base64
        })