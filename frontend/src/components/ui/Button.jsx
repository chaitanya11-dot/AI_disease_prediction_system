import { Spinner } from "./LoadingScreen";

const variants = {
  primary: "bg-clinical-600 hover:bg-clinical-700 text-white shadow-card disabled:bg-clinical-300",
  secondary: "bg-clinical-50 hover:bg-clinical-100 text-clinical-700 dark:bg-clinical-800 dark:hover:bg-clinical-700 dark:text-clinical-100",
  vital: "bg-vital-500 hover:bg-vital-600 text-white shadow-card",
  outline: "border border-clinical-200 dark:border-clinical-700 text-clinical-700 dark:text-clinical-100 hover:bg-clinical-50 dark:hover:bg-clinical-800",
  danger: "bg-red-600 hover:bg-red-700 text-white",
  ghost: "text-clinical-700 dark:text-clinical-100 hover:bg-clinical-50 dark:hover:bg-clinical-800",
};

const sizes = {
  sm: "px-3 py-1.5 text-sm",
  md: "px-4 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  className = "",
  type = "button",
  icon: Icon,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-70 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {loading ? <Spinner size="w-4 h-4" /> : Icon ? <Icon className="w-4 h-4" /> : null}
      {children}
    </button>
  );
}
