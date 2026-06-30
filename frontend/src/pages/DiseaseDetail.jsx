import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Pill, Salad, Dumbbell, UserRound, ListChecks } from "lucide-react";
import Card from "../components/ui/Card";
import SeverityBadge from "../components/ui/Badges";
import LoadingScreen from "../components/ui/LoadingScreen";
import { diseaseApi } from "../api/endpoints";

export default function DiseaseDetail() {
  const { diseaseId } = useParams();
  const [disease, setDisease] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    diseaseApi
      .getById(diseaseId)
      .then((res) => setDisease(res.data.disease))
      .catch(() => setError("Disease not found."))
      .finally(() => setLoading(false));
  }, [diseaseId]);

  if (loading) return <LoadingScreen label="Loading disease details..." />;
  if (error || !disease) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-warmgray-600">{error}</p>
        <Link to="/diseases" className="mt-4 inline-block text-clinical-600 font-semibold hover:underline">
          Back to disease library
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link to="/diseases" className="inline-flex items-center gap-1.5 text-sm font-medium text-clinical-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to disease library
      </Link>

      <Card className="p-6 sm:p-8 mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="text-2xl sm:text-3xl font-semibold text-clinical-950 dark:text-white">{disease.disease_name}</h1>
          <SeverityBadge severity={disease.severity} />
        </div>
        <p className="mt-4 text-warmgray-700 dark:text-clinical-300 leading-relaxed">{disease.description}</p>
      </Card>

      <Card className="p-6 sm:p-8 mb-6">
        <h2 className="font-semibold text-clinical-950 dark:text-white mb-3 flex items-center gap-2">
          <ListChecks className="w-5 h-5 text-clinical-500" /> Common symptoms
        </h2>
        <div className="flex flex-wrap gap-2">
          {disease.symptoms.map((s) => (
            <span key={s} className="px-3 py-1.5 rounded-full bg-clinical-50 dark:bg-clinical-800 text-clinical-700 dark:text-clinical-100 text-sm font-medium">
              {s.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      </Card>

      <Card className="p-6 sm:p-8 mb-6">
        <h2 className="font-semibold text-clinical-950 dark:text-white mb-2">Possible causes</h2>
        <p className="text-sm text-warmgray-700 dark:text-clinical-300 leading-relaxed">{disease.causes}</p>
      </Card>

      <div className="grid sm:grid-cols-2 gap-5 mb-6">
        <InfoCard icon={ShieldCheck} title="Prevention & precautions" items={disease.precautions} color="text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20" />
        <InfoCard icon={Pill} title="Treatment overview" items={disease.treatments?.length ? disease.treatments : disease.medications} color="text-blue-600 bg-blue-50 dark:bg-blue-900/20" />
        <InfoCard icon={Salad} title="Diet recommendations" items={disease.diet} color="text-lime-600 bg-lime-50 dark:bg-lime-900/20" />
        <InfoCard icon={Dumbbell} title="Exercise suggestions" items={disease.exercise} color="text-orange-600 bg-orange-50 dark:bg-orange-900/20" />
      </div>

      <Card className="p-6 sm:p-8 bg-clinical-600 border-none text-white">
        <div className="flex items-center gap-4">
          <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/15 shrink-0">
            <UserRound className="w-6 h-6" />
          </span>
          <div>
            <h2 className="font-semibold">Recommended specialist</h2>
            <p className="text-clinical-100 text-sm mt-0.5">{disease.specialist}</p>
          </div>
        </div>
      </Card>

      <p className="text-xs text-warmgray-400 dark:text-clinical-500 text-center mt-8">
        This information is for educational purposes only and is not a substitute for professional medical advice.
      </p>
    </div>
  );
}

function InfoCard({ icon: Icon, title, items = [], color }) {
  return (
    <Card className="p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <span className={`flex items-center justify-center w-9 h-9 rounded-xl ${color}`}>
          <Icon className="w-4.5 h-4.5" />
        </span>
        <h3 className="font-semibold text-clinical-950 dark:text-white text-sm">{title}</h3>
      </div>
      <ul className="space-y-1.5">
        {items?.map((item, i) => (
          <li key={i} className="text-sm text-warmgray-700 dark:text-clinical-300 leading-relaxed flex gap-2">
            <span className="text-clinical-400 mt-1">•</span> {item}
          </li>
        ))}
      </ul>
    </Card>
  );
}
