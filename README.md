# Welcome to your Lovable project

TODO: Document your project here
# 🚀 AI Landing Page Personalizer

## 📌 Overview
This project builds an AI-powered system that personalizes landing pages based on ad creatives.

Users can:
- Input an ad creative (URL)
- Input a landing page URL
- Get a personalized version of the landing page optimized for conversion

---

## 🎯 Goal
To improve conversion rates by aligning landing page messaging with ad creatives using AI and CRO (Conversion Rate Optimization) principles.

---

## ⚙️ How It Works

### 1. Ad Analysis
- Extracts:
  - Message
  - Offer
  - Target audience
  - CTA
  - Tone

### 2. Personalization Engine
- Modifies:
  - Hero section
  - Headlines
  - Call-to-action (CTA)
- Keeps original layout intact

---

## 🧠 Architecture

Frontend → Sends ad + URL  
Backend → Processes data  
AI Layer → Generates insights & improvements  
Output → Personalized landing page preview

---

## 🛠️ Tech Stack

- Frontend: React (Vite + Tailwind CSS)
- Backend: FastAPI
- AI Layer: LLM-based (Gemini/OpenAI compatible)
- Deployment: Vercel + Render (optional)

---

## 🚀 How to Run

### Frontend
```bash
npm install
npm run dev