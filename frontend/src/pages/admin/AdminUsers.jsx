import { useEffect, useState, useCallback } from "react";
import { Search, ShieldCheck, ShieldOff, Trash2, UserX, UserCheck } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badges";
import LoadingScreen from "../../components/ui/LoadingScreen";
import { adminApi } from "../../api/endpoints";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    adminApi
      .listUsers(search ? { search } : {})
      .then((res) => setUsers(res.data.users))
      .catch(() => toast.error("Could not load users."))
      .finally(() => setLoading(false));
  }, [search]);

  useEffect(() => {
    const t = setTimeout(fetchUsers, 300);
    return () => clearTimeout(t);
  }, [fetchUsers]);

  const handleToggleActive = async (id) => {
    try {
      const res = await adminApi.toggleUserActive(id);
      setUsers((prev) => prev.map((u) => (u.id === id ? res.data.user : u)));
      toast.success(res.data.message);
    } catch (err) {
      toast.error(err.response?.data?.error || "Action failed.");
    }
  };

  const handleRoleToggle = async (user) => {
    const newRole = user.role === "admin" ? "user" : "admin";
    try {
      const res = await adminApi.updateUserRole(user.id, newRole);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? res.data.user : u)));
      toast.success(`Role updated to ${newRole}.`);
    } catch (err) {
      toast.error(err.response?.data?.error || "Action failed.");
    }
  };

  const handleDelete = async (id) => {
    try {
      await adminApi.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success("User deleted.");
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not delete user.");
    } finally {
      setConfirmDelete(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-2xl font-semibold text-clinical-950 dark:text-white">User management</h1>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-warmgray-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="pl-10 pr-4 py-2.5 rounded-xl border border-clinical-200 dark:border-clinical-700 bg-white dark:bg-clinical-900 text-sm focus:outline-none focus:ring-2 focus:ring-clinical-300"
          />
        </div>
      </div>

      {loading ? (
        <LoadingScreen label="Loading users..." />
      ) : (
        <Card className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-clinical-50 dark:bg-clinical-800 text-warmgray-600 dark:text-clinical-300">
              <tr>
                <th className="text-left px-5 py-3 font-semibold">Name</th>
                <th className="text-left px-5 py-3 font-semibold">Email</th>
                <th className="text-left px-5 py-3 font-semibold">Role</th>
                <th className="text-left px-5 py-3 font-semibold">Status</th>
                <th className="text-left px-5 py-3 font-semibold">Joined</th>
                <th className="text-right px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-clinical-100 dark:divide-clinical-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-clinical-50/50 dark:hover:bg-clinical-800/40">
                  <td className="px-5 py-3.5 font-medium text-clinical-950 dark:text-white">{u.name}</td>
                  <td className="px-5 py-3.5 text-warmgray-600 dark:text-clinical-300">{u.email}</td>
                  <td className="px-5 py-3.5">
                    <Badge color={u.role === "admin" ? "vital" : "gray"}>{u.role}</Badge>
                  </td>
                  <td className="px-5 py-3.5">
                    <Badge color={u.is_active ? "clinical" : "gray"}>{u.is_active ? "Active" : "Inactive"}</Badge>
                  </td>
                  <td className="px-5 py-3.5 text-warmgray-500 dark:text-clinical-400">
                    {u.created_at ? format(new Date(u.created_at), "MMM d, yyyy") : "—"}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1.5">
                      {u.role !== "admin" && (
                        <>
                          <button
                            onClick={() => handleToggleActive(u.id)}
                            title={u.is_active ? "Deactivate" : "Activate"}
                            className="p-2 rounded-lg text-warmgray-500 hover:bg-clinical-50 dark:hover:bg-clinical-800"
                          >
                            {u.is_active ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                          </button>
                          <button
                            onClick={() => handleRoleToggle(u)}
                            title="Make admin"
                            className="p-2 rounded-lg text-warmgray-500 hover:bg-clinical-50 dark:hover:bg-clinical-800"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(u)}
                            title="Delete user"
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {u.role === "admin" && (
                        <button
                          onClick={() => handleRoleToggle(u)}
                          title="Revoke admin"
                          className="p-2 rounded-lg text-warmgray-500 hover:bg-clinical-50 dark:hover:bg-clinical-800"
                        >
                          <ShieldOff className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <p className="text-center py-10 text-warmgray-500">No users found.</p>}
        </Card>
      )}

      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <Card className="w-full max-w-sm p-6">
            <h3 className="font-semibold text-clinical-950 dark:text-white mb-2">Delete {confirmDelete.name}?</h3>
            <p className="text-sm text-warmgray-600 dark:text-clinical-300 mb-6">
              This will permanently delete the user account and all of their prediction history.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1" onClick={() => setConfirmDelete(null)}>Cancel</Button>
              <Button variant="danger" className="flex-1" onClick={() => handleDelete(confirmDelete.id)}>Delete</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
