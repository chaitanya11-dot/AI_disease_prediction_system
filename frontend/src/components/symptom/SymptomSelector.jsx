import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { predictionApi } from "../../api/endpoints";

export default function SymptomSelector({ selected, onChange }) {
  const [query, setQuery] = useState("");
  const [allSymptoms, setAllSymptoms] = useState([]);
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    predictionApi
      .getSymptoms()
      .then((res) => setAllSymptoms(res.data.symptoms))
      .catch(() => setAllSymptoms([]));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = allSymptoms.filter(
    (s) => s.label.toLowerCase().includes(query.toLowerCase()) && !selected.includes(s.key)
  );

  const addSymptom = (key) => {
    onChange([...selected, key]);
    setQuery("");
  };

  const removeSymptom = (key) => {
    onChange(selected.filter((s) => s !== key));
  };

  const labelFor = (key) => allSymptoms.find((s) => s.key === key)?.label || key.replace(/_/g, " ");

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-warmgray-400" />
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          placeholder="Search symptoms (e.g. fever, headache, fatigue)..."
          className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-clinical-200 dark:border-clinical-700 bg-white dark:bg-clinical-900 text-warmgray-900 dark:text-clinical-50 placeholder:text-warmgray-400 focus:outline-none focus:ring-2 focus:ring-clinical-300"
        />
      </div>

      {open && query && (
        <div className="absolute z-20 mt-2 w-full max-h-64 overflow-y-auto bg-white dark:bg-clinical-900 border border-clinical-100 dark:border-clinical-800 rounded-xl shadow-card-hover">
          {filtered.length > 0 ? (
            filtered.slice(0, 40).map((s) => (
              <button
                key={s.key}
                onClick={() => addSymptom(s.key)}
                className="w-full text-left px-4 py-2.5 text-sm hover:bg-clinical-50 dark:hover:bg-clinical-800 text-warmgray-800 dark:text-clinical-100 transition-colors"
              >
                {s.label}
              </button>
            ))
          ) : (
            <p className="px-4 py-3 text-sm text-warmgray-400">No matching symptoms found.</p>
          )}
        </div>
      )}

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {selected.map((key) => (
            <span
              key={key}
              className="inline-flex items-center gap-1.5 pl-3 pr-2 py-1.5 rounded-full bg-clinical-50 dark:bg-clinical-800 text-clinical-700 dark:text-clinical-100 text-sm font-medium border border-clinical-200 dark:border-clinical-700"
            >
              {labelFor(key)}
              <button
                onClick={() => removeSymptom(key)}
                aria-label={`Remove ${labelFor(key)}`}
                className="hover:bg-clinical-200 dark:hover:bg-clinical-700 rounded-full p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {selected.length === 0 && (
        <p className="mt-3 text-xs text-warmgray-400">
          Start typing to search from {allSymptoms.length || "90+"} symptoms, or try common ones like
          "fever", "cough", or "headache".
        </p>
      )}
    </div>
  );
}
