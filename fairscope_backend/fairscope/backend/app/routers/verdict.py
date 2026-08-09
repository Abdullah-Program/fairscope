"""
POST /api/verdict/generate
Takes the SHAP + fairness evidence already computed in /audit/analyze
and asks Groq LLM to produce the plain-english "Verdict" tab content,
plus a compliance checklist.
"""
from fastapi import APIRouter, HTTPException

from app.database.db import AUDIT_CACHE, save_verdict, save_full_verdict
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

    try:
        verdict_val = result.get("verdict", "POTENTIALLY_BIASED")
        confidence_val = float(result.get("confidence", 0.5))
        risk_score_val = float(result.get("risk_score", 50.0))
        summary_val = result.get("summary", "Analysis complete.")
        key_findings_val = result.get("key_findings", [])
        mitigation_val = result.get("mitigation_recommendations", [])
        debate_val = result.get("debate_transcript", [])
    except Exception:
        verdict_val = "POTENTIALLY_BIASED"
        confidence_val = 0.5
        risk_score_val = 50.0
        summary_val = "Verdict generation encountered an issue."
        key_findings_val = []
        mitigation_val = []
        debate_val = []

    compliance_checklist = [
        {
            "check": m["metric"],
            "feature": m["sensitive_feature"],
            "value": m["value"],
            "passes": m["passes"],
        }
        for m in fairness_metrics
    ]

    save_verdict(audit_id, verdict_val, summary_val)

    verdict_response = {
        "audit_id": audit_id,
        "verdict": verdict_val,
        "confidence": confidence_val,
        "risk_score": risk_score_val,
        "summary": summary_val,
        "key_findings": key_findings_val,
        "mitigation_recommendations": mitigation_val,
        "compliance_checklist": compliance_checklist,
        "debate_transcript": debate_val,
    }
    save_full_verdict(audit_id, verdict_response)
    
    cache["last_verdict"] = verdict_response

    return VerdictResponse(
        audit_id=audit_id,
        verdict=verdict_val,
        confidence=confidence_val,
        risk_score=risk_score_val,
        summary=summary_val,
        key_findings=key_findings_val,
        mitigation_recommendations=mitigation_val,
        compliance_checklist=compliance_checklist,
        debate_transcript=debate_val,
    )
