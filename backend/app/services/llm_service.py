"""
Wraps the Groq API (FREE, fast Llama 3.3 70B) to turn raw SHAP numbers
and fairness metrics into a human-readable "verdict" - this is what
makes FairScope feel like an investigation report instead of a
raw stats dump.
"""
import json
from groq import Groq
from app.config import settings

client = Groq(api_key=settings.groq_api_key) if settings.groq_api_key else None


SYSTEM_PROMPT = """You are FairScope, an AI fairness auditor. You are given
statistical evidence (SHAP feature importances and fairness metrics) about
a machine learning model. Your job is to act like an impartial investigator
writing a case file - NOT a lawyer arguing one side.

Respond ONLY with valid JSON in this exact structure, nothing else:
{
  "verdict": "FAIR" | "POTENTIALLY_BIASED" | "BIASED",
  "confidence": <float 0.0 to 1.0>,
  "summary": "<2-3 sentence plain english summary of the finding>",
  "key_findings": ["<finding 1>", "<finding 2>", "<finding 3>"]
}

Base your verdict primarily on the fairness_metrics (statistical, objective)
and use feature_importances as supporting evidence. If a sensitive-looking
feature (zip code, gender, age, race, religion, marital status) has high
importance AND fairness metrics fail their threshold, lean towards BIASED.
If fairness metrics pass but a sensitive feature still has notable importance,
lean towards POTENTIALLY_BIASED. Be precise, cite actual numbers you were given.
"""


def generate_verdict(feature_importances: list, fairness_metrics: list,
                      target_column: str) -> dict:
    """
    Calls Groq LLM with the evidence and returns a structured verdict.
    Falls back to a rule-based verdict if no API key is configured,
    so the project still runs end-to-end for demo purposes.
    """
    if client is None:
        return _fallback_verdict(feature_importances, fairness_metrics)

    user_message = f"""
Target being predicted: {target_column}

Top feature importances (SHAP):
{json.dumps(feature_importances[:8], indent=2)}

Fairness metrics computed:
{json.dumps(fairness_metrics, indent=2)}

Generate the case file JSON now.
"""

    try:
        response = client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.3,
            max_tokens=800,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content
        parsed = json.loads(content)
        return parsed
    except Exception as e:
        fallback = _fallback_verdict(feature_importances, fairness_metrics)
        fallback["summary"] = f"[LLM call failed, rule-based fallback used: {e}] " + fallback["summary"]
        return fallback


def _fallback_verdict(feature_importances: list, fairness_metrics: list) -> dict:
    """Simple rule-based backup so the app never fully breaks without an API key."""
    failed_metrics = [m for m in fairness_metrics if not m.get("passes", True)]

    if len(failed_metrics) >= 2:
        verdict = "BIASED"
        confidence = 0.75
    elif len(failed_metrics) == 1:
        verdict = "POTENTIALLY_BIASED"
        confidence = 0.6
    else:
        verdict = "FAIR"
        confidence = 0.7

    top_features = [f["feature"] for f in feature_importances[:3]]

    return {
        "verdict": verdict,
        "confidence": confidence,
        "summary": (
            f"Based on {len(fairness_metrics)} statistical fairness checks, "
            f"{len(failed_metrics)} failed their threshold. Top influencing "
            f"features were: {', '.join(top_features)}."
        ),
        "key_findings": [
            f"{m['metric']} on '{m['sensitive_feature']}' = {m['value']} "
            f"({'PASS' if m['passes'] else 'FAIL'})"
            for m in fairness_metrics
        ] or ["No sensitive features were provided for fairness testing."],
    }


def explain_whatif_change(original_pred, new_pred, changed_features: list,
                           contributions: list) -> str:
    """Generates a short natural language explanation for the what-if simulator."""
    if client is None:
        return (
            f"Changing {', '.join(changed_features)} moved the prediction "
            f"from {original_pred} to {new_pred}. Top contributing feature: "
            f"{contributions[0]['feature'] if contributions else 'N/A'}."
        )

    prompt = f"""In one short sentence, explain why changing {changed_features}
caused the model's prediction to go from {original_pred} to {new_pred}.
Top feature contributions: {json.dumps(contributions[:3])}
Keep it under 30 words, plain English, no jargon."""

    try:
        response = client.chat.completions.create(
            model=settings.groq_model,
            messages=[{"role": "user", "content": prompt}],
            temperature=0.4,
            max_tokens=100,
        )
        return response.choices[0].message.content.strip()
    except Exception:
        return (
            f"Changing {', '.join(changed_features)} moved the prediction "
            f"from {original_pred} to {new_pred}."
        )
