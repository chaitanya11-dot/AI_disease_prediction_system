import { useEffect, useState } from "react";
import { Users, Activity, Database, TrendingUp, Brain } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Card from "../../components/ui/Card";
import LoadingScreen from "../../components/ui/LoadingScreen";
import { adminApi } from "../../api/endpoints";

const SEVERITY_COLORS = { Low: "#1FA971", Medium: "#D98C19", High: "#D9483D" };

export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi
      .analytics()
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen label="Loading analytics..." />;
  if (!data) return null;

  const statCards = [
    { label: "Total users", value: data.total_users, icon: Users, color: "text-clinical-600 bg-clinical-50 dark:bg-clinical-800" },
    { label: "Total predictions", value: data.total_predictions, icon: Activity, color: "text-vital-600 bg-vital-500/10" },
    { label: "Diseases in DB", value: data.total_diseases, icon: Database, color: "text-amber-600 bg-amber-50 dark:bg-amber-900/20" },
    { label: "Model accuracy", value: `${data.model_accuracy}%`, icon: Brain, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/20" },
  ];

  const severityData = Object.entries(data.severity_breakdown).map(([name, value]) => ({ name, value }));
  const topDiseasesData = data.top_diseases.map((d) => ({ name: d.disease, count: d.count }));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-clinical-950 dark:text-white mb-1">Analytics overview</h1>
      <p className="text-warmgray-600 dark:text-clinical-300 mb-7">System-wide statistics and model performance.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {statCards.map((s) => (
          <Card key={s.label} className="p-5">
            <span className={`flex items-center justify-center w-10 h-10 rounded-xl ${s.color} mb-3`}>
              <s.icon className="w-5 h-5" />
            </span>
            <p className="text-2xl font-semibold text-clinical-950 dark:text-white">{s.value}</p>
            <p className="text-sm text-warmgray-500 dark:text-clinical-400">{s.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card className="p-6">
          <h2 className="font-semibold text-clinical-950 dark:text-white mb-4">Top predicted diseases</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={topDiseasesData} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E3F2FD" />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12 }} />
              <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#0B5FA5" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h2 className="font-semibold text-clinical-950 dark:text-white mb-4">Severity distribution</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                {severityData.map((entry) => (
                  <Cell key={entry.name} fill={SEVERITY_COLORS[entry.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      <div className="grid sm:grid-cols-3 gap-5">
        <Card className="p-5">
          <p className="text-sm text-warmgray-500 dark:text-clinical-400 mb-1">New users (7 days)</p>
          <p className="text-2xl font-semibold text-clinical-950 dark:text-white">{data.new_users_this_week}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-warmgray-500 dark:text-clinical-400 mb-1">Predictions (7 days)</p>
          <p className="text-2xl font-semibold text-clinical-950 dark:text-white">{data.predictions_this_week}</p>
        </Card>
        <Card className="p-5">
          <p className="text-sm text-warmgray-500 dark:text-clinical-400 mb-1">Avg. confidence</p>
          <p className="text-2xl font-semibold text-clinical-950 dark:text-white">{data.average_confidence}%</p>
        </Card>
      </div>
    </div>
  );
}
