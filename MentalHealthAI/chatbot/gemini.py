import google.generativeai as genai
import os
import json
import urllib.request
from dotenv import load_dotenv

load_dotenv(override=True)

# Verify if API Keys are set
openai_key = os.getenv("OPENAI_API_KEY")
is_openai_configured = bool(openai_key and openai_key != "PASTE_YOUR_OPENAI_API_KEY_HERE" and openai_key.startswith("sk-"))

gemini_key = os.getenv("GEMINI_API_KEY")
is_gemini_configured = bool(gemini_key and gemini_key != "PASTE_YOUR_GEMINI_API_KEY_HERE" and gemini_key.strip() != "")

is_api_key_configured = is_openai_configured or is_gemini_configured

if is_openai_configured:
    print("Configuring OpenAI Chat Completions API.")
    model = None
elif is_gemini_configured:
    try:
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel("gemini-pro")
    except Exception as e:
        print(f"Error configuring Gemini API: {e}")
        is_gemini_configured = False
        is_api_key_configured = is_openai_configured
        model = None
else:
    print("WARNING: Neither GEMINI_API_KEY nor OPENAI_API_KEY is configured. Running offline heuristics.")
    model = None

SYSTEM_PROMPT = """
You are a supportive workplace wellbeing companion. Your role is to help employees process 
workplace stress and anxiety through short, warm, conversational check-ins.

Guidelines:
- Keep responses brief (2-4 sentences) unless the user wants to go deeper
- Validate feelings before offering suggestions ("That sounds really draining" before any advice)
- Ask one gentle follow-up question at a time, never interrogate
- Use plain, warm language — no clinical jargon
- Never diagnose, never claim to be a therapist or medical professional
- If the user seems to want a coping tool (breathing, grounding, reframing), offer ONE relevant 
  option rather than a list
- If the conversation touches on self-harm, suicide, or crisis language, do NOT try to resolve 
  it yourself — follow the crisis escalation protocol instead
- Never share what the user says with anyone, and remind them of this if they ask

Context about this user (if available): {user_memory_summary}
Recent mood trend: {mood_score_trend}
"""

RISK_CLASSIFIER_PROMPT = """
You are a risk classifier for a mental health support chatbot. Analyze the following message 
and classify the risk level. Do not respond conversationally — output only the classification.

Classify as one of:
- LOW: general stress, venting, no safety concern
- MEDIUM: signs of hopelessness, overwhelm, or emotional distress but no explicit self-harm intent
- HIGH: explicit or implied mention of self-harm, suicide, wanting to disappear/not exist, 
  or giving up entirely

Output format (JSON only):
{"risk_level": "LOW/MEDIUM/HIGH", "reason": "brief phrase, max 6 words"} 
"""

COPING_TOOL_PROMPT = """
Based on this message, identify the primary emotional trigger and select the single most 
relevant coping tool from the list below. Output only the tool ID.

Available tools:
- box_breathing: for acute stress/panic
- grounding_54321: for overwhelm/dissociation feeling
- reframe_prompt: for catastrophizing/rumination
- micro_movement: for restlessness/low energy
- none: if no clear trigger, just continue conversation normally

Output format (JSON only):
{"tool_id": "...", "trigger_detected": "..."}
"""

MEMORY_SUMMARY_PROMPT = """
Summarize this conversation in 2-3 sentences for use as private context in future sessions 
with the same user. Focus on: recurring stressors, emotional patterns, and any coping tools 
that seemed to help. Do not include sensitive details that aren't necessary for continuity of 
care. Write in third person, neutral tone.

Output format (JSON only):
{"summary": "...", "recurring_triggers": ["...", "..."], "last_mood_score": "..."}
"""

MANAGER_INSIGHT_PROMPT = """
You are generating a weekly wellbeing summary for a team manager. You only have access to 
anonymized, aggregated data — never individual employee conversations or identities.

Write a brief, actionable summary (max 5 sentences) for the manager. Do not name or imply any 
individual. Focus on team-level patterns and one practical suggestion the manager could act on 
(e.g. lighter meeting load, check-in prompts, flexible deadlines).
"""

