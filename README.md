# contract-review-bot

# ⚖️ ContractLens — AI-Powered Contract Review Bot

> Understand any contract in seconds. AI-powered analysis that identifies risks, explains terms, and gives you confidence in every signature.

![ContractLens](https://img.shields.io/badge/AI-Powered-6366f1?style=for-the-badge&logo=openai)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react)
![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python)

---

## 🎯 What is ContractLens?

ContractLens is an AI-powered contract review bot built for the **AI Engineer Hiring Task**. It reads legal contracts (PDF or plain text), extracts key information, flags risky clauses, and presents a clean structured report in plain English — so you never miss an important clause again.

---
<img width="1918" height="923" alt="p1" src="https://github.com/user-attachments/assets/2fd04e1d-3a2f-4d2a-b35e-3f8e059761ee" />



## ✨ Features

- 📎 **PDF & Text Upload** — Drag & drop or paste contract text directly
- 🤖 **AI-Powered Analysis** — Extracts parties, dates, payment terms, termination, IP ownership, confidentiality
- 🚩 **Risk Flag System** — Color-coded risk badges (🔴 High / 🟠 Medium / 🟡 Low)
- 📋 **Plain English Summary** — Explains contract in simple words
- 🎯 **Risk Score Gauge** — Visual risk meter showing overall contract risk
- 💡 **Expandable Risk Cards** — Click to see contract excerpt + actionable advice
- ⬇️ **Download Report** — Export full analysis as Markdown
- 🌙 **Dark/Light Mode** — Toggle between themes
- ✨ **Beautiful Animations** — Particles, shimmer, slide-up effects

---
## PDF Upload

<img width="1915" height="920" alt="pd1" src="https://github.com/user-attachments/assets/b0d3d37e-1a61-4173-95a4-ff89d386800f" />
Key Details:
<img width="1891" height="917" alt="pd2" src="https://github.com/user-attachments/assets/cf951148-3d0d-4ba0-8698-9b594e74f7f7" />
Risk Analysis:
<img width="1882" height="912" alt="pd3" src="https://github.com/user-attachments/assets/58185d78-a31c-4b15-bfe6-7bee6b0e3c98" />

<img width="1891" height="915" alt="pd4" src="https://github.com/user-attachments/assets/2217c295-9f75-4210-8e78-23e1082f95b8" />

## Text 
<img width="1908" height="916" alt="p2" src="https://github.com/user-attachments/assets/914846e1-e515-4afb-9eb1-c437415a713e" />

<img width="1918" height="915" alt="Screenshot 2026-02-26 191146" src="https://github.com/user-attachments/assets/f0688008-34bc-4268-ad96-5cb5389fce40" />

<img width="1886" height="912" alt="p4" src="https://github.com/user-attachments/assets/63b56b01-39a9-40c5-93d1-3af45443ba97" />

<img width="1893" height="911" alt="p5" src="https://github.com/user-attachments/assets/761d3792-85c9-48bb-86d3-b548d6dc7a87" />

<img width="1891" height="911" alt="p6" src="https://github.com/user-attachments/assets/8571a4b6-e2d7-44a2-b9f9-936b505da667" />


## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| AI Brain | Groq API (Llama 3.3 70B) — Claude API alternative per task instructions |
| Backend | Python + FastAPI |
| Frontend | React + TypeScript + Tailwind CSS + Vite |
| PDF Parsing | pdfplumber |
| Animations | Custom CSS + Canvas particles |

---

## 📐 System Architecture

```
User Browser (React Frontend)
         │
         │  POST /analyze (multipart/form-data)
         │  field: file (PDF/TXT) OR text (string)
         ▼
FastAPI Backend (Python)
         │
         ├──► pdfplumber → extract text from PDF
         │
         └──► Groq API (Llama 3.3 70B)
                    │
                    ▼
              Structured JSON
              {parties, dates, payment_terms,
               termination, risks[], summary}
                    │
                    ▼
         FastAPI returns JSON
                    │
                    ▼
    React renders sections + risk badges
```

---

## 🚀 Quick Start (Local Setup)

### Prerequisites
- Python 3.11+
- Node.js 18+
- Groq API key (free) → [console.groq.com](https://console.groq.com)

### 1. Clone the repo
```bash
git clone https://github.com/yourusername/contract-review-bot.git
cd contract-review-bot
```

### 2. Setup Backend
```bash
cd backend
pip install -r requirements.txt
```

Create `.env` file in backend folder:
```
GROQ_API_KEY=gsk_your_groq_key_here
```

Start backend:
```bash
python -m uvicorn main:app --reload --port 8000
```

Backend runs at: `http://localhost:8000`

### 3. Setup Frontend
```bash
cd frontend
npm install
npx vite
```

Frontend runs at: `http://localhost:3000`

### 4. Open Browser
```
http://localhost:3000
```

---

## 🧪 Testing the App

1. Open `http://localhost:3000`
2. Click **"Load Sample Contract"** for quick test
3. Click **"Analyze Contract"**
4. See results with risk flags! 🎉

Or upload a real PDF contract to test.

---

## 📁 Project Structure

```
contract-review-bot/
├── backend/
│   ├── main.py              # FastAPI app, routes, CORS
│   ├── claude_client.py     # Groq API calls + prompts
│   ├── pdf_parser.py        # PDF text extraction
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.tsx          # Main React component
│   │   └── main.tsx         # Entry point
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── .env.example             # Environment variables template
├── .gitignore
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the `backend/` folder:

```env
# Required
GROQ_API_KEY=gsk_your_key_here

# Optional (default: llama-3.3-70b-versatile)
GROQ_MODEL=llama-3.3-70b-versatile
```

Get your free Groq API key at 👉 [console.groq.com](https://console.groq.com)

---

## 📊 API Reference

### `POST /analyze`

Analyze a contract.

**Request:** `multipart/form-data`
- `file` — `.pdf` or `.txt` file (optional)
- `text` — raw contract string (optional)

**Response:**
```json
{
  "parties": ["TechCorp Inc.", "Jane Developer"],
  "dates": {
    "effective": "2025-03-01",
    "duration": "ongoing",
    "renewal": "automatic yearly, 30-day opt-out"
  },
  "payment_terms": "$75/hour, invoiced monthly, 5% late fee",
  "termination": "14 days written notice",
  "renewal": "auto-renewal with 30-day opt-out",
  "confidentiality": "Contractor cannot disclose Client info",
  "ip_ownership": "All work assigned to Client",
  "governing_law": "Delaware",
  "risks": [
    {
      "clause": "One-sided Indemnification",
      "category": "indemnity",
      "risk_level": "high",
      "text_excerpt": "Contractor agrees to indemnify...",
      "explanation": "You bear all legal costs..."
    }
  ],
  "plain_english_summary": "..."
}
```

### `GET /health`
Returns `{"status": "ok"}` ✅

---

## 🚩 Risk Categories

| Category | Description |
|---|---|
| `auto-renewal` | Contract renews without explicit action |
| `liability` | Uncapped or one-sided liability |
| `missing-exit` | No termination-for-convenience clause |
| `ip-assignment` | Broad IP transfer to other party |
| `indemnity` | One-sided legal cost obligation |
| `payment` | Unusual fees or payment terms |
| `confidentiality` | Overly broad confidentiality scope |

---

## 📝 Note on AI Model

This project uses **Groq API (Llama 3.3 70B)** as the AI brain. As per the task instructions:
> *"If Claude is not available, any other LLM API is acceptable"*

The system prompt and JSON extraction logic are designed to work with any LLM API. To switch to Claude, simply update `claude_client.py` with the Anthropic SDK.

---

## 👨‍💻 Built By

Akshit Thakur — AI Engineer Hiring Task Submission

---

*ContractLens is not a substitute for professional legal advice. Always consult a qualified attorney for important legal matters.*
