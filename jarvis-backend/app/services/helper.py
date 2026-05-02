import os
import shutil

def clear_audio_files():
    # Define paths based on your project structure
    # Since helper.py is in app/services, we go up two levels
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    
    folders = [
        os.path.join(base_dir, "app", "input-audio-files"),
        os.path.join(base_dir, "app", "output-audio-files")
    ]

    for folder in folders:
        if os.path.exists(folder):
            print(f"🧹 Clearing: {folder}")
            for filename in os.listdir(folder):
                file_path = os.path.join(folder, filename)
                try:
                    if os.path.isfile(file_path) or os.path.islink(file_path):
                        os.unlink(file_path) 
                    elif os.path.isdir(file_path):
                        shutil.rmtree(file_path) 
                except Exception as e:
                    print(f"❌ Failed to delete {file_path}. Reason: {e}")
        else:
            os.makedirs(folder, exist_ok=True)
            print(f"📁 Created missing folder: {folder}")