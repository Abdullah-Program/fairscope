# FairScope — AI Fairness Auditor

> **Every audit becomes a case file — evidence, verdict, and the numbers to defend it.**

FairScope is a full-stack AI auditing web app that takes a trained scikit-learn model and its dataset, runs SHAP-based explainability analysis, tests statistical fairness across sensitive features, and delivers a plain-English case file verdict powered by a multi-agent LLM courtroom debate.

---

## 🎬 Demo

> **Live:** _[your-deployment-url]_  
> Test credentials: `demo@fairscope.io` / `demo1234`

---

## ✨ Features

### 🔍 Evidence Engine
- **SHAP explainability** — Mean absolute SHAP values reveal which features actually drive predictions
- **Disparate Impact analysis** — Statistical fairness tests across any sensitive feature (zip code, gender, age, etc.)
- **Sample predictions table** — Ground truth vs. model output for first 10 rows

### ⚖️ Multi-Agent Courtroom Verdict
- Three LLM agents debate the model's fairness: **Prosecutor AI**, **Defense AI**, **Judge AI**
- Powered by **Groq's Llama 3.3 70B** (free, ~200ms latency)
- Outputs: Verdict (`FAIR` / `POTENTIALLY_BIASED` / `BIASED`), Bias Risk Index (0–100), Key Findings, Mitigation Plan

### 🔬 Cross-Examination (What-If Simulator)
- Change any feature value and see how the prediction shifts
- Live SHAP recalculation for the modified scenario

### ⚡ Automated Debiaser
- One-click inverse-probability demographic re-weighting
- Retrains a fair scikit-learn model on-the-fly
- Download the debiased `.pkl` model directly

### 📄 PDF Report Export
- Full audit report with all findings, downloadable for sharing

### 🔐 Auth & Security
- Supabase auth with **email OTP verification** (6–8 digit, custom SMTP via Gmail)
- Protected routes — unverified users cannot access dashboard
- Password reset flow

---

## 🛠️ Tech Stack

| Layer | Tech |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Framer Motion, Lucide |
| **Backend** | FastAPI, Python 3.11, SQLite (SQLAlchemy) |
| **ML / XAI** | scikit-learn, SHAP, NumPy, pandas |
| **LLM** | Groq API — `llama-3.3-70b-versatile` |
| **Auth** | Supabase Auth (email OTP) |
| **PDF** | ReportLab |

---

## 🗂️ Project Structure

```
fairscope/
├── fairscope-frontend/          # React app
│   └── src/
│       ├── pages/               # LandingPage, NewAuditPage, AuditResultsPage, HistoryPage
│       ├── components/
│       │   ├── auth/            # AuthLayout, ProtectedRoute
│       │   ├── dashboard/       # EvidenceTab, VerdictTab, CrossExamineTab, DebiasCard, Sidebar
│       │   └── landing/         # Hero, Navbar, HowItWorks, CaseFilePreview, Features
│       ├── context/             # AuthContext (Supabase session)
│       └── lib/                 # api.js (axios), supabaseClient.js
│
└── fairscope_backend/
    └── app/
        ├── main.py              # FastAPI entry point
        ├── config.py            # Pydantic settings (.env)
        ├── routers/             # upload, audit, verdict, simulate, report, debias
        └── services/
            ├── explainability_service.py   # SHAP pipeline
            ├── fairness_metrics.py         # Disparate impact, demographic parity
            ├── llm_service.py              # Groq multi-agent courtroom
            ├── debias_service.py           # Re-weighting + retraining
            └── model_loader.py             # .pkl / .joblib loader
```

---

## 🚀 Running Locally

### Prerequisites
- Python 3.10+
- Node.js 18+
- A free [Groq API key](https://console.groq.com)
- A free [Supabase](https://supabase.com) project

### 1. Clone & Backend Setup

```bash
git clone https://github.com/Abdullah-Program/fairscope.git
cd fairscope/fairscope_backend

python -m venv .venv
source .venv/bin/activate       # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

Create `fairscope_backend/.env`:

```env
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
DATABASE_URL=sqlite:///./fairscope.db
UPLOAD_DIR=uploads
MAX_UPLOAD_SIZE_MB=25
```

```bash
uvicorn app.main:app --reload --port 8000
# API docs → http://localhost:8000/docs
```

### 2. Frontend Setup

```bash
cd fairscope/fairscope-frontend
npm install
```

Create `fairscope-frontend/.env`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_BASE_URL=http://localhost:8000
```

```bash
npm run dev
# App → http://localhost:5173
```

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **Auth → Providers → Email** → enable **Confirm email**
3. _(Optional)_ Set up custom SMTP (Gmail App Password) to customize the OTP email template

### 4. Try it with Sample Data

Don't have a model? Generate one:

```bash
cd fairscope_backend
python fairscope/generate_sample_model.py
# Creates: sample_model.pkl + sample_dataset.csv
```

Upload both files, set target column to `approved`, and run the audit.

---

## 📡 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/upload/model` | Upload `.pkl`/`.joblib` + CSV |
| `POST` | `/api/audit/analyze/{audit_id}` | Run SHAP + fairness metrics |
| `POST` | `/api/verdict/generate` | LLM multi-agent verdict |
| `POST` | `/api/simulate/whatif` | What-if feature simulation |
| `GET` | `/api/report/{audit_id}/pdf` | Download PDF report |
| `GET` | `/api/report/history` | List past audits |
| `POST` | `/api/debias/fix/{audit_id}` | Retrain debiased model |
| `GET` | `/api/debias/download/{audit_id}` | Download debiased `.pkl` |

Full interactive docs at `/docs` (Swagger UI).

---

## 🌐 Deployment

**Frontend → Vercel**
```bash
cd fairscope-frontend
npm run build
# Deploy dist/ to Vercel, set env vars in Vercel dashboard
```

**Backend → Render**  
Connect the `fairscope_backend` folder, set start command:
```
uvicorn app.main:app --host 0.0.0.0 --port $PORT
```
Add env vars (`GROQ_API_KEY`, etc.) in Render dashboard.

---

## 🤝 Author

Built by **Abdullah** — aspiring AI Engineer  
GitHub: [@Abdullah-Program](https://github.com/Abdullah-Program)

---

_Part of a portfolio of full-stack agentic AI projects targeting AI startup internships._
