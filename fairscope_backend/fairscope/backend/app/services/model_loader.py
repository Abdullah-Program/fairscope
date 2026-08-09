"""
Handles loading uploaded scikit-learn models (.pkl / .joblib)
and datasets (.csv) safely.
"""
import joblib
import pandas as pd
import os


class ModelLoadError(Exception):
    pass


def load_model(model_path: str):
    """
    Loads a scikit-learn compatible model saved via joblib or pickle.
    NOTE: In production you'd sandbox this since pickle can execute
    arbitrary code. For this project we restrict uploads to .pkl/.joblib
    and document the risk in the README.
    """
    if not os.path.exists(model_path):
        raise ModelLoadError(f"Model file not found: {model_path}")
    try:
        model = joblib.load(model_path)
    except Exception as e:
        raise ModelLoadError(f"Failed to load model: {e}")

    if not hasattr(model, "predict"):
        raise ModelLoadError("Uploaded file is not a valid scikit-learn model (no .predict method)")

    return model


def load_dataset(csv_path: str, target_column: str = None) -> pd.DataFrame:
    if not os.path.exists(csv_path):
        raise ModelLoadError(f"Dataset file not found: {csv_path}")
    df = pd.read_csv(csv_path)
    if df.empty:
        raise ModelLoadError("Uploaded dataset is empty")
    if target_column and target_column not in df.columns:
        raise ModelLoadError(
            f"Target column '{target_column}' not found in dataset. "
            f"Available columns: {list(df.columns)}"
        )
    return df
