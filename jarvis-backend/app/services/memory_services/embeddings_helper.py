from app.db_config import get_db
from .embeddings import get_embedding
from .embeddings_math import cosine_similarity
import json

def get_all_messages():
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM messages")
    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]



def save_message(role: str, content: str):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT 1 FROM messages WHERE content = ?
    """, (content,))

    if cursor.fetchone():
        conn.close()
        return  

    embedding = get_embedding(content)

    cursor.execute("""
        INSERT INTO messages (role, content, embedding)
        VALUES (?, ?, ?)
    """, (role, content, json.dumps(embedding)))

    conn.commit()
    conn.close()
    

    
 
    
def get_recent_messages(limit: int = 10):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT * FROM messages
        ORDER BY created_at DESC
        LIMIT ?
    """, (limit,))

    rows = cursor.fetchall()
    conn.close()

    return [dict(row) for row in rows]


def search_similar(query: str, top_k: int = 5, threshold: float = 0.2):
    query_embedding = get_embedding(query)

    messages = get_all_messages()

    scored = []

    for msg in messages:
        stored_embedding = json.loads(msg["embedding"])
        score = cosine_similarity(query_embedding, stored_embedding)

        if score > threshold:
            scored.append({
                "score": score,
                "content": msg["content"],
                "role": msg["role"]
            })

    scored.sort(key=lambda x: x["score"], reverse=True)

    return scored[:top_k]


def save_image(
    file_path: str,
    original_name: str,
    image_context: str
):

    conn = get_db()

    cursor = conn.cursor()

    cursor.execute("""
        SELECT 1 FROM images
        WHERE file_path = ?
    """, (file_path,))

    if cursor.fetchone():

        conn.close()

        return

    embedding = get_embedding(
        image_context
    )
    

    cursor.execute("""
        INSERT INTO images (
            file_path,
            original_name,
            image_context,
            embedding
        )
        VALUES (?, ?, ?, ?)
    """, (
        file_path,
        original_name,
        image_context,
        json.dumps(embedding)
    ))

    conn.commit()

    conn.close()