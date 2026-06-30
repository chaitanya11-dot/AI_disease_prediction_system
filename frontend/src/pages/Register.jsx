import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Cake, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../components/layout/AuthLayout";
import FormInput from "../components/ui/FormInput";
import Button from "../components/ui/Button";
import { authApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirmPassword: "", age: "", gender: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const validate = () => {
    const errs = {};
    if (!form.name.trim() || form.name.trim().length < 2) errs.name = "Please enter your full name.";
    if (!form.email.trim()) errs.email = "Email is required.";
    if (form.password.length < 8) errs.password = "Password must be at least 8 characters.";
    else if (!/[A-Za-z]/.test(form.password) || !/[0-9]/.test(form.password)) {
      errs.password = "Password must include letters and numbers.";
    }
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match.";
    if (form.age && (Number(form.age) < 0 || Number(form.age) > 130)) errs.age = "Please enter a valid age.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await authApi.register({
        name: form.name,
        email: form.email,
        password: form.password,
        age: form.age || undefined,
        gender: form.gender || undefined,
      });
      login(res.data.token, res.data.user);
      toast.success("Account created! Welcome to MediSense AI.");
      navigate("/dashboard", { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.error || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start tracking symptoms and predictions in under a minute."
      footer={
        <p className="text-warmgray-600 dark:text-clinical-300">
          Already have an account?{" "}
          <Link to="/login" className="text-clinical-600 font-semibold hover:underline">
            Log in
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormInput
          id="name"
          name="name"
          label="Full name"
          icon={User}
          placeholder="Jane Doe"
          value={form.name}
          onChange={handleChange}
          error={errors.name}
          autoComplete="name"
        />
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

        <div className="grid grid-cols-2 gap-3">
          <FormInput
            id="age"
            name="age"
            label="Age (optional)"
            type="number"
            icon={Cake}
            placeholder="30"
            min="0"
            max="130"
            value={form.age}
            onChange={handleChange}
            error={errors.age}
          />
          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-warmgray-800 dark:text-clinical-200 mb-1.5">
              Gender (optional)
            </label>
            <select
              id="gender"
              name="gender"
              value={form.gender}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 rounded-xl border border-clinical-200 dark:border-clinical-700 text-sm bg-white dark:bg-clinical-900 text-warmgray-900 dark:text-clinical-50 focus:outline-none focus:ring-2 focus:ring-clinical-300"
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
          <FormInput
            id="password"
            name="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            icon={Lock}
            placeholder="At least 8 characters"
            value={form.password}
            onChange={handleChange}
            error={errors.password}
            autoComplete="new-password"
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

        <FormInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm password"
          type={showPassword ? "text" : "password"}
          icon={Lock}
          placeholder="Re-enter password"
          value={form.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <Button type="submit" loading={loading} className="w-full" size="lg">
          Create account
        </Button>

        <p className="text-xs text-warmgray-500 dark:text-clinical-400 text-center leading-relaxed">
          By creating an account, you agree this tool provides informational guidance only and is
          not a substitute for professional medical advice.
        </p>
      </form>
    </AuthLayout>
  );
}
