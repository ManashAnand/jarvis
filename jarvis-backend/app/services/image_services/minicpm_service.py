import base64
import requests
from ...config.settings import settings




def analyze_image(
    image_path: str
):

    with open(
        image_path,
        "rb"
    ) as f:

        image_base64 = (
            base64.b64encode(
                f.read()
            ).decode("utf-8")
        )

    prompt = """
    Analyze this image.

    Return:
    - summary
    - important text
    - UI elements
    - errors if present
    """

    response = requests.post(
        settings.OLLAMA_URL,
        json={
            "model": "minicpm-v",
            "prompt": prompt,
            "images": [image_base64],
            "stream": False,
        },
    )

    data = response.json()

    return data.get(
        "response",
        ""
    )