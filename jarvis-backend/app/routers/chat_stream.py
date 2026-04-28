from fastapi import APIRouter ,Request
from fastapi.responses import StreamingResponse
import json
import httpx
from ..config.settings import settings

router = APIRouter(tags=["stream-chat"])


@router.post('/chat-stream')
async def chat_stream(request: Request):
    body = await request.json()
    user_query = body["user_query"]
    async def event_generator():
        async with httpx.AsyncClient(timeout=None) as Client:
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
                        yield json.dumps({
                            "type": "token",
                            "content": data["response"]
                        }) + "\n"

                    if data.get("done"):
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