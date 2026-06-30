import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Stethoscope, Cake, Users, FileText, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import DisclaimerBanner from "../components/ui/DisclaimerBanner";
import SymptomSelector from "../components/symptom/SymptomSelector";
import { predictionApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

export default function SymptomChecker() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [symptoms, setSymptoms] = useState([]);
  const [age, setAge] = useState(user?.age || "");
  const [gender, setGender] = useState(user?.gender || "");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (symptoms.length === 0) {
      toast.error("Please select at least one symptom.");
      return;
    }
    setLoading(true);
    try {
      const res = await predictionApi.predict({
        symptoms,
        age: age || undefined,
        gender: gender || undefined,
        additional_info: additionalInfo,
      });
      navigate(`/prediction-result/${res.data.prediction_id}`, { state: { result: res.data } });
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not generate a prediction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-8">
        <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-clinical-600 text-white mb-4">
          <Stethoscope className="w-6 h-6" />
        </span>
        <h1 className="text-2xl sm:text-3xl font-semibold text-clinical-950 dark:text-white">Symptom Checker</h1>
        <p className="mt-2 text-warmgray-600 dark:text-clinical-300">
          Select all the symptoms you're experiencing for the most accurate prediction.
        </p>
      </div>

      <Card className="p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="space-y-7">
          <div>
            <label className="block text-sm font-semibold text-clinical-950 dark:text-white mb-2.5">
              Symptoms <span className="text-red-500">*</span>
            </label>
            <SymptomSelector selected={symptoms} onChange={setSymptoms} />
          </div>

          <div className="grid sm:grid-cols-2 gap-5">
            <div>
              <label htmlFor="age" className="flex items-center gap-1.5 text-sm font-semibold text-clinical-950 dark:text-white mb-2">
                <Cake className="w-4 h-4" /> Age
              </label>
              <input
                id="age"
                type="number"
                min="0"
                max="130"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="e.g. 30"
                className="w-full px-3.5 py-2.5 rounded-xl border border-clinical-200 dark:border-clinical-700 bg-white dark:bg-clinical-900 text-warmgray-900 dark:text-clinical-50 focus:outline-none focus:ring-2 focus:ring-clinical-300"
              />
            </div>
            <div>
              <label htmlFor="gender" className="flex items-center gap-1.5 text-sm font-semibold text-clinical-950 dark:text-white mb-2">
                <Users className="w-4 h-4" /> Gender
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-clinical-200 dark:border-clinical-700 bg-white dark:bg-clinical-900 text-warmgray-900 dark:text-clinical-50 focus:outline-none focus:ring-2 focus:ring-clinical-300"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="additionalInfo" className="flex items-center gap-1.5 text-sm font-semibold text-clinical-950 dark:text-white mb-2">
              <FileText className="w-4 h-4" /> Additional health information (optional)
            </label>
            <textarea
              id="additionalInfo"
              rows={3}
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="e.g. duration of symptoms, existing conditions, medications you're taking..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-clinical-200 dark:border-clinical-700 bg-white dark:bg-clinical-900 text-warmgray-900 dark:text-clinical-50 placeholder:text-warmgray-400 focus:outline-none focus:ring-2 focus:ring-clinical-300 resize-none"
            />
          </div>

          <DisclaimerBanner />

          <Button type="submit" loading={loading} size="lg" className="w-full" icon={!loading ? ArrowRight : undefined}>
            {loading ? "Analyzing symptoms..." : "Get prediction"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
