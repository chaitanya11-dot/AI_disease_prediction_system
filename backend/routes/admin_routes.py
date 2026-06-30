"""
routes/admin_routes.py - Admin Panel: analytics, user management, disease DB management, monitoring
"""
import json
import platform
from datetime import datetime, timedelta

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from extensions import db, bcrypt
from models import User, Disease, Prediction
from utils.auth_utils import admin_required, is_valid_email
from ml.predictor import get_predictor

admin_bp = Blueprint("admin", __name__, url_prefix="/api/admin")


# ---------- Dashboard Analytics ----------
@admin_bp.route("/analytics", methods=["GET"])
@admin_required
def analytics():
    total_users = User.query.count()
    total_predictions = Prediction.query.count()
    total_diseases = Disease.query.count()
    active_users = User.query.filter_by(is_active=True).count()

    week_ago = datetime.utcnow() - timedelta(days=7)
    predictions_this_week = Prediction.query.filter(Prediction.prediction_date >= week_ago).count()
    new_users_this_week = User.query.filter(User.created_at >= week_ago).count()

    # disease frequency breakdown
    predictions = Prediction.query.all()
    disease_freq = {}
    severity_freq = {"Low": 0, "Medium": 0, "High": 0}
    for p in predictions:
        disease_freq[p.predicted_disease] = disease_freq.get(p.predicted_disease, 0) + 1
        if p.severity in severity_freq:
            severity_freq[p.severity] += 1

    top_diseases = sorted(disease_freq.items(), key=lambda x: x[1], reverse=True)[:10]
    top_diseases = [{"disease": d, "count": c} for d, c in top_diseases]

    avg_confidence = (
        round(sum(p.confidence_score for p in predictions) / len(predictions), 2)
        if predictions else 0
    )

    predictor = get_predictor()

    return jsonify({
        "total_users": total_users,
        "active_users": active_users,
        "total_predictions": total_predictions,
        "total_diseases": total_diseases,
        "predictions_this_week": predictions_this_week,
        "new_users_this_week": new_users_this_week,
        "top_diseases": top_diseases,
        "severity_breakdown": severity_freq,
        "average_confidence": avg_confidence,
        "model_accuracy": predictor.get_accuracy(),
        "model_meta": predictor.get_meta(),
    }), 200


# ---------- User Management ----------
@admin_bp.route("/users", methods=["GET"])
@admin_required
def list_users():
    search = (request.args.get("search") or "").strip().lower()
    users = User.query.order_by(User.created_at.desc()).all()
    results = [u.to_dict() for u in users]
    if search:
        results = [u for u in results if search in u["name"].lower() or search in u.get("email", "").lower()]
    return jsonify({"users": results, "count": len(results)}), 200


