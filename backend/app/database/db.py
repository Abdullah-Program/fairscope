"""
Persistence layer — now backed by PostgreSQL via SQLAlchemy ORM
instead of raw sqlite3. Works with any SQLAlchemy-compatible DB
(Postgres, MySQL, SQLite) just by changing DATABASE_URL in .env.

Heavy objects (trained model, dataframe, shap explainer) still live
in an in-memory dict — those are session-only and too large/complex
to store in a relational DB. Only audit metadata + verdict text
gets persisted, which is what "history" needs.
"""
from sqlalchemy import create_engine, Column, String, DateTime, Text
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime

from app.config import settings

# In-memory cache holding heavy objects (model, dataframe, shap values)
# key = audit_id -> dict. This stays exactly as before — DB choice
# doesn't affect this part.
AUDIT_CACHE: dict = {}

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


class Audit(Base):
    __tablename__ = "audits"

    audit_id = Column(String, primary_key=True)
    model_filename = Column(String)
    dataset_filename = Column(String)
    target_column = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    verdict = Column(String, nullable=True)
    summary = Column(Text, nullable=True)


def init_db():
    Base.metadata.create_all(bind=engine)


def save_audit_metadata(audit_id, model_filename, dataset_filename, target_column):
    db = SessionLocal()
    try:
        existing = db.get(Audit, audit_id)
        if existing:
            db.delete(existing)
            db.commit()
        record = Audit(
            audit_id=audit_id,
            model_filename=model_filename,
            dataset_filename=dataset_filename,
            target_column=target_column,
            created_at=datetime.utcnow(),
        )
        db.add(record)
        db.commit()
    finally:
        db.close()


def save_verdict(audit_id, verdict, summary):
    db = SessionLocal()
    try:
        record = db.get(Audit, audit_id)
        if record:
            record.verdict = verdict
            record.summary = summary
            db.commit()
    finally:
        db.close()


def get_audit_history():
    db = SessionLocal()
    try:
        records = db.query(Audit).order_by(Audit.created_at.desc()).all()
        return [
            {
                "audit_id": r.audit_id,
                "model_filename": r.model_filename,
                "dataset_filename": r.dataset_filename,
                "target_column": r.target_column,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "verdict": r.verdict,
                "summary": r.summary,
            }
            for r in records
        ]
    finally:
        db.close()
