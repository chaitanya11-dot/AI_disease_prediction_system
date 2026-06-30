import { useState } from "react";
import { User, Mail, Cake, Users, Lock, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import FormInput from "../components/ui/FormInput";
import { authApi } from "../api/endpoints";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({
    name: user?.name || "",
    age: user?.age || "",
    gender: user?.gender || "",
  });
  const [passwordForm, setPasswordForm] = useState({ current_password: "", new_password: "", confirm_password: "" });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await authApi.updateProfile(profileForm);
      updateUser(res.data.user);
      toast.success("Profile updated successfully.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not update profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      toast.error("New passwords do not match.");
      return;
    }
    setSavingPassword(true);
    try {
      await authApi.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      });
      toast.success("Password changed successfully.");
      setPasswordForm({ current_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not change password.");
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex items-center gap-4 mb-8">
        <span className="flex items-center justify-center w-16 h-16 rounded-2xl bg-clinical-600 text-white text-2xl font-semibold">
          {user?.name?.[0]?.toUpperCase()}
        </span>
        <div>
          <h1 className="text-2xl font-semibold text-clinical-950 dark:text-white">{user?.name}</h1>
          <p className="text-warmgray-500 dark:text-clinical-400 text-sm flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" /> {user?.email}
            {user?.role === "admin" && (
              <span className="ml-1 inline-flex items-center gap-1 text-xs font-semibold text-vital-600 bg-vital-500/10 px-2 py-0.5 rounded-full">
                <ShieldCheck className="w-3 h-3" /> Admin
              </span>
            )}
          </p>
        </div>
      </div>

      <Card className="p-6 sm:p-8 mb-6">
        <h2 className="font-semibold text-clinical-950 dark:text-white mb-5 flex items-center gap-2">
          <User className="w-5 h-5 text-clinical-500" /> Profile information
        </h2>
        <form onSubmit={handleProfileSubmit} className="space-y-4">
          <FormInput
            label="Full name"
            value={profileForm.name}
            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
            icon={User}
          />
          <div className="grid sm:grid-cols-2 gap-4">
            <FormInput
              label="Age"
              type="number"
              min="0"
              max="130"
              value={profileForm.age}
              onChange={(e) => setProfileForm({ ...profileForm, age: e.target.value })}
              icon={Cake}
            />
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-warmgray-800 dark:text-clinical-200 mb-1.5">
                <Users className="w-4 h-4" /> Gender
              </label>
              <select
                value={profileForm.gender}
                onChange={(e) => setProfileForm({ ...profileForm, gender: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-clinical-200 dark:border-clinical-700 bg-white dark:bg-clinical-900 text-warmgray-900 dark:text-clinical-50 focus:outline-none focus:ring-2 focus:ring-clinical-300"
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
                <option value="prefer_not_to_say">Prefer not to say</option>
              </select>
            </div>
          </div>
          <Button type="submit" loading={savingProfile}>Save changes</Button>
        </form>
      </Card>

      <Card className="p-6 sm:p-8">
        <h2 className="font-semibold text-clinical-950 dark:text-white mb-5 flex items-center gap-2">
          <Lock className="w-5 h-5 text-clinical-500" /> Change password
        </h2>
        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          <FormInput
            label="Current password"
            type="password"
            icon={Lock}
            value={passwordForm.current_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
            autoComplete="current-password"
          />
          <FormInput
            label="New password"
            type="password"
            icon={Lock}
            value={passwordForm.new_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
            autoComplete="new-password"
          />
          <FormInput
            label="Confirm new password"
            type="password"
            icon={Lock}
            value={passwordForm.confirm_password}
            onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
            autoComplete="new-password"
          />
          <Button type="submit" loading={savingPassword} variant="secondary">Change password</Button>
        </form>
      </Card>
    </div>
  );
}
