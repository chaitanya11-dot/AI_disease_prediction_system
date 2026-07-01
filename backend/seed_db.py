"""
seed_db.py - Seeds the database with sample diseases and default admin user.
Safe to re-run: skips records that already exist.

Admin credentials are configurable via env vars (recommended for any deployment):
  ADMIN_EMAIL     default: admin@aidiseaseprediction.local
  ADMIN_PASSWORD  default: Admin@12345 (local dev), random (if on Render without this set)
  ADMIN_NAME      default: System Administrator
"""
import json, secrets, sys, os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app
from extensions import db, bcrypt
from models import Disease, User
from data.disease_dataset import DISEASES

_is_hosted = (
    os.environ.get("RENDER") == "true"
    or os.environ.get("FLASK_ENV") == "production"
    or os.environ.get("ENVIRONMENT") == "production"
)

DEFAULT_ADMIN_EMAIL    = os.environ.get("ADMIN_EMAIL",    "admin@aidiseaseprediction.local")
DEFAULT_ADMIN_NAME     = os.environ.get("ADMIN_NAME",     "System Administrator")

if os.environ.get("ADMIN_PASSWORD"):
    DEFAULT_ADMIN_PASSWORD = os.environ["ADMIN_PASSWORD"]
elif _is_hosted:
    DEFAULT_ADMIN_PASSWORD = secrets.token_urlsafe(12)
else:
    DEFAULT_ADMIN_PASSWORD = "Admin@12345"


def seed_diseases():
    created, skipped = 0, 0
    for d in DISEASES:
        if Disease.query.filter_by(disease_name=d["name"]).first():
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
                f"Follow prescribed medications: {', '.join(d['medications'][:2])}",
                "Adopt recommended diet and lifestyle changes",
                f"Consult a {d['specialist']} for a personalised treatment plan",
            ]),
            severity=d["severity"],
            specialist=d["specialist"],
        )
        db.session.add(disease)
        created += 1
    db.session.commit()
    print(f"Diseases seeded: {created} created, {skipped} already existed.")


def seed_admin():
    if User.query.filter_by(email=DEFAULT_ADMIN_EMAIL).first():
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
    print(f"Admin created -> email: {DEFAULT_ADMIN_EMAIL} | password: {DEFAULT_ADMIN_PASSWORD}")
    if _is_hosted and not os.environ.get("ADMIN_PASSWORD"):
        print("NOTE: Set ADMIN_PASSWORD env var to choose your own admin password.")


if __name__ == "__main__":
    application = create_app()
    with application.app_context():
        seed_diseases()
        seed_admin()
    print("Seeding complete.")
