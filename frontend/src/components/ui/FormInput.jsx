import { forwardRef } from "react";

const FormInput = forwardRef(function FormInput(
  { label, error, icon: Icon, type = "text", className = "", ...props },
  ref
) {
  return (
    <div className={className}>
      {label && (
        <label htmlFor={props.id} className="block text-sm font-medium text-warmgray-800 dark:text-clinical-200 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-warmgray-400">
            <Icon className="w-4.5 h-4.5" />
          </span>
        )}
        <input
          ref={ref}
          type={type}
          className={`w-full ${Icon ? "pl-10" : "pl-3.5"} pr-3.5 py-2.5 rounded-xl border text-sm bg-white dark:bg-clinical-900 text-warmgray-900 dark:text-clinical-50 placeholder:text-warmgray-400 transition-colors ${
            error
              ? "border-red-300 focus:ring-2 focus:ring-red-200"
              : "border-clinical-200 dark:border-clinical-700 focus:ring-2 focus:ring-clinical-300 focus:border-clinical-400"
          } focus:outline-none`}
          {...props}
        />
      </div>
      {error && <p className="mt-1.5 text-xs text-red-600">{error}</p>}
    </div>
  );
});

export default FormInput;
