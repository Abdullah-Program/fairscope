import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
const api = axios.create({ baseURL: API_BASE_URL });

export async function uploadModel({ modelFile, datasetFile, targetColumn, userId }) {
  const form = new FormData();
  form.append("model_file", modelFile);
  form.append("dataset_file", datasetFile);
  form.append("target_column", targetColumn);
  if (userId) form.append("user_id", userId);
  const res = await api.post("/api/upload/model", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function analyzeAudit(auditId, sensitiveFeatures = []) {
  const params = new URLSearchParams();
  sensitiveFeatures.forEach((f) => params.append("sensitive_features", f));
  const res = await api.post(`/api/audit/analyze/${auditId}?${params.toString()}`);
  return res.data;
}

export async function generateVerdict(auditId) {
  const res = await api.post("/api/verdict/generate", { audit_id: auditId });
  return res.data;
}

export async function runWhatIf(auditId, modifiedRow) {
  const res = await api.post("/api/simulate/whatif", {
    audit_id: auditId,
    modified_row: modifiedRow,
  });
  return res.data;
}

export function getReportPdfUrl(auditId) {
  return `${API_BASE_URL}/api/report/${auditId}/pdf`;
}

export async function getAuditHistory(userId) {
  const params = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
  const res = await api.get(`/api/report/history${params}`);
  return res.data;
}

export async function getFullAudit(auditId, userId) {
  const params = userId ? `?user_id=${encodeURIComponent(userId)}` : "";
  const res = await api.get(`/api/report/${auditId}/full${params}`);
  return res.data;
}

export async function triggerDebias(auditId) {
  const res = await api.post(`/api/debias/fix/${auditId}`);
  return res.data;
}

export function getDebiasedModelUrl(auditId) {
  return `${API_BASE_URL}/api/debias/download/${auditId}`;
}

export default api;
