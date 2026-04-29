from TTS.api import TTS

tts = TTS(model_name="tts_models/en/ljspeech/tacotron2-DDC")

def text_to_speech(text: str,output_path: str):
    tts.tts_to_file(text=text,file_path=output_path)