"""
Persistence layer — backed by SQLAlchemy.

The user_id column is added via a SAFE migration in init_db() that
checks whether the column already exists before running ALTER TABLE —
this works correctly on both SQLite and PostgreSQL and won't crash on
a database that already has an `audits` table without user_id.
"""
from sqlalchemy import create_engine, Column, String, DateTime, Text, inspect, text
from sqlalchemy.orm import declarative_base, sessionmaker
from datetime import datetime
import json
from app.config import settings

AUDIT_CACHE: dict = {}

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()


class Audit(Base):
    __tablename__ = "audits"
    audit_id = Column(String, primary_key=True)
    user_id = Column(String, nullable=True, index=True)
    model_filename = Column(String)
    dataset_filename = Column(String)
    target_column = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    verdict = Column(String, nullable=True)
    summary = Column(Text, nullable=True)
    evidence_json = Column(Text, nullable=True)
    verdict_json = Column(Text, nullable=True)


def _ensure_column(conn, table: str, column: str, coltype: str):
    """Adds a column to an existing table only if it doesn't already exist.
    Safe to run every startup — idempotent, works on SQLite and Postgres."""
    inspector = inspect(conn)
    existing_cols = [c["name"] for c in inspector.get_columns(table)]
    if column not in existing_cols:
        conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {column} {coltype}"))


def init_db():
    Base.metadata.create_all(bind=engine)
    with engine.begin() as conn:
        inspector = inspect(conn)
        if "audits" in inspector.get_table_names():
            _ensure_column(conn, "audits", "user_id", "VARCHAR")
            _ensure_column(conn, "audits", "evidence_json", "TEXT")
            _ensure_column(conn, "audits", "verdict_json", "TEXT")


def save_audit_metadata(audit_id, model_filename, dataset_filename, target_column, user_id=None):
    db = SessionLocal()
    try:
        existing = db.get(Audit, audit_id)
        if existing:
            db.delete(existing)
            db.commit()
        record = Audit(
            audit_id=audit_id,
            user_id=user_id,
            model_filename=model_filename,
            dataset_filename=dataset_filename,
            target_column=target_column,
            created_at=datetime.utcnow(),
        )
        db.add(record)
        db.commit()
    finally:
        db.close()


def save_evidence(audit_id, evidence_dict):
    db = SessionLocal()
    try:
        record = db.get(Audit, audit_id)
        if record:
            record.evidence_json = json.dumps(evidence_dict)
            db.commit()
    finally:
        db.close()


def save_verdict(audit_id, verdict, summary, verdict_dict=None):
    db = SessionLocal()
    try:
        record = db.get(Audit, audit_id)
        if record:
            record.verdict = verdict
            record.summary = summary
            if verdict_dict is not None:
                record.verdict_json = json.dumps(verdict_dict)
            db.commit()
    finally:
        db.close()


def get_audit_history(user_id=None):
    """If user_id is given, only that user's audits are returned.
    If omitted, returns everything (used for local/dev testing only)."""
    db = SessionLocal()
    try:
        query = db.query(Audit)
        if user_id:
            query = query.filter(Audit.user_id == user_id)
        records = query.order_by(Audit.created_at.desc()).all()
        return [
            {
                "audit_id": r.audit_id,
                "model_filename": r.model_filename,
                "dataset_filename": r.dataset_filename,
                "target_column": r.target_column,
                "created_at": r.created_at.isoformat() if r.created_at else None,
                "verdict": r.verdict,
                "summary": r.summary,
                "has_full_data": bool(r.evidence_json and r.verdict_json),
            }
            for r in records
        ]
    finally:
        db.close()


def get_full_audit(audit_id, user_id=None):
    """If user_id is given, only returns the audit if it belongs to that user."""
    db = SessionLocal()
    try:
        record = db.get(Audit, audit_id)
        if not record:
            return None
        if user_id and record.user_id and record.user_id != user_id:
            return None
        return {
            "audit_id": record.audit_id,
            "target_column": record.target_column,
            "evidence": json.loads(record.evidence_json) if record.evidence_json else None,
            "verdict": json.loads(record.verdict_json) if record.verdict_json else None,
        }
    finally:
        db.close()


def save_full_evidence(audit_id: str, evidence_data: dict):
    """Persist the full evidence dict for reopening past audits."""
    db = SessionLocal()
    try:
        record = db.get(Audit, audit_id)
        if record:
            record.evidence_json = json.dumps(evidence_data)
            db.commit()
    finally:
        db.close()


def save_full_verdict(audit_id: str, verdict_data: dict):
    """Persist the full verdict dict for reopening past audits."""
    db = SessionLocal()
    try:
        record = db.get(Audit, audit_id)
        if record and isinstance(verdict_data, dict):
            record.verdict = verdict_data.get("verdict")
            record.summary = verdict_data.get("summary")
            record.verdict_json = json.dumps(verdict_data)
            db.commit()
    finally:
        db.close()


# Backward-compatibility aliases
save_evidence = save_full_evidence
get_full_audit_data = get_full_audit
