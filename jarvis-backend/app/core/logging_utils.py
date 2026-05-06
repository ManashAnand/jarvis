from sqlite3 import Row


def smart_preview(data, limit=2, text_limit=120):
    """
    Smart logging preview for:
    - list
    - dict
    - sqlite rows
    - strings
    - primitives
    """

    # -------------------------
    # None
    # -------------------------
    if data is None:
        return None

    # -------------------------
    # String
    # -------------------------
    if isinstance(data, str):

        if len(data) > text_limit:
            return data[:text_limit] + "..."

        return data

    # -------------------------
    # Dict
    # -------------------------
    if isinstance(data, dict):
        return {
            k: smart_preview(v)
            for k, v in data.items()
        }

    # -------------------------
    # SQLite Row
    # -------------------------
    if isinstance(data, Row):
        return dict(data)

    # -------------------------
    # List / Tuple
    # -------------------------
    if isinstance(data, (list, tuple)):

        preview = []

        for item in data[-limit:]:
            preview.append(
                smart_preview(item)
            )

        return preview

    # -------------------------
    # Fallback
    # -------------------------
    return str(data)