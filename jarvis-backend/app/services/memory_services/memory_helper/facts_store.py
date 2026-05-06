import sqlite3
from app.db_config import get_db

def save_fact(memory):

    print("INSIDE SAVE FACT")

    conn = get_db()

    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO facts
        (subject, relation, object, type, confidence)
        VALUES (?, ?, ?, ?, ?)
    """, (
        memory["subject"],
        memory["relation"],
        memory["object"],
        memory["type"],
        memory["confidence"]
    ))

    conn.commit()

    print("FACT SAVED")

    conn.close()