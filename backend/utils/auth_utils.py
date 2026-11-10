"""
utils/auth_utils.py - JWT helpers, input validation, role-based access decorators
"""
import re
from functools import wraps

from flask import jsonify
from flask_jwt_extended import get_jwt_identity, verify_jwt_in_request, get_jwt

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def parse_optional_int(value, *, min_value=None, max_value=None, field_name="value"):
    """Coerce a request field to an integer while validating its bounds."""
    if value is None:
        return None
    if isinstance(value, str) and not value.strip():
        return None

    try:
        parsed = int(str(value).strip())
    except (TypeError, ValueError):
        raise ValueError(f"{field_name} must be a valid integer.") from None

    if min_value is not None and parsed < min_value:
        raise ValueError(f"{field_name} must be at least {min_value}.")
    if max_value is not None and parsed > max_value:
        raise ValueError(f"{field_name} must be at most {max_value}.")
    return parsed


def is_valid_email(email: str) -> bool:
    return bool(email) and bool(EMAIL_REGEX.match(email.strip()))


def is_valid_password(password: str):
    """Returns (is_valid, message)."""
    if not password or len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r"[A-Za-z]", password):
        return False, "Password must contain at least one letter."
    if not re.search(r"[0-9]", password):
        return False, "Password must contain at least one number."
    return True, ""


def admin_required(fn):
    """Decorator: requires a valid JWT AND role == 'admin' in the token claims."""
    @wraps(fn)
    def wrapper(*args, **kwargs):
        verify_jwt_in_request()
        claims = get_jwt()
        if claims.get("role") != "admin":
            return jsonify({"error": "Admin privileges required."}), 403
        return fn(*args, **kwargs)
    return wrapper


def current_user_id():
    return get_jwt_identity()
