
def build_prompt(user_input: str, memories: list[dict]) -> str:
    context = "\n".join([f"- {m['content']}" for m in memories])

    prompt = f"""
        You are Jarvis, a smart personal AI assistant.

        Use the user's past memory if relevant.

        Relevant memory:
        {context if context else "None"}

        User: {user_input}

        Respond naturally and helpfully.
        """

    return prompt