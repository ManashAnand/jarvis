from .embeddings_helper import save_message
from .memory_helper.structural_memory import extract_memories
from .memory_helper.facts_store import save_fact
from .memory_helper.importance_filter import should_save_memory


async def process_memory(user_query: str):

    # Save vector memory
    if should_save_memory(user_query):
        save_message("user", user_query)

    # Extract structured facts
    extracted_memories = await extract_memories(user_query)
    print("EXTRACTED MEMORIES:", extracted_memories)
    # Save facts
    for memory in extracted_memories:
        print("SAVING FACT:", memory)
        save_fact(memory)
