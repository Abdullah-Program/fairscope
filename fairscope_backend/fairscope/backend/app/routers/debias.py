"""
POST /api/debias/fix/{audit_id}      -> Triggers automated debiasing & model retraining
GET  /api/debias/download/{audit_id} -> Downloads debiased_model.pkl file
"""
import os
import joblib
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from app.config import settings
from app.database.db import AUDIT_CACHE
from app.services.debias_service import retrain_debiased_model, evaluate_debiased_model

router = APIRouter(prefix="/api/debias", tags=["debias"])


@router.post("/fix/{audit_id}")
def fix_bias(audit_id: str):
    if audit_id not in AUDIT_CACHE:
        raise HTTPException(status_code=404, detail="Audit ID not found in active session.")

    cache = AUDIT_CACHE[audit_id]
    model = cache["model"]
    df = cache["df"]
    target_column = cache["target_column"]
    
    # Retrieve last analyzed sensitive features if available
    sensitive_features = cache.get("last_sensitive_features", [])
    if not sensitive_features:
        last_metrics = cache.get("last_fairness_metrics", [])
        sensitive_features = list(set(m["sensitive_feature"] for m in last_metrics)) if last_metrics else []

    try:
        new_model = retrain_debiased_model(model, df, target_column, sensitive_features)
        evaluation = evaluate_debiased_model(model, new_model, df, target_column, sensitive_features)
        
        audit_dir = os.path.join(settings.upload_dir, audit_id)
        os.makedirs(audit_dir, exist_ok=True)
        debiased_model_path = os.path.join(audit_dir, "debiased_model.pkl")
        joblib.dump(new_model, debiased_model_path)
        
        cache["debiased_model_path"] = debiased_model_path
        
        res = {
            "audit_id": audit_id,
            "debiased_model_filename": "debiased_model.pkl",
            "post_risk_score": evaluation.get("post_risk_score", 0),
            "accuracy_retention": evaluation.get("accuracy_retention", 100.0),
            "post_fairness_metrics": evaluation.get("post_fairness_metrics", []),
            "status": "SUCCESS",
            "message": "Model debiased and retrained successfully."
        }
        cache["debias_result"] = res
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Debiasing failed: {str(e)}")


@router.get("/download/{audit_id}")
def download_debiased_model(audit_id: str):
    file_path = os.path.join(settings.upload_dir, audit_id, "debiased_model.pkl")
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Debiased model file not found. Run /api/debias/fix first.")
    
    return FileResponse(
        path=file_path,
        filename=f"debiased_{audit_id}_model.pkl",
        media_type="application/octet-stream",
    )
