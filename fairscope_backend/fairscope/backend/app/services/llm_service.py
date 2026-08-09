"""
Wraps the Groq API (FREE, fast Llama 3.3 70B) to turn raw SHAP numbers
and fairness metrics into a human-readable "verdict" - this is what
makes FairScope feel like an investigation report instead of a
raw stats dump.
"""
import json
from groq import Groq
from app.config import settings

_placeholder_keys = {"your_groq_api_key_here", "your_key_here", "gsk_your_actual_key_here", ""}
client = (
    Groq(api_key=settings.groq_api_key)
    if settings.groq_api_key and settings.groq_api_key not in _placeholder_keys
    else None
)


SYSTEM_PROMPT = """You are FairScope, an AI fairness auditing engine. You manage a Multi-Agent Courtroom Hearing evaluating a machine learning model for bias.

The hearing consists of three specialized AI agents:
1. Prosecutor AI: Highlights model bias, discriminatory proxies, and statutory metric failures.
2. Defense AI: Defends model performance, business necessity, and legitimate feature relationships.
3. Judge AI: Evaluates both arguments to deliver the final Verdict, Risk Index (0-100), and Court Order.

Respond ONLY with valid JSON in this exact structure:
{
  "verdict": "FAIR" | "POTENTIALLY_BIASED" | "BIASED",
  "confidence": <float 0.0 to 1.0>,
  "risk_score": <number 0 to 100 representing overall bias risk level>,
  "summary": "<2-3 sentence plain english summary of the finding>",
  "key_findings": ["<finding 1>", "<finding 2>", "<finding 3>"],
  "mitigation_recommendations": ["<actionable recommendation 1>", "<actionable recommendation 2>"],
  "debate_transcript": [
    {
      "agent": "Prosecutor",
      "title": "Indictment: Unlawful Statistical Disparity",
      "argument": "<Prosecutor AI speech detailing bias and failed metrics>"
    },
    {
      "agent": "Defense",
      "title": "Rebuttal: Business Necessity & Metric Validity",
      "argument": "<Defense AI speech defending feature legitimacy and predictive necessity>"
    },
    {
      "agent": "Judge",
      "title": "Final Adjudication & Regulatory Order",
      "argument": "<Judge AI speech summarizing the final ruling and risk assessment>"
    }
  ]
}

Base your verdict primarily on the fairness_metrics (statistical, objective)
and use feature_importances as supporting evidence. Be precise and cite specific feature names and metric values.
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

Execute the Multi-Agent Courtroom Debate and return JSON now.
"""

    try:
        response = client.chat.completions.create(
            model=settings.groq_model,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": user_message},
            ],
            temperature=0.3,
            max_tokens=1000,
            response_format={"type": "json_object"},
        )
        content = response.choices[0].message.content
        parsed = json.loads(content)
        parsed.setdefault("risk_score", _compute_risk_score(fairness_metrics, parsed.get("verdict", "FAIR")))
        parsed.setdefault("debate_transcript", _fallback_debate(feature_importances, fairness_metrics, parsed.get("verdict", "FAIR")))
        parsed.setdefault("mitigation_recommendations", [])
        return parsed
    except Exception as e:
        fallback = _fallback_verdict(feature_importances, fairness_metrics)
        fallback["summary"] = f"[LLM call failed, rule-based fallback used: {e}] " + fallback["summary"]
        return fallback


def _compute_risk_score(fairness_metrics: list, verdict: str) -> int:
    """Compute a 0-100 risk score from fairness metric failures."""
    if not fairness_metrics:
        return {"FAIR": 15, "POTENTIALLY_BIASED": 45, "BIASED": 75}.get(verdict, 45)
    failed = [m for m in fairness_metrics if not m.get("passes", True)]
    total = len(fairness_metrics)
    base = (len(failed) / max(total, 1)) * 100
    severity = 0
    for m in failed:
        val = abs(m.get("value", 0))
        if m["metric"] == "Disparate Impact Ratio":
            severity += max(0, (0.8 - val) * 100)
        elif m["metric"] == "Demographic Parity Difference":
            severity += max(0, (val - 0.1) * 200)
    score = min(100, int(base * 0.5 + min(severity, 50) * 1.0))
    return max(0, score)


