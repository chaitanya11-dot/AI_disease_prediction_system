import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { Search, Trash2, Calendar, History as HistoryIcon, Eye, X } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SeverityBadge from "../components/ui/Badges";
import LoadingScreen from "../components/ui/LoadingScreen";
import { historyApi } from "../api/endpoints";

export default function PredictionHistory() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmClearAll, setConfirmClearAll] = useState(false);

  const fetchHistory = useCallback(() => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (dateFrom) params.date_from = dateFrom;
    if (dateTo) params.date_to = dateTo;
    historyApi
      .list(params)
      .then((res) => setHistory(res.data.history))
      .catch(() => toast.error("Could not load history."))
      .finally(() => setLoading(false));
  }, [search, dateFrom, dateTo]);

  useEffect(() => {
    const timeout = setTimeout(fetchHistory, 300);
    return () => clearTimeout(timeout);
  }, [fetchHistory]);

  const handleDelete = async (id) => {
    try {
      await historyApi.delete(id);
      setHistory((prev) => prev.filter((h) => h.id !== id));
      toast.success("Record deleted.");
    } catch {
      toast.error("Could not delete record.");
    } finally {
      setConfirmDeleteId(null);
    }
  };

  const handleClearAll = async () => {
    try {
      await historyApi.clearAll();
      setHistory([]);
      toast.success("All history cleared.");
    } catch {
      toast.error("Could not clear history.");
    } finally {
      setConfirmClearAll(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-7">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-clinical-950 dark:text-white flex items-center gap-2.5">
            <HistoryIcon className="w-7 h-7 text-clinical-500" /> Prediction History
          </h1>
          <p className="mt-1 text-warmgray-600 dark:text-clinical-300">All your past symptom checks, saved automatically.</p>
        </div>
        {history.length > 0 && (
          <Button variant="danger" size="sm" icon={Trash2} onClick={() => setConfirmClearAll(true)}>
            Clear all
          </Button>
        )}
      </div>

      <Card className="p-4 sm:p-5 mb-6">
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-warmgray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by disease or symptom..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-clinical-200 dark:border-clinical-700 bg-white dark:bg-clinical-900 text-warmgray-900 dark:text-clinical-50 focus:outline-none focus:ring-2 focus:ring-clinical-300"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmgray-400" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-clinical-200 dark:border-clinical-700 bg-white dark:bg-clinical-900 text-warmgray-900 dark:text-clinical-50 focus:outline-none focus:ring-2 focus:ring-clinical-300"
              aria-label="From date"
            />
          </div>
          <div className="relative">
            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmgray-400" />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-clinical-200 dark:border-clinical-700 bg-white dark:bg-clinical-900 text-warmgray-900 dark:text-clinical-50 focus:outline-none focus:ring-2 focus:ring-clinical-300"
              aria-label="To date"
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <LoadingScreen label="Loading history..." />
      ) : history.length === 0 ? (
        <Card className="p-10 text-center">
          <HistoryIcon className="w-10 h-10 text-clinical-200 dark:text-clinical-700 mx-auto mb-3" />
          <p className="text-warmgray-600 dark:text-clinical-300">No prediction records found.</p>
          <Link to="/symptom-checker">
            <Button className="mt-4" size="sm">Run a symptom check</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((h) => (
            <Card key={h.id} className="p-4 sm:p-5" hover>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-clinical-950 dark:text-white">{h.predicted_disease}</h3>
                    <SeverityBadge severity={h.severity} />
                  </div>
                  <p className="text-sm text-warmgray-600 dark:text-clinical-300 mt-1.5 truncate">
                    {h.symptoms.map((s) => s.replace(/_/g, " ")).join(", ")}
                  </p>
                  <p className="text-xs text-warmgray-400 mt-2">
                    {format(new Date(h.prediction_date), "MMM d, yyyy 'at' h:mm a")} · {h.confidence_score}% confidence
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/prediction-result/${h.id}`}>
                    <Button variant="outline" size="sm" icon={Eye}>View</Button>
                  </Link>
                  <button
                    onClick={() => setConfirmDeleteId(h.id)}
                    aria-label="Delete record"
                    className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {confirmDeleteId && (
        <ConfirmDialog
          title="Delete this record?"
          message="This prediction will be permanently removed from your history."
          onCancel={() => setConfirmDeleteId(null)}
          onConfirm={() => handleDelete(confirmDeleteId)}
        />
      )}
      {confirmClearAll && (
        <ConfirmDialog
          title="Clear all history?"
          message="This will permanently delete all of your saved predictions. This cannot be undone."
          onCancel={() => setConfirmClearAll(false)}
          onConfirm={handleClearAll}
        />
      )}
    </div>
  );
}

function ConfirmDialog({ title, message, onCancel, onConfirm }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true">
      <Card className="w-full max-w-sm p-6 animate-scaleIn">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-clinical-950 dark:text-white">{title}</h3>
          <button onClick={onCancel} aria-label="Close" className="text-warmgray-400 hover:text-warmgray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        <p className="text-sm text-warmgray-600 dark:text-clinical-300 mb-6">{message}</p>
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>Cancel</Button>
          <Button variant="danger" className="flex-1" onClick={onConfirm}>Delete</Button>
        </div>
      </Card>
    </div>
  );
}
