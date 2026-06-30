import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Card from "../../components/ui/Card";
import SeverityBadge from "../../components/ui/Badges";
import LoadingScreen from "../../components/ui/LoadingScreen";
import { adminApi } from "../../api/endpoints";

export default function AdminPredictions() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    adminApi
      .listPredictions({ page, per_page: 15 })
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-clinical-950 dark:text-white mb-1">All predictions</h1>
      <p className="text-warmgray-600 dark:text-clinical-300 mb-6">
        {data ? `${data.total} total predictions across all users.` : "Loading..."}
      </p>

      {loading ? (
        <LoadingScreen label="Loading predictions..." />
      ) : (
        <>
          <Card className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-clinical-50 dark:bg-clinical-800 text-warmgray-600 dark:text-clinical-300">
                <tr>
                  <th className="text-left px-5 py-3 font-semibold">User</th>
                  <th className="text-left px-5 py-3 font-semibold">Predicted disease</th>
                  <th className="text-left px-5 py-3 font-semibold">Confidence</th>
                  <th className="text-left px-5 py-3 font-semibold">Severity</th>
                  <th className="text-left px-5 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clinical-100 dark:divide-clinical-800">
                {data?.predictions.map((p) => (
                  <tr key={p.id} className="hover:bg-clinical-50/50 dark:hover:bg-clinical-800/40">
                    <td className="px-5 py-3.5">
                      <p className="font-medium text-clinical-950 dark:text-white">{p.user_name}</p>
                      <p className="text-xs text-warmgray-400">{p.user_email}</p>
                    </td>
                    <td className="px-5 py-3.5 text-warmgray-700 dark:text-clinical-200">{p.predicted_disease}</td>
                    <td className="px-5 py-3.5 text-warmgray-700 dark:text-clinical-200">{p.confidence_score}%</td>
                    <td className="px-5 py-3.5"><SeverityBadge severity={p.severity} /></td>
                    <td className="px-5 py-3.5 text-warmgray-500 dark:text-clinical-400">
                      {format(new Date(p.prediction_date), "MMM d, yyyy h:mm a")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data?.predictions.length === 0 && <p className="text-center py-10 text-warmgray-500">No predictions yet.</p>}
          </Card>

          {data && data.total_pages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-lg border border-clinical-200 dark:border-clinical-700 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-warmgray-600 dark:text-clinical-300">
                Page {data.page} of {data.total_pages}
              </span>
              <button
                disabled={page >= data.total_pages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-lg border border-clinical-200 dark:border-clinical-700 disabled:opacity-40"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
