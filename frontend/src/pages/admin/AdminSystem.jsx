import { useEffect, useState } from "react";
import { Server, Database, Brain, CheckCircle2, XCircle, RefreshCw } from "lucide-react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import LoadingScreen from "../../components/ui/LoadingScreen";
import { adminApi } from "../../api/endpoints";

export default function AdminSystem() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = () => {
    setLoading(true);
    adminApi
      .systemStatus()
      .then((res) => setStatus(res.data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  if (loading) return <LoadingScreen label="Checking system status..." />;
  if (!status) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-clinical-950 dark:text-white">System monitoring</h1>
        <Button variant="outline" size="sm" icon={RefreshCw} onClick={fetchStatus}>Refresh</Button>
      </div>

      <Card className="p-6 mb-6 flex items-center gap-4">
        <span className="flex items-center justify-center w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
          <CheckCircle2 className="w-6 h-6" />
        </span>
        <div>
          <p className="font-semibold text-clinical-950 dark:text-white">System {status.status}</p>
          <p className="text-sm text-warmgray-500 dark:text-clinical-400">
            Server time: {new Date(status.server_time).toLocaleString()}
          </p>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 gap-5">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Server className="w-5 h-5 text-clinical-500" />
            <h2 className="font-semibold text-clinical-950 dark:text-white">Environment</h2>
          </div>
          <dl className="space-y-2 text-sm">
            <Row label="Python version" value={status.python_version} />
            <Row label="Platform" value={status.platform} />
          </dl>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-clinical-500" />
            <h2 className="font-semibold text-clinical-950 dark:text-white">Database</h2>
          </div>
          <dl className="space-y-2 text-sm">
            <Row label="Users" value={status.database.users} />
            <Row label="Predictions" value={status.database.predictions} />
            <Row label="Diseases" value={status.database.diseases} />
          </dl>
        </Card>

        <Card className="p-6 sm:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-clinical-500" />
            <h2 className="font-semibold text-clinical-950 dark:text-white">ML model</h2>
          </div>
          <div className="flex items-center gap-2 mb-3">
            {status.ml_model.loaded ? (
              <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
                <CheckCircle2 className="w-4 h-4" /> Model loaded successfully
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-sm font-medium text-red-600">
                <XCircle className="w-4 h-4" /> Model not loaded
              </span>
            )}
          </div>
          <dl className="grid sm:grid-cols-2 gap-2 text-sm">
            <Row label="Accuracy" value={`${status.ml_model.accuracy}%`} />
            <Row label="Model type" value={status.ml_model.meta?.model_type} />
            <Row label="Training samples" value={status.ml_model.meta?.n_samples} />
            <Row label="Features (symptoms)" value={status.ml_model.meta?.n_features} />
            <Row label="Diseases covered" value={status.ml_model.meta?.n_diseases} />
            <Row label="Estimators (trees)" value={status.ml_model.meta?.n_estimators} />
          </dl>
        </Card>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between gap-3 py-1 border-b border-clinical-50 dark:border-clinical-800 last:border-0">
      <dt className="text-warmgray-500 dark:text-clinical-400">{label}</dt>
      <dd className="font-medium text-clinical-950 dark:text-white text-right truncate">{value}</dd>
    </div>
  );
}
