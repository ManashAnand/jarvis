from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Request
from typing import Optional
from fastapi.responses import StreamingResponse
from ..services.memory_services.embeddings_helper import search_similar
from ..services.memory_services.memory_manager import add_to_short_term
from ..services.prompt_builder import build_prompt
from ..services.memory_services.memory_helper.facts_retriever import get_all_facts
from app.core.logger import logger
from app.core.logging_utils import smart_preview
from pathlib import Path
from ..services.memory_services.memory_pipeline import process_memory
from ..config.settings import settings
from ..services.image_services.minicpm_service import analyze_image
from ..services.memory_services.embeddings_helper import save_image

import uuid
import asyncio

import json
import httpx

router = APIRouter(tags=["stream-chat"])


async def process_attachments(saved_files):

    try:

        logger.info(f"Processing " f"{len(saved_files)} attachments")

        for saved_file in saved_files:

            logger.info(f"Processing file: " f"{saved_file['filename']}")

            image_context = saved_file.get("image_context")

            if not image_context:
                logger.info("No images present in image_context in process attachments")
                continue

        logger.info("Attachment processing completed")

    except Exception:

        logger.exception("Attachment processing failed")


@router.post("/chat-stream")
async def chat_stream(
    request: Request,
    user_query: Optional[str] = Form(None),
    files: list[UploadFile] = File([]),
):
    if not user_query and not files:
        raise HTTPException(
            status_code=400, detail="Either user_query or image is required"
        )
    logger.info("New /chat-stream request received")

    try:

        logger.info(f"User Query: " f"{smart_preview(user_query)}")
        logger.info(f"Files Count: {len(files)}")
        upload_dir = Path("app/input-image-files")

        upload_dir.mkdir(exist_ok=True)

        saved_files = []

        for file in files:

            ext = file.filename.split(".")[-1]

            filename = f"{uuid.uuid4()}.{ext}"

            file_path = upload_dir / filename

            contents = await file.read()

            with open(file_path, "wb") as f:
                f.write(contents)

            saved_files.append(
                {
                    "path": str(file_path),
                    "content_type": (file.content_type),
                    "filename": file.filename,
                }
            )

        logger.info(f"Saved {len(saved_files)} files")

        image_contexts = []

        for saved_file in saved_files:

            content_type = saved_file.get("content_type") or ""

            if not content_type.startswith("image/"):
                continue

            vision_summary = analyze_image(saved_file["path"])

            saved_file["image_context"] = vision_summary

            image_contexts.append(vision_summary)

        image_context = "\n".join(image_contexts)

        search_query_parts = []
        if user_query:
            search_query_parts.append(user_query)

        if image_context:
            search_query_parts.append(image_context)

        search_query = "\n".join(search_query_parts)

        if not search_query:
            search_query = "image upload"

        logger.info("Searching semantic memories")

        memories = search_similar(search_query, top_k=3)

        logger.info(
            f"Retrieved {len(memories)} semantic memories | "
            f"Preview: {smart_preview(memories)}"
        )

        logger.info("Fetching structured facts")

        facts = get_all_facts()

        logger.info(
            f"Retrieved {len(facts)} structured facts | "
            f"Preview: {smart_preview(facts)}"
        )

        final_query_parts = []
        if search_query:
            final_query_parts.append(search_query)

        logger.info("Building prompt")
        final_query = "\n".join(final_query_parts)
        prompt = build_prompt(final_query, memories, facts)

        logger.info(
            f"Prompt built successfully | "
            f"Length: {len(prompt)} chars | "
            f"Preview: {smart_preview(prompt)}"
        )

        async def event_generator():

            logger.info("Starting streaming pipeline")

            async with httpx.AsyncClient(timeout=None) as client:

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

                        logger.info("Connected to Ollama stream")

                        async for line in response.aiter_lines():

                            if await request.is_disconnected():

                                logger.warning("Client disconnected")

                                break

                            if not line:
                                continue

                            data = json.loads(line)

                            if "response" in data:

                                token = data["response"]

                                full_response += token

                                yield json.dumps(
                                    {"type": "token", "content": token}
                                ) + "\n"

                            if data.get("done"):

                                logger.info("Streaming completed")

                                logger.info(
                                    f"Final Response Length: "
                                    f"{len(full_response)} chars"
                                )

                                logger.info(
                                    f"Final Response Preview: "
                                    f"{smart_preview(full_response)}"
                                )

                                logger.info("Updating short-term memory")

                                add_to_short_term("user", final_query)

                                add_to_short_term("assistant", full_response)

                                asyncio.create_task(process_memory(final_query))

                                asyncio.create_task(process_attachments(saved_files))

                                save_image(
                                    file_path=saved_file["path"],
                                    original_name=saved_file["filename"],
                                    image_context=image_context,
                                )
                                logger.info(f"Image embeddings save at image table")

                                yield json.dumps({"type": "done"}) + "\n"

                                break

                except Exception:

                    logger.exception("Streaming pipeline crashed")

                    yield json.dumps(
                        {"type": "error", "content": "Streaming failed"}
                    ) + "\n"

        return StreamingResponse(
            event_generator(),
            media_type="application/json",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        )

    except Exception:

        logger.exception("chat_stream route crashed")

        return {"error": "Internal server error"}
