# MediSense AI — AI Disease Prediction System

A full-stack, fully offline AI-powered disease prediction system. Enter your symptoms and get
the top 5 probable conditions, confidence scores, severity levels, and personalized health
recommendations — all powered by a locally trained machine learning model. No paid APIs, no
external AI services, no data leaving your machine.

> **Disclaimer:** This system is for informational purposes only and is not a substitute for
> professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare
> provider with any questions about a medical condition.

---

## Tech stack

| Layer        | Technology                                                            |
|--------------|------------------------------------------------------------------------|
| Frontend     | React 18 + Vite + Tailwind CSS + React Router + Recharts + Axios       |
| Backend      | Python Flask + Flask-JWT-Extended + Flask-Bcrypt + Flask-SQLAlchemy    |
| Database     | SQLite                                                                 |
| ML model     | scikit-learn `RandomForestClassifier`                                  |
| PDF reports  | ReportLab                                                               |
| Email        | Python `smtplib` (with a console-mode fallback — no SMTP required)     |
| Chatbot      | Fully offline, rule-based (no external LLM API)                        |

Everything runs locally. No paid APIs are required at any point.

---

## Project structure

```
ai-disease-prediction/
├── backend/
│   ├── app.py                  # Flask app entrypoint
│   ├── config.py               # App configuration
│   ├── extensions.py           # Shared Flask extensions (db, jwt, bcrypt)
│   ├── models.py               # SQLAlchemy models (User, Disease, Prediction, ...)
│   ├── seed_db.py              # Seeds diseases + default admin user
│   ├── requirements.txt
│   ├── data/
│   │   └── disease_dataset.py  # Sample symptom-disease dataset (25 diseases, 90+ symptoms)
│   ├── ml/
│   │   ├── train_model.py      # Generates synthetic training data & trains the model
│   │   ├── predictor.py        # Loads trained model & serves predictions
│   │   └── *.pkl               # Generated after training (model, encoder, vocab, meta)
│   ├── routes/
│   │   ├── auth_routes.py      # Register, login, forgot/reset password, profile
│   │   ├── prediction_routes.py# Symptom list, /predict, dashboard stats
│   │   ├── disease_routes.py   # Disease library endpoints
│   │   ├── history_routes.py   # Prediction history (list/filter/search/delete)
│   │   ├── report_routes.py    # PDF download + email report
│   │   ├── chatbot_routes.py   # Offline chatbot endpoint
│   │   └── admin_routes.py     # Admin analytics, user & disease management, monitoring
│   └── utils/
│       ├── auth_utils.py       # Validation, role-based access decorator
│       ├── email_utils.py      # SMTP sender with console-mode fallback
│       ├── pdf_utils.py        # PDF report generator
│       └── chatbot.py          # Rule-based chatbot logic
│
└── frontend/
    ├── src/
    │   ├── api/                # Axios client + grouped endpoint functions
    │   ├── context/            # AuthContext, ThemeContext
    │   ├── components/
    │   │   ├── layout/         # Navbar, Footer, MainLayout, AuthLayout, RouteGuards
    │   │   ├── ui/             # Button, Card, Badge, FormInput, DisclaimerBanner, ...
    │   │   ├── symptom/        # SymptomSelector (searchable multi-select)
    │   │   └── chatbot/        # Floating ChatbotWidget
    │   └── pages/
    │       ├── Home.jsx, Login.jsx, Register.jsx, ForgotPassword.jsx, ResetPassword.jsx
    │       ├── Dashboard.jsx, SymptomChecker.jsx, PredictionResult.jsx
    │       ├── DiseaseLibrary.jsx, DiseaseDetail.jsx, PredictionHistory.jsx
    │       ├── Profile.jsx, FAQ.jsx, Emergency.jsx, NotFound.jsx
    │       └── admin/          # AdminLayout, AdminAnalytics, AdminUsers, AdminDiseases,
    │                           # AdminPredictions, AdminSystem
    ├── tailwind.config.js
    └── package.json
```

---

## 1. Backend setup

### Requirements
- Python 3.10+

### Steps

```bash
cd backend

# (Recommended) create a virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Train the ML model (generates .pkl files in ml/)
python ml/train_model.py

# Seed the database with the sample disease dataset + a default admin account
python seed_db.py

# Run the server
python app.py
```

The backend will start on **http://localhost:5000**.

**Default admin login** (created by `seed_db.py` when no `ADMIN_EMAIL`/`ADMIN_PASSWORD` env
vars are set):
- Email: `admin@aidiseaseprediction.local`
- Password: `Admin@12345`

> These are public, well-known defaults meant only for local development. Set your own
> `ADMIN_EMAIL` and `ADMIN_PASSWORD` environment variables before running `seed_db.py` for
> any deployment beyond your own machine — see [DEPLOYMENT.md](./DEPLOYMENT.md).

#### Environment variables (optional)

Create a `.env` file in `backend/` (or just export these in your shell) to customize:

```env
SECRET_KEY=your-secret-key
JWT_SECRET_KEY=your-jwt-secret
DATABASE_URL=sqlite:///disease_prediction.db
ADMIN_EMAIL=you@example.com
ADMIN_PASSWORD=choose-a-strong-password
CORS_ORIGINS=http://localhost:3000,http://localhost:5173

# Optional: configure real SMTP to actually send emails.
# If left blank, emails are printed to the console instead (fully functional offline).
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USE_TLS=true
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_DEFAULT_SENDER=your-email@gmail.com
```

