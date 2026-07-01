import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import streamlit as st
import numpy as np
import pickle
from chatbot.gemini import get_response
from datetime import datetime

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

# ---------------- LOGIN PAGE ----------------
if st.session_state.page == "login":

    st.markdown("""
    <h1 style='text-align:center; color:#e75480;'>🌸 Welcome to Your Wellness Space 🌸</h1>
    """, unsafe_allow_html=True)

    name = st.text_input("Enter your name to begin 💗")

    if st.button("Continue 🌷"):
        if name:
            st.session_state.name = name
            st.session_state.page = "motivation"
            st.rerun()

# ---------------- MOTIVATION PAGE ----------------
elif st.session_state.page == "motivation":

    st.markdown(f"""
    <div class='card'>
    <h2 style='text-align:center; color:#6C63FF;'>
    🌟 {st.session_state.name}, you are stronger than you think 🌟
    </h2>
    <p style='text-align:center; font-size:18px;'>
    Every day you show up, you grow a little more 🌸<br>
    Take a deep breath. This is your safe space 💖
    </p>
    </div>
    """, unsafe_allow_html=True)

    if st.button("Enter My Wellness Space 🐼"):
        st.session_state.page = "home"
        st.rerun()

# ---------------- HOME PAGE ----------------
elif st.session_state.page == "home":

    # Greeting based on time
    hour = datetime.now().hour
    if hour < 12:
        greeting = "Good Morning ☀️"
    elif hour < 18:
        greeting = "Good Afternoon 🌼"
    else:
        greeting = "Good Evening 🌙"

    st.markdown(f"""
    <h2 style='color:#e75480;'>
    {greeting}, {st.session_state.name} 🌸
    </h2>
    """, unsafe_allow_html=True)

    # Load model
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    model = pickle.load(open(os.path.join(base_dir, "model.pkl"), "rb"))
    scaler = pickle.load(open(os.path.join(base_dir, "scaler.pkl"), "rb"))

    st.divider()

    # Questionnaire Section
    st.markdown("### 📝 Daily Wellness Check")

    col1, col2 = st.columns(2)

    with col1:
        study = st.slider("📚 Study Hours", 0, 12, 4)
        sleep = st.slider("😴 Sleep Hours", 0, 10, 7)

    with col2:
        screen = st.slider("📱 Screen Time", 0, 12, 5)
        exercise = st.slider("🏃 Exercise Minutes", 0, 60, 30)

    st.divider()

    # Stress Prediction
    input_data = np.array([[study, sleep, screen, exercise]])
    input_scaled = scaler.transform(input_data)
    prediction = model.predict(input_scaled)[0]
    stress_level = max(0, min(2, round(prediction)))

    stress_text = ["Low 🌿", "Medium 🌼", "High 🌧️"]
    stress_colors = ["#4CAF50", "#FF9800", "#F44336"]

    st.markdown(f"""
    <div class='result-card'>
    <h3 style='color:{stress_colors[stress_level]};'>
    Your Stress Level Today: {stress_text[stress_level]}
    </h3>
    </div>
    """, unsafe_allow_html=True)

    st.progress((stress_level + 1) / 3)

    # Achievement Image
    if stress_level == 0:
        st.image("https://cdn-icons-png.flaticon.com/512/190/190411.png", width=100)
    elif stress_level == 1:
        st.image("https://cdn-icons-png.flaticon.com/512/4140/4140048.png", width=100)
    else:
        st.image("https://cdn-icons-png.flaticon.com/512/3774/3774299.png", width=100)

    st.divider()

    # Panda Companion
    st.markdown("""
    <div class='card' style='display:flex; align-items:center; gap:20px;'>
        <img src="https://cdn-icons-png.flaticon.com/512/616/616408.png" width="90">
        <div>
            <h3 style="color:#6C63FF;">Hi 💗 I'm your Panda Buddy 🐼</h3>
            <p>How are you feeling today? I'm here for you 🌸</p>
        </div>
    </div>
    """, unsafe_allow_html=True)

    user_msg = st.text_input("💬 Tell Panda what's on your mind...")

    if user_msg:
        with st.spinner("🐼 Panda is thinking..."):
            reply = get_response(user_msg, stress_level)

        st.markdown(f"""
        <div class='card' style='background-color:#ffe6f2;'>
        <b>🐼 Panda says:</b><br>
        {reply}
        </div>
        """, unsafe_allow_html=True)

    st.divider()

    # Mood Selector
    st.markdown("### 😊 How Are You Feeling?")
    mood = st.radio("", ["😢 Sad", "😐 Neutral", "😊 Happy"], horizontal=True)
    st.write(f"You selected: {mood}")

    st.divider()

    # Journal Section
    st.markdown("### 📝 Personal Reflection Journal")
    journal = st.text_area("Write your thoughts here 🌷", height=150)

    if st.button("Save Reflection 💾"):
        st.success("Your reflection is saved for this session 🌸")
