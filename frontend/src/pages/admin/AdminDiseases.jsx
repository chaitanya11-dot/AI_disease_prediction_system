import { useEffect, useState } from "react";
import { Plus, Pencil, Trash2, X, Save } from "lucide-react";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import FormInput from "../../components/ui/FormInput";
import SeverityBadge from "../../components/ui/Badges";
import LoadingScreen from "../../components/ui/LoadingScreen";
import { adminApi } from "../../api/endpoints";

const emptyForm = {
  disease_name: "",
  description: "",
  causes: "",
  severity: "Medium",
  specialist: "",
  symptoms: "",
  precautions: "",
  medications: "",
  diet: "",
  exercise: "",
};

function toLines(arr) {
  return (arr || []).join("\n");
}
function fromLines(text) {
  return text.split("\n").map((l) => l.trim()).filter(Boolean);
}

export default function AdminDiseases() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // disease object or "new"
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchDiseases = () => {
    setLoading(true);
    adminApi
      .listDiseases()
      .then((res) => setDiseases(res.data.diseases))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDiseases();
  }, []);

  const openEdit = (disease) => {
    setEditing(disease);
    setForm({
      disease_name: disease.disease_name,
      description: disease.description || "",
      causes: disease.causes || "",
      severity: disease.severity,
      specialist: disease.specialist || "",
      symptoms: toLines(disease.symptoms),
      precautions: toLines(disease.precautions),
      medications: toLines(disease.medications),
      diet: toLines(disease.diet),
      exercise: toLines(disease.exercise),
    });
  };

  const openNew = () => {
    setEditing("new");
    setForm(emptyForm);
  };

  const closeModal = () => {
    setEditing(null);
    setForm(emptyForm);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.disease_name.trim()) {
      toast.error("Disease name is required.");
      return;
    }
    setSaving(true);
    const payload = {
      disease_name: form.disease_name,
      description: form.description,
      causes: form.causes,
      severity: form.severity,
      specialist: form.specialist,
      symptoms: fromLines(form.symptoms).map((s) => s.toLowerCase().replace(/\s+/g, "_")),
      precautions: fromLines(form.precautions),
      medications: fromLines(form.medications),
      diet: fromLines(form.diet),
      exercise: fromLines(form.exercise),
    };
    try {
      if (editing === "new") {
        const res = await adminApi.createDisease(payload);
        setDiseases((prev) => [...prev, res.data.disease].sort((a, b) => a.disease_name.localeCompare(b.disease_name)));
        toast.success("Disease added. Retrain the ML model to include it in live predictions.");
      } else {
        const res = await adminApi.updateDisease(editing.id, payload);
        setDiseases((prev) => prev.map((d) => (d.id === editing.id ? res.data.disease : d)));
        toast.success("Disease updated.");
      }
      closeModal();
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not save disease.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteDisease(id);
      setDiseases((prev) => prev.filter((d) => d.id !== id));
      toast.success("Disease deleted.");
    } catch {
      toast.error("Could not delete disease.");
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-clinical-950 dark:text-white">Disease database</h1>
        <Button icon={Plus} onClick={openNew}>Add disease</Button>
      </div>

      {loading ? (
        <LoadingScreen label="Loading diseases..." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {diseases.map((d) => (
            <Card key={d.id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-clinical-950 dark:text-white">{d.disease_name}</h3>
                <SeverityBadge severity={d.severity} />
              </div>
              <p className="text-sm text-warmgray-600 dark:text-clinical-300 mt-1.5 line-clamp-2">{d.description}</p>
              <p className="text-xs text-warmgray-400 mt-2">{d.symptoms.length} symptoms · Specialist: {d.specialist}</p>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" icon={Pencil} onClick={() => openEdit(d)}>Edit</Button>
                <button
                  onClick={() => setConfirmDelete(d)}
                  className="px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-8 overflow-y-auto">
          <Card className="w-full max-w-2xl p-6 sm:p-7 my-auto">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-semibold text-clinical-950 dark:text-white text-lg">
                {editing === "new" ? "Add new disease" : `Edit ${editing.disease_name}`}
              </h2>
              <button onClick={closeModal} className="text-warmgray-400 hover:text-warmgray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
              <FormInput
                label="Disease name"
                value={form.disease_name}
                onChange={(e) => setForm({ ...form, disease_name: e.target.value })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-warmgray-800 dark:text-clinical-200 mb-1.5">Description</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-clinical-200 dark:border-clinical-700 bg-white dark:bg-clinical-900 text-sm focus:outline-none focus:ring-2 focus:ring-clinical-300 resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-warmgray-800 dark:text-clinical-200 mb-1.5">Causes</label>
                <textarea
                  rows={2}
                  value={form.causes}
                  onChange={(e) => setForm({ ...form, causes: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-clinical-200 dark:border-clinical-700 bg-white dark:bg-clinical-900 text-sm focus:outline-none focus:ring-2 focus:ring-clinical-300 resize-none"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-warmgray-800 dark:text-clinical-200 mb-1.5">Severity</label>
                  <select
                    value={form.severity}
                    onChange={(e) => setForm({ ...form, severity: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-clinical-200 dark:border-clinical-700 bg-white dark:bg-clinical-900 text-sm focus:outline-none focus:ring-2 focus:ring-clinical-300"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <FormInput
                  label="Recommended specialist"
                  value={form.specialist}
                  onChange={(e) => setForm({ ...form, specialist: e.target.value })}
                  placeholder="e.g. General Physician"
                />
              </div>

              <TextAreaListField label="Symptoms (one per line)" value={form.symptoms} onChange={(v) => setForm({ ...form, symptoms: v })} />
              <TextAreaListField label="Precautions (one per line)" value={form.precautions} onChange={(v) => setForm({ ...form, precautions: v })} />
              <TextAreaListField label="Medications (one per line, informational only)" value={form.medications} onChange={(v) => setForm({ ...form, medications: v })} />
              <TextAreaListField label="Diet recommendations (one per line)" value={form.diet} onChange={(v) => setForm({ ...form, diet: v })} />
              <TextAreaListField label="Exercise suggestions (one per line)" value={form.exercise} onChange={(v) => setForm({ ...form, exercise: v })} />

              {editing === "new" && (
                <p className="text-xs text-amber-700 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-300 p-3 rounded-xl">
                  Note: newly added diseases appear in the library immediately, but won't be
                  included in live ML predictions until the model is retrained
                  (<code>python ml/train_model.py</code>) with the updated dataset.
                </p>
              )}

              <div className="flex gap-3 pt-2 sticky bottom-0 bg-white dark:bg-clinical-900 pb-1">
                <Button type="button" variant="outline" className="flex-1" onClick={closeModal}>Cancel</Button>
                <Button type="submit" className="flex-1" icon={Save} loading={saving}>Save disease</Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <Card className="w-full max-w-sm p-6">
            <h3 className="font-semibold text-clinical-950 dark:text-white mb-2">Delete {confirmDelete.disease_name}?</h3>
            <p className="text-sm text-warmgray-600 dark:text-clinical-300 mb-6">This action cannot be undone.</p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="danger" className="flex-1" onClick={() => handleDelete(confirmDelete.id)}>Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

function TextAreaListField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-warmgray-800 dark:text-clinical-200 mb-1.5">{label}</label>
      <textarea
        rows={3}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3.5 py-2.5 rounded-xl border border-clinical-200 dark:border-clinical-700 bg-white dark:bg-clinical-900 text-sm focus:outline-none focus:ring-2 focus:ring-clinical-300 resize-none font-mono"
      />
    </div>
  );
}
