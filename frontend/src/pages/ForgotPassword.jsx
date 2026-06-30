import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import AuthLayout from "../components/layout/AuthLayout";
import FormInput from "../components/ui/FormInput";
import Button from "../components/ui/Button";
import { authApi } from "../api/endpoints";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Please enter your email address.");
      return;
    }
    setLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setSubmitted(true);
    } catch (err) {
      toast.error(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthLayout title="Check your inbox">
        <div className="text-center py-4">
          <span className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 mb-4">
            <CheckCircle2 className="w-7 h-7" />
          </span>
          <p className="text-sm text-warmgray-700 dark:text-clinical-300 leading-relaxed">
            If an account exists for <span className="font-semibold">{email}</span>, password
            reset instructions have been sent. (Running locally without SMTP configured? Check
            the backend server console — the email content is printed there.)
          </p>
          <Link to="/login" className="mt-6 inline-block text-clinical-600 font-semibold hover:underline text-sm">
            Back to login
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you reset instructions."
      footer={
        <Link to="/login" className="text-clinical-600 font-semibold hover:underline text-sm">
          Back to login
        </Link>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          id="email"
          label="Email address"
          type="email"
          icon={Mail}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
        />
        <Button type="submit" loading={loading} className="w-full" size="lg">
          Send reset instructions
        </Button>
      </form>
    </AuthLayout>
  );
}
