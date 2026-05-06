from fastapi import APIRouter ,Request
from fastapi.responses import StreamingResponse
from ..services.memory_services.embeddings_helper import search_similar,save_message
from ..services.memory_services.memory_manager import add_to_short_term
from ..services.prompt_builder import build_prompt
from ..services.memory_services.memory_helper.importance_filter import should_save_memory
from ..services.memory_services.memory_helper.structural_memory import extract_memories
from ..services.memory_services.memory_helper.facts_store import save_fact
from ..services.memory_services.memory_helper.facts_retriever import get_all_facts

import asyncio

from ..services.memory_services.memory_pipeline import process_memory

import json
import httpx
from ..config.settings import settings

router = APIRouter(tags=["stream-chat"])


@router.post('/chat-stream')
async def chat_stream(request: Request):
    body = await request.json()
    user_query = body["user_query"]
    
    memories = search_similar(user_query, top_k=3)
    facts = get_all_facts()
    print(facts)
    
    
    prompt = build_prompt(
    user_query,
    memories,
    facts
)
    
    async def event_generator():
        async with httpx.AsyncClient(timeout=None) as Client:
            full_response = "" 
            
            async with Client.stream(
                "POST",
                settings.OLLAMA_URL,
                json={
                    "model": "llama3:8b",
                    "prompt": user_query + prompt,
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
                        
                        add_to_short_term("user", user_query)
                        add_to_short_term("assistant", full_response)
                        asyncio.create_task(
                                process_memory(user_query)
                            )
                        
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