"""
POST /api/audit/analyze
Runs SHAP against the uploaded model+dataset (the "Evidence" tab data)
plus optional fairness metrics if sensitive_features are provided.
"""
from fastapi import APIRouter, HTTPException, Query
from typing import List, Optional

from app.database.db import AUDIT_CACHE, save_full_evidence
from app.services.explainability_service import ExplainabilityService
from app.services.fairness_metrics import run_all_fairness_checks
from app.models.schemas import AuditResult

router = APIRouter(prefix="/api/audit", tags=["audit"])


@router.post("/analyze/{audit_id}", response_model=AuditResult)
def analyze(audit_id: str, sensitive_features: Optional[List[str]] = Query(default=None)):
    if audit_id not in AUDIT_CACHE:
        raise HTTPException(status_code=404, detail="Audit ID not found. Upload a model first.")

    cache = AUDIT_CACHE[audit_id]
    model = cache["model"]
    X = cache["X"]

    # Limit rows for speed on free-tier hosting / KernelExplainer fallback
    X_sample = X.head(200).copy() if len(X) > 200 else X.copy()

    service = ExplainabilityService(model, X_sample)
    feature_importances = service.compute_global_importance()
    sample_predictions = service.get_sample_predictions(n=10)

    cache["explainability_service"] = service  # reuse in what-if simulator

    fairness_results = []
    if sensitive_features:
        predictions = model.predict(X_sample)
        fairness_results = run_all_fairness_checks(X_sample, predictions, sensitive_features)

    cache["last_feature_importances"] = feature_importances
    cache["last_fairness_metrics"] = fairness_results
    cache["last_sensitive_features"] = sensitive_features or []

    # Persist evidence for history reopening
    evidence_data = {
        "audit_id": audit_id,
        "feature_importances": feature_importances,
        "sample_predictions": sample_predictions,
        "fairness_metrics": {"results": fairness_results},
    }
    save_full_evidence(audit_id, evidence_data)

    return AuditResult(
        audit_id=audit_id,
        feature_importances=feature_importances,
        sample_predictions=sample_predictions,
        fairness_metrics={"results": fairness_results},
    )
