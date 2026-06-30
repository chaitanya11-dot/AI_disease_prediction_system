"""
routes/disease_routes.py - Disease information listing and detail pages
"""
from flask import Blueprint, request, jsonify
from models import Disease

disease_bp = Blueprint("disease", __name__, url_prefix="/api/diseases")


@disease_bp.route("", methods=["GET"])
def list_diseases():
    search = (request.args.get("search") or "").strip().lower()
    severity = (request.args.get("severity") or "").strip()

    query = Disease.query
    diseases = query.all()

    results = [d.to_dict() for d in diseases]
    if search:
        results = [d for d in results if search in d["disease_name"].lower()]
    if severity:
        results = [d for d in results if d["severity"].lower() == severity.lower()]

    results.sort(key=lambda d: d["disease_name"])
    return jsonify({"diseases": results, "count": len(results)}), 200


@disease_bp.route("/<int:disease_id>", methods=["GET"])
def get_disease(disease_id):
    disease = Disease.query.get(disease_id)
    if not disease:
        return jsonify({"error": "Disease not found."}), 404
    return jsonify({"disease": disease.to_dict()}), 200


@disease_bp.route("/by-name/<string:name>", methods=["GET"])
def get_disease_by_name(name):
    disease = Disease.query.filter(Disease.disease_name.ilike(name)).first()
    if not disease:
        return jsonify({"error": "Disease not found."}), 404
    return jsonify({"disease": disease.to_dict()}), 200
