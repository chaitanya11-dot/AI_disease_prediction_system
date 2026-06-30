"""
routes/chatbot_routes.py - Offline rule-based health guidance chatbot endpoint
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from utils.chatbot import get_chatbot_response

chatbot_bp = Blueprint("chatbot", __name__, url_prefix="/api/chatbot")


@chatbot_bp.route("/message", methods=["POST"])
def chatbot_message():
    data = request.get_json(silent=True) or {}
    message = data.get("message", "")
    history = data.get("history", [])

    result = get_chatbot_response(message, history)
    return jsonify(result), 200
