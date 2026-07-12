"""
Standard, well-known fairness metrics used in ML fairness literature.
These give FairScope's "Compliance Scorecard" real statistical backing
(not just LLM opinion) - this is what EU AI Act style audits actually check.
"""
import pandas as pd
import numpy as np


def disparate_impact_ratio(df: pd.DataFrame, predictions: np.ndarray,
                            sensitive_feature: str, privileged_value):
    """
    Disparate Impact = P(positive outcome | unprivileged group) /
                        P(positive outcome | privileged group)

    A commonly used legal threshold: ratio should be >= 0.8
    (the "80% rule" used in US EEOC guidelines) to be considered fair.
    """
    df = df.copy()
    df["_pred"] = predictions

    privileged_mask = df[sensitive_feature] == privileged_value
    unprivileged_mask = ~privileged_mask

    if privileged_mask.sum() == 0 or unprivileged_mask.sum() == 0:
        return None

    p_privileged = df.loc[privileged_mask, "_pred"].mean()
    p_unprivileged = df.loc[unprivileged_mask, "_pred"].mean()

    if p_privileged == 0:
        return None

    ratio = p_unprivileged / p_privileged
    return {
        "metric": "Disparate Impact Ratio",
        "sensitive_feature": sensitive_feature,
        "value": round(float(ratio), 3),
        "threshold": 0.8,
        "passes": bool(ratio >= 0.8),
        "explanation": (
            f"Unprivileged group receives positive outcomes at "
            f"{round(ratio * 100, 1)}% the rate of the privileged group. "
            f"Legal threshold (EEOC 80% rule) is 80%."
        ),
    }


def demographic_parity_difference(df: pd.DataFrame, predictions: np.ndarray,
                                   sensitive_feature: str, privileged_value):
    """
    Demographic Parity Difference = P(positive | unprivileged) - P(positive | privileged)
    Ideal value is 0. Common acceptable range: -0.1 to 0.1
    """
    df = df.copy()
    df["_pred"] = predictions

    privileged_mask = df[sensitive_feature] == privileged_value
    unprivileged_mask = ~privileged_mask

    if privileged_mask.sum() == 0 or unprivileged_mask.sum() == 0:
        return None

    p_privileged = df.loc[privileged_mask, "_pred"].mean()
    p_unprivileged = df.loc[unprivileged_mask, "_pred"].mean()
    diff = p_unprivileged - p_privileged

    return {
        "metric": "Demographic Parity Difference",
        "sensitive_feature": sensitive_feature,
        "value": round(float(diff), 3),
        "threshold": 0.1,
        "passes": bool(abs(diff) <= 0.1),
        "explanation": (
            f"Difference in positive outcome rate between groups is "
            f"{round(diff * 100, 1)} percentage points. Acceptable range is ±10 points."
        ),
    }


def run_all_fairness_checks(df: pd.DataFrame, predictions: np.ndarray,
                             sensitive_features: list):
    """
    Runs every fairness metric against every provided sensitive feature.
    Auto-picks the most frequent value in each column as the 'privileged' group
    if not specified - this is a simplification, real audits let you choose.
    """
    results = []
    for feature in sensitive_features:
        if feature not in df.columns:
            continue
        privileged_value = df[feature].mode().iloc[0]

        di = disparate_impact_ratio(df, predictions, feature, privileged_value)
        dp = demographic_parity_difference(df, predictions, feature, privileged_value)

        if di:
            results.append(di)
        if dp:
            results.append(dp)

    return results
