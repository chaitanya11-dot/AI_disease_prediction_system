"""
train_model.py
----------------
Generates a synthetic symptom-disease training dataset from data/disease_dataset.py
and trains a Random Forest Classifier to predict disease from a binary symptom vector.

Run this once during setup:
    python ml/train_model.py

It produces:
    ml/disease_model.pkl   - trained RandomForestClassifier
    ml/label_encoder.pkl   - LabelEncoder for disease names
    ml/symptom_vocab.pkl   - ordered list of symptom feature names
    ml/model_meta.pkl      - dict with accuracy and metadata
"""

import os
import sys
import random
import pickle

import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data.disease_dataset import DISEASES, SYMPTOM_VOCAB

RANDOM_SEED = 42
random.seed(RANDOM_SEED)
np.random.seed(RANDOM_SEED)

SAMPLES_PER_DISEASE = 220  # synthetic samples generated per disease
NOISE_SYMPTOM_PROB = 0.04  # chance of an unrelated symptom being added (simulates noisy real-world input)
DROPOUT_PROB = 0.18        # chance a true symptom is omitted (simulates partial reporting)


def build_feature_vector(symptom_set, vocab):
    return [1 if s in symptom_set else 0 for s in vocab]


def generate_synthetic_dataset():
    """
    For each disease, generate many synthetic patients by:
    - Randomly selecting a subset of the disease's real symptoms (at least 2, simulating
      that patients rarely report ALL symptoms of a condition)
    - Occasionally dropping a symptom (DROPOUT_PROB) to simulate partial/incomplete reporting
    - Occasionally adding a random unrelated symptom (NOISE_SYMPTOM_PROB) to simulate noise
    """
    X = []
    y = []
    vocab = SYMPTOM_VOCAB

    for disease in DISEASES:
        true_symptoms = disease["symptoms"]
        n_true = len(true_symptoms)

        for _ in range(SAMPLES_PER_DISEASE):
            # choose how many symptoms this synthetic patient reports (at least 2, or all if fewer)
            min_k = min(2, n_true)
            k = random.randint(min_k, n_true)
            chosen = set(random.sample(true_symptoms, k))

            # simulate dropout (remove some chosen symptoms but keep at least 1)
            chosen = {s for s in chosen if random.random() > DROPOUT_PROB}
            if not chosen:
                chosen = {random.choice(true_symptoms)}

            # simulate noise: occasionally add an unrelated symptom
            if random.random() < NOISE_SYMPTOM_PROB:
                noise_candidates = [s for s in vocab if s not in true_symptoms]
                if noise_candidates:
                    chosen.add(random.choice(noise_candidates))

            X.append(build_feature_vector(chosen, vocab))
            y.append(disease["name"])

    return np.array(X), np.array(y)


def train():
    print("Generating synthetic training data from disease dataset...")
    X, y = generate_synthetic_dataset()
    print(f"Generated {len(X)} samples across {len(set(y))} diseases, {len(SYMPTOM_VOCAB)} symptom features.")

    le = LabelEncoder()
    y_encoded = le.fit_transform(y)

    X_train, X_test, y_train, y_test = train_test_split(
        X, y_encoded, test_size=0.2, random_state=RANDOM_SEED, stratify=y_encoded
    )

    print("Training RandomForestClassifier...")
    clf = RandomForestClassifier(
        n_estimators=150,
        max_depth=18,
        min_samples_split=2,
        min_samples_leaf=2,
        random_state=RANDOM_SEED,
        n_jobs=-1,
        class_weight="balanced",
    )
    clf.fit(X_train, y_train)

    y_pred = clf.predict(X_test)
    accuracy = accuracy_score(y_test, y_pred)
    print(f"Model accuracy on held-out test set: {accuracy * 100:.2f}%")

    out_dir = os.path.dirname(os.path.abspath(__file__))
    with open(os.path.join(out_dir, "disease_model.pkl"), "wb") as f:
        pickle.dump(clf, f)
    with open(os.path.join(out_dir, "label_encoder.pkl"), "wb") as f:
        pickle.dump(le, f)
    with open(os.path.join(out_dir, "symptom_vocab.pkl"), "wb") as f:
        pickle.dump(SYMPTOM_VOCAB, f)
    with open(os.path.join(out_dir, "model_meta.pkl"), "wb") as f:
        pickle.dump({
            "accuracy": round(accuracy * 100, 2),
            "n_samples": len(X),
            "n_diseases": len(set(y)),
            "n_features": len(SYMPTOM_VOCAB),
            "model_type": "RandomForestClassifier",
            "n_estimators": 150,
        }, f)

    print("Saved model artifacts to:", out_dir)
    print("Done.")


if __name__ == "__main__":
    train()
