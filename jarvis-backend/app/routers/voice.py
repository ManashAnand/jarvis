from fastapi import APIRouter,UploadFile,File
import tempfile, os, subprocess, uuid
from ..services.voice_services.stt import speech_to_text
from ..services.voice_services.llm import call_llm
from ..services.voice_services.tts import text_to_speech
from fastapi.responses import FileResponse

router = APIRouter(tags=["sync voice"])

def convert_webm_to_wav(src: str, dst: str):
    # safer than os.system
    subprocess.run(
        ["ffmpeg", "-y", "-i", src, "-ar", "16000", "-ac", "1", dst],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL
    )
    
    
@router.post("/voice")
async def voice_chat(file: UploadFile = File(...)):
    uid = str(uuid.uuid4())
    
    webm_path = f"/tmp/{uid}.webm"
    wav_path = f"/tmp/{uid}.wav"
    out_wav = f"/tmp/{uid}_out.wav"
    
    with open(webm_path,"wb") as f:
        f.write(await file.read())
        
    convert_webm_to_wav(webm_path, wav_path)
    
    user_text = speech_to_text(wav_path)
    print("User:", user_text)
    
    prompt = f"You are a helpful voice assistant.\nUser: {user_text}\nAssistant:"
    response_text = call_llm(prompt)
    print("Bot:", response_text)
    
    
    text_to_speech(response_text, out_wav)
    
    
    return FileResponse(out_wav, media_type="audio/wav")
