import { Activity } from "lucide-react";

export default function LoadingScreen({ label = "Loading..." }) {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
      <div className="relative">
        <span className="flex items-center justify-center w-12 h-12 rounded-2xl bg-clinical-600 text-white animate-pulse">
          <Activity className="w-6 h-6" strokeWidth={2.5} />
        </span>
      </div>
      <p className="text-sm text-warmgray-800 dark:text-clinical-200 font-medium">{label}</p>
    </div>
  );
}

export function Spinner({ size = "w-5 h-5", className = "" }) {
  return (
    <svg className={`animate-spin ${size} ${className}`} viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-90"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
