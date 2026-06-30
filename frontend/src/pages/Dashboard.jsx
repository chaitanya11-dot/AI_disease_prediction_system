import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity, Stethoscope, TrendingUp, Calendar, ArrowRight,
  AlertCircle, Clock, User
} from "lucide-react";
import { format } from "date-fns";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SeverityBadge from "../components/ui/Badges";
import LoadingScreen from "../components/ui/LoadingScreen";
import { predictionApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    predictionApi
      .dashboardStats()
      .then((res) => setStats(res.data))
      .catch(() => setError("Couldn't load your dashboard right now."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen label="Loading your dashboard..." />;

  const statCards = [
    {
      label: "Total predictions",
      value: stats?.total_predictions ?? 0,
      icon: Activity,
      color: "text-clinical-600 bg-clinical-50 dark:bg-clinical-800",
    },
    {
      label: "Average confidence",
      value: `${stats?.average_confidence ?? 0}%`,
      icon: TrendingUp,
      color: "text-vital-600 bg-vital-500/10",
    },
    {
      label: "Most common result",
      value: stats?.most_common_prediction || "—",
      icon: Stethoscope,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20",
      small: true,
    },
    {
      label: "Member since",
      value: stats?.member_since ? format(new Date(stats.member_since), "MMM yyyy") : "—",
      icon: Calendar,
      color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-clinical-950 dark:text-white">
            Welcome back, {user?.name?.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-warmgray-600 dark:text-clinical-300">
            Here's an overview of your health prediction activity.
          </p>
        </div>
        <Link to="/symptom-checker">
          <Button icon={Stethoscope} size="lg">
            New symptom check
          </Button>
        </Link>
      </div>

      {error && (
        <Card className="p-4 mb-6 flex items-center gap-2 text-red-700 bg-red-50 border-red-200">
          <AlertCircle className="w-4 h-4" /> {error}
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {statCards.map((s) => (
          <Card key={s.label} className="p-5" hover>
            <div className="flex items-center justify-between mb-3">
              <span className={`flex items-center justify-center w-10 h-10 rounded-xl ${s.color}`}>
                <s.icon className="w-5 h-5" />
              </span>
            </div>
            <p className={`font-semibold text-clinical-950 dark:text-white ${s.small ? "text-base" : "text-2xl"} truncate`}>
              {s.value}
            </p>
            <p className="text-sm text-warmgray-500 dark:text-clinical-400 mt-0.5">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-clinical-950 dark:text-white">Recent predictions</h2>
            <Link to="/history" className="text-sm font-medium text-clinical-600 hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {stats?.recent_predictions?.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_predictions.map((p) => (
                <Card key={p.id} className="p-4 sm:p-5" hover>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-clinical-950 dark:text-white">{p.predicted_disease}</h3>
                        <SeverityBadge severity={p.severity} />
                      </div>
                      <p className="text-sm text-warmgray-600 dark:text-clinical-300 mt-1.5">
                        Symptoms: {p.symptoms.slice(0, 4).map((s) => s.replace(/_/g, " ")).join(", ")}
                        {p.symptoms.length > 4 ? ` +${p.symptoms.length - 4} more` : ""}
                      </p>
                      <p className="flex items-center gap-1 text-xs text-warmgray-400 mt-2">
                        <Clock className="w-3 h-3" /> {format(new Date(p.prediction_date), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xl font-semibold text-clinical-600 dark:text-clinical-300">
                        {p.confidence_score}%
                      </p>
                      <p className="text-xs text-warmgray-400">confidence</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-10 text-center">
              <Stethoscope className="w-10 h-10 text-clinical-200 dark:text-clinical-700 mx-auto mb-3" />
              <p className="text-warmgray-600 dark:text-clinical-300">You haven't run a symptom check yet.</p>
              <Link to="/symptom-checker">
                <Button className="mt-4" size="sm">Run your first check</Button>
              </Link>
            </Card>
          )}
        </div>

        <div>
          <h2 className="text-lg font-semibold text-clinical-950 dark:text-white mb-4">Severity breakdown</h2>
          <Card className="p-5">
            {["High", "Medium", "Low"].map((level) => {
              const count = stats?.severity_breakdown?.[level] ?? 0;
              const total = stats?.total_predictions || 1;
              const pct = Math.round((count / total) * 100);
              const colorMap = { Low: "bg-emerald-500", Medium: "bg-amber-500", High: "bg-red-500" };
              return (
                <div key={level} className="mb-4 last:mb-0">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium text-warmgray-700 dark:text-clinical-300">{level}</span>
                    <span className="text-warmgray-500 dark:text-clinical-400">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-warmgray-100 dark:bg-clinical-800 overflow-hidden">
                    <div className={`h-full rounded-full ${colorMap[level]}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </Card>

          <Card className="p-5 mt-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-clinical-50 dark:bg-clinical-800 text-clinical-600 dark:text-clinical-300">
                <User className="w-5 h-5" />
              </span>
              <div>
                <p className="font-semibold text-clinical-950 dark:text-white">{user?.name}</p>
                <p className="text-xs text-warmgray-500 dark:text-clinical-400">
                  {user?.age ? `${user.age} years` : "Age not set"} · {user?.gender || "Gender not set"}
                </p>
              </div>
            </div>
            <Link to="/profile">
              <Button variant="outline" className="w-full" size="sm">
                Edit profile
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
