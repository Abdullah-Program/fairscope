"""
Pydantic models used across the API for request validation
and response formatting.
"""
from pydantic import BaseModel
from typing import List, Dict, Any, Optional


class UploadResponse(BaseModel):
    audit_id: str
    model_filename: str
    dataset_filename: str
    n_rows: int
    n_features: int
    feature_names: List[str]
    target_column: str


class FeatureImportance(BaseModel):
    feature: str
    importance: float
    direction: str  # "increases" or "decreases" prediction


class AuditResult(BaseModel):
    audit_id: str
    feature_importances: List[FeatureImportance]
    sample_predictions: List[Dict[str, Any]]
    fairness_metrics: Dict[str, Any]


class VerdictRequest(BaseModel):
    audit_id: str
    sensitive_features: Optional[List[str]] = None  # e.g. ["zip_code", "gender"]


class VerdictResponse(BaseModel):
    audit_id: str
    verdict: str          # "FAIR", "POTENTIALLY_BIASED", "BIASED"
    confidence: float
    summary: str           # plain english explanation
    key_findings: List[str]
    compliance_checklist: List[Dict[str, Any]]


class WhatIfRequest(BaseModel):
    audit_id: str
    modified_row: Dict[str, Any]  # feature_name -> new_value


class WhatIfResponse(BaseModel):
    original_prediction: Any
    new_prediction: Any
    changed_features: List[str]
    explanation: str
    feature_contributions: List[FeatureImportance]
