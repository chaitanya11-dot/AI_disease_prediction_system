"""
config.py - Application configuration
"""
import os
from datetime import timedelta

BASE_DIR = os.path.dirname(os.path.abspath(__file__))


def _normalize_db_url(url: str) -> str:
    """Render issues postgres:// URLs but SQLAlchemy requires postgresql://"""
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql://", 1)
    return url


class Config:
    SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production")
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "dev-jwt-secret-change-in-production")
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=24)

    SQLALCHEMY_DATABASE_URI = _normalize_db_url(
        os.environ.get("DATABASE_URL",
                       f"sqlite:///{os.path.join(BASE_DIR, 'disease_prediction.db')}")
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = {
        "pool_pre_ping": True,          # handles stale Postgres connections
        "pool_recycle": 300,            # recycle connections every 5 min
        "connect_args": {}
    }

    # CORS — comma-separated list of allowed origins.
    # On Render, set this env var to your exact frontend URL:
    #   CORS_ORIGINS=https://medisense-frontend-xixc.onrender.com
    CORS_ORIGINS = [
        o.strip() for o in
        os.environ.get(
            "CORS_ORIGINS",
            "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173"
        ).split(",")
        if o.strip()
    ]

    MAIL_SERVER = os.environ.get("MAIL_SERVER", "")
    MAIL_PORT = int(os.environ.get("MAIL_PORT", 587))
    MAIL_USE_TLS = os.environ.get("MAIL_USE_TLS", "true").lower() == "true"
    MAIL_USERNAME = os.environ.get("MAIL_USERNAME", "")
    MAIL_PASSWORD = os.environ.get("MAIL_PASSWORD", "")
    MAIL_DEFAULT_SENDER = os.environ.get("MAIL_DEFAULT_SENDER",
                                          "no-reply@aidiseaseprediction.local")

    ML_DIR = os.path.join(BASE_DIR, "ml")
    REPORTS_DIR = os.path.join(BASE_DIR, "generated_reports")
    FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:5173")
