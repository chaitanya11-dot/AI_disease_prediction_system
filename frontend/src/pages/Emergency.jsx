import { Phone, AlertTriangle, Heart, Brain, Baby, Flame } from "lucide-react";
import Card from "../components/ui/Card";

const EMERGENCY_NUMBERS = [
  { region: "United States / Canada", number: "911", note: "All emergencies" },
  { region: "European Union", number: "112", note: "All emergencies" },
  { region: "United Kingdom", number: "999", note: "All emergencies" },
  { region: "India", number: "112", note: "All emergencies" },
  { region: "Australia", number: "000", note: "All emergencies" },
];

const SPECIAL_LINES = [
  { icon: Brain, label: "Suicide & Crisis Lifeline (US)", number: "988", desc: "24/7 free and confidential support" },
  { icon: Heart, label: "Poison Control (US)", number: "1-800-222-1222", desc: "24/7 poisoning emergencies" },
  { icon: Baby, label: "Childhelp National Hotline (US)", number: "1-800-422-4453", desc: "Child abuse support" },
  { icon: Flame, label: "Fire / Rescue", number: "Use local emergency number", desc: "Fire and rescue services" },
];

export default function Emergency() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Card className="p-6 sm:p-7 mb-8 bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h1 className="font-semibold text-red-800 dark:text-red-200 text-lg">In a medical emergency?</h1>
            <p className="text-sm text-red-700 dark:text-red-300 mt-1 leading-relaxed">
              Do not use this app for emergencies. If you or someone near you is experiencing a
              life-threatening condition, call your local emergency number immediately or go to
              the nearest emergency room.
            </p>
          </div>
        </div>
      </Card>

      <h2 className="text-xl font-semibold text-clinical-950 dark:text-white mb-4">Emergency numbers by region</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {EMERGENCY_NUMBERS.map((e) => (
          <Card key={e.region} className="p-5 flex items-center justify-between">
            <div>
              <p className="font-medium text-clinical-950 dark:text-white">{e.region}</p>
              <p className="text-xs text-warmgray-500 dark:text-clinical-400">{e.note}</p>
            </div>
            <span className="text-xl font-semibold text-clinical-600 flex items-center gap-1.5">
              <Phone className="w-4 h-4" /> {e.number}
            </span>
          </Card>
        ))}
      </div>

      <h2 className="text-xl font-semibold text-clinical-950 dark:text-white mb-4">Specialized helplines</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {SPECIAL_LINES.map((s) => (
          <Card key={s.label} className="p-5" hover>
            <div className="flex items-center gap-3 mb-2">
              <span className="flex items-center justify-center w-10 h-10 rounded-xl bg-clinical-50 dark:bg-clinical-800 text-clinical-600">
                <s.icon className="w-5 h-5" />
              </span>
              <div>
                <p className="font-medium text-clinical-950 dark:text-white text-sm">{s.label}</p>
                <p className="text-xs text-warmgray-500 dark:text-clinical-400">{s.desc}</p>
              </div>
            </div>
            <p className="text-lg font-semibold text-clinical-600 mt-2">{s.number}</p>
          </Card>
        ))}
      </div>

      <p className="text-xs text-warmgray-400 dark:text-clinical-500 text-center mt-10">
        Numbers listed are general references and may vary by location. Always verify the correct
        emergency number for your specific region.
      </p>
    </div>
  );
}
