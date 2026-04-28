import os
from dotenv import load_dotenv


load_dotenv()


class Settings():
    def __init__(self):
        self.OLLAMA_URL: str = os.getenv("OLLAMA_URL")    
    

settings = Settings()

# print(settings.OLLAMA_URL)