import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Activity, Menu, X, Sun, Moon, LayoutDashboard, Stethoscope,
  History as HistoryIcon, ShieldCheck, LogOut, User as UserIcon, BookOpen, HelpCircle, Phone
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const navLinkBase =
  "px-3 py-2 rounded-lg text-sm font-medium transition-colors";

export default function Navbar() {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/");
  };

  const links = isAuthenticated
    ? [
        { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
        { to: "/symptom-checker", label: "Symptom Checker", icon: Stethoscope },
        { to: "/history", label: "History", icon: HistoryIcon },
        { to: "/diseases", label: "Disease Library", icon: BookOpen },
        { to: "/faq", label: "FAQ", icon: HelpCircle },
      ]
    : [
        { to: "/diseases", label: "Disease Library", icon: BookOpen },
        { to: "/faq", label: "FAQ", icon: HelpCircle },
      ];

  return (
    <header className="sticky top-0 z-50 border-b border-clinical-100 dark:border-clinical-800 bg-white/90 dark:bg-clinical-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 group" onClick={() => setMobileOpen(false)}>
            <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-clinical-600 text-white shadow-card group-hover:bg-clinical-700 transition-colors">
              <Activity className="w-5 h-5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg font-semibold text-clinical-900 dark:text-clinical-50 tracking-tight">
              MediSense<span className="text-clinical-500">AI</span>
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `${navLinkBase} flex items-center gap-1.5 ${
                    isActive
                      ? "bg-clinical-50 text-clinical-700 dark:bg-clinical-800 dark:text-clinical-100"
                      : "text-warmgray-800 dark:text-clinical-200 hover:bg-clinical-50 dark:hover:bg-clinical-800/60"
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `${navLinkBase} flex items-center gap-1.5 ${
                    isActive
                      ? "bg-vital-500/10 text-vital-600"
                      : "text-vital-600 hover:bg-vital-500/10"
                  }`
                }
              >
                <ShieldCheck className="w-4 h-4" />
                Admin
              </NavLink>
            )}
          </nav>

          <div className="hidden lg:flex items-center gap-2">
            <button
              onClick={toggleTheme}
              aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
              className="p-2 rounded-lg text-warmgray-800 dark:text-clinical-200 hover:bg-clinical-50 dark:hover:bg-clinical-800/60 transition-colors"
            >
              {isDark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />}
            </button>

            {isAuthenticated ? (
              <div className="flex items-center gap-2 ml-1">
                <Link
                  to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-clinical-50 dark:hover:bg-clinical-800/60 transition-colors"
                >
                  <span className="flex items-center justify-center w-7 h-7 rounded-full bg-clinical-100 dark:bg-clinical-800 text-clinical-700 dark:text-clinical-100 text-xs font-semibold">
                    {user?.name?.[0]?.toUpperCase() || <UserIcon className="w-3.5 h-3.5" />}
                  </span>
                  <span className="text-sm font-medium text-warmgray-800 dark:text-clinical-100 max-w-[100px] truncate">
                    {user?.name}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-warmgray-800 dark:text-clinical-200 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-300 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-clinical-700 dark:text-clinical-100 hover:bg-clinical-50 dark:hover:bg-clinical-800/60 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-clinical-600 hover:bg-clinical-700 shadow-card transition-colors"
                >
                  Get started
                </Link>
              </div>
            )}
          </div>

          <button
            className="lg:hidden p-2 rounded-lg text-warmgray-800 dark:text-clinical-100"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="lg:hidden border-t border-clinical-100 dark:border-clinical-800 bg-white dark:bg-clinical-950 px-4 py-3 space-y-1 animate-fadeUp">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive
                    ? "bg-clinical-50 text-clinical-700 dark:bg-clinical-800 dark:text-clinical-100"
                    : "text-warmgray-800 dark:text-clinical-200"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-vital-600"
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Panel
            </NavLink>
          )}
          <div className="pt-2 border-t border-clinical-100 dark:border-clinical-800 flex items-center justify-between">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-warmgray-800 dark:text-clinical-200"
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              {isDark ? "Light mode" : "Dark mode"}
            </button>
          </div>
          {isAuthenticated ? (
            <div className="space-y-1 pt-1">
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-warmgray-800 dark:text-clinical-200"
              >
                <UserIcon className="w-4 h-4" /> Profile ({user?.name})
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600"
              >
                <LogOut className="w-4 h-4" /> Log out
              </button>
            </div>
          ) : (
            <div className="flex gap-2 pt-2">
              <Link
                to="/login"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-medium border border-clinical-200 dark:border-clinical-700 text-clinical-700 dark:text-clinical-100"
              >
                Log in
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileOpen(false)}
                className="flex-1 text-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-clinical-600"
              >
                Get started
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
