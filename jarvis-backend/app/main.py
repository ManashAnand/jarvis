from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import router
from dotenv import load_dotenv
from .db_config import init_db
from contextlib import asynccontextmanager
from .services.helper import clear_audio_files

load_dotenv()


@asynccontextmanager
async def lifespan(app:FastAPI):
    print("--------------------------")
    print("🚀 HELLO MANASH - App Starting")
    print("--------------------------")
    db_connection = init_db() 
    app.state.db = db_connection
    clear_audio_files()
    
    yield 
    if hasattr(app.state, 'db'):
        app.state.db.close()
    print("--------------------------")
    print("🛑 GOODBYE MANASH - App Closing")
    print("--------------------------")

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
