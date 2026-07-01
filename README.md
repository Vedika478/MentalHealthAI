# 🧠 MentalHealthAI — AI-Powered Mental Health Support System

A robust full-stack web application that predicts stress levels based on daily habits, provides an empathetic AI support buddy powered by Google Gemini, offers interactive journaling, and presents a comprehensive manager dashboard for anonymized team wellbeing insights.

> ⚠️ **Disclaimer:** This is a non-medical support tool only. It does not provide medical diagnosis or replace professional mental health care.

---

## ✨ Features

- 🔒 **Secure User Authentication** — JWT-based authentication system with hashed passwords using SQLite to keep personal reflections fully private.
- 📊 **Interactive Daily Check-In** — Input study hours, sleep, screen time, and exercise to instantly log and monitor your well-being.
- 🤖 **AI Chat Support** — Powered by Google Gemini (`gemini-pro`), providing empathetic responses, memory summarization, and cognitive behavioral therapy (CBT) inspired coping tools based on user sentiment.
- 📓 **Reflection Journal** — A private space to record thoughts and feelings securely.
- 📈 **Manager Wellbeing Dashboard** — A specialized view that aggregates anonymized team check-in data, visualizes mood trends over the week, and utilizes AI to extract key stress themes affecting the team without compromising individual privacy.
- 🛟 **Support Resources** — Dynamic integration of free, government-backed mental health helplines for immediate professional access.

---

## 🛠️ Tech Stack & Architecture

- **Frontend:** React, Vite, TailwindCSS (for dynamic, beautiful glass-morphic UI).
- **Backend:** Flask (Python) exposing RESTful JSON APIs.
- **Database:** SQLite (local, fully free, and zero-configuration).
- **Authentication:** PyJWT & Werkzeug for robust token-based security and password hashing.
- **AI Integrations:** Google Gemini (`google-generativeai`) for natural language conversational therapy, memory summarization, and team insights.
- **Machine Learning:** `scikit-learn` for habit-to-stress level prediction models.

*Note: All technologies used in this stack are open-source and **completely free**. The only external service is the Google Gemini API, which offers a free tier for testing and personal development.*

---

## 🚀 Quick Start Guide

### 1. Repository Setup
```bash
git clone https://github.com/Vedika478/MentalHealthAI_Project.git
cd MentalHealthAI_Project/MentalHealthAI
```

### 2. Backend Environment Configuration
You need a free Google Gemini API key to power the AI features.
1. Get a free API key at: https://aistudio.google.com/app/apikey
2. Create a `.env` file inside the `MentalHealthAI` directory:
```bash
# MentalHealthAI/.env
GEMINI_API_KEY=your_actual_key_here
```
*(Note: `.env` is ignored by Git to protect your secrets.)*

### 3. Install Backend Dependencies
```bash
pip install -r requirements.txt
```

### 4. Start the Flask Backend Server
```bash
python server.py
```
*The Flask server will initialise the SQLite database (`wellness.db`) automatically and run on `http://localhost:5000`.*

### 5. Start the React Frontend
Open a new terminal window and navigate to the frontend directory:
```bash
cd MentalHealthAI/frontend
npm install
npm run dev
```

### 6. Access the Application
Open your browser and navigate to:
```
http://localhost:5173
```
Create a new secure account on the login page and start your wellness journey!

---

## 📁 Project Structure

```
MentalHealthAI/
│
├── frontend/               # React + Vite frontend application
│   ├── src/                # UI Components (App.jsx, ChatView, ManagerView, etc.)
│   └── package.json        # Node.js dependencies
│
├── chatbot/                
│   ├── database.py         # SQLite CRUD operations & schema definitions
│   └── gemini.py           # Google Gemini AI prompts and logic
│
├── server.py               # Flask backend API with JWT middleware
├── train.py                # Trains the linear regression model for stress prediction
├── wellness.db             # Auto-generated SQLite database
├── requirements.txt        # Python dependencies
└── .env                    # Secret API keys
```

---

## 🔮 Future Improvements

- [ ] Multi-turn conversation memory for the chatbot across sessions.
- [ ] Push notifications for daily check-in reminders.
- [ ] Expanded Manager Dashboard with department-level filtering.
- [ ] Docker containerization for easier cloud deployment.

---

## ⚠️ Important Note

This app is for **educational and support purposes only**. If you or someone you know is struggling with mental health, please reach out to a qualified professional or crisis helpline.

---

<p align="center">Built with 💚 to support mental wellbeing through technology</p>