If you don't configure SMTP, password reset emails and prediction report emails will be
printed to the backend terminal instead of actually sent — this keeps every feature usable
without requiring any paid email service.

---

## 2. Frontend setup

### Requirements
- Node.js 18+

### Steps

```bash
cd frontend
npm install
npm run dev
```

The frontend will start on **http://localhost:5173**.

If your backend runs somewhere other than `http://localhost:5000/api`, copy `.env.example` to
`.env` and adjust `VITE_API_URL`.

### Production build

```bash
npm run build    # outputs to frontend/dist
npm run preview  # preview the production build locally
```

---

## 3. Using the app

1. Open **http://localhost:5173**.
2. Register a new account (or log in as the seeded admin).
3. Go to **Symptom Checker**, search and select your symptoms, optionally add age/gender/notes.
4. Submit to get your top 5 probable conditions with confidence scores, severity, causes, and
   recommendations (precautions, diet, exercise, medication notes, specialist suggestion).
5. Download the result as a PDF or email it to yourself (console-mode if SMTP isn't configured).
6. View past predictions under **History** — searchable and filterable by date.
7. Browse **Disease Library** for general reference info independent of a specific prediction.
8. Use the floating chat bubble for offline, rule-based health guidance.
9. Log in as the admin account and visit **/admin** for analytics, user management, the disease
   database editor, prediction statistics, and system monitoring.

---

## 4. About the ML model

- **Algorithm:** `RandomForestClassifier` (scikit-learn), 200 trees, balanced class weights.
- **Training data:** synthetically generated from `backend/data/disease_dataset.py` — for each
  of the 25 diseases, hundreds of synthetic "patients" are generated by randomly subsetting that
  disease's real symptoms (simulating partial symptom reporting) and occasionally injecting an
  unrelated symptom (simulating noisy real-world input).
- **Typical accuracy:** ~85-90% on a held-out test split (this is reported live in the Admin →
  System Monitoring page, since it's regenerated each time you retrain).
- **This is illustrative, not clinical-grade.** The dataset is small and synthetic. Treat all
  predictions as a conversation starter for a real consultation, not a diagnosis.

### Retraining after editing the disease database

If you add or edit diseases via the Admin Panel, the disease **library** updates immediately,
but the live **prediction model** will not include those changes until you retrain:

```bash
cd backend
python ml/train_model.py
# then restart the Flask server so it reloads the new model files
```

---

## 5. Security notes

- Passwords are hashed with **bcrypt** (via Flask-Bcrypt) — never stored in plain text.
- Authentication uses **JWT** (JSON Web Tokens) via Flask-JWT-Extended, with a 24-hour expiry.
- Admin-only routes are protected by a role-based decorator that checks the JWT's `role` claim.
- Basic input validation is applied on registration (email format, password complexity) and
  throughout the API.
- This is a development setup (`debug=False` by default, but using Flask's built-in server).
  For any real deployment, run behind a production WSGI server (e.g. gunicorn) and HTTPS.

---

## 6. Database schema

**users**: id, name, email, password_hash, role, age, gender, is_active, created_at
**diseases**: id, disease_name, symptoms (JSON), description, causes, precautions (JSON),
medications (JSON), diet (JSON), exercise (JSON), treatments (JSON), severity, specialist
**predictions**: id, user_id, symptoms (JSON), age, gender, additional_info,
predicted_disease, confidence_score, top_predictions (JSON), severity, prediction_date
**password_reset_tokens**: id, user_id, token, expires_at, used, created_at

SQLite is used for simplicity and zero-config local setup; swap `DATABASE_URL` for Postgres/MySQL
in production if needed (SQLAlchemy handles the abstraction).

---

## 7. Troubleshooting

- **"Trained model not found" error on backend startup** → run `python ml/train_model.py` first.
- **CORS errors in the browser console** → make sure `CORS_ORIGINS` in your backend `.env`
  includes the exact origin your frontend is running on (including protocol and port).
- **Login works but admin pages 403** → make sure you're logged in as the seeded admin account,
  or promote a user to admin via direct DB edit / another admin account's User Management page.
- **Emails aren't arriving** → check the backend terminal; if SMTP isn't configured, email
  content is printed there instead of sent.

---

## 8. Deploying this app

Want to put this online instead of just running it locally? See **[DEPLOYMENT.md](./DEPLOYMENT.md)**
for a step-by-step guide to deploying on [Render](https://render.com) (free tier), including:
- A ready-to-use `render.yaml` Blueprint that provisions the backend, frontend, and a managed
  Postgres database together
- Swapping SQLite for Postgres (already supported via `DATABASE_URL`)
- Generating real `SECRET_KEY`/`JWT_SECRET_KEY` values (the app will refuse to boot on Render
  with the insecure local-dev defaults — see `app.py`'s `_enforce_production_secrets`)
- Setting your own admin credentials via `ADMIN_EMAIL` / `ADMIN_PASSWORD` instead of the
  publicly-known local defaults

## License & disclaimer

This project is built entirely with free and open-source tools. The included disease dataset is
illustrative and was authored for this project — it is not sourced from or validated against
real clinical data. **Do not use this system for actual medical decision-making.**
