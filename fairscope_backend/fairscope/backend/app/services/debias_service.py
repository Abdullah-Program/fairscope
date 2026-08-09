"""
Auto-Fix & Retrain — real bias mitigation using reweighting.

Technique: reweighting (Kamiran & Calders, 2012) — a well-known,
model-agnostic fairness technique. Each training row gets a sample
weight based on how over/under-represented its (sensitive_feature,
outcome) combination is, then the SAME model type is retrained with
those weights.
"""
import numpy as np
import pandas as pd
from sklearn.base import clone

from app.services.fairness_metrics import disparate_impact_ratio, demographic_parity_difference


def compute_reweighing_weights(df: pd.DataFrame, target_col: str, sensitive_col: str) -> np.ndarray:
    """
    Classic reweighing: weight(row) = P(group) * P(outcome) / P(group, outcome)
    Rows from combinations that are under-represented relative to what
    independence would predict get boosted; over-represented combos get
    down-weighted.
    """
    n = len(df)
    weights = np.ones(n)

    groups = df[sensitive_col].unique()
    outcomes = df[target_col].unique()

    for g in groups:
        for o in outcomes:
            mask = (df[sensitive_col] == g) & (df[target_col] == o)
            n_go = mask.sum()
            if n_go == 0:
                continue
            p_g = (df[sensitive_col] == g).mean()
            p_o = (df[target_col] == o).mean()
            p_go = n_go / n
            w = (p_g * p_o) / p_go if p_go > 0 else 1.0
            weights[mask.values] = w

    return weights


def retrain_debiased_model(model, df: pd.DataFrame, target_col: str, sensitive_features: list):
    """
    Retrains a clone of the same model architecture using reweighted
    samples. Averages weights across all provided sensitive features
    if more than one is given.
    """
    X = df.drop(columns=[target_col])
    y = df[target_col]

    if not sensitive_features:
        raise ValueError("At least one sensitive feature is required to debias against.")

    all_weights = []
    for feat in sensitive_features:
        if feat in df.columns:
            all_weights.append(compute_reweighing_weights(df, target_col, feat))

    if not all_weights:
        raise ValueError("None of the provided sensitive features exist in the dataset.")

    combined_weights = np.mean(all_weights, axis=0)

    new_model = clone(model)
    try:
        new_model.fit(X, y, sample_weight=combined_weights)
    except TypeError:
        # Some estimators don't support sample_weight — fall back to
        # oversampling high-weight rows as an approximation.
        probs = combined_weights / combined_weights.sum()
        resample_idx = np.random.choice(len(X), size=len(X), replace=True, p=probs)
        new_model.fit(X.iloc[resample_idx], y.iloc[resample_idx])

    return new_model


def evaluate_debiased_model(original_model, new_model, df: pd.DataFrame, target_col: str, sensitive_features: list):
    """
    Compares original vs retrained model: fairness metrics (post-fix)
    and accuracy retention (how much predictive accuracy was kept).
    """
    X = df.drop(columns=[target_col])
    y = df[target_col]

    original_preds = original_model.predict(X)
    new_preds = new_model.predict(X)

    original_acc = float((original_preds == y).mean())
    new_acc = float((new_preds == y).mean())
    accuracy_retention = round((new_acc / original_acc) * 100, 1) if original_acc > 0 else 100.0

    # post-fix fairness metrics
    post_metrics = []
    for feat in sensitive_features:
        if feat not in df.columns:
            continue
        mode_result = df[feat].mode()
        if mode_result.empty:
            continue
        privileged_value = mode_result.iloc[0]
        di = disparate_impact_ratio(df, new_preds, feat, privileged_value)
        dp = demographic_parity_difference(df, new_preds, feat, privileged_value)
        if di:
            post_metrics.append(di)
        if dp:
            post_metrics.append(dp)

    failed = [m for m in post_metrics if not m.get("passes", True)]
    post_risk_score = min(100, int((len(failed) / max(len(post_metrics), 1)) * 100))

    return {
        "post_risk_score": post_risk_score,
        "accuracy_retention": min(accuracy_retention, 100.0),
        "post_fairness_metrics": post_metrics,
    }
