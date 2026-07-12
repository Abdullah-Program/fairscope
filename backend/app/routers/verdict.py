"""
POST /api/verdict/generate
Takes the SHAP + fairness evidence already computed in /audit/analyze
and asks Groq LLM to produce the plain-english "Verdict" tab content,
plus a compliance checklist.
"""
from fastapi import APIRouter, HTTPException

from app.database.db import AUDIT_CACHE, save_verdict
from app.services.llm_service import generate_verdict
from app.models.schemas import VerdictRequest, VerdictResponse

router = APIRouter(prefix="/api/verdict", tags=["verdict"])


@router.post("/generate", response_model=VerdictResponse)
def generate(payload: VerdictRequest):
    audit_id = payload.audit_id
    if audit_id not in AUDIT_CACHE:
        raise HTTPException(status_code=404, detail="Audit ID not found.")

    cache = AUDIT_CACHE[audit_id]
    feature_importances = cache.get("last_feature_importances")
    fairness_metrics = cache.get("last_fairness_metrics", [])

    if feature_importances is None:
        raise HTTPException(
            status_code=400,
            detail="Run /api/audit/analyze/{audit_id} before generating a verdict."
        )

    result = generate_verdict(
        feature_importances=feature_importances,
        fairness_metrics=fairness_metrics,
        target_column=cache["target_column"],
    )

    compliance_checklist = [
        {
            "check": m["metric"],
            "feature": m["sensitive_feature"],
            "value": m["value"],
            "passes": m["passes"],
        }
        for m in fairness_metrics
    ]

    save_verdict(audit_id, result["verdict"], result["summary"])

    return VerdictResponse(
        audit_id=audit_id,
        verdict=result["verdict"],
        confidence=result["confidence"],
        summary=result["summary"],
        key_findings=result["key_findings"],
        compliance_checklist=compliance_checklist,
    )