def generate_text(system_prompt, user_prompt, json_mode=False):
    if is_openai_configured:
        url = "https://api.openai.com/v1/chat/completions"
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {openai_key}"
        }
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        data = {
            "model": "gpt-4o-mini",
            "messages": messages,
            "temperature": 0.7
        }
        
        if json_mode:
            data["response_format"] = {"type": "json_object"}
            
        req = urllib.request.Request(
            url, 
            data=json.dumps(data).encode("utf-8"), 
            headers=headers,
            method="POST"
        )
        
        try:
            with urllib.request.urlopen(req, timeout=15) as response:
                res_data = json.loads(response.read().decode("utf-8"))
                return res_data["choices"][0]["message"]["content"].strip()
        except Exception as e:
            print(f"OpenAI API request failed: {e}")
            raise e
            
    elif is_gemini_configured and model is not None:
        combined_prompt = f"{system_prompt}\n\n{user_prompt}"
        try:
            from google.generativeai.types import HarmCategory, HarmBlockThreshold
            response = model.generate_content(
                combined_prompt,
                safety_settings={
                    HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_NONE,
                    HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_NONE,
                }
            )
            return response.text.strip()
        except Exception as e:
            print(f"Gemini API request failed: {e}")
            raise e
            
    raise Exception("No active API keys available.")

def get_heuristic_fallback(user_message, mood_score_trend="Unknown"):
    msg = user_message.lower()
    
    # Coworker / communication issues
    if any(k in msg for k in ["coworker", "colleague", "boss", "manager", "team", "office", "work", "talk", "nice"]):
        return "That sounds really isolating and draining. It's difficult when coworkers or colleagues don't communicate kindly or treat you nicely. You deserve a supportive work environment. Have you considered talking to someone you trust at work, or taking a small step back today to protect your peace?"
        
    # Sadness / Boredom
    if any(k in msg for k in ["sad", "bored", "lonely", "depressed", "unhappy"]):
        return "I hear you, and it's completely natural to feel that way. Dealing with a flat day or unkind communication can leave us feeling both down and unmotivated. Would you like to try a centering breathing space, or would it help to talk more about what's on your mind?"
        
    # Stress / Deadlines
    if any(k in msg for k in ["stress", "deadline", "busy", "overwhelmed", "anxious", "worry"]):
        return "That sounds incredibly intense and overwhelming. Work demands can accumulate quickly. What is one small thing you feel in control of today?"
        
    return "I'm listening and I want to support you. It's completely valid to feel drained by coworker issues or daily stressors. Can you tell me a little more about how that is affecting you right now?"

def select_coping_tool_fallback(user_message, recently_used_tools=None):
    if recently_used_tools is None:
        recently_used_tools = []
    msg = user_message.lower()
    
    # Offline keyword triggers
    tool_keywords = {
        "box_breathing": ["breathe", "panic", "anxious", "calm", "hyperventilating", "breath"],
        "grounding_54321": ["overwhelmed", "ground", "focus", "lost", "dissociating"],
        "reframe_prompt": ["reframe", "control", "worry", "rumination", "fail"],
        "micro_movement": ["stretch", "tired", "sit", "move", "restless", "energy"]
    }
    
    for tool_id, keywords in tool_keywords.items():
        if tool_id in recently_used_tools:
            continue
        if any(k in msg for k in keywords):
            return tool_id
            
    return "none"

def classify_risk(user_message):
    msg = user_message.lower()
    crisis_keywords = ["suicide", "kill myself", "self-harm", "harm myself", "end my life", "want to die", "disappear"]
    if any(k in msg for k in crisis_keywords):
        return "HIGH"

    if not is_api_key_configured:
        return "LOW"
        
    try:
        result_text = generate_text(RISK_CLASSIFIER_PROMPT, f'Message: "{user_message}"', json_mode=True)
        if result_text.startswith("```json"): result_text = result_text[7:]
        if result_text.startswith("```"): result_text = result_text[3:]
        if result_text.endswith("```"): result_text = result_text[:-3]
        result = json.loads(result_text.strip())
        return result.get("risk_level", "MEDIUM").upper()
    except Exception as e:
        print(f"Error classifying risk: {e}")
        return "MEDIUM"

