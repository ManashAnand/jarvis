import json
from app.db_config import get_db

def save_fact(memory):

    print("INSIDE SAVE FACT")

    conn = get_db()

    cursor = conn.cursor()
    metadata_json = json.dumps(
        memory.get("metadata", {})
    )

    cursor.execute("""
        INSERT INTO facts
        (
            subject,
            relation,
            object,
            metadata,
            type,
            confidence
        )
        VALUES (?, ?, ?, ?, ?, ?)
    """, (
        memory["subject"],
        memory["relation"],
        memory["object"],
        metadata_json,
        memory["type"],
        memory["confidence"]
    ))


    conn.commit()

    print("FACT SAVED")

    conn.close()