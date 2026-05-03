from fastapi import APIRouter ,Request
from fastapi.responses import StreamingResponse
from ..services.memory_services.embeddings_helper import search_similar,save_message
from ..services.prompt_builder import build_prompt
import json
import httpx
from ..config.settings import settings

router = APIRouter(tags=["stream-chat"])


@router.post('/chat-stream')
async def chat_stream(request: Request):
    body = await request.json()
    user_query = body["user_query"]
    
    
    memories = search_similar(user_query, top_k=3)
    
    
    prompt = build_prompt(user_query, memories)
    
    async def event_generator():
        async with httpx.AsyncClient(timeout=None) as Client:
            full_response = "" 
            
            async with Client.stream(
                "POST",
                settings.OLLAMA_URL,
                json={
                    "model": "llama3:8b",
                    "prompt": user_query,
                    "stream": True,
                },
            ) as response:
                async for line in response.aiter_lines():
                    if await request.is_disconnected():
                        break

                    if not line:
                        continue

                    data = json.loads(line)

                    if "response" in data:
                        token = data["response"]
                        full_response += token
                        
                        yield json.dumps({
                            "type": "token",
                            "content": data["response"]
                        }) + "\n"

                    if data.get("done"):
                        save_message("user", user_query)
                        save_message("assistant", full_response)
                        yield json.dumps({"type": "done"}) + "\n"
                        break
                    
                    
    return StreamingResponse(
        event_generator(),
        media_type="application/json",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        },
    )