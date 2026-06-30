"""
routes/auth_routes.py - Registration, Login, Forgot/Reset Password, Profile
"""
import secrets
from datetime import datetime, timedelta

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    create_access_token, jwt_required, get_jwt_identity, get_jwt
)

from extensions import db, bcrypt
from models import User, PasswordResetToken
from utils.auth_utils import is_valid_email, is_valid_password
from utils.email_utils import send_email

auth_bp = Blueprint("auth", __name__, url_prefix="/api/auth")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""
    age = data.get("age")
    gender = data.get("gender")

    if not name or len(name) < 2:
        return jsonify({"error": "Please provide a valid name (at least 2 characters)."}), 400
    if not is_valid_email(email):
        return jsonify({"error": "Please provide a valid email address."}), 400
    valid_pw, pw_msg = is_valid_password(password)
    if not valid_pw:
        return jsonify({"error": pw_msg}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email already exists."}), 409

    password_hash = bcrypt.generate_password_hash(password).decode("utf-8")
    user = User(
        name=name,
        email=email,
        password_hash=password_hash,
        age=int(age) if age else None,
        gender=gender,
        role="user",
    )
    db.session.add(user)
    db.session.commit()

    access_token = create_access_token(
        identity=user.id, additional_claims={"role": user.role, "name": user.name}
    )
    return jsonify({
        "message": "Registration successful.",
        "token": access_token,
        "user": user.to_dict(),
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not email or not password:
        return jsonify({"error": "Email and password are required."}), 400

    user = User.query.filter_by(email=email).first()
    if not user or not bcrypt.check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid email or password."}), 401

    if not user.is_active:
        return jsonify({"error": "This account has been deactivated. Contact support."}), 403

    access_token = create_access_token(
        identity=user.id, additional_claims={"role": user.role, "name": user.name}
    )
    return jsonify({
        "message": "Login successful.",
        "token": access_token,
        "user": user.to_dict(),
    }), 200


@auth_bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()

    if not is_valid_email(email):
        return jsonify({"error": "Please provide a valid email address."}), 400

    user = User.query.filter_by(email=email).first()
    # Always return a generic success message (avoid leaking which emails are registered)
    generic_msg = {"message": "If an account with that email exists, password reset instructions have been sent."}

    if not user:
        return jsonify(generic_msg), 200

    token = secrets.token_urlsafe(32)
    reset_token = PasswordResetToken(
        user_id=user.id,
        token=token,
        expires_at=datetime.utcnow() + timedelta(hours=1),
    )
    db.session.add(reset_token)
    db.session.commit()

    frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:5173")
    reset_link = f"{frontend_url}/reset-password?token={token}"
    body = (
        f"Hi {user.name},\n\n"
        f"We received a request to reset your password for AI Disease Prediction System.\n"
        f"Use the link below (valid for 1 hour) or enter this token manually in the app:\n\n"
        f"Reset link: {reset_link}\n"
        f"Token: {token}\n\n"
        f"If you didn't request this, you can safely ignore this email.\n"
    )
    send_email(user.email, "Password Reset - AI Disease Prediction System", body)

    return jsonify(generic_msg), 200


@auth_bp.route("/reset-password", methods=["POST"])
def reset_password():
    data = request.get_json(silent=True) or {}
    token = data.get("token") or ""
    new_password = data.get("password") or ""

    valid_pw, pw_msg = is_valid_password(new_password)
    if not valid_pw:
        return jsonify({"error": pw_msg}), 400

    reset_token = PasswordResetToken.query.filter_by(token=token, used=False).first()
    if not reset_token or reset_token.expires_at < datetime.utcnow():
        return jsonify({"error": "This reset link is invalid or has expired."}), 400

    user = User.query.get(reset_token.user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    user.password_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")
    reset_token.used = True
    db.session.commit()

    return jsonify({"message": "Password has been reset successfully. You can now log in."}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404
    return jsonify({"user": user.to_dict()}), 200


@auth_bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    data = request.get_json(silent=True) or {}
    name = data.get("name")
    age = data.get("age")
    gender = data.get("gender")

    if name and len(name.strip()) >= 2:
        user.name = name.strip()
    if age is not None:
        try:
            user.age = int(age)
        except (ValueError, TypeError):
            pass
    if gender:
        user.gender = gender

    db.session.commit()
    return jsonify({"message": "Profile updated successfully.", "user": user.to_dict()}), 200


@auth_bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    user_id = get_jwt_identity()
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found."}), 404

    data = request.get_json(silent=True) or {}
    current_password = data.get("current_password") or ""
    new_password = data.get("new_password") or ""

    if not bcrypt.check_password_hash(user.password_hash, current_password):
        return jsonify({"error": "Current password is incorrect."}), 401

    valid_pw, pw_msg = is_valid_password(new_password)
    if not valid_pw:
        return jsonify({"error": pw_msg}), 400

    user.password_hash = bcrypt.generate_password_hash(new_password).decode("utf-8")
    db.session.commit()
    return jsonify({"message": "Password changed successfully."}), 200
