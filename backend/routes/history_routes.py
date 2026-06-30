"""
routes/history_routes.py - Prediction history: list, filter by date, search, delete
"""
from datetime import datetime

from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity

from extensions import db
from models import Prediction

history_bp = Blueprint("history", __name__, url_prefix="/api/history")


@history_bp.route("", methods=["GET"])
@jwt_required()
def get_history():
    user_id = get_jwt_identity()

    search = (request.args.get("search") or "").strip().lower()
    date_from = request.args.get("date_from")
    date_to = request.args.get("date_to")

    query = Prediction.query.filter_by(user_id=user_id)

    if date_from:
        try:
            df = datetime.fromisoformat(date_from)
            query = query.filter(Prediction.prediction_date >= df)
        except ValueError:
            pass
    if date_to:
        try:
            dt = datetime.fromisoformat(date_to)
            query = query.filter(Prediction.prediction_date <= dt)
        except ValueError:
            pass

    predictions = query.order_by(Prediction.prediction_date.desc()).all()
    results = [p.to_dict() for p in predictions]

    if search:
        results = [
            r for r in results
            if search in r["predicted_disease"].lower()
            or any(search in s.replace("_", " ") for s in r["symptoms"])
        ]

    return jsonify({"history": results, "count": len(results)}), 200


@history_bp.route("/<string:prediction_id>", methods=["GET"])
@jwt_required()
def get_prediction_detail(prediction_id):
    user_id = get_jwt_identity()
    prediction = Prediction.query.filter_by(id=prediction_id, user_id=user_id).first()
    if not prediction:
        return jsonify({"error": "Prediction record not found."}), 404
    return jsonify({"prediction": prediction.to_dict()}), 200


@history_bp.route("/<string:prediction_id>", methods=["DELETE"])
@jwt_required()
def delete_prediction(prediction_id):
    user_id = get_jwt_identity()
    prediction = Prediction.query.filter_by(id=prediction_id, user_id=user_id).first()
    if not prediction:
        return jsonify({"error": "Prediction record not found."}), 404

    db.session.delete(prediction)
    db.session.commit()
    return jsonify({"message": "Prediction record deleted."}), 200


@history_bp.route("/clear-all", methods=["DELETE"])
@jwt_required()
def clear_all_history():
    user_id = get_jwt_identity()
    Prediction.query.filter_by(user_id=user_id).delete()
    db.session.commit()
    return jsonify({"message": "All prediction history cleared."}), 200
