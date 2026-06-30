"""
routes/prediction_routes.py - Symptom list, disease prediction, dashboard stats
"""
import json
from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models import Prediction, Disease, User
from ml.predictor import get_predictor
from data.disease_dataset import SYMPTOM_VOCAB

prediction_bp = Blueprint("prediction", __name__, url_prefix="/api")

DISCLAIMER_TEXT = (
    "This prediction is for informational purposes only and is not a substitute "
    "for professional medical advice."
)


@prediction_bp.route("/symptoms", methods=["GET"])
def get_symptoms():
    """Returns the full searchable symptom vocabulary for the multi-select UI."""
    search = (request.args.get("search") or "").strip().lower()
    symptoms = [
        {"key": s, "label": s.replace("_", " ").capitalize()}
        for s in SYMPTOM_VOCAB
    ]
    if search:
        symptoms = [s for s in symptoms if search in s["label"].lower()]
    symptoms.sort(key=lambda s: s["label"])
    return jsonify({"symptoms": symptoms, "count": len(symptoms)}), 200


@prediction_bp.route("/predict", methods=["POST"])
@jwt_required()
def predict():
    user_id = get_jwt_identity()
    data = request.get_json(silent=True) or {}

    symptoms = data.get("symptoms") or []
    age = data.get("age")
    gender = data.get("gender")
    additional_info = data.get("additional_info", "")

    if not symptoms or not isinstance(symptoms, list) or len(symptoms) == 0:
        return jsonify({"error": "Please select at least one symptom."}), 400

    # normalize symptom keys defensively
    symptoms = [str(s).strip().lower().replace(" ", "_") for s in symptoms]
    valid_symptoms = [s for s in symptoms if s in SYMPTOM_VOCAB]
    if not valid_symptoms:
        return jsonify({"error": "None of the provided symptoms were recognized."}), 400

    predictor = get_predictor()
    top_predictions = predictor.predict_top_n(valid_symptoms, n=5)

    if not top_predictions:
        return jsonify({"error": "Could not generate a prediction. Please try different symptoms."}), 422

    top_disease_name = top_predictions[0]["disease"]
    top_confidence = top_predictions[0]["confidence"]

    disease_record = Disease.query.filter_by(disease_name=top_disease_name).first()
    severity = disease_record.severity if disease_record else "Medium"

    # enrich each top prediction with severity for the frontend table
    enriched = []
    for p in top_predictions:
        d = Disease.query.filter_by(disease_name=p["disease"]).first()
        enriched.append({
            **p,
            "severity": d.severity if d else "Medium",
        })

    prediction = Prediction(
        user_id=user_id,
        symptoms=json.dumps(valid_symptoms),
        age=int(age) if age else None,
        gender=gender,
        additional_info=additional_info,
        predicted_disease=top_disease_name,
        confidence_score=top_confidence,
        top_predictions=json.dumps(enriched),
        severity=severity,
        prediction_date=datetime.utcnow(),
    )
    db.session.add(prediction)
    db.session.commit()

    response = {
        "prediction_id": prediction.id,
        "predicted_disease": top_disease_name,
        "confidence_score": top_confidence,
        "severity": severity,
        "top_predictions": enriched,
        "disease_info": disease_record.to_dict() if disease_record else None,
        "model_accuracy": predictor.get_accuracy(),
        "disclaimer": DISCLAIMER_TEXT,
        "prediction_date": prediction.prediction_date.isoformat(),
    }
    return jsonify(response), 200


@prediction_bp.route("/dashboard/stats", methods=["GET"])
@jwt_required()
def dashboard_stats():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    predictions = Prediction.query.filter_by(user_id=user_id).order_by(Prediction.prediction_date.desc()).all()

    total_predictions = len(predictions)
    recent = [p.to_dict() for p in predictions[:5]]

    severity_counts = {"Low": 0, "Medium": 0, "High": 0}
    disease_counts = {}
    for p in predictions:
        if p.severity in severity_counts:
            severity_counts[p.severity] += 1
        disease_counts[p.predicted_disease] = disease_counts.get(p.predicted_disease, 0) + 1

    most_common = None
    if disease_counts:
        most_common = max(disease_counts.items(), key=lambda x: x[1])[0]

    avg_confidence = (
        round(sum(p.confidence_score for p in predictions) / total_predictions, 2)
        if total_predictions else 0
    )

    return jsonify({
        "welcome_name": user.name,
        "total_predictions": total_predictions,
        "recent_predictions": recent,
        "severity_breakdown": severity_counts,
        "most_common_prediction": most_common,
        "average_confidence": avg_confidence,
        "member_since": user.created_at.isoformat() if user.created_at else None,
    }), 200
