import { NavLink, Outlet } from "react-router-dom";
import { LayoutDashboard, Users, Database, Activity, ListTree } from "lucide-react";

const adminLinks = [
  { to: "/admin", label: "Analytics", icon: LayoutDashboard, end: true },
  { to: "/admin/users", label: "User Management", icon: Users },
  { to: "/admin/diseases", label: "Disease Database", icon: Database },
  { to: "/admin/predictions", label: "Predictions", icon: ListTree },
  { to: "/admin/system", label: "System Monitoring", icon: Activity },
];

export default function AdminLayout() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-60 shrink-0">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-warmgray-400 mb-3 px-2">Admin Panel</h2>
          <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
            {adminLinks.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${
                    isActive
                      ? "bg-clinical-600 text-white shadow-card"
                      : "text-warmgray-700 dark:text-clinical-200 hover:bg-clinical-50 dark:hover:bg-clinical-800"
                  }`
                }
              >
                <Icon className="w-4 h-4" /> {label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <div className="flex-1 min-w-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
