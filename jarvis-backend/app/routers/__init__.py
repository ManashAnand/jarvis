from fastapi import APIRouter
from .chat import router as ChatApiRouter
from .chat_stream import router as ChatStreamRouter
from .voice import router as VoiceRouter

router = APIRouter()
router.include_router(ChatStreamRouter)
router.include_router(ChatApiRouter)
router.include_router(VoiceRouter)