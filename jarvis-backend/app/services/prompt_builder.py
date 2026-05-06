from .memory_services.memory_manager import get_short_term_memory


def build_prompt(user_input: str, memories: list[dict], facts):

    context = "\n".join([
        f"- {m['content']}"
        for m in memories
    ])

    short_term = get_short_term_memory()

    conversation_context = format_conversation(short_term)

    formatted_facts = ""

    for fact in facts:
        formatted_facts += (
        f"- {fact['subject']} "
        f"{fact['relation']} "
        f"{fact['object']}\n"
    )

    prompt = f"""
You are Jarvis, a smart personal AI assistant working just for MANASH.

[CRITICAL]
When any query refers to:
- I
- me
- my
- master

Always assume it refers to MANASH.

Use past memory only if relevant.

Known Facts:
{formatted_facts if formatted_facts else "None"}

Conversation History:
{conversation_context if conversation_context else "None"}

Relevant Memories:
{context if context else "None"}

Current User Message:
{user_input}

Respond naturally and helpfully.
"""

    return prompt


def format_conversation(history):

    formatted = ""

    for msg in history:
        formatted += (
            f"{msg['role']}: {msg['content']}\n"
        )

    return formatted