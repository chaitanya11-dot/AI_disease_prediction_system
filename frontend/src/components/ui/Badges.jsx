const severityStyles = {
  Low: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-700/40",
  Medium: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-700/40",
  High: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-700/40",
};

export default function SeverityBadge({ severity = "Medium", className = "" }) {
  const style = severityStyles[severity] || severityStyles.Medium;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${style} ${className}`}>
      {severity} severity
    </span>
  );
}

export function Badge({ children, color = "clinical", className = "" }) {
  const colorMap = {
    clinical: "bg-clinical-50 text-clinical-700 border-clinical-200 dark:bg-clinical-800/50 dark:text-clinical-100 dark:border-clinical-700",
    vital: "bg-vital-500/10 text-vital-600 border-vital-500/30",
    gray: "bg-warmgray-100 text-warmgray-800 border-warmgray-200 dark:bg-clinical-800 dark:text-clinical-200 dark:border-clinical-700",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${colorMap[color]} ${className}`}>
      {children}
    </span>
  );
}
