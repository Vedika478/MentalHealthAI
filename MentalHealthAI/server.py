from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
import jwt
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash

# Ensure local imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from chatbot.database import (
    init_db, get_user_by_username, register_user, get_chat_history, log_chat, 
    log_mood, log_coping_tool, get_recent_coping_tools, 
    update_user_memory, get_manager_insight_data, log_journal, get_journal_entries,
    delete_journal_entry, get_manager_dashboard_data, log_habits
)
from chatbot.gemini import get_response, generate_manager_insight, generate_memory_summary, is_api_key_configured

app = Flask(__name__)
CORS(app)

# Use a strong secret key in production
app.config['SECRET_KEY'] = 'mental-health-ai-super-secret-key-2026'

# Ensure database is initialized
init_db()

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if len(auth_header.split(" ")) > 1:
                token = auth_header.split(" ")[1]
        
        if not token:
            return jsonify({'error': 'Token is missing!'}), 401
            
        try:
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user_id = data['user_id']
        except Exception as e:
            return jsonify({'error': 'Token is invalid!'}), 401
            
        return f(current_user_id, *args, **kwargs)
    return decorated

@app.route("/api/register", methods=["POST"])
def register():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "")
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
        
    hashed_password = generate_password_hash(password)
    user = register_user(username, hashed_password)
    
    if not user:
        return jsonify({"error": "Username already exists"}), 409
        
    token = jwt.encode({'user_id': user['id']}, app.config['SECRET_KEY'], algorithm="HS256")
    
    # Return user details without password hash
    return jsonify({
        "token": token,
        "user": {
            "id": user['id'],
            "username": user['username'],
            "memory_summary": user['memory_summary'],
            "api_key_configured": is_api_key_configured
        }
    })

@app.route("/api/login", methods=["POST"])
def login():
    data = request.json
    username = data.get("username", "").strip()
    password = data.get("password", "")
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
        
    user = get_user_by_username(username)
    
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({"error": "Invalid username or password"}), 401
        
    token = jwt.encode({'user_id': user['id']}, app.config['SECRET_KEY'], algorithm="HS256")
    
    return jsonify({
        "token": token,
        "user": {
            "id": user['id'],
            "username": user['username'],
            "memory_summary": user['memory_summary'],
            "api_key_configured": is_api_key_configured
        }
    })

@app.route("/api/chat", methods=["POST"])
@token_required
def chat(current_user_id):
    data = request.json
    username = data.get("username", "")
    message = data.get("message", "").strip()
    stress_level = data.get("stress_level", 1) # default medium
    mood = data.get("mood", "Neutral")
    
    if not message:
        return jsonify({"error": "message is required"}), 400

    # Get user memory directly from DB to avoid sending memory from frontend
    user = get_user_by_username(username)
    memory_summary = user.get("memory_summary", "None") if user else "None"

    # Get recently used tools (last 12 hours)
    recent_tools = get_recent_coping_tools(current_user_id, hours=12)
    
    # Call Gemini chatbot pipeline
    reply, tool_id = get_response(
        message, stress_level, 
        user_memory_summary=memory_summary, 
        mood_score_trend=mood, 
        recently_used_tools=recent_tools
    )
    
    # Log to SQLite
    log_chat(current_user_id, "User", message)
    log_chat(current_user_id, "Panda", reply)
    
    if tool_id != "none":
        log_coping_tool(current_user_id, tool_id)
        
    return jsonify({
        "reply": reply,
        "tool_id": tool_id,
        "api_key_configured": is_api_key_configured
    })

@app.route("/api/mood", methods=["POST"])
@token_required
def mood(current_user_id):
    data = request.json
    mood_str = data.get("mood", "Neutral")
    
    score = 0 if "Sad" in mood_str or mood_str == "sad" else 1 if "Neutral" in mood_str or mood_str == "neutral" else 2
    log_mood(current_user_id, score)
    return jsonify({"status": "success"})

