"use client";

import { useEffect, useState } from "react";
import {
  ShieldCheck,
  Shield,
  User,
  Search,
  Lock,
  Unlock,
  Sparkles,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function AdminRolesPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const isSuperAdmin = currentUser?.role === "super_admin";

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    return token;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getToken();

      const res = await axios.get("http://localhost:5000/admin/users", {
        headers: { Authorization: `Bearer ${token}` },
        params: { search, role: roleFilter },
      });

      if (res.data.success) {
        setUsers(res.data.data.users || []);
      } else {
        setUsers(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  // 🔄 Update user role (Super Admin only)
  const updateRole = async (id, role) => {
    if (!isSuperAdmin) {
      toast.error("Only Super Admin can change user roles");
      return;
    }

    try {
      setUpdatingId(id);
      const token = getToken();

      await axios.put(
        `http://localhost:5000/admin/users/${id}`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, role } : u)));
      toast.success(`User role updated to ${role}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  // 🔒 Toggle Block user (Super Admin only)
  const toggleBlock = async (id, currentBlocked) => {
    if (!isSuperAdmin) {
      toast.error("Only Super Admin can block/unblock users");
      return;
    }

    try {
      setUpdatingId(id);
      const token = getToken();

      const res = await axios.patch(
        `http://localhost:5000/admin/users/${id}/block`,
        { block: !currentBlocked },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newLock = !currentBlocked ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : null;
      setUsers((prev) => prev.map((u) => (u._id === id ? { ...u, lockUntil: newLock } : u)));
      toast.success(res.data.message || `User ${!currentBlocked ? "blocked" : "unblocked"}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            User Authority & Roles
            {isSuperAdmin && (
              <span className="rounded-full bg-amber-500/20 border border-amber-500/30 px-3 py-0.5 text-xs font-semibold text-amber-300 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> Super Admin Access
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Manage customer accounts, assign admin privileges, and block suspicious accounts.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 transition-colors shadow-sm"
        >
          <RefreshCw className="h-3.5 w-3.5 text-rose-400" />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-900/90 py-2 pl-9 pr-4 text-xs text-white placeholder-slate-500 focus:border-rose-500 focus:outline-none"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="rounded-xl border border-slate-800 bg-slate-900/90 py-2 px-3 text-xs text-white focus:border-rose-500 focus:outline-none"
        >
          <option value="">All Roles</option>
          <option value="user font-semibold">User</option>
          <option value="admin">Admin</option>
          <option value="super_admin">Super Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 shadow-xl">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-slate-400 text-xs">
            <RefreshCw className="h-5 w-5 animate-spin text-rose-500 mr-2" /> Loading accounts...
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">No matching user accounts found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4 text-center">Role Status</th>
                  <th className="py-3.5 px-4 text-center">Role Management</th>
                  <th className="py-3.5 px-4 text-right">Account Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => {
                  const isBlocked = u.lockUntil && new Date(u.lockUntil) > new Date();

                  return (
                    <tr key={u._id} className="hover:bg-slate-800/40 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-rose-700 to-rose-500 flex items-center justify-center font-bold text-white shadow-sm shrink-0">
                            {u.name ? u.name[0].toUpperCase() : "U"}
                          </div>
                          <div>
                            <p className="font-bold text-white">{u.name || "N/A"}</p>
                            <p className="text-[10px] text-slate-400">Joined {new Date(u.createdAt).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3 px-4 text-slate-300">
                        <p className="font-medium text-slate-200">{u.email || "No email"}</p>
                        <p className="text-[10px] text-slate-400">{u.phone || "No phone"}</p>
                      </td>

                      {/* Role Status Badge */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                            u.role === "super_admin"
                              ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                              : u.role === "admin"
                              ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              : "bg-slate-800 text-slate-400 border border-slate-700"
                          }`}
                        >
                          {u.role === "super_admin" ? (
                            <Sparkles className="h-3 w-3" />
                          ) : u.role === "admin" ? (
                            <Shield className="h-3 w-3" />
                          ) : (
                            <User className="h-3 w-3" />
                          )}
                          {u.role}
                        </span>
                      </td>

                      {/* Role Select Dropdown */}
                      <td className="py-3 px-4 text-center">
                        <select
                          value={u.role}
                          disabled={!isSuperAdmin || updatingId === u._id || u.role === "super_admin"}
                          onChange={(e) => updateRole(u._id, e.target.value)}
                          className="rounded-lg border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs text-slate-200 focus:border-rose-500 focus:outline-none disabled:opacity-50"
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>

                      {/* Block / Unblock Action */}
                      <td className="py-3 px-4 text-right">
                        {u.role === "super_admin" ? (
                          <span className="text-[10px] font-semibold text-slate-500 italic">Protected</span>
                        ) : (
                          <button
                            onClick={() => toggleBlock(u._id, isBlocked)}
                            disabled={!isSuperAdmin || updatingId === u._id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors disabled:opacity-40 ${
                              isBlocked
                                ? "bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30"
                                : "bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 border border-rose-500/30"
                            }`}
                          >
                            {isBlocked ? (
                              <>
                                <Unlock className="h-3.5 w-3.5" /> Unblock
                              </>
                            ) : (
                              <>
                                <Lock className="h-3.5 w-3.5" /> Block
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
