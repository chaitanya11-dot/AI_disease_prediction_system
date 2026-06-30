"""
app.py - Main Flask application entrypoint

Local development:
    python app.py
    (Set FLASK_DEBUG=true in your environment to enable the debug reloader.)

Make sure you've run the following first (see README for full setup):
    python ml/train_model.py
    python seed_db.py

Production:
    See start.sh — runs seed_db.py then serves via gunicorn.
"""
import os
from flask import Flask, jsonify
from flask_cors import CORS

from config import Config
from extensions import db, jwt, bcrypt

from routes.auth_routes import auth_bp
from routes.prediction_routes import prediction_bp
from routes.disease_routes import disease_bp
from routes.history_routes import history_bp
from routes.report_routes import report_bp
from routes.chatbot_routes import chatbot_bp
from routes.admin_routes import admin_bp


DEV_DEFAULT_SECRET = "dev-secret-key-change-in-production"
DEV_DEFAULT_JWT_SECRET = "dev-jwt-secret-change-in-production"


def _enforce_production_secrets(app):
    """
    Refuses to boot with placeholder dev secrets when running on a recognized
    hosting platform (Render sets RENDER=true automatically; this also checks
    the generic FLASK_ENV/ENVIRONMENT convention some other hosts use).
    Prevents accidentally deploying with publicly-known SECRET_KEY/JWT_SECRET_KEY.
    """
    is_hosted = (
        os.environ.get("RENDER") == "true"
        or os.environ.get("FLASK_ENV") == "production"
        or os.environ.get("ENVIRONMENT") == "production"
    )
    if not is_hosted:
        return

    if app.config["SECRET_KEY"] == DEV_DEFAULT_SECRET or app.config["JWT_SECRET_KEY"] == DEV_DEFAULT_JWT_SECRET:
        raise RuntimeError(
            "Refusing to start: SECRET_KEY and/or JWT_SECRET_KEY are still set to their "
            "insecure default values. Set real random values for SECRET_KEY and "
            "JWT_SECRET_KEY in your environment before deploying. "
            "Generate one with: python -c \"import secrets; print(secrets.token_hex(32))\""
        )


def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    _enforce_production_secrets(app)

    os.makedirs(app.config["REPORTS_DIR"], exist_ok=True)

    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)

    CORS(app, resources={r"/api/*": {"origins": app.config["CORS_ORIGINS"]}}, supports_credentials=True)

    app.register_blueprint(auth_bp)
    app.register_blueprint(prediction_bp)
    app.register_blueprint(disease_bp)
    app.register_blueprint(history_bp)
    app.register_blueprint(report_bp)
    app.register_blueprint(chatbot_bp)
    app.register_blueprint(admin_bp)

    @app.route("/api/health", methods=["GET"])
    def health_check():
        return jsonify({"status": "ok", "service": "AI Disease Prediction System API"}), 200

    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Resource not found."}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "An internal server error occurred."}), 500

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"error": "Your session has expired. Please log in again."}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"error": "Invalid authentication token."}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"error": "Authentication required. Please log in."}), 401

    with app.app_context():
        db.create_all()

    return app


app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug_mode = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
