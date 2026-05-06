LOW_VALUE_PATTERNS = [
    "ok",
    "okay",
    "thanks",
    "cool",
    "nice",
    "lol",
]


def should_save_memory(text: str):
    text = text.lower().strip()

    if text in LOW_VALUE_PATTERNS:
        return False

    if len(text.split()) < 4:
        return False

    return True