@admin_bp.route("/users/<string:user_id>", methods=["GET"])
@admin_required
def get_user_detail(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404
    prediction_count = Prediction.query.filter_by(user_id=user_id).count()
    data = user.to_dict()
    data["prediction_count"] = prediction_count
    return jsonify({"user": data}), 200


@admin_bp.route("/users/<string:user_id>/toggle-active", methods=["PUT"])
@admin_required
def toggle_user_active(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404
    if user.role == "admin":
        return jsonify({"error": "Cannot deactivate an admin account."}), 403

    user.is_active = not user.is_active
    db.session.commit()
    return jsonify({"message": f"User {'activated' if user.is_active else 'deactivated'}.", "user": user.to_dict()}), 200


@admin_bp.route("/users/<string:user_id>/role", methods=["PUT"])
@admin_required
def update_user_role(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    data = request.get_json(silent=True) or {}
    new_role = data.get("role")
    if new_role not in ("user", "admin"):
        return jsonify({"error": "Role must be 'user' or 'admin'."}), 400

    user.role = new_role
    db.session.commit()
    return jsonify({"message": "User role updated.", "user": user.to_dict()}), 200


@admin_bp.route("/users/<string:user_id>", methods=["DELETE"])
@admin_required
def delete_user(user_id):
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404
    if user.role == "admin":
        return jsonify({"error": "Cannot delete an admin account."}), 403

    db.session.delete(user)
    db.session.commit()
    return jsonify({"message": "User deleted successfully."}), 200


# ---------- Disease Database Management ----------
@admin_bp.route("/diseases", methods=["GET"])
@admin_required
def admin_list_diseases():
    diseases = Disease.query.order_by(Disease.disease_name.asc()).all()
    return jsonify({"diseases": [d.to_dict() for d in diseases], "count": len(diseases)}), 200


@admin_bp.route("/diseases", methods=["POST"])
@admin_required
def create_disease():
    data = request.get_json(silent=True) or {}
    name = (data.get("disease_name") or "").strip()
    if not name:
        return jsonify({"error": "Disease name is required."}), 400
    if Disease.query.filter_by(disease_name=name).first():
        return jsonify({"error": "A disease with this name already exists."}), 409

    disease = Disease(
        disease_name=name,
        symptoms=json.dumps(data.get("symptoms", [])),
        description=data.get("description", ""),
        causes=data.get("causes", ""),
        precautions=json.dumps(data.get("precautions", [])),
        medications=json.dumps(data.get("medications", [])),
        diet=json.dumps(data.get("diet", [])),
        exercise=json.dumps(data.get("exercise", [])),
        treatments=json.dumps(data.get("treatments", [])),
        severity=data.get("severity", "Medium"),
        specialist=data.get("specialist", "General Physician"),
    )
    db.session.add(disease)
    db.session.commit()
    return jsonify({"message": "Disease added. Note: retrain the ML model to include it in predictions.", "disease": disease.to_dict()}), 201


@admin_bp.route("/diseases/<int:disease_id>", methods=["PUT"])
@admin_required
def update_disease(disease_id):
    disease = Disease.query.get(disease_id)
    if not disease:
        return jsonify({"error": "Disease not found."}), 404

    data = request.get_json(silent=True) or {}
    if "disease_name" in data and data["disease_name"]:
        disease.disease_name = data["disease_name"].strip()
    if "symptoms" in data:
        disease.symptoms = json.dumps(data["symptoms"])
    if "description" in data:
        disease.description = data["description"]
    if "causes" in data:
        disease.causes = data["causes"]
    if "precautions" in data:
        disease.precautions = json.dumps(data["precautions"])
    if "medications" in data:
        disease.medications = json.dumps(data["medications"])
    if "diet" in data:
        disease.diet = json.dumps(data["diet"])
    if "exercise" in data:
        disease.exercise = json.dumps(data["exercise"])
    if "treatments" in data:
        disease.treatments = json.dumps(data["treatments"])
    if "severity" in data:
        disease.severity = data["severity"]
    if "specialist" in data:
        disease.specialist = data["specialist"]

    disease.updated_at = datetime.utcnow()
    db.session.commit()
    return jsonify({"message": "Disease updated successfully.", "disease": disease.to_dict()}), 200


@admin_bp.route("/diseases/<int:disease_id>", methods=["DELETE"])
@admin_required
def delete_disease(disease_id):
    disease = Disease.query.get(disease_id)
    if not disease:
        return jsonify({"error": "Disease not found."}), 404
    db.session.delete(disease)
    db.session.commit()
    return jsonify({"message": "Disease deleted successfully."}), 200


# ---------- Prediction Statistics ----------
@admin_bp.route("/predictions", methods=["GET"])
@admin_required
def admin_list_predictions():
    page = int(request.args.get("page", 1))
    per_page = int(request.args.get("per_page", 25))

    query = Prediction.query.order_by(Prediction.prediction_date.desc())
    total = query.count()
    predictions = query.offset((page - 1) * per_page).limit(per_page).all()

    results = []
    for p in predictions:
        user = User.query.get(p.user_id)
        d = p.to_dict()
        d["user_name"] = user.name if user else "Unknown"
        d["user_email"] = user.email if user else "Unknown"
        results.append(d)

    return jsonify({
        "predictions": results,
        "total": total,
        "page": page,
        "per_page": per_page,
        "total_pages": (total + per_page - 1) // per_page if per_page else 1,
    }), 200


# ---------- System Monitoring ----------
@admin_bp.route("/system-status", methods=["GET"])
@admin_required
def system_status():
    predictor = get_predictor()
    db_user_count = User.query.count()
    db_prediction_count = Prediction.query.count()
    db_disease_count = Disease.query.count()

    return jsonify({
        "status": "online",
        "python_version": platform.python_version(),
        "platform": platform.platform(),
        "database": {
            "users": db_user_count,
            "predictions": db_prediction_count,
            "diseases": db_disease_count,
        },
        "ml_model": {
            "loaded": predictor.model is not None,
            "accuracy": predictor.get_accuracy(),
            "meta": predictor.get_meta(),
        },
        "server_time": datetime.utcnow().isoformat(),
    }), 200
