"""
POST /api/upload/model
Accepts a trained sklearn model (.pkl/.joblib) + a CSV dataset,
saves them, loads them once to validate, and creates an audit_id
that all other endpoints will reference.
"""
import uuid
import os
import shutil
import pandas as pd
from fastapi import APIRouter, UploadFile, File, Form, HTTPException

from app.config import settings
from app.services.model_loader import load_model, load_dataset, ModelLoadError
from app.database.db import AUDIT_CACHE, save_audit_metadata
from app.models.schemas import UploadResponse

router = APIRouter(prefix="/api/upload", tags=["upload"])


@router.post("/model", response_model=UploadResponse)
async def upload_model(
    model_file: UploadFile = File(...),
    dataset_file: UploadFile = File(...),
    target_column: str = Form(...),
):
    audit_id = str(uuid.uuid4())[:8]
    audit_dir = os.path.join(settings.upload_dir, audit_id)
    os.makedirs(audit_dir, exist_ok=True)

    model_path = os.path.join(audit_dir, model_file.filename)
    dataset_path = os.path.join(audit_dir, dataset_file.filename)

    with open(model_path, "wb") as f:
        shutil.copyfileobj(model_file.file, f)
    with open(dataset_path, "wb") as f:
        shutil.copyfileobj(dataset_file.file, f)

    try:
        model = load_model(model_path)
        df = load_dataset(dataset_path, target_column)
    except ModelLoadError as e:
        shutil.rmtree(audit_dir, ignore_errors=True)
        raise HTTPException(status_code=400, detail=str(e))

    X = df.drop(columns=[target_column])

    # cache heavy objects in memory for this session
    AUDIT_CACHE[audit_id] = {
        "model": model,
        "df": df,
        "X": X,
        "target_column": target_column,
        "explainability_service": None,  # built lazily on first /audit/analyze call
    }

    save_audit_metadata(audit_id, model_file.filename, dataset_file.filename, target_column)

    return UploadResponse(
        audit_id=audit_id,
        model_filename=model_file.filename,
        dataset_filename=dataset_file.filename,
        n_rows=len(df),
        n_features=len(X.columns),
        feature_names=list(X.columns),
        target_column=target_column,
    )
