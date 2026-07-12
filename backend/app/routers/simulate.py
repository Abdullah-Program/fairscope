"""
POST /api/simulate/whatif
Powers the "Cross-Examination" tab: user changes one or more feature
values via sliders/inputs on the frontend, this recomputes the
prediction + SHAP explanation for that single modified row in real time.
"""
import pandas as pd
from fastapi import APIRouter, HTTPException

from app.database.db import AUDIT_CACHE
from app.services.llm_service import explain_whatif_change
from app.models.schemas import WhatIfRequest, WhatIfResponse, FeatureImportance

router = APIRouter(prefix="/api/simulate", tags=["simulate"])


@router.post("/whatif", response_model=WhatIfResponse)
def whatif(payload: WhatIfRequest):
    audit_id = payload.audit_id
    if audit_id not in AUDIT_CACHE:
        raise HTTPException(status_code=404, detail="Audit ID not found.")

    cache = AUDIT_CACHE[audit_id]
    service = cache.get("explainability_service")
    X = cache["X"]

    if service is None:
        raise HTTPException(
            status_code=400,
            detail="Run /api/audit/analyze/{audit_id} first to initialize the explainer."
        )

    # Take the first row of the dataset as a baseline, apply user's changes
    baseline_row = X.iloc[[0]].copy()
    original_row = baseline_row.copy()

    for feature, new_value in payload.modified_row.items():
        if feature not in baseline_row.columns:
            raise HTTPException(status_code=400, detail=f"Unknown feature: {feature}")
        baseline_row[feature] = new_value

    model = cache["model"]
    original_pred = model.predict(original_row)[0]
    new_pred, contributions = service.compute_single_prediction(baseline_row)

    changed_features = list(payload.modified_row.keys())

    explanation = explain_whatif_change(
        original_pred=original_pred,
        new_pred=new_pred,
        changed_features=changed_features,
        contributions=contributions,
    )

    return WhatIfResponse(
        original_prediction=original_pred if not hasattr(original_pred, "item") else original_pred.item(),
        new_prediction=new_pred if not hasattr(new_pred, "item") else new_pred.item(),
        changed_features=changed_features,
        explanation=explanation,
        feature_contributions=[FeatureImportance(**c) for c in contributions],
    )
