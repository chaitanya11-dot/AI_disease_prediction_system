import { Link } from "react-router-dom";
import { Activity, Home } from "lucide-react";
import Button from "../components/ui/Button";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-clinical-50 dark:bg-clinical-800 text-clinical-400 mb-5">
        <Activity className="w-8 h-8" />
      </span>
      <h1 className="text-3xl font-semibold text-clinical-950 dark:text-white">Page not found</h1>
      <p className="mt-2 text-warmgray-600 dark:text-clinical-300 max-w-sm">
        The page you're looking for doesn't exist or may have been moved.
      </p>
      <Link to="/" className="mt-6">
        <Button icon={Home}>Back to home</Button>
      </Link>
    </div>
  );
}
