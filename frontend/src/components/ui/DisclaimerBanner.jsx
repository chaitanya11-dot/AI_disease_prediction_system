import { AlertTriangle } from "lucide-react";

export default function DisclaimerBanner({ compact = false }) {
  return (
    <div
      role="note"
      className={`flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-700/40 dark:bg-amber-950/30 dark:text-amber-200 ${
        compact ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm"
      }`}
    >
      <AlertTriangle className={compact ? "h-3.5 w-3.5 mt-0.5 shrink-0" : "h-4 w-4 mt-0.5 shrink-0"} />
      <p className="leading-snug">
        This prediction is for informational purposes only and is not a substitute for professional medical advice.
      </p>
    </div>
  );
}
