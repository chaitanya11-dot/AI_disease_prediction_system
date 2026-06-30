"""
routes/report_routes.py - Download prediction report as PDF, email prediction report
"""
from flask import Blueprint, jsonify, send_file
from flask_jwt_extended import jwt_required, get_jwt_identity
import io

from models import Prediction, Disease, User
from utils.pdf_utils import generate_prediction_report_pdf
from utils.email_utils import send_email

report_bp = Blueprint("report", __name__, url_prefix="/api/report")


def _get_prediction_and_disease(prediction_id, user_id):
    prediction = Prediction.query.filter_by(id=prediction_id, user_id=user_id).first()
    if not prediction:
        return None, None
    disease = Disease.query.filter_by(disease_name=prediction.predicted_disease).first()
    return prediction, disease


@report_bp.route("/download/<string:prediction_id>", methods=["GET"])
@jwt_required()
def download_report(prediction_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    prediction, disease = _get_prediction_and_disease(prediction_id, user_id)

    if not prediction:
        return jsonify({"error": "Prediction record not found."}), 404

    pdf_bytes = generate_prediction_report_pdf(
        user_name=user.name if user else "User",
        prediction_dict=prediction.to_dict(),
        disease_info=disease.to_dict() if disease else None,
    )

    return send_file(
        io.BytesIO(pdf_bytes),
        mimetype="application/pdf",
        as_attachment=True,
        download_name=f"health_report_{prediction_id[:8]}.pdf",
    )


@report_bp.route("/email/<string:prediction_id>", methods=["POST"])
@jwt_required()
def email_report(prediction_id):
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    prediction, disease = _get_prediction_and_disease(prediction_id, user_id)

    if not prediction:
        return jsonify({"error": "Prediction record not found."}), 404
    if not user or not user.email:
        return jsonify({"error": "No email address found for this account."}), 400

    pdf_bytes = generate_prediction_report_pdf(
        user_name=user.name,
        prediction_dict=prediction.to_dict(),
        disease_info=disease.to_dict() if disease else None,
    )

    body = (
        f"Hi {user.name},\n\n"
        f"Attached is your health prediction report generated on "
        f"{prediction.prediction_date.strftime('%Y-%m-%d %H:%M UTC')}.\n\n"
        f"Predicted condition: {prediction.predicted_disease} "
        f"(confidence: {prediction.confidence_score}%)\n\n"
        f"This prediction is for informational purposes only and is not a substitute "
        f"for professional medical advice.\n\n"
        f"- AI Disease Prediction System"
    )

    success = send_email(
        to_email=user.email,
        subject="Your Health Prediction Report",
        body=body,
        attachment_bytes=pdf_bytes,
        attachment_filename=f"health_report_{prediction_id[:8]}.pdf",
    )

    if success:
        return jsonify({"message": f"Report sent to {user.email} (check server console if running without SMTP configured)."}), 200
    return jsonify({"error": "Failed to send email. Please try again later."}), 500
