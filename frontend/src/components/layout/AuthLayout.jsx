import { Link } from "react-router-dom";
import { Activity } from "lucide-react";
import VitalLine from "../ui/VitalLine";

export default function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="min-h-[calc(100vh-64px)] flex">
      <div className="hidden lg:flex lg:w-1/2 bg-clinical-700 relative overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 bg-gradient-to-br from-clinical-600 to-clinical-900 opacity-90" />
        <Link to="/" className="relative z-10 flex items-center gap-2 text-white">
          <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-white/15">
            <Activity className="w-5 h-5" strokeWidth={2.5} />
          </span>
          <span className="font-display text-lg font-semibold">
            MediSense<span className="text-vital-300">AI</span>
          </span>
        </Link>

        <div className="relative z-10">
          <blockquote className="text-white text-2xl font-display leading-snug max-w-md">
            "Knowing what to ask your doctor is half the battle."
          </blockquote>
          <p className="mt-4 text-clinical-200 text-sm max-w-sm">
            MediSense AI helps you go into every appointment with clearer questions and a better
            understanding of what your symptoms might mean.
          </p>
        </div>

        <VitalLine className="relative z-10 w-full h-12 text-vital-300/40" />
      </div>

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 bg-warmgray-50 dark:bg-clinical-950">
        <div className="w-full max-w-sm">
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-clinical-600 text-white">
              <Activity className="w-4.5 h-4.5" />
            </span>
            <span className="font-display text-base font-semibold text-clinical-950 dark:text-white">
              MediSense<span className="text-clinical-500">AI</span>
            </span>
          </Link>

          <h1 className="text-2xl font-semibold text-clinical-950 dark:text-white">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-warmgray-600 dark:text-clinical-300">{subtitle}</p>}

          <div className="mt-7">{children}</div>

          {footer && <div className="mt-6 text-center text-sm">{footer}</div>}
        </div>
      </div>
    </div>
  );
}
