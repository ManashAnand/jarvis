from app.db_config import get_db

def get_all_facts():
    conn = get_db()

    cursor = conn.cursor()

    cursor.execute("""
        SELECT subject, relation, object, type
        FROM facts
    """)

    rows = cursor.fetchall()

    conn.close()

    return rows