# FairScope — AI Fairness Auditor (Backend)

Upload a trained ML model + dataset, get a "case file" style bias audit report
powered by SHAP explainability + Groq LLM (free).

## 🚀 Quick Setup

### 1. Create virtual environment
```bash
cd fairscope
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
```

### 2. Install dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 3. Get a FREE Groq API key
- Go to https://console.groq.com/keys
- Sign up (free, no credit card)
- Create an API key

### 4. Setup PostgreSQL (local)
Install PostgreSQL on your machine (postgresql.org/download), then create
the database:
```bash
psql postgres
```
```sql
CREATE DATABASE fairscope;
CREATE USER fairscope_user WITH PASSWORD 'your_password_here';
GRANT ALL PRIVILEGES ON DATABASE fairscope TO fairscope_user;
\q
```

### 5. Setup environment variables
```bash
cp .env.example .env
```
Open `.env` and fill in:
```
GROQ_API_KEY=gsk_your_actual_key_here
DATABASE_URL=postgresql://fairscope_user:your_password_here@localhost:5432/fairscope
```
Make sure the password matches what you set in step 4.

> **Note:** If you skip this step, the app still runs — `llm_service.py` has a
> rule-based fallback verdict generator so nothing breaks. But for the full
> "AI-generated report" experience, add the free Groq key.

### 5. Generate a demo model + dataset (optional but recommended)
From the `fairscope/` root folder:
```bash
python generate_sample_model.py
```
This creates `ml_examples/loan_approval_model.pkl` and `ml_examples/loan_dataset.csv`
— a synthetic loan-approval model with an intentionally baked-in bias
(against `zip_code`) so you have something interesting to detect in the demo.

### 6. Run the backend
```bash
cd backend
uvicorn app.main:app --reload --port 8000
```

Backend will be live at: **http://localhost:8000**
Interactive API docs (Swagger): **http://localhost:8000/docs**

---

## 🧪 Test it via /docs (before building frontend)

1. Open http://localhost:8000/docs
2. `POST /api/upload/model` — upload `ml_examples/loan_approval_model.pkl` as
   `model_file`, `ml_examples/loan_dataset.csv` as `dataset_file`,
   `target_column = approved`. Copy the returned `audit_id`.
3. `POST /api/audit/analyze/{audit_id}` — paste your audit_id, add
   `sensitive_features = ["zip_code", "gender"]` as query params.
4. `POST /api/verdict/generate` — body: `{"audit_id": "your_id"}` — get the
   AI-generated case file verdict.
5. `POST /api/simulate/whatif` — body:
   ```json
   {"audit_id": "your_id", "modified_row": {"zip_code": 1}}
   ```
   See how the prediction changes in real time.
6. `GET /api/report/{audit_id}/pdf` — download the full PDF report.

---

## 📂 Project Structure

```
backend/
├── app/
│   ├── main.py              # FastAPI entry point
│   ├── config.py            # env var loading
│   ├── routers/              # API endpoints (upload, audit, verdict, simulate, report)
│   ├── services/              # core logic (SHAP, fairness metrics, Groq LLM calls)
│   ├── models/schemas.py     # request/response validation
│   └── database/db.py        # SQLite + in-memory audit cache
├── requirements.txt
└── .env.example
```

## ⚠️ Known limitations (be upfront about these in your interview!)

- Model must be a **scikit-learn compatible classifier** with `.predict()`
  (RandomForest, LogisticRegression, GradientBoosting etc. all work).
  XGBoost/LightGBM also work if they expose sklearn API.
- Uses `joblib.load()` which relies on pickle — fine for a personal/demo
  project, but in production you'd sandbox this (mention this awareness
  in interviews, it shows security maturity).
- KernelExplainer (used for non-tree models) is slower — capped dataset
  sample to 200 rows for speed.
- In-memory audit cache means restarting the server clears active sessions
  (metadata history in SQLite survives, but you'd need to re-upload to
  re-run analysis). Fine for a project demo; mention Redis as the
  production upgrade path.

## 🔜 Next: Frontend

This backend exposes everything the React frontend needs — build the
3-tab dashboard (Evidence / Verdict / Cross-Examination) against these
endpoints. Ask for the frontend code separately.
