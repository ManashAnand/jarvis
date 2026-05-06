from fastapi import APIRouter ,Request
from fastapi.responses import StreamingResponse
from ..services.memory_services.embeddings_helper import search_similar
from ..services.memory_services.memory_manager import add_to_short_term
from ..services.prompt_builder import build_prompt
from ..services.memory_services.memory_helper.facts_retriever import get_all_facts
from app.core.logger import logger
from app.core.logging_utils import smart_preview


import asyncio

from ..services.memory_services.memory_pipeline import process_memory

import json
import httpx
from ..config.settings import settings

router = APIRouter(tags=["stream-chat"])


@router.post("/chat-stream")
async def chat_stream(request: Request):

    logger.info("New /chat-stream request received")

    try:

        body = await request.json()

        logger.info(
            f"Request Body Preview: "
            f"{smart_preview(body)}"
        )

        user_query = body["user_query"]

        logger.info(
            f"User Query: "
            f"{smart_preview(user_query)}"
        )

        logger.info(
            "Searching semantic memories"
        )

        memories = search_similar(
            user_query,
            top_k=3
        )

        logger.info(
            f"Retrieved {len(memories)} semantic memories | "
            f"Preview: {smart_preview(memories)}"
        )

        logger.info(
            "Fetching structured facts"
        )

        facts = get_all_facts()

        logger.info(
            f"Retrieved {len(facts)} structured facts | "
            f"Preview: {smart_preview(facts)}"
        )

        logger.info(
            "Building prompt"
        )

        prompt = build_prompt(
            user_query,
            memories,
            facts
        )

        logger.info(
            f"Prompt built successfully | "
            f"Length: {len(prompt)} chars | "
            f"Preview: {smart_preview(prompt)}"
        )

        async def event_generator():

            logger.info(
                "Starting streaming pipeline"
            )

            async with httpx.AsyncClient(
                timeout=None
            ) as client:

                full_response = ""

                try:

                    async with client.stream(
                        "POST",
                        settings.OLLAMA_URL,
                        json={
                            "model": "llama3:8b",
                            "prompt": prompt,
                            "stream": True,
                        },
                    ) as response:

                        logger.info(
                            "Connected to Ollama stream"
                        )

                        async for line in response.aiter_lines():

                            if await request.is_disconnected():

                                logger.warning(
                                    "Client disconnected"
                                )

                                break

                            if not line:
                                continue

                            data = json.loads(line)

                            if "response" in data:

                                token = data["response"]

                                full_response += token

                                yield json.dumps({
                                    "type": "token",
                                    "content": token
                                }) + "\n"

                            if data.get("done"):

                                logger.info(
                                    "Streaming completed"
                                )

                                logger.info(
                                    f"Final Response Length: "
                                    f"{len(full_response)} chars"
                                )

                                logger.info(
                                    f"Final Response Preview: "
                                    f"{smart_preview(full_response)}"
                                )

                                logger.info(
                                    "Updating short-term memory"
                                )

                                add_to_short_term(
                                    "user",
                                    user_query
                                )

                                add_to_short_term(
                                    "assistant",
                                    full_response
                                )

                                logger.info(
                                    "Short-term memory updated"
                                )

                                logger.info(
                                    "Scheduling background memory pipeline"
                                )

                                asyncio.create_task(
                                    process_memory(user_query)
                                )

                                logger.info(
                                    f"Memory pipeline scheduled | "
                                    f"Query Preview: "
                                    f"{smart_preview(user_query)}"
                                )

                                yield json.dumps({
                                    "type": "done"
                                }) + "\n"

                                break

                except Exception:

                    logger.exception(
                        "Streaming pipeline crashed"
                    )

                    yield json.dumps({
                        "type": "error",
                        "content": "Streaming failed"
                    }) + "\n"

        return StreamingResponse(
            event_generator(),
            media_type="application/json",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        )

    except Exception:

        logger.exception(
            "chat_stream route crashed"
        )

        return {
            "error": "Internal server error"
        }