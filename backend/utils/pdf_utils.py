"""
utils/pdf_utils.py - Generates a prediction report PDF using ReportLab (free, open-source).
"""
import io
from datetime import datetime

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER

DISCLAIMER_TEXT = (
    "This prediction is for informational purposes only and is not a substitute "
    "for professional medical advice."
)

PRIMARY_BLUE = colors.HexColor("#1565C0")
LIGHT_BLUE = colors.HexColor("#E3F2FD")
DARK_GRAY = colors.HexColor("#37474F")


def generate_prediction_report_pdf(user_name, prediction_dict, disease_info=None):
    """
    prediction_dict: dict from Prediction.to_dict()
    disease_info: optional dict from Disease.to_dict() for the top predicted disease
    Returns: bytes of the generated PDF
    """
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        topMargin=18 * mm, bottomMargin=18 * mm, leftMargin=18 * mm, rightMargin=18 * mm,
    )
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "TitleStyle", parent=styles["Title"], textColor=PRIMARY_BLUE, fontSize=20, spaceAfter=4
    )
    subtitle_style = ParagraphStyle(
        "SubtitleStyle", parent=styles["Normal"], textColor=DARK_GRAY, fontSize=10,
        alignment=TA_CENTER, spaceAfter=14
    )
    h2_style = ParagraphStyle(
        "H2Style", parent=styles["Heading2"], textColor=PRIMARY_BLUE, fontSize=13, spaceBefore=14, spaceAfter=6
    )
    body_style = ParagraphStyle(
        "BodyStyle", parent=styles["Normal"], fontSize=10, leading=15, textColor=DARK_GRAY
    )
    disclaimer_style = ParagraphStyle(
        "DisclaimerStyle", parent=styles["Normal"], fontSize=8.5, leading=12,
        textColor=colors.HexColor("#B71C1C"), alignment=TA_CENTER, spaceBefore=18
    )

    elements = []
    elements.append(Paragraph("AI Disease Prediction System", title_style))
    elements.append(Paragraph("Health Prediction Report", subtitle_style))
    elements.append(HRFlowable(width="100%", color=PRIMARY_BLUE, thickness=1.2))
    elements.append(Spacer(1, 10))

    # Patient / report metadata table
    meta_data = [
        ["Patient Name:", user_name or "N/A", "Report Date:", datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")],
        ["Age:", str(prediction_dict.get("age", "N/A")), "Gender:", str(prediction_dict.get("gender", "N/A")).capitalize()],
    ]
    meta_table = Table(meta_data, colWidths=[80, 160, 90, 140])
    meta_table.setStyle(TableStyle([
        ("FONTSIZE", (0, 0), (-1, -1), 9.5),
        ("TEXTCOLOR", (0, 0), (-1, -1), DARK_GRAY),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTNAME", (2, 0), (2, -1), "Helvetica-Bold"),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 8))

    # Symptoms reported
    elements.append(Paragraph("Reported Symptoms", h2_style))
    symptoms_text = ", ".join(
        s.replace("_", " ").capitalize() for s in prediction_dict.get("symptoms", [])
    ) or "None recorded"
    elements.append(Paragraph(symptoms_text, body_style))

    # Top prediction highlight
    elements.append(Paragraph("Primary Prediction", h2_style))
    primary_data = [
        ["Predicted Condition", prediction_dict.get("predicted_disease", "N/A")],
        ["Confidence Score", f"{prediction_dict.get('confidence_score', 0)}%"],
        ["Severity Level", prediction_dict.get("severity", "N/A")],
    ]
    primary_table = Table(primary_data, colWidths=[160, 310])
    primary_table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (0, -1), LIGHT_BLUE),
        ("FONTNAME", (0, 0), (0, -1), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 10),
        ("TEXTCOLOR", (0, 0), (-1, -1), DARK_GRAY),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CFD8DC")),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
        ("TOPPADDING", (0, 0), (-1, -1), 7),
    ]))
    elements.append(primary_table)

    # Top 5 predictions table
    top_preds = prediction_dict.get("top_predictions", [])
    if top_preds:
        elements.append(Paragraph("Top Probable Conditions", h2_style))
        table_data = [["#", "Disease", "Confidence"]]
        for i, p in enumerate(top_preds, 1):
            table_data.append([str(i), p.get("disease", ""), f"{p.get('confidence', 0)}%"])
        preds_table = Table(table_data, colWidths=[30, 340, 100])
        preds_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), PRIMARY_BLUE),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 9.5),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#CFD8DC")),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F5F9FF")]),
            ("ALIGN", (0, 0), (0, -1), "CENTER"),
            ("ALIGN", (2, 0), (2, -1), "CENTER"),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ("TOPPADDING", (0, 0), (-1, -1), 6),
        ]))
        elements.append(preds_table)

    # Disease info / recommendations
    if disease_info:
        elements.append(Paragraph("About This Condition", h2_style))
        elements.append(Paragraph(disease_info.get("description", "N/A"), body_style))

        elements.append(Paragraph("Possible Causes", h2_style))
        elements.append(Paragraph(disease_info.get("causes", "N/A"), body_style))

        def bullet_section(title, items):
            elements.append(Paragraph(title, h2_style))
            if items:
                for item in items:
                    elements.append(Paragraph(f"• {item}", body_style))
            else:
                elements.append(Paragraph("N/A", body_style))

        bullet_section("Recommended Precautions", disease_info.get("precautions", []))
        bullet_section("Informational Medication Notes", disease_info.get("medications", []))
        bullet_section("Diet Recommendations", disease_info.get("diet", []))
        bullet_section("Exercise Suggestions", disease_info.get("exercise", []))

        elements.append(Paragraph("Recommended Specialist", h2_style))
        elements.append(Paragraph(disease_info.get("specialist", "General Physician"), body_style))

    elements.append(HRFlowable(width="100%", color=colors.HexColor("#CFD8DC"), thickness=1, spaceBefore=16))
    elements.append(Paragraph(DISCLAIMER_TEXT, disclaimer_style))

    doc.build(elements)
    pdf_bytes = buffer.getvalue()
    buffer.close()
    return pdf_bytes
