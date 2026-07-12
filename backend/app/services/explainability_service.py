"""
Core "evidence gathering" engine.

This is the heart of FairScope: it runs SHAP against the uploaded
model + dataset and turns raw shap values into clean, ranked
feature importance data the frontend / LLM can consume.
"""
import shap
import numpy as np
import pandas as pd


class ExplainabilityService:

    def __init__(self, model, X: pd.DataFrame):
        self.model = model
        self.X = X
        self.explainer = None
        self.shap_values = None

    def _build_explainer(self):
        """
        SHAP has different explainer types depending on model type.
        We try TreeExplainer first (fast, works for RF/XGBoost/etc),
        and fall back to KernelExplainer (slower, model-agnostic)
        for anything else (e.g. LogisticRegression, SVM).
        """
        try:
            self.explainer = shap.TreeExplainer(self.model)
            self.shap_values = self.explainer.shap_values(self.X)
        except Exception:
            # Fallback: model-agnostic explainer, works with any model
            # that exposes predict_proba or predict.
            background = shap.sample(self.X, min(50, len(self.X)))
            predict_fn = (
                self.model.predict_proba
                if hasattr(self.model, "predict_proba")
                else self.model.predict
            )
            self.explainer = shap.KernelExplainer(predict_fn, background)
            self.shap_values = self.explainer.shap_values(
                self.X.iloc[: min(100, len(self.X))]
            )

    def _normalize_shap_values(self, shap_values):
        """
        For classification models, shap_values can come back as a list
        (one array per class). We take the positive class (index 1)
        for binary classification, which is the common case here.
        """
        if isinstance(shap_values, list):
            if len(shap_values) == 2:
                return np.array(shap_values[1])
            return np.array(shap_values[0])
        arr = np.array(shap_values)
        # Some SHAP versions return shape (n_samples, n_features, n_classes)
        if arr.ndim == 3:
            return arr[:, :, -1]
        return arr

    def compute_global_importance(self) -> list:
        """
        Returns average absolute SHAP value per feature - i.e. how much
        each feature matters overall, ranked highest to lowest.
        """
        if self.shap_values is None:
            self._build_explainer()

        values = self._normalize_shap_values(self.shap_values)
        n_used_rows = values.shape[0]

        mean_abs = np.abs(values).mean(axis=0)
        mean_signed = values.mean(axis=0)

        results = []
        for i, feature in enumerate(self.X.columns[: len(mean_abs)]):
            results.append({
                "feature": feature,
                "importance": round(float(mean_abs[i]), 5),
                "direction": "increases" if mean_signed[i] > 0 else "decreases",
            })

        results.sort(key=lambda x: x["importance"], reverse=True)
        return results

    def compute_single_prediction(self, row: pd.DataFrame):
        """
        Explains ONE row's prediction - used by the what-if simulator.
        Returns predicted value + per-feature contribution for that row.
        """
        prediction = self.model.predict(row)[0]

        try:
            local_shap = self.explainer.shap_values(row)
        except Exception:
            local_shap = self.explainer.shap_values(row)

        values = self._normalize_shap_values(local_shap)[0]

        contributions = []
        for i, feature in enumerate(row.columns[: len(values)]):
            contributions.append({
                "feature": feature,
                "importance": round(float(abs(values[i])), 5),
                "direction": "increases" if values[i] > 0 else "decreases",
            })
        contributions.sort(key=lambda x: x["importance"], reverse=True)

        return prediction, contributions

    def get_sample_predictions(self, n=10):
        """Grab a handful of sample rows with predictions - shown in Evidence tab."""
        sample = self.X.head(n).copy()
        preds = self.model.predict(sample)
        sample["prediction"] = preds
        return sample.to_dict(orient="records")
