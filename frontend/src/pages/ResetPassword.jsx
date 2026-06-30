import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Lock, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../components/layout/AuthLayout";
import FormInput from "../components/ui/FormInput";
import Button from "../components/ui/Button";
import { authApi } from "../api/endpoints";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get("token") || "";
  const [form, setForm] = useState({ token: tokenFromUrl, password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.token.trim()) {
      toast.error("Please enter your reset token.");
      return;
    }
    if (form.password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword({ token: form.token, password: form.password });
      setSuccess(true);
      toast.success("Password reset successfully!");
    } catch (err) {
      toast.error(err.response?.data?.error || "Reset failed. The link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <AuthLayout title="Password reset complete">
        <div className="text-center py-4">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mb-4">
            <CheckCircle2 className="w-7 h-7" />
          </span>
          <p className="text-sm text-warmgray-700 dark:text-clinical-300">
            Your password has been updated. You can now log in with your new password.
          </p>
          <Button className="mt-6 w-full" size="lg" onClick={() => navigate("/login")}>
            Go to login
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Paste the token from your email and choose a new password."
      footer={
        <Link to="/login" className="text-clinical-600 font-semibold hover:underline text-sm">
          Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="token"
          name="token"
          label="Reset token"
          placeholder="Paste your reset token here"
          value={form.token}
          onChange={handleChange}
        />
        <FormInput
          id="password"
          name="password"
          label="New password"
          type="password"
          icon={Lock}
          placeholder="At least 8 characters"
          value={form.password}
          onChange={handleChange}
          autoComplete="new-password"
        />
        <FormInput
          id="confirmPassword"
          name="confirmPassword"
          label="Confirm new password"
          type="password"
          icon={Lock}
          placeholder="Re-enter new password"
          value={form.confirmPassword}
          onChange={handleChange}
          autoComplete="new-password"
        />
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Reset password
        </Button>
      </form>
    </AuthLayout>
  );
}
