import os
import time
from dotenv import load_dotenv


load_dotenv()

timestamp = int(time.time())


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

class Settings():
    def __init__(self):
        self.OLLAMA_URL: str = os.getenv("OLLAMA_URL")   
        self.input_dir = os.path.join(BASE_DIR, "input-audio-files")
        os.makedirs(self.input_dir, exist_ok=True)

        self.output_dir = os.path.join(BASE_DIR, "output-audio-files")
        os.makedirs(self.output_dir, exist_ok=True)

        
        self.input_path_voice = os.path.join(self.input_dir, f"input_{timestamp}.wav")
        self.output_path_voice = os.path.join(self.output_dir, f"output_{timestamp}.wav")


settings = Settings()

print(f"Ollama url is {settings.OLLAMA_URL}")