def _fallback_debate(feature_importances, fairness_metrics, verdict):
    """Generate a rule-based debate transcript when LLM is unavailable."""
    top = feature_importances[0]["feature"] if feature_importances else "unknown feature"
    failed = [m for m in fairness_metrics if not m.get("passes", True)]
    fail_str = ", ".join(f"{m['metric']} = {m['value']}" for m in failed[:2]) if failed else "no threshold violations"
    return [
        {
            "agent": "Prosecutor",
            "title": "Bias Indictment",
            "argument": f"The evidence is clear: '{top}' carries disproportionate weight in this model's decisions. Fairness checks show {fail_str}, failing their legal thresholds. This constitutes systemic discrimination.",
        },
        {
            "agent": "Defense",
            "title": "Model Defense",
            "argument": f"'{top}' may correlate with the target legitimately. Without domain context, correlation cannot be equated with discrimination. The model may reflect real-world patterns rather than introduce new bias.",
        },
        {
            "agent": "Judge",
            "title": "Final Ruling",
            "argument": f"Having reviewed both arguments, the court finds the model {verdict.replace('_', ' ').lower()}. Statistical evidence of disparity is present; the burden of proof on legitimate justification was not met. Remediation is ordered.",
        },
    ]


def _fallback_verdict(feature_importances: list, fairness_metrics: list) -> dict:
    """Simple rule-based backup so the app never fully breaks without an API key."""
    failed_metrics = [m for m in fairness_metrics if not m.get("passes", True)]
    top_features = [f["feature"] for f in feature_importances[:3]]

    if len(failed_metrics) >= 2:
        verdict = "BIASED"
        confidence = 0.85
        risk_score = 85.0
        prosecutor_arg = f"The evidence shows critical statutory violations! {len(failed_metrics)} fairness metrics failed, notably on '{failed_metrics[0].get('sensitive_feature')}' with a disparate ratio of {failed_metrics[0].get('value')}. The model relies heavily on proxy variables."
        defense_arg = f"While sensitive feature correlation exists, features like '{top_features[0]}' are core business risk drivers. Complete elimination of these signals could degrade predictive accuracy across all populations."
        judge_arg = f"The Court finds the model guilty of discriminatory bias. Risk score is high at 85/100. Automated remediation is ordered before deployment."
        recommendations = [
            "Perform sample re-weighting or adversarial debiasing on unprivileged demographic groups.",
            "Remove or re-encode proxy features (e.g. zip_code) that strongly correlate with protected attributes.",
            "Audit training data collection pipelines to balance historical skew before redeploying."
        ]
    elif len(failed_metrics) == 1:
        verdict = "POTENTIALLY_BIASED"
        confidence = 0.70
        risk_score = 55.0
        prosecutor_arg = f"Caution is warranted. A single demographic parity metric failed on '{failed_metrics[0].get('sensitive_feature')}', showing a skewed selection rate."
        defense_arg = f"The disparity is marginal. The model relies primarily on legitimate predictive features ({', '.join(top_features[:2])}) with low overall impact."
        judge_arg = "The Court issues a warning. Moderate bias risk detected (55/100). Threshold tuning and subgroup sample collection required."
        recommendations = [
            "Collect additional representative samples for unprivileged subgroups.",
            "Apply post-processing decision threshold adjustments to satisfy equalized odds."
        ]
    else:
        verdict = "FAIR"
        confidence = 0.80
        risk_score = 15.0
        prosecutor_arg = "All statistical audit checks passed the 80% legal threshold. No explicit discriminatory impact observed."
        defense_arg = f"The model operates cleanly. Feature weights are distributed proportionally across legitimate variables like {', '.join(top_features)}."
        judge_arg = "The Court clears the model for deployment. Risk index is low (15/100). Maintain continuous monitoring."
        recommendations = [
            "Model satisfies the 80% disparity rule. Continue routine continuous monitoring for fairness drift.",
            "Maintain versioned audit logs for regulatory compliance documentation."
        ]

    return {
        "verdict": verdict,
        "confidence": confidence,
        "risk_score": _compute_risk_score(fairness_metrics, verdict),
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
        "mitigation_recommendations": [
            f"Apply inverse-probability weighting to balance outcomes across groups in '{top_features[0] if top_features else 'sensitive features'}'.",
            "Re-evaluate feature selection: remove or transform features that act as proxies for protected attributes.",
            "Introduce fairness constraints during model training (e.g., Fairlearn's ExponentiatedGradient).",
        ],
        "debate_transcript": _fallback_debate(feature_importances, fairness_metrics, verdict),
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
