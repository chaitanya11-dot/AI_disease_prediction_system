"""
seed_db.py - Seeds the database with the sample disease dataset and a default admin user.

Run with:
    python seed_db.py

Safe to re-run: it will skip records that already exist.

Admin credentials can be overridden via environment variables (recommended for any
deployed instance):
    ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME

If ADMIN_PASSWORD is not set, a random secure password is generated and printed once
to stdout (captured in your host's deploy logs) instead of using a publicly-known default.
"""
import json
import secrets
import sys
import os

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from extensions import db, bcrypt
from models import Disease, User
from data.disease_dataset import DISEASES

DEFAULT_ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@aidiseaseprediction.local")
DEFAULT_ADMIN_NAME = os.environ.get("ADMIN_NAME", "System Administrator")

_is_hosted = (
    os.environ.get("RENDER") == "true"
    or os.environ.get("FLASK_ENV") == "production"
    or os.environ.get("ENVIRONMENT") == "production"
)

if os.environ.get("ADMIN_PASSWORD"):
    DEFAULT_ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]
elif _is_hosted:
    # Never fall back to the well-known local default on a recognized hosting
    # platform — generate a random one-time password and print it instead.
    DEFAULT_ADMIN_PASSWORD = secrets.token_urlsafe(12)
else:
    # Stable, documented default for local development convenience only.
    DEFAULT_ADMIN_PASSWORD = "Admin@12345"


def seed_diseases():
    created, skipped = 0, 0
    for d in DISEASES:
        existing = Disease.query.filter_by(disease_name=d["name"]).first()
        if existing:
            skipped += 1
            continue

        disease = Disease(
            disease_name=d["name"],
            symptoms=json.dumps(d["symptoms"]),
            description=d["description"],
            causes=d["causes"],
            precautions=json.dumps(d["precautions"]),
            medications=json.dumps(d["medications"]),
            diet=json.dumps(d["diet"]),
            exercise=json.dumps(d["exercise"]),
            treatments=json.dumps([
                f"Follow the prescribed medications: {', '.join(d['medications'][:2])}",
                f"Adopt the recommended diet and lifestyle changes",
                f"Consult a {d['specialist']} for a personalized treatment plan",
            ]),
            severity=d["severity"],
            specialist=d["specialist"],
        )
        db.session.add(disease)
        created += 1

    db.session.commit()
    print(f"Diseases seeded: {created} created, {skipped} already existed.")


def seed_admin():
    existing = User.query.filter_by(email=DEFAULT_ADMIN_EMAIL).first()
    if existing:
        print(f"Admin user already exists: {DEFAULT_ADMIN_EMAIL}")
        return

    admin = User(
        name=DEFAULT_ADMIN_NAME,
        email=DEFAULT_ADMIN_EMAIL,
        password_hash=bcrypt.generate_password_hash(DEFAULT_ADMIN_PASSWORD).decode("utf-8"),
        role="admin",
    )
    db.session.add(admin)
    db.session.commit()
    print(f"Default admin created -> email: {DEFAULT_ADMIN_EMAIL} | password: {DEFAULT_ADMIN_PASSWORD}")
    if os.environ.get("ADMIN_PASSWORD"):
        print("(Password set via ADMIN_PASSWORD environment variable.)")
    elif _is_hosted:
        print(
            "NOTE: Running on a recognized hosting platform with no ADMIN_PASSWORD set, so "
            "a random one-time password was generated above (visible only in this log). "
            "Set ADMIN_PASSWORD explicitly and re-seed if you'd rather choose your own."
        )
    else:
        print(
            "NOTE: This is the well-known local-development default password. Set "
            "ADMIN_PASSWORD before deploying anywhere beyond your own machine."
        )


if __name__ == "__main__":
    app = create_app()
    with app.app_context():
        seed_diseases()
        seed_admin()
    print("Database seeding complete.")
