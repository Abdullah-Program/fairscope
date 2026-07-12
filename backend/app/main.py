"""
FairScope Backend — main entry point.

Run with:
    uvicorn app.main:app --reload --port 8000

Docs available at http://localhost:8000/docs
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database.db import init_db
from app.routers import upload, audit, verdict, simulate, report

app = FastAPI(
    title="FairScope API",
    description="AI Fairness Auditor — upload a model, get a case-file style bias report.",
    version="1.0.0",
)

# Allow the React frontend (running on a different port) to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(upload.router)
app.include_router(audit.router)
app.include_router(verdict.router)
app.include_router(simulate.router)
app.include_router(report.router)


@app.on_event("startup")
def on_startup():
    init_db()


@app.get("/")
def root():
    return {
        "message": "FairScope API is running",
        "docs": "/docs",
        "endpoints": [
            "POST /api/upload/model",
            "POST /api/audit/analyze/{audit_id}",
            "POST /api/verdict/generate",
            "POST /api/simulate/whatif",
            "GET  /api/report/{audit_id}/pdf",
            "GET  /api/report/history",
        ],
    }
