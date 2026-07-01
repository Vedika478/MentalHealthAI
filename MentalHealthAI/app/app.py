import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import streamlit as st
import numpy as np
import pickle
from chatbot.gemini import get_response
from chatbot.database import init_db, get_or_create_user, get_chat_history, log_chat, log_mood, log_coping_tool, get_recent_coping_tools, update_user_memory, get_manager_insight_data
from datetime import datetime

# Initialize DB
init_db()

# ---------------- PAGE CONFIG ----------------
st.set_page_config(page_title="Mental Wellness Companion 🌸", layout="wide")

# ---------------- COLOR THEME ----------------
st.markdown("""
<style>
.stApp {
    background: linear-gradient(to right, #fff0f6, #f8e8ff);
}
.card {
    background-color: white;
    padding: 25px;
    border-radius: 20px;
    box-shadow: 0px 4px 15px rgba(0,0,0,0.08);
}
.result-card {
    background-color: #ffe6f2;
    padding: 20px;
    border-radius: 20px;
    text-align: center;
}
button[kind="primary"] {
    background-color: #e75480;
}
</style>
""", unsafe_allow_html=True)

# ---------------- SESSION STATE ----------------
if "page" not in st.session_state:
    st.session_state.page = "login"
if "name" not in st.session_state:
    st.session_state.name = ""
if "mood" not in st.session_state:
    st.session_state.mood = "Unknown"

# ---------------- LOGIN PAGE ----------------
if st.session_state.page == "login":
    st.markdown("<h1 style='text-align:center; color:#e75480;'>🌸 Welcome to Your Wellness Space 🌸</h1>", unsafe_allow_html=True)
    name = st.text_input("Enter your username to begin 💗")
    if st.button("Continue 🌷"):
        if name:
            user = get_or_create_user(name)
            st.session_state.name = user["username"]
            st.session_state.user_id = user["id"]
            st.session_state.memory_summary = user["memory_summary"]
            st.session_state.page = "motivation"
            st.rerun()

# ---------------- MOTIVATION PAGE ----------------
elif st.session_state.page == "motivation":
    st.markdown(f"""
    <div class='card'>
    <h2 style='text-align:center; color:#6C63FF;'>🌟 {st.session_state.name}, you are stronger than you think 🌟</h2>
    <p style='text-align:center; font-size:18px;'>Every day you show up, you grow a little more 🌸<br>Take a deep breath. This is your safe space 💖</p>
    </div>
    """, unsafe_allow_html=True)
    if st.button("Enter My Wellness Space 🐼"):
        st.session_state.page = "home"
        st.rerun()