def get_response(user_message, stress_level, user_memory_summary="None", mood_score_trend="Unknown", recently_used_tools=None):
    stress_map = {0: "low", 1: "medium", 2: "high"}
    
    # 1. Classify Risk
    risk_level = classify_risk(user_message)
    if risk_level == "HIGH":
        return "HIGH_RISK", "none"
        
    # 2. Coping Tool Trigger
    tool_id = select_coping_tool(user_message, recently_used_tools)
    if tool_id == "box_breathing":
        return "Let's try this together: Breathe in for 4 counts... hold for 4... out for 4... hold for 4. Repeat 3 times. I'll count with you if you'd like.", tool_id
    elif tool_id == "grounding_54321":
        return "Let's ground for a second. Can you name: 5 things you see, 4 things you can touch, 3 things you hear, 2 things you smell, 1 thing you taste?", tool_id
    elif tool_id == "reframe_prompt":
        return "Quick reframe: what's one thing right now that IS in your control, even if it's small?", tool_id
    elif tool_id == "micro_movement":
        return "Sometimes shifting our physical state helps. Can you do a quick stretch, shake out your hands, or take a few steps away from your screen?", tool_id
        
    # Check if API is offline/not configured
    if not is_api_key_configured:
        return get_heuristic_fallback(user_message, mood_score_trend), "none"
        
    # 3. Get conversational response
    system_prompt = SYSTEM_PROMPT.replace('{user_memory_summary}', user_memory_summary).replace('{mood_score_trend}', mood_score_trend)
    user_prompt = f"User stress level from today's habits: {stress_map[int(stress_level)]}\nUser message: {user_message}"

    try:
        reply = generate_text(system_prompt, user_prompt)
        if reply:
            return reply, "none"
        else:
            return "I hear you. Sometimes it is hard to find the right words, but I'm here. Can you tell me a little more about what's on your mind?", "none"
    except Exception as e:
        print(f"Text generation error: {e}")
        return get_heuristic_fallback(user_message, mood_score_trend), "none"

def select_coping_tool(user_message, recently_used_tools=None):
    if not is_api_key_configured:
        return select_coping_tool_fallback(user_message, recently_used_tools)

    if recently_used_tools is None:
        recently_used_tools = []
    
    exclusion_text = ""
    if recently_used_tools:
        exclusion_text = f"\nCRITICAL: Do NOT recommend any of these recently used tools: {recently_used_tools}. Pick a DIFFERENT tool if needed."
        
    prompt = f'Message: "{user_message}"' + exclusion_text
    try:
        result_text = generate_text(COPING_TOOL_PROMPT, prompt, json_mode=True)
        if result_text.startswith("```json"): result_text = result_text[7:]
        if result_text.startswith("```"): result_text = result_text[3:]
        if result_text.endswith("```"): result_text = result_text[:-3]
        result = json.loads(result_text.strip())
        return result.get("tool_id", "none")
    except Exception as e:
        print(f"Error selecting coping tool: {e}")
        return "none"

def generate_memory_summary(transcript):
    fallback_summary = json.dumps({
        "summary": "User checked in and shared thoughts about workplace communication.",
        "recurring_triggers": ["coworker communication"],
        "last_mood_score": "5.9"
    })
    if not is_api_key_configured:
        return fallback_summary

    try:
        result_text = generate_text(MEMORY_SUMMARY_PROMPT, f"Conversation:\n{transcript}", json_mode=True)
        if result_text.startswith("```json"): result_text = result_text[7:]
        if result_text.startswith("```"): result_text = result_text[3:]
        if result_text.endswith("```"): result_text = result_text[:-3]
        return result_text.strip()
    except Exception as e:
        print(f"Error generating memory summary: {e}")
        return fallback_summary

def generate_manager_insight(avg_mood, prev_avg_mood, theme_list, engagement_rate):
    fallback_msg = f"Aggregated weekly review shows a team mood baseline around {avg_mood} (previously {prev_avg_mood}). The primary recurring pressure point identified is work priorities and communication dynamics. We recommend coordinating task reviews during weekly huddles to keep expectations clear."
    if not is_api_key_configured:
        return fallback_msg

    prompt = f"Average team mood score this week: {avg_mood}\nAverage team mood score last week: {prev_avg_mood}\nTop 3 anonymized recurring stress themes: {theme_list}\n% of team who engaged with the bot this week: {engagement_rate}"
    try:
        return generate_text(MANAGER_INSIGHT_PROMPT, prompt)
    except Exception as e:
        print(f"Error generating manager insight: {e}")
        return f"{fallback_msg} (Note: AI generation fell back to heuristic due to API rate limit: {e})"
