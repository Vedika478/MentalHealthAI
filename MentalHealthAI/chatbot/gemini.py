import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-pro")

SYSTEM_PROMPT = """
You are a mental health support assistant.
Be empathetic, calm, and supportive.
Do NOT provide medical diagnosis.
Encourage healthy habits and professional help if stress is high.
"""

def get_response(user_message, stress_level):
    stress_map = {0: "low", 1: "medium", 2: "high"}

    prompt = f"""
    {SYSTEM_PROMPT}

    User stress level: {stress_map[int(stress_level)]}
    User message: {user_message}
    """

    response = model.generate_content(prompt)
    return response.text
