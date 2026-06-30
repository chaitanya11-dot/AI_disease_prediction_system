"""
models.py - SQLAlchemy database models
"""
import uuid
from datetime import datetime

from extensions import db


def gen_uuid():
    return str(uuid.uuid4())


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(180), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default="user")  # "user" | "admin"
    age = db.Column(db.Integer, nullable=True)
    gender = db.Column(db.String(20), nullable=True)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    predictions = db.relationship("Prediction", backref="user", lazy=True, cascade="all, delete-orphan")
    reset_tokens = db.relationship("PasswordResetToken", backref="user", lazy=True, cascade="all, delete-orphan")

    def to_dict(self, include_email=True):
        data = {
            "id": self.id,
            "name": self.name,
            "role": self.role,
            "age": self.age,
            "gender": self.gender,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
        if include_email:
            data["email"] = self.email
        return data


class Disease(db.Model):
    __tablename__ = "diseases"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    disease_name = db.Column(db.String(150), unique=True, nullable=False, index=True)
    symptoms = db.Column(db.Text, nullable=False)        # JSON-encoded list of symptom keys
    description = db.Column(db.Text, nullable=True)
    causes = db.Column(db.Text, nullable=True)
    precautions = db.Column(db.Text, nullable=True)      # JSON-encoded list
    medications = db.Column(db.Text, nullable=True)      # JSON-encoded list
    diet = db.Column(db.Text, nullable=True)              # JSON-encoded list
    exercise = db.Column(db.Text, nullable=True)          # JSON-encoded list
    treatments = db.Column(db.Text, nullable=True)        # JSON-encoded list (overview, derived)
    severity = db.Column(db.String(20), nullable=False, default="Medium")
    specialist = db.Column(db.String(120), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "disease_name": self.disease_name,
            "symptoms": json.loads(self.symptoms) if self.symptoms else [],
            "description": self.description,
            "causes": self.causes,
            "precautions": json.loads(self.precautions) if self.precautions else [],
            "medications": json.loads(self.medications) if self.medications else [],
            "diet": json.loads(self.diet) if self.diet else [],
            "exercise": json.loads(self.exercise) if self.exercise else [],
            "treatments": json.loads(self.treatments) if self.treatments else [],
            "severity": self.severity,
            "specialist": self.specialist,
        }


class Prediction(db.Model):
    __tablename__ = "predictions"

    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False, index=True)
    symptoms = db.Column(db.Text, nullable=False)  # JSON-encoded list of symptom keys submitted
    age = db.Column(db.Integer, nullable=True)
    gender = db.Column(db.String(20), nullable=True)
    additional_info = db.Column(db.Text, nullable=True)
    predicted_disease = db.Column(db.String(150), nullable=False)
    confidence_score = db.Column(db.Float, nullable=False)
    top_predictions = db.Column(db.Text, nullable=True)  # JSON-encoded list of top-5 {disease, confidence}
    severity = db.Column(db.String(20), nullable=True)
    prediction_date = db.Column(db.DateTime, default=datetime.utcnow, index=True)

    def to_dict(self):
        import json
        return {
            "id": self.id,
            "user_id": self.user_id,
            "symptoms": json.loads(self.symptoms) if self.symptoms else [],
            "age": self.age,
            "gender": self.gender,
            "additional_info": self.additional_info,
            "predicted_disease": self.predicted_disease,
            "confidence_score": self.confidence_score,
            "top_predictions": json.loads(self.top_predictions) if self.top_predictions else [],
            "severity": self.severity,
            "prediction_date": self.prediction_date.isoformat() if self.prediction_date else None,
        }


class PasswordResetToken(db.Model):
    __tablename__ = "password_reset_tokens"

    id = db.Column(db.String(36), primary_key=True, default=gen_uuid)
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    token = db.Column(db.String(255), unique=True, nullable=False, index=True)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
