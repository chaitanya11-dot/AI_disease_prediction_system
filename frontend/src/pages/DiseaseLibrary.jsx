import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search, BookOpen, ArrowRight } from "lucide-react";
import Card from "../components/ui/Card";
import SeverityBadge from "../components/ui/Badges";
import LoadingScreen from "../components/ui/LoadingScreen";
import { diseaseApi } from "../api/endpoints";

export default function DiseaseLibrary() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("");

  useEffect(() => {
    diseaseApi
      .list()
      .then((res) => setDiseases(res.data.diseases))
      .finally(() => setLoading(false));
  }, []);

  const filtered = diseases.filter((d) => {
    const matchesSearch = d.disease_name.toLowerCase().includes(search.toLowerCase());
    const matchesSeverity = !severityFilter || d.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-clinical-600 text-white mb-4">
          <BookOpen className="w-6 h-6" />
        </span>
        <h1 className="text-2xl sm:text-3xl font-semibold text-clinical-950 dark:text-white">Disease Library</h1>
        <p className="mt-2 text-warmgray-600 dark:text-clinical-300">
          Browse symptoms, causes, prevention, and treatment overviews for conditions in our dataset.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-7">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-warmgray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search diseases..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-clinical-200 dark:border-clinical-700 bg-white dark:bg-clinical-900 text-warmgray-900 dark:text-clinical-50 focus:outline-none focus:ring-2 focus:ring-clinical-300"
          />
        </div>
        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-clinical-200 dark:border-clinical-700 bg-white dark:bg-clinical-900 text-warmgray-900 dark:text-clinical-50 focus:outline-none focus:ring-2 focus:ring-clinical-300"
        >
          <option value="">All severities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
      </div>

      {loading ? (
        <LoadingScreen label="Loading disease library..." />
      ) : filtered.length === 0 ? (
        <Card className="p-10 text-center text-warmgray-500">No diseases match your search.</Card>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((d) => (
            <Link key={d.id} to={`/diseases/${d.id}`}>
              <Card className="p-5 h-full flex flex-col" hover>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-clinical-950 dark:text-white">{d.disease_name}</h3>
                  <SeverityBadge severity={d.severity} />
                </div>
                <p className="text-sm text-warmgray-600 dark:text-clinical-300 leading-relaxed line-clamp-3 flex-1">
                  {d.description}
                </p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-clinical-600">
                  View details <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
