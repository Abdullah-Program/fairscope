"""
GET /api/report/{audit_id}/pdf   -> downloadable PDF case file
GET /api/report/history          -> list of past audits
"""
import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from reportlab.lib.pagesizes import A4
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors

from app.database.db import AUDIT_CACHE, get_audit_history
from app.config import settings

router = APIRouter(prefix="/api/report", tags=["report"])


@router.get("/history")
def history():
    return {"audits": get_audit_history()}


@router.get("/{audit_id}/pdf")
def download_pdf(audit_id: str):
    if audit_id not in AUDIT_CACHE:
        raise HTTPException(status_code=404, detail="Audit ID not found.")

    cache = AUDIT_CACHE[audit_id]
    feature_importances = cache.get("last_feature_importances", [])
    fairness_metrics = cache.get("last_fairness_metrics", [])

    output_path = os.path.join(settings.upload_dir, audit_id, "fairscope_report.pdf")
    doc = SimpleDocTemplate(output_path, pagesize=A4)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("FairScope — AI Fairness Case File", styles["Title"]))
    story.append(Spacer(1, 12))
    story.append(Paragraph(f"Audit ID: {audit_id}", styles["Normal"]))
    story.append(Paragraph(f"Target Column: {cache['target_column']}", styles["Normal"]))
    story.append(Spacer(1, 20))

    story.append(Paragraph("Top Feature Importances (Evidence)", styles["Heading2"]))
    data = [["Feature", "Importance", "Direction"]]
    for f in feature_importances[:10]:
        data.append([f["feature"], str(f["importance"]), f["direction"]])
    table = Table(data, hAlign="LEFT")
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f2937")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
    ]))
    story.append(table)
    story.append(Spacer(1, 20))

    if fairness_metrics:
        story.append(Paragraph("Fairness Metrics (Compliance)", styles["Heading2"]))
        fdata = [["Metric", "Feature", "Value", "Passes?"]]
        for m in fairness_metrics:
            fdata.append([m["metric"], m["sensitive_feature"], str(m["value"]),
                          "Yes" if m["passes"] else "No"])
        ftable = Table(fdata, hAlign="LEFT")
        ftable.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#1f2937")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ]))
        story.append(ftable)

    doc.build(story)
    return FileResponse(output_path, filename="fairscope_report.pdf", media_type="application/pdf")
