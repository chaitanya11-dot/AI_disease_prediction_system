"""
predictor.py - Loads the trained Random Forest model and serves predictions.
"""
import os
import pickle
import numpy as np

ML_DIR = os.path.dirname(os.path.abspath(__file__))


class DiseasePredictor:
    def __init__(self):
        self.model = None
        self.label_encoder = None
        self.symptom_vocab = None
        self.meta = None
        self._load()

    def _load(self):
        model_path = os.path.join(ML_DIR, "disease_model.pkl")
        if not os.path.exists(model_path):
            raise FileNotFoundError(
                "Trained model not found. Run 'python ml/train_model.py' from the backend "
                "directory before starting the server."
            )
        with open(model_path, "rb") as f:
            self.model = pickle.load(f)
        with open(os.path.join(ML_DIR, "label_encoder.pkl"), "rb") as f:
            self.label_encoder = pickle.load(f)
        with open(os.path.join(ML_DIR, "symptom_vocab.pkl"), "rb") as f:
            self.symptom_vocab = pickle.load(f)
        with open(os.path.join(ML_DIR, "model_meta.pkl"), "rb") as f:
            self.meta = pickle.load(f)

    def get_accuracy(self):
        return self.meta.get("accuracy", None)

    def get_meta(self):
        return self.meta

    def vectorize(self, symptoms):
        """Convert a list of symptom keys into the binary feature vector the model expects."""
        symptom_set = set(symptoms)
        return np.array([[1 if s in symptom_set else 0 for s in self.symptom_vocab]])

    def predict_top_n(self, symptoms, n=5):
        """
        Returns a list of up to n dicts: {disease, confidence} sorted by confidence desc.
        Confidence is the RandomForest's predict_proba percentage, rounded to 2 decimals.
        """
        if not symptoms:
            return []

        X = self.vectorize(symptoms)
        proba = self.model.predict_proba(X)[0]  # array aligned with self.model.classes_
        class_indices = self.model.classes_  # these are label-encoded ints

        # pair up (encoded_label, probability)
        pairs = list(zip(class_indices, proba))
        pairs.sort(key=lambda x: x[1], reverse=True)
        top = pairs[:n]

        results = []
        for encoded_label, prob in top:
            disease_name = self.label_encoder.inverse_transform([encoded_label])[0]
            results.append({
                "disease": disease_name,
                "confidence": round(float(prob) * 100, 2),
            })
        return results


# Singleton instance, loaded once at import time
_predictor_instance = None


def get_predictor():
    global _predictor_instance
    if _predictor_instance is None:
        _predictor_instance = DiseasePredictor()
    return _predictor_instance
