from collections import deque

conversation_history = deque(maxlen=10)

def add_to_short_term(role:str, content:str):
    conversation_history.append({
        "role": role,
        "content": content
    })
    
    

def get_short_term_memory():
    return list(conversation_history)