# ---------------- HOME PAGE ----------------
elif st.session_state.page == "home":
    if "chat_history" not in st.session_state:
        history = get_chat_history(st.session_state.user_id)
        st.session_state.chat_history = [f"{r[0]}: {r[1]}" for r in history]

    hour = datetime.now().hour
    if hour < 12: greeting = "Good Morning ☀️"
    elif hour < 18: greeting = "Good Afternoon 🌼"
    else: greeting = "Good Evening 🌙"

    st.markdown(f"<h2 style='color:#e75480;'>{greeting}, {st.session_state.name} 🌸</h2>", unsafe_allow_html=True)

    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model = pickle.load(open(os.path.join(base_dir, "model.pkl"), "rb"))
    scaler = pickle.load(open(os.path.join(base_dir, "scaler.pkl"), "rb"))

    st.divider()

    st.markdown("### 📝 Daily Wellness Check")
    col1, col2 = st.columns(2)
    with col1:
        study = st.slider("📚 Study Hours", 0, 12, 4)
        sleep = st.slider("😴 Sleep Hours", 0, 10, 7)
    with col2:
        screen = st.slider("📱 Screen Time", 0, 12, 5)
        exercise = st.slider("🏃 Exercise Minutes", 0, 60, 30)

    st.divider()

    input_data = np.array([[study, sleep, screen, exercise]])
    input_scaled = scaler.transform(input_data)
    prediction = model.predict(input_scaled)[0]
    stress_level = max(0, min(2, round(prediction)))

    stress_text = ["Low 🌿", "Medium 🌼", "High 🌧️"]
    stress_colors = ["#4CAF50", "#FF9800", "#F44336"]

    st.markdown(f"""
    <div class='result-card'>
    <h3 style='color:{stress_colors[stress_level]};'>Your Stress Level Today: {stress_text[stress_level]}</h3>
    </div>
    """, unsafe_allow_html=True)
    st.progress((stress_level + 1) / 3)

    st.divider()

    st.markdown("""
    <div class='card' style='display:flex; align-items:center; gap:20px;'>
        <img src="https://cdn-icons-png.flaticon.com/512/616/616408.png" width="90">
        <div>
            <h3 style="color:#6C63FF;">Hi 💗 I'm your Panda Buddy 🐼</h3>
            <p>How are you feeling today? I'm here for you 🌸</p>
        </div>
    </div>
    """, unsafe_allow_html=True)

    # Render previous chat history
    for msg in st.session_state.chat_history:
        role, text = msg.split(": ", 1)
        if role == "User":
            st.markdown(f"<b>You:</b> {text}", unsafe_allow_html=True)
        else:
            st.markdown(f"<b>🐼 Panda:</b> {text}", unsafe_allow_html=True)

    user_msg = st.text_input("💬 Tell Panda what's on your mind...")

    if user_msg:
        recent_tools = get_recent_coping_tools(st.session_state.user_id, hours=12)
        with st.spinner("🐼 Panda is thinking..."):
            reply, tool_id = get_response(user_msg, stress_level, user_memory_summary=st.session_state.memory_summary, mood_score_trend=st.session_state.mood, recently_used_tools=recent_tools)
            
            log_chat(st.session_state.user_id, "User", user_msg)
            log_chat(st.session_state.user_id, "Panda", reply)
            
            st.session_state.chat_history.append(f"User: {user_msg}")
            st.session_state.chat_history.append(f"Panda: {reply}")
            
            if tool_id != "none":
                log_coping_tool(st.session_state.user_id, tool_id)

        if reply == "HIGH_RISK":
            st.markdown(f"""
            <div class='card' style='background-color:#ffe6f2;'>
            <b>🐼 Panda says:</b><br>
            It sounds like you're going through something really heavy right now, and I want you to have real support — not just a chat with me.<br><br>
            📞 iCall (India): 9152987821 (Mon–Sat, 10am–8pm)<br>
            📞 Vandrevala Foundation: 1860-2662-345 (24/7)<br><br>
            Would you like me to help you connect with someone at work you trust, or would you prefer to just have these numbers for now? Either way, I'm here.
            </div>
            """, unsafe_allow_html=True)
        else:
            st.markdown(f"""
            <div class='card' style='background-color:#ffe6f2;'>
            <b>🐼 Panda says:</b><br>
            {reply}
            </div>
            """, unsafe_allow_html=True)

    st.markdown("🔒 *Your conversations are private. Only anonymized, team-level trends are ever shared with your manager — never your individual messages, mood scores, or identity.*")

    st.divider()

    st.markdown("### 😊 How Are You Feeling?")
    mood = st.radio("", ["😢 Sad", "😐 Neutral", "😊 Happy"], horizontal=True, key="mood")
    
    if st.button("Log Daily Mood 📊"):
        score = 0 if "Sad" in st.session_state.mood else 1 if "Neutral" in st.session_state.mood else 2
        log_mood(st.session_state.user_id, score)
        st.success("Mood securely logged to the database! 🌸")

    st.divider()
    
    st.markdown("### 💾 Session Control")
    if st.button("End Session & Generate Memory"):
        if st.session_state.chat_history:
            transcript = "\\n".join(st.session_state.chat_history)
            from chatbot.gemini import generate_memory_summary
            with st.spinner("Summarizing session into secure database..."):
                summary_json = generate_memory_summary(transcript)
                try:
                    import json
                    parsed = json.loads(summary_json)
                    st.session_state.memory_summary = parsed.get("summary", "None")
                except:
                    st.session_state.memory_summary = summary_json
                
                update_user_memory(st.session_state.user_id, st.session_state.memory_summary)
                st.success("Memory permanently saved! It will be loaded automatically next time you log in.")
        else:
            st.warning("No conversation to summarize yet.")

    st.sidebar.title("📊 Manager View")
    st.sidebar.write("Generate weekly wellbeing insights based on actual anonymized, aggregated team data.")
    if st.sidebar.button("Generate Weekly Insight"):
        with st.spinner("Analyzing database trends..."):
            from chatbot.gemini import generate_manager_insight
            data = get_manager_insight_data()
            insight = generate_manager_insight(
                avg_mood=data["avg_mood"], 
                prev_avg_mood=data["prev_avg_mood"], 
                theme_list=data["theme_list"], 
                engagement_rate=data["engagement_rate"]
            )
            st.sidebar.info(insight)
