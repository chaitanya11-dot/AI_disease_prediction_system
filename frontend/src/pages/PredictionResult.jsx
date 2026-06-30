import { useEffect, useState } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import {
  CheckCircle2, AlertCircle, Download, Mail, Stethoscope, ShieldCheck,
  Pill, Salad, Dumbbell, UserRound, ArrowRight, Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import DisclaimerBanner from "../components/ui/DisclaimerBanner";
import SeverityBadge from "../components/ui/Badges";
import LoadingScreen from "../components/ui/LoadingScreen";
import { historyApi, reportApi } from "../api/endpoints";

export default function PredictionResult() {
  const { predictionId } = useParams();
  const location = useLocation();
  const [result, setResult] = useState(location.state?.result || null);
  const [loading, setLoading] = useState(!location.state?.result);
  const [downloading, setDownloading] = useState(false);
  const [emailing, setEmailing] = useState(false);

  useEffect(() => {
    if (result) return;
    // Fallback: fetch from history if user navigated directly via URL (e.g. refresh)
    historyApi
      .getDetail(predictionId)
      .then((res) => {
        const p = res.data.prediction;
        setResult({
          predicted_disease: p.predicted_disease,
          confidence_score: p.confidence_score,
          severity: p.severity,
          top_predictions: p.top_predictions,
          disease_info: null,
          prediction_date: p.prediction_date,
        });
      })
      .catch(() => toast.error("Could not load this prediction."))
      .finally(() => setLoading(false));
  }, [predictionId, result]);

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const res = await reportApi.download(predictionId);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url;
      link.download = `health_report_${predictionId.slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Report downloaded.");
    } catch {
      toast.error("Could not download report.");
    } finally {
      setDownloading(false);
    }
  };

  const handleEmail = async () => {
    setEmailing(true);
    try {
      const res = await reportApi.email(predictionId);
      toast.success(res.data.message || "Report emailed successfully.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not email report.");
    } finally {
      setEmailing(false);
    }
  };

  if (loading) return <LoadingScreen label="Loading your prediction..." />;
  if (!result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
        <p className="text-warmgray-700 dark:text-clinical-300">We couldn't find this prediction.</p>
        <Link to="/symptom-checker" className="mt-4 inline-block text-clinical-600 font-semibold hover:underline">
          Run a new symptom check
        </Link>
      </div>
    );
  }

  const info = result.disease_info;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Primary result */}
      <Card className="p-6 sm:p-8 mb-6 relative overflow-hidden">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-vital-600 bg-vital-500/10 px-2.5 py-1 rounded-full mb-3">
              <CheckCircle2 className="w-3.5 h-3.5" /> Top prediction
            </span>
            <h1 className="text-2xl sm:text-3xl font-semibold text-clinical-950 dark:text-white">
              {result.predicted_disease}
            </h1>
            <div className="flex items-center gap-3 mt-3">
              <SeverityBadge severity={result.severity} />
              {result.model_accuracy && (
                <span className="text-xs text-warmgray-500 dark:text-clinical-400">
                  Model accuracy: {result.model_accuracy}%
                </span>
              )}
            </div>
          </div>
          <div className="text-center shrink-0">
            <div className="relative w-20 h-20">
              <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                <circle cx="40" cy="40" r="34" fill="none" stroke="#E3F2FD" strokeWidth="8" />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="#0B5FA5"
                  strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 34}`}
                  strokeDashoffset={`${2 * Math.PI * 34 * (1 - result.confidence_score / 100)}`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center font-semibold text-clinical-900 dark:text-white text-lg">
                {result.confidence_score}%
              </span>
            </div>
            <p className="text-xs text-warmgray-500 dark:text-clinical-400 mt-1">confidence</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mt-6">
          <Button variant="outline" icon={Download} loading={downloading} onClick={handleDownload}>
            Download PDF report
          </Button>
          <Button variant="outline" icon={Mail} loading={emailing} onClick={handleEmail}>
            Email me this report
          </Button>
        </div>
      </Card>

      <div className="mb-6">
        <DisclaimerBanner />
      </div>

      {/* Top 5 predictions table */}
      {result.top_predictions?.length > 0 && (
        <Card className="p-6 sm:p-8 mb-6">
          <h2 className="font-semibold text-clinical-950 dark:text-white mb-4 flex items-center gap-2">
            <Stethoscope className="w-5 h-5 text-clinical-500" /> Top 5 probable conditions
          </h2>
          <div className="space-y-3">
            {result.top_predictions.map((p, i) => (
              <div key={p.disease} className="flex items-center gap-4">
                <span className="text-sm font-semibold text-warmgray-400 w-5">{i + 1}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-medium text-warmgray-800 dark:text-clinical-100">{p.disease}</span>
                    <span className="text-sm font-semibold text-clinical-600 dark:text-clinical-300">{p.confidence}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-warmgray-100 dark:bg-clinical-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-clinical-500"
                      style={{ width: `${p.confidence}%` }}
                    />
                  </div>
                </div>
                {p.severity && <SeverityBadge severity={p.severity} className="hidden sm:inline-flex" />}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Description & causes */}
      {info && (
        <Card className="p-6 sm:p-8 mb-6">
          <h2 className="font-semibold text-clinical-950 dark:text-white mb-2">About {info.disease_name}</h2>
          <p className="text-sm text-warmgray-700 dark:text-clinical-300 leading-relaxed">{info.description}</p>
          <h3 className="font-semibold text-clinical-950 dark:text-white mt-5 mb-2">Possible causes</h3>
          <p className="text-sm text-warmgray-700 dark:text-clinical-300 leading-relaxed">{info.causes}</p>
        </Card>
      )}

      {/* Recommendation module */}
      {info && (
        <div className="grid sm:grid-cols-2 gap-5 mb-6">
          <RecommendationCard icon={ShieldCheck} title="Recommended precautions" items={info.precautions} color="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" />
          <RecommendationCard icon={Pill} title="Informational medication notes" items={info.medications} color="text-blue-600 bg-blue-50 dark:bg-blue-900/20" note />
          <RecommendationCard icon={Salad} title="Diet recommendations" items={info.diet} color="text-lime-600 bg-lime-50 dark:bg-lime-900/20" />
          <RecommendationCard icon={Dumbbell} title="Exercise suggestions" items={info.exercise} color="text-orange-600 bg-orange-50 dark:bg-orange-900/20" />
        </div>
      )}

      {info && (
        <Card className="p-6 sm:p-8 mb-6 bg-clinical-600 border-none text-white">
          <div className="flex items-center gap-4">
            <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 shrink-0">
              <UserRound className="w-6 h-6" />
            </span>
            <div>
              <h2 className="font-semibold">Recommended specialist</h2>
              <p className="text-clinical-100 text-sm mt-0.5">{info.specialist}</p>
            </div>
          </div>
        </Card>
      )}

      <div className="flex flex-wrap gap-3 justify-center mt-8">
        <Link to="/symptom-checker">
          <Button variant="secondary" icon={ArrowRight}>Run another check</Button>
        </Link>
        <Link to="/history">
          <Button variant="outline">View prediction history</Button>
        </Link>
        {info && (
          <Link to={`/diseases/${info.id}`}>
            <Button variant="outline">View full disease info</Button>
          </Link>
        )}
      </div>
    </div>
  );
}

function RecommendationCard({ icon: Icon, title, items = [], color, note }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <span className={`flex items-center justify-center w-9 h-9 rounded-xl ${color}`}>
          <Icon className="w-4.5 h-4.5" />
        </span>
        <h3 className="font-semibold text-clinical-950 dark:text-white text-sm">{title}</h3>
      </div>
      <ul className="space-y-1.5">
        {items.map((item, i) => (
          <li key={i} className="text-sm text-warmgray-700 dark:text-clinical-300 leading-relaxed flex gap-2">
            <span className="text-clinical-400 mt-1">•</span> {item}
          </li>
        ))}
      </ul>
      {note && (
        <p className="text-xs text-warmgray-400 dark:text-clinical-500 mt-3 italic">
          Informational only — always consult a pharmacist or physician before taking any medication.
        </p>
      )}
    </Card>
  );
}
