import { Link } from "react-router-dom";
import {
  Activity, Stethoscope, ShieldCheck, BarChart3, History as HistoryIcon,
  FileText, MessageCircle, ArrowRight, CheckCircle2, Brain, Lock, Sparkles
} from "lucide-react";
import VitalLine from "../components/ui/VitalLine";
import Card from "../components/ui/Card";
import { useAuth } from "../context/AuthContext";

const features = [
  {
    icon: Stethoscope,
    title: "Symptom-based prediction",
    desc: "Select symptoms from a searchable list and get the top 5 probable conditions, ranked by confidence.",
  },
  {
    icon: Brain,
    title: "Trained ML model",
    desc: "Powered by a Random Forest Classifier trained on a curated symptom-disease dataset, running entirely on your machine.",
  },
  {
    icon: BarChart3,
    title: "Confidence & severity",
    desc: "Every prediction includes a confidence score and severity level, so you know how seriously to treat the result.",
  },
  {
    icon: FileText,
    title: "Personalized recommendations",
    desc: "Precautions, dietary guidance, exercise suggestions, and which kind of specialist to consult.",
  },
  {
    icon: HistoryIcon,
    title: "Prediction history",
    desc: "Every check is saved to your account so you can track patterns and revisit past results.",
  },
  {
    icon: MessageCircle,
    title: "Health guidance chatbot",
    desc: "A built-in assistant for quick, general questions about symptoms and conditions — fully offline.",
  },
];

