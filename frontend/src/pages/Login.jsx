import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../components/layout/AuthLayout";
import FormInput from "../components/ui/FormInput";
import Button from "../components/ui/Button";
import { authApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = "Email is required.";
    if (!form.password) errs.password = "Password is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authApi.login(form);
      login(res.data.token, res.data.user);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      const redirectTo = location.state?.from?.pathname || (res.data.user.role === "admin" ? "/admin" : "/dashboard");
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to continue tracking your health predictions."
      footer={
        <p className="text-warmgray-600 dark:text-clinical-300">
          Don't have an account?{" "}
          <Link to="/register" className="text-clinical-600 font-semibold hover:underline">
            Create one
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormInput
          id="email"
          name="email"
          label="Email address"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          autoComplete="email"
        />
        <div>
          <FormInput
            id="password"
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            icon={Lock}
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="mt-1.5 inline-flex items-center gap-1 text-xs text-warmgray-500 hover:text-clinical-600"
          >
            {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showPassword ? "Hide password" : "Show password"}
          </button>
        </div>

        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-sm text-clinical-600 hover:underline font-medium">
            Forgot password?
          </Link>
        </div>

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Log in
        </Button>
      </form>

      <div className="mt-6 p-3.5 rounded-xl bg-clinical-50 dark:bg-clinical-900 text-xs text-warmgray-600 dark:text-clinical-300">
        <p className="font-semibold text-clinical-700 dark:text-clinical-200 mb-1">Demo admin account</p>
        <p>admin@aidiseaseprediction.local / Admin@12345</p>
      </div>
    </AuthLayout>
  );
}
