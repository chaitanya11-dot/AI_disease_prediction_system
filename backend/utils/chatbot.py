"""
utils/chatbot.py - Fully offline, rule-based health guidance chatbot.

This is NOT a real medical AI — it uses keyword matching and the local disease
dataset to give general, informational guidance, point users toward the
prediction tool, and answer FAQ-style questions. No external API calls.
"""
import re
import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from data.disease_dataset import DISEASES

DISCLAIMER = (
    "Remember: this chatbot provides general informational guidance only and is not "
    "a substitute for professional medical advice."
)

GREETINGS = ["hi", "hello", "hey", "good morning", "good evening", "good afternoon"]
THANKS = ["thank you", "thanks", "thx", "appreciate it"]
EMERGENCY_KEYWORDS = [
    "can't breathe", "cannot breathe", "chest pain", "severe bleeding", "unconscious",
    "suicidal", "suicide", "heart attack", "stroke", "severe pain", "overdose", "not breathing",
]


def _find_disease_matches(text):
    text_lower = text.lower()
    matches = []
    for d in DISEASES:
        if d["name"].lower() in text_lower:
            matches.append(d)
    return matches


def _find_symptom_mentions(text):
    text_lower = text.lower().replace("-", " ")
    found = []
    symptom_keywords = set()
    for d in DISEASES:
        for s in d["symptoms"]:
            symptom_keywords.add(s)
    for s in symptom_keywords:
        readable = s.replace("_", " ")
        if readable in text_lower:
            found.append(s)
    return found


def get_chatbot_response(message: str, history=None):
    """
    Returns a dict: { reply: str, suggestions: [str], emergency: bool }
    """
    if not message or not message.strip():
        return {
            "reply": "I didn't catch that — could you tell me more about how you're feeling?",
            "suggestions": ["I have a fever and cough", "What is hypertension?", "How do I use the symptom checker?"],
            "emergency": False,
        }

    text = message.strip().lower()

    # Emergency detection first — always
    if any(kw in text for kw in EMERGENCY_KEYWORDS):
        return {
            "reply": (
                "This sounds like it could be a medical emergency. Please contact your local "
                "emergency services immediately or go to the nearest emergency room. "
                "If you're in the US, call 911. If you are having thoughts of self-harm, please "
                "reach out to a crisis line in your country right away. I can't help with "
                "emergencies through this chat."
            ),
            "suggestions": ["Find emergency contacts", "I'm feeling better now, continue"],
            "emergency": True,
        }

    # Greeting
    if any(g in text for g in GREETINGS) and len(text) < 40:
        return {
            "reply": (
                "Hello! I'm your AI Health Assistant. I can help you understand symptoms, "
                "learn about common conditions, or guide you to the Symptom Checker for a "
                "prediction. How can I help today?"
            ),
            "suggestions": ["Check my symptoms", "What is diabetes?", "Show me precautions for flu"],
            "emergency": False,
        }

    if any(t in text for t in THANKS):
        return {
            "reply": "You're welcome! Is there anything else about your health you'd like to know?",
            "suggestions": ["Check my symptoms", "View FAQ", "Talk to a specialist - who should I see?"],
            "emergency": False,
        }

    # Disease name lookup
    disease_matches = _find_disease_matches(text)
    if disease_matches:
        d = disease_matches[0]
        reply = (
            f"**{d['name']}**: {d['description']} "
            f"Common symptoms include {', '.join(s.replace('_',' ') for s in d['symptoms'][:5])}. "
            f"Typical precautions: {', '.join(d['precautions'][:3])}. "
            f"It's generally advisable to consult a {d['specialist']} for proper diagnosis. "
            f"{DISCLAIMER}"
        )
        return {
            "reply": reply,
            "suggestions": [f"What causes {d['name']}?", "Check my symptoms", "Diet recommendations for this"],
            "emergency": False,
        }

    # "what causes X"
    causes_match = re.search(r"(causes?|why do (i|you) get) (of )?(.+)", text)
    if causes_match:
        candidate = causes_match.group(4).strip().rstrip("?")
        for d in DISEASES:
            if d["name"].lower() in candidate or candidate in d["name"].lower():
                return {
                    "reply": f"**{d['name']}** is typically caused by: {d['causes']} {DISCLAIMER}",
                    "suggestions": ["Check my symptoms", "Precautions", "Diet tips"],
                    "emergency": False,
                }

    # Symptom-based response
    symptom_hits = _find_symptom_mentions(text)
    if symptom_hits:
        # find diseases that share the most symptoms with what was mentioned
        scored = []
        for d in DISEASES:
            overlap = len(set(d["symptoms"]) & set(symptom_hits))
            if overlap > 0:
                scored.append((overlap, d))
        scored.sort(key=lambda x: x[0], reverse=True)

        readable_symptoms = ", ".join(s.replace("_", " ") for s in symptom_hits)
        if scored:
            top_names = ", ".join(d["name"] for _, d in scored[:3])
            reply = (
                f"I noticed you mentioned: {readable_symptoms}. These symptoms can sometimes be "
                f"associated with conditions like {top_names}, among others. For a more accurate "
                f"assessment with confidence scores, I'd recommend using the Symptom Checker tool "
                f"on this site, which uses our trained prediction model. {DISCLAIMER}"
            )
        else:
            reply = (
                f"I noticed you mentioned: {readable_symptoms}. I'd recommend using the Symptom "
                f"Checker for a more thorough assessment. {DISCLAIMER}"
            )
        return {
            "reply": reply,
            "suggestions": ["Go to Symptom Checker", "What precautions should I take?", "When should I see a doctor?"],
            "emergency": False,
        }

    # Doctor / specialist guidance
    if "doctor" in text or "specialist" in text or "who should i see" in text:
        return {
            "reply": (
                "The right specialist depends on your symptoms — for example, a Cardiologist for "
                "heart-related concerns, a Pulmonologist for breathing issues, or a General "
                "Physician as a good first stop for most concerns. Try the Symptom Checker — it "
                "will recommend a specialist based on your predicted condition. " + DISCLAIMER
            ),
            "suggestions": ["Go to Symptom Checker", "Find emergency contacts"],
            "emergency": False,
        }

    # Diet / exercise guidance generic
    if "diet" in text or "eat" in text or "food" in text:
        return {
            "reply": (
                "General healthy eating tips: stay hydrated, favor whole foods (vegetables, fruits, "
                "lean protein, whole grains), limit processed sugar and excess salt, and eat "
                "regular balanced meals. For condition-specific diet advice, run a prediction in "
                "the Symptom Checker for tailored recommendations. " + DISCLAIMER
            ),
            "suggestions": ["Go to Symptom Checker", "Exercise tips"],
            "emergency": False,
        }

    if "exercise" in text or "workout" in text:
        return {
            "reply": (
                "In general, aim for about 150 minutes of moderate aerobic activity per week, plus "
                "some strength training, unless a health condition limits this. If you're currently "
                "unwell, rest is usually best until acute symptoms resolve. Check the Symptom Checker "
                "for activity guidance specific to your condition. " + DISCLAIMER
            ),
            "suggestions": ["Go to Symptom Checker", "Diet tips"],
            "emergency": False,
        }

    # Fallback
    return {
        "reply": (
            "I'm not fully sure how to answer that yet. I can help with: describing symptoms you're "
            "experiencing, explaining a known condition, or guiding you to the Symptom Checker for "
            "an AI-based prediction. Could you rephrase, or tell me what symptoms you're noticing?"
        ),
        "suggestions": ["Check my symptoms", "What is asthma?", "View FAQ page"],
        "emergency": False,
    }