@app.route("/api/journal", methods=["POST", "GET", "DELETE"])
@token_required
def journal(current_user_id):
    if request.method == "POST":
        data = request.json
        entry = data.get("entry", "").strip()
        
        if not entry:
            return jsonify({"error": "entry is required"}), 400
            
        log_journal(current_user_id, entry)
        return jsonify({"status": "success"})
        
    elif request.method == "DELETE":
        entry_id = request.args.get("entry_id")
        if not entry_id:
            return jsonify({"error": "entry_id is required"}), 400
        delete_journal_entry(int(entry_id))
        return jsonify({"status": "success"})
        
    else:
        entries = get_journal_entries(current_user_id)
        return jsonify(entries)

@app.route("/api/session/end", methods=["POST"])
@token_required
def end_session(current_user_id):
    # Get chat history to build transcript
    history = get_chat_history(current_user_id)
    if not history:
        return jsonify({"status": "no history"})
        
    transcript = "\n".join([f"{r[0]}: {r[1]}" for r in history])
    summary_json = generate_memory_summary(transcript)
    
    # Try parsing
    try:
        import json
        parsed = json.loads(summary_json)
        summary = parsed.get("summary", summary_json)
    except:
        summary = summary_json
        
    update_user_memory(current_user_id, summary)
    return jsonify({"status": "success", "summary": summary})

@app.route("/api/habits", methods=["POST"])
@token_required
def habits(current_user_id):
    data = request.json
    study = data.get("study", 0)
    sleep = data.get("sleep", 0)
    screen = data.get("screen", 0)
    exercise = data.get("exercise", 0)
    stress_level = data.get("stress_level", 0)
    
    log_habits(current_user_id, study, sleep, screen, exercise, stress_level)
    return jsonify({"status": "success"})

# Public / Manager Endpoints below
@app.route("/api/manager/insight", methods=["GET"])
def manager_insight():
    data = get_manager_insight_data()
    insight = generate_manager_insight(
        avg_mood=data["avg_mood"], 
        prev_avg_mood=data["prev_avg_mood"], 
        theme_list=data["theme_list"], 
        engagement_rate=data["engagement_rate"]
      )
    return jsonify({"insight": insight})

@app.route("/api/config", methods=["GET"])
def get_config():
    return jsonify({
        "api_key_configured": is_api_key_configured
    })

@app.route("/api/manager/dashboard", methods=["GET"])
def manager_dashboard():
    data = get_manager_dashboard_data()
    return jsonify(data)

@app.route("/api/resources", methods=["GET"])
def get_resources():
    resource_data = [
        {
            "name": "Tele-MANAS (Government of India)",
            "contact": "14416 or 1800-891-4416",
            "desc": "Flagship 24/7 digital mental health initiative of the Ministry of Health & Family Welfare. Free and confidential support across multiple languages.",
            "tags": ["24/7 Helpline", "Government Support", "Free Access"]
        },
        {
            "name": "Kiran Mental Health Helpline (DEPwD)",
            "contact": "1800-599-0019",
            "desc": "A toll-free 24/7 helpline by the Department of Empowerment of Persons with Disabilities to provide relief and support.",
            "tags": ["24/7 Helpline", "Government Support", "Free Access"]
        },
        {
            "name": "iCall Helpline (TISS)",
            "contact": "+91 9152987821",
            "desc": "Tata Institute of Social Sciences initiative. Professional counselors providing email, chat, and phone counseling from Monday to Saturday, 10am to 8pm.",
            "tags": ["Professional Counselors", "TISS Initiative"]
        },
        {
            "name": "Vandrevala Foundation",
            "contact": "1860-2662-345 or +91 9999-666-555",
            "desc": "Free 24/7 distress and crisis helpline staffed by trained counselors for immediate psychological assistance.",
            "tags": ["24/7 Helpline", "Crisis Relief"]
        },
        {
            "name": "AASRA",
            "contact": "+91 9820466726",
            "desc": "A 24/7 suicide prevention and mental health support organization providing non-judgmental active listening support.",
            "tags": ["24/7 Helpline", "Suicide Prevention"]
        }
    ]
    return jsonify(resource_data)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
