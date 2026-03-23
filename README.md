# 🧠 MentalHealthAI — AI-Powered Mental Health Support System

A machine learning web app that predicts stress levels based on daily habits and provides empathetic AI support through Google Gemini — built with Streamlit.

> ⚠️ **Disclaimer:** This is a non-medical support tool only. It does not provide medical diagnosis or replace professional mental health care.

---

## ✨ Features

- 📊 **Stress Level Prediction** — predicts Low / Medium / High stress based on your daily habits
- 🤖 **AI Chat Support** — powered by Google Gemini, gives empathetic responses tailored to your stress level
- 🎛️ **Interactive Sliders** — input study hours, sleep, screen time, and exercise
- ⚡ **Instant Results** — real-time prediction with personalised feedback

---

## 🖼️ How It Works

```
User inputs daily habits (sleep, study, screen time, exercise)
        │
        ▼
Linear Regression model → predicts stress level (Low / Medium / High)
        │
        ▼
User types how they're feeling
        │
        ▼
Google Gemini API → empathetic response tailored to stress level
```

---

## 🚀 Quick Start

### 1. Navigate into the project folder
```bash
cd MentalHealthAI
```

### 2. Install dependencies
```bash
pip install -r requirements.txt
```

### 3. Add your Gemini API key

Open the `.env` file and replace the placeholder:
```
GEMINI_API_KEY=your_actual_key_here
```
Get a free API key at: https://aistudio.google.com/app/apikey

### 4. Train the model
```bash
python train.py
```
This generates `model.pkl` and `scaler.pkl` in the project root.

### 5. Run the app
```bash
streamlit run app/app.py
```

### 6. Open in your browser
```
http://localhost:8501
```

---

## 📁 Project Structure

```
MentalHealthAI/
│
├── app/
│   └── app.py              # Streamlit frontend + prediction logic
│
├── chatbot/
│   └── gemini.py           # Google Gemini AI chatbot integration
│
├── train.py                # Trains the stress prediction model
├── model.pkl               # Saved ML model (generated after train.py)
├── scaler.pkl              # Saved scaler (generated after train.py)
├── requirements.txt        # Python dependencies
├── .env                    # API key (never commit this to GitHub!)
└── README.md
```

---

## 📊 Model

The stress prediction model is a **Linear Regression** trained on 4 features:

| Feature | Description |
|---------|-------------|
| `study_hours` | Daily hours spent studying |
| `sleep_hours` | Hours of sleep per night |
| `screen_time` | Daily screen time in hours |
| `exercise_minutes` | Daily exercise in minutes |

**Output:** Stress level — `0 = Low`, `1 = Medium`, `2 = High`

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Streamlit |
| ML Model | scikit-learn (Linear Regression) |
| AI Chatbot | Google Gemini API (`gemini-pro`) |
| Data | pandas, numpy |
| Config | python-dotenv |

---

## 🔐 Environment Variables

Create a `.env` file in the project root:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

> ⚠️ **Never push your `.env` file to GitHub.** Add it to `.gitignore`.

---

## 📦 Requirements

```
numpy
pandas
scikit-learn
streamlit
python-dotenv
google-generativeai
```

Install all with:
```bash
pip install -r requirements.txt
```

---

## 🔮 Future Improvements

- [ ] Larger, real-world training dataset for better predictions
- [ ] Mood tracking over time with history charts
- [ ] Multi-turn conversation memory for the chatbot
- [ ] User login and personalised recommendations
- [ ] Deploy to Streamlit Cloud

---

## ⚠️ Important Note

This app is for **educational and support purposes only**. If you or someone you know is struggling with mental health, please reach out to a qualified professional or crisis helpline.

---

<p align="center">Built with 💚 to support mental wellbeing through technology</p>