const steps = [
  { label: "Describe", detail: "Select your symptoms, age, and gender" },
  { label: "Analyze", detail: "Our model compares your input against learned patterns" },
  { label: "Understand", detail: "See ranked conditions with confidence & severity" },
  { label: "Act", detail: "Get precautions, diet tips, and a specialist recommendation" },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-b from-clinical-50 via-white to-white dark:from-clinical-900 dark:via-clinical-950 dark:to-clinical-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 lg:pt-24 lg:pb-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeUp">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-clinical-100 dark:bg-clinical-800 text-clinical-700 dark:text-clinical-200 text-xs font-semibold mb-5">
                <Sparkles className="w-3.5 h-3.5" /> Offline AI · Free & open-source
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold text-clinical-950 dark:text-white leading-[1.08] text-balance">
                Understand your symptoms
                <span className="text-clinical-600"> before you see a doctor.</span>
              </h1>
              <p className="mt-5 text-lg text-warmgray-800 dark:text-clinical-200 leading-relaxed max-w-xl">
                MediSense AI uses a locally trained machine learning model to analyze your
                symptoms and surface the most probable conditions — with confidence scores,
                severity levels, and clear next steps. No paid APIs, no data leaving your machine.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to={isAuthenticated ? "/symptom-checker" : "/register"}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-clinical-600 hover:bg-clinical-700 text-white font-semibold shadow-card-hover transition-colors"
                >
                  Check my symptoms <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/diseases"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl border border-clinical-200 dark:border-clinical-700 text-clinical-700 dark:text-clinical-100 font-semibold hover:bg-clinical-50 dark:hover:bg-clinical-800 transition-colors"
                >
                  Browse disease library
                </Link>
              </div>
              <p className="mt-5 text-xs text-warmgray-500 dark:text-clinical-400 max-w-md">
                This prediction is for informational purposes only and is not a substitute for
                professional medical advice.
              </p>
            </div>

            <div className="relative animate-fadeUp [animation-delay:120ms]">
              <Card className="p-6 sm:p-8 relative overflow-hidden">
                <div className="absolute -top-6 -right-6 w-40 h-40 bg-clinical-100 dark:bg-clinical-800 rounded-full opacity-60" />
                <div className="flex items-center justify-between mb-5 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-clinical-600 text-white">
                      <Activity className="w-5 h-5" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-clinical-950 dark:text-white">Live prediction preview</p>
                      <p className="text-xs text-warmgray-500 dark:text-clinical-400">Example output</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                    89.6% model accuracy
                  </span>
                </div>

                <VitalLine className="w-full h-10 text-clinical-300 dark:text-clinical-700 mb-4" />

                <div className="space-y-2.5 relative z-10">
                  {[
                    { name: "Influenza (Flu)", pct: 78 },
                    { name: "Common Cold", pct: 54 },
                    { name: "COVID-19", pct: 41 },
                  ].map((d, i) => (
                    <div key={d.name} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-warmgray-800 dark:text-clinical-100 w-32 truncate">
                        {d.name}
                      </span>
                      <div className="flex-1 h-2 rounded-full bg-clinical-50 dark:bg-clinical-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-clinical-500"
                          style={{ width: `${d.pct}%` }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-clinical-600 dark:text-clinical-300 w-10 text-right">
                        {d.pct}%
                      </span>
                    </div>
                  ))}
                </div>

                <div className="mt-5 pt-4 border-t border-clinical-100 dark:border-clinical-800 flex items-center gap-2 text-xs text-warmgray-500 dark:text-clinical-400 relative z-10">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Symptoms: fever, cough, body ache, fatigue
                </div>
              </Card>
            </div>
          </div>
        </div>

        <VitalLine className="w-full h-6 text-clinical-200 dark:text-clinical-800" animated={false} />
      </section>

      {/* HOW IT WORKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl font-semibold text-clinical-950 dark:text-white">From symptoms to a clear next step</h2>
          <p className="mt-3 text-warmgray-700 dark:text-clinical-300">
            A simple flow, built on a transparent prediction process — not a black box.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s, i) => (
            <div key={s.label} className="relative">
              <Card className="p-5 h-full" hover>
                <span className="font-display text-3xl text-clinical-200 dark:text-clinical-700 font-semibold">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-2 font-semibold text-clinical-950 dark:text-white">{s.label}</h3>
                <p className="mt-1 text-sm text-warmgray-700 dark:text-clinical-300 leading-relaxed">{s.detail}</p>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section className="bg-clinical-50/60 dark:bg-clinical-900/40 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-semibold text-clinical-950 dark:text-white">Everything you need to make sense of symptoms</h2>
            <p className="mt-3 text-warmgray-700 dark:text-clinical-300">
              Built as a complete health companion, not just a single prediction form.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="p-6" hover>
                <span className="flex items-center justify-center w-11 h-11 rounded-xl bg-clinical-600/10 text-clinical-600 dark:text-clinical-300 mb-4">
                  <Icon className="w-5.5 h-5.5" />
                </span>
                <h3 className="font-semibold text-clinical-950 dark:text-white">{title}</h3>
                <p className="mt-1.5 text-sm text-warmgray-700 dark:text-clinical-300 leading-relaxed">{desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* TRUST / PRIVACY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <Card className="p-8 sm:p-12 bg-clinical-600 border-none text-white relative overflow-hidden">
          <VitalLine className="absolute bottom-0 left-0 w-full h-16 text-white/10" animated={false} />
          <div className="relative z-10 grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-xs font-semibold mb-4">
                <Lock className="w-3.5 h-3.5" /> Privacy by design
              </span>
              <h2 className="text-2xl sm:text-3xl font-semibold leading-tight">
                Your symptoms never leave your own server.
              </h2>
              <p className="mt-3 text-clinical-100 leading-relaxed max-w-lg">
                Every prediction runs through a model trained and hosted locally — no third-party
                AI APIs, no paid subscriptions, no external data sharing. Authentication uses
                hashed passwords and JWT-secured sessions.
              </p>
            </div>
            <div className="flex flex-col gap-3 justify-center">
              {[
                "JWT-secured authentication",
                "Bcrypt password hashing",
                "Fully offline ML inference",
                "Open-source stack throughout",
              ].map((t) => (
                <div key={t} className="flex items-center gap-2 text-sm font-medium">
                  <ShieldCheck className="w-4 h-4 shrink-0" /> {t}
                </div>
              ))}
            </div>
          </div>
        </Card>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center max-w-xl mx-auto">
          <h2 className="text-3xl font-semibold text-clinical-950 dark:text-white">Ready to check your symptoms?</h2>
          <p className="mt-3 text-warmgray-700 dark:text-clinical-300">
            It takes less than a minute, and your history is saved so you can track changes over time.
          </p>
          <Link
            to={isAuthenticated ? "/symptom-checker" : "/register"}
            className="mt-7 inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-clinical-600 hover:bg-clinical-700 text-white font-semibold shadow-card-hover transition-colors"
          >
            Get started for free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
