from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import router
from dotenv import load_dotenv
from .db_config import init_db
from contextlib import asynccontextmanager
from .services.helper import clear_audio_files
from .services.memory_services.embeddings_helper import save_message,get_recent_messages
from .services.memory_services.embeddings_helper import search_similar

load_dotenv()


@asynccontextmanager
async def lifespan(app:FastAPI):
    print("🚀 HELLO MANASH - App Starting")
    init_db() 
    clear_audio_files()
    
    yield 

    print("🛑 GOODBYE MANASH - App Closing")

app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    
)
app.include_router(router)

@app.get("/health")
def health():
    return {"health": "I'm perfectly fine sir!"}


@app.get("/test-db")
def test_db():
    save_message("user", "hello jarvis") 
    save_message("user", "I like FastAPI")
    save_message("user", "I use React")
    save_message("user", "I work with Node.js")
    return get_recent_messages()


@app.get("/search")
def search(q: str):
    return search_similar(q)