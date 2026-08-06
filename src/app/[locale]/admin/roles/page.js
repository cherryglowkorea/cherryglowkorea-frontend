"use client";

import { useEffect, useState, useMemo } from "react";
import {
  ShieldCheck,
  Shield,
  User,
  Search,
  Lock,
  Unlock,
  Sparkles,
  RefreshCw,
  Users,
  UserCheck,
  UserX,
  Copy,
  Check,
  Phone,
  Mail,
  Filter,
  X,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function AdminRolesPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [copiedText, setCopiedText] = useState(null);

  // Filter States
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const isSuperAdmin = currentUser?.role === "super_admin";
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    return token;
  };

  /* ---------------- Fetch Users ---------------- */
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = getToken();

      const res = await axios.get(`${API}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          search,
          role: roleFilter === "all" ? "" : roleFilter,
        },
      });

      if (res.data.success) {
        setUsers(res.data.data.users || []);
      } else {
        setUsers(res.data || []);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user accounts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  /* ---------------- Update User Role ---------------- */
  const updateRole = async (id, role) => {
    if (!isSuperAdmin) {
      toast.error("Only Super Admin can change user roles");
      return;
    }

    try {
      setUpdatingId(id);
      const token = getToken();

      await axios.put(
        `${API}/admin/users/${id}`,
        { role },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, role } : u))
      );
      toast.success(`User role successfully changed to ${role}`);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ---------------- Block / Unblock User ---------------- */
  const toggleBlock = async (id, currentBlocked) => {
    if (!isSuperAdmin) {
      toast.error("Only Super Admin can block/unblock users");
      return;
    }

    try {
      setUpdatingId(id);
      const token = getToken();

      const res = await axios.patch(
        `${API}/admin/users/${id}/block`,
        { block: !currentBlocked },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newLock = !currentBlocked
        ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
        : null;

      setUsers((prev) =>
        prev.map((u) => (u._id === id ? { ...u, lockUntil: newLock } : u))
      );

      toast.success(
        res.data.message ||
          `User ${!currentBlocked ? "blocked" : "unblocked"} successfully`
      );
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ---------------- Metrics Calculation ---------------- */
  const metrics = useMemo(() => {
    const total = users.length;
    const superAdmins = users.filter((u) => u.role === "super_admin").length;
    const admins = users.filter((u) => u.role === "admin").length;
    const regularUsers = users.filter((u) => u.role === "user" || !u.role).length;
    const blocked = users.filter(
      (u) => u.lockUntil && new Date(u.lockUntil) > new Date()
    ).length;

    return { total, superAdmins, admins, regularUsers, blocked };
  }, [users]);

  /* ---------------- Filter Users ---------------- */
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Role Filter
      if (roleFilter !== "all" && u.role !== roleFilter) {
        return false;
      }

      // Status Filter
      const isBlocked = u.lockUntil && new Date(u.lockUntil) > new Date();
      if (statusFilter === "blocked" && !isBlocked) return false;
      if (statusFilter === "active" && isBlocked) return false;

      // Search Query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const name = (u.name || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        const phone = (u.phone || "").toLowerCase();
        return name.includes(q) || email.includes(q) || phone.includes(q);
      }

      return true;
    });
  }, [users, roleFilter, statusFilter, search]);

  const handleCopy = (text, label) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const clearFilters = () => {
    setSearch("");
    setRoleFilter("all");
    setStatusFilter("all");
  };

  const isFiltered = search !== "" || roleFilter !== "all" || statusFilter !== "all";

  const getInitial = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="w-full space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent p-6 rounded-3xl border border-stone-200 dark:border-rose-900/40 bg-white/70 dark:bg-[#160E12]/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-rose-50 flex items-center gap-2">
              User Authority & Roles
            </h1>
            {isSuperAdmin && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5" /> Super Admin Mode
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-rose-300/70 mt-1">
            Manage user accounts, assign admin privileges, and block suspicious accounts.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-stone-200 dark:border-rose-800/60 bg-white dark:bg-rose-950/60 text-xs font-semibold text-stone-700 dark:text-rose-200 hover:bg-stone-100 dark:hover:bg-rose-900/50 transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-rose-500" : ""}`} />
          <span>Refresh Users</span>
        </button>
      </div>

      {/* 2. Metrics Overview Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Accounts */}
        <div
          onClick={() => setRoleFilter("all")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            roleFilter === "all"
              ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/50 dark:bg-rose-950/40"
              : "border-stone-200 dark:border-rose-900/40 bg-white dark:bg-[#180f14] hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-rose-300/70">
              Total Accounts
            </span>
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-rose-100 mt-2">
            {metrics.total}
          </div>
          <div className="text-[11px] text-stone-400 dark:text-rose-300/50 mt-1">
            Registered accounts
          </div>
        </div>

        {/* Super Admins */}
        <div
          onClick={() => setRoleFilter("super_admin")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            roleFilter === "super_admin"
              ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50 dark:bg-amber-950/40"
              : "border-stone-200 dark:border-rose-900/40 bg-white dark:bg-[#180f14] hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Super Admins
            </span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {metrics.superAdmins}
          </div>
          <div className="text-[11px] text-amber-600/70 dark:text-amber-400/60 mt-1">
            Full system control
          </div>
        </div>

        {/* Admins */}
        <div
          onClick={() => setRoleFilter("admin")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            roleFilter === "admin"
              ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/50 dark:bg-rose-950/40"
              : "border-stone-200 dark:border-rose-900/40 bg-white dark:bg-[#180f14] hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
              Admins
            </span>
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <Shield className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {metrics.admins}
          </div>
          <div className="text-[11px] text-rose-600/70 dark:text-rose-400/60 mt-1">
            Store management
          </div>
        </div>

        {/* Regular Users */}
        <div
          onClick={() => setRoleFilter("user")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            roleFilter === "user"
              ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/40"
              : "border-stone-200 dark:border-rose-900/40 bg-white dark:bg-[#180f14] hover:border-blue-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-rose-300/70">
              Customers / Users
            </span>
            <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <UserCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-rose-100 mt-2">
            {metrics.regularUsers}
          </div>
          <div className="text-[11px] text-stone-400 dark:text-rose-300/50 mt-1">
            Standard shoppers
          </div>
        </div>

        {/* Blocked Accounts */}
        <div
          onClick={() => setStatusFilter(statusFilter === "blocked" ? "all" : "blocked")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "blocked"
              ? "border-rose-600 ring-2 ring-rose-600/20 bg-rose-100/50 dark:bg-rose-950/60"
              : "border-stone-200 dark:border-rose-900/40 bg-white dark:bg-[#180f14] hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
              Blocked Accounts
            </span>
            <div className="p-2 rounded-xl bg-rose-200 dark:bg-rose-900 text-rose-700 dark:text-rose-300">
              <UserX className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-2">
            {metrics.blocked}
          </div>
          <div className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">
            Restricted access
          </div>
        </div>
      </div>

      {/* 3. Search & Multi-Filter Control Bar */}
      <div className="space-y-4 bg-white dark:bg-[#180f14] p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-rose-900/40 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-rose-300/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, email or phone number..."
              className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-stone-900 dark:text-rose-100 placeholder-stone-400 dark:placeholder-rose-300/40 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-rose-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Role Filter Selector */}
          <div className="flex items-center gap-2">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 px-3 py-2.5 text-xs text-stone-800 dark:text-rose-200 focus:border-rose-500 focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="user">User / Customer</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>

            {/* Status Filter Selector */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 px-3 py-2.5 text-xs text-stone-800 dark:text-rose-200 focus:border-rose-500 focus:outline-none"
            >
              <option value="all">All Account Status</option>
              <option value="active">Active Only</option>
              <option value="blocked">Blocked Only</option>
            </select>

            {isFiltered && (
              <button
                onClick={clearFilters}
                className="p-2 rounded-2xl border border-stone-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold shrink-0"
                title="Clear Filters"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Results Header */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-rose-300/70">
        <span>
          Showing <strong>{filteredUsers.length}</strong> of {users.length} accounts
        </span>
      </div>

      {/* 5. Desktop Users Table */}
      <div className="hidden sm:block overflow-hidden rounded-2xl border border-stone-200 dark:border-rose-900/40 bg-white dark:bg-[#180f14] shadow-xs">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-stone-500 dark:text-rose-300/70 text-xs">
            <RefreshCw className="h-5 w-5 animate-spin text-rose-500 mr-2" /> Loading accounts...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-stone-400 dark:text-rose-300/60">
            <Users className="h-10 w-10 mx-auto mb-2 text-stone-300 dark:text-rose-950" />
            <p className="font-semibold text-base">No user accounts found</p>
            <p className="text-xs mt-1">Try resetting search or role filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-rose-950/40 border-b border-stone-200 dark:border-rose-900/40">
                <tr className="text-stone-600 dark:text-rose-200 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4 text-center">Role Status</th>
                  <th className="py-3.5 px-4 text-center">Role Management</th>
                  <th className="py-3.5 px-4 text-right">Account Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-rose-900/30">
                {filteredUsers.map((u) => {
                  const isBlocked = u.lockUntil && new Date(u.lockUntil) > new Date();

                  return (
                    <tr key={u._id} className="hover:bg-rose-500/5 dark:hover:bg-rose-900/20 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center font-bold text-white shadow-xs shrink-0">
                            {getInitial(u.name)}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-stone-900 dark:text-rose-100">
                              {u.name || "Guest User"}
                            </p>
                            <p className="text-[11px] text-stone-500 dark:text-rose-300/70">
                              Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Contact Info */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          {u.email ? (
                            <div className="flex items-center gap-1 text-stone-800 dark:text-rose-200 font-medium">
                              <Mail className="h-3 w-3 text-stone-400 shrink-0" />
                              <span className="truncate max-w-[180px]">{u.email}</span>
                              <button
                                onClick={() => handleCopy(u.email, "Email")}
                                className="p-0.5 text-stone-400 hover:text-stone-700 dark:hover:text-rose-200"
                              >
                                {copiedText === u.email ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-stone-400 dark:text-rose-300/50 text-[11px]">No email</span>
                          )}

                          {u.phone ? (
                            <div className="flex items-center gap-1 text-xs text-stone-600 dark:text-rose-300/80 font-mono">
                              <Phone className="h-3 w-3 text-stone-400 shrink-0" />
                              <a href={`tel:${u.phone}`} className="hover:underline">{u.phone}</a>
                            </div>
                          ) : (
                            <span className="text-stone-400 dark:text-rose-300/50 text-[11px]">No phone</span>
                          )}
                        </div>
                      </td>

                      {/* Role Status Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                            u.role === "super_admin"
                              ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                              : u.role === "admin"
                              ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                              : "bg-stone-100 text-stone-700 dark:bg-rose-950/60 dark:text-rose-300 border border-stone-200 dark:border-rose-900/40"
                          }`}
                        >
                          {u.role === "super_admin" ? (
                            <Sparkles className="h-3 w-3 text-amber-500" />
                          ) : u.role === "admin" ? (
                            <Shield className="h-3 w-3 text-rose-500" />
                          ) : (
                            <User className="h-3 w-3 text-stone-400" />
                          )}
                          {u.role || "user"}
                        </span>
                      </td>

                      {/* Role Select Dropdown */}
                      <td className="py-3.5 px-4 text-center">
                        <select
                          value={u.role || "user"}
                          disabled={!isSuperAdmin || updatingId === u._id || u.role === "super_admin"}
                          onChange={(e) => updateRole(u._id, e.target.value)}
                          className="rounded-xl border border-stone-200 dark:border-rose-900/50 bg-white dark:bg-rose-950 px-3 py-1 text-xs text-stone-800 dark:text-rose-100 focus:border-rose-500 focus:outline-none disabled:opacity-50"
                        >
                          <option value="user">User / Customer</option>
                          <option value="admin">Admin</option>
                          <option value="super_admin">Super Admin</option>
                        </select>
                      </td>

                      {/* Block / Unblock Action */}
                      <td className="py-3.5 px-4 text-right">
                        {u.role === "super_admin" ? (
                          <span className="text-xs font-semibold text-stone-400 dark:text-rose-300/50 italic">Protected</span>
                        ) : (
                          <button
                            onClick={() => toggleBlock(u._id, isBlocked)}
                            disabled={!isSuperAdmin || updatingId === u._id}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer ${
                              isBlocked
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-800"
                                : "bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:hover:bg-rose-900 border border-rose-300 dark:border-rose-800"
                            }`}
                          >
                            {isBlocked ? (
                              <>
                                <Unlock className="h-3.5 w-3.5" /> Unblock Account
                              </>
                            ) : (
                              <>
                                <Lock className="h-3.5 w-3.5" /> Block Account
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

      {/* 6. Mobile Cards View */}
      <div className="grid gap-3.5 sm:hidden">
        {loading ? (
          <div className="py-12 text-center text-stone-400 dark:text-rose-300/60">
            <RefreshCw className="h-6 w-6 animate-spin text-rose-500 mx-auto mb-2" />
            Loading accounts...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-8 text-center text-stone-400 dark:text-rose-300/60 bg-white dark:bg-[#180f14] rounded-2xl border border-stone-200 dark:border-rose-900/40 p-4">
            No matching accounts found.
          </div>
        ) : (
          filteredUsers.map((u) => {
            const isBlocked = u.lockUntil && new Date(u.lockUntil) > new Date();

            return (
              <div
                key={u._id}
                className="p-4 rounded-2xl border border-stone-200 dark:border-rose-900/40 bg-white dark:bg-[#180f14] shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 flex items-center justify-center font-bold text-white text-xs shrink-0">
                      {getInitial(u.name)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-stone-900 dark:text-rose-100">
                        {u.name || "Guest User"}
                      </h4>
                      <p className="text-[10px] text-stone-400 dark:text-rose-300/60">
                        Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "N/A"}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                      u.role === "super_admin"
                        ? "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                        : u.role === "admin"
                        ? "bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300"
                        : "bg-stone-100 text-stone-700 dark:bg-rose-950 dark:text-rose-300"
                    }`}
                  >
                    {u.role || "user"}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-stone-600 dark:text-rose-200/80 bg-stone-50 dark:bg-rose-950/40 p-2.5 rounded-xl border border-stone-100 dark:border-rose-900/30">
                  {u.email && <p className="truncate">Email: {u.email}</p>}
                  {u.phone && <p>Phone: {u.phone}</p>}
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <select
                    value={u.role || "user"}
                    disabled={!isSuperAdmin || updatingId === u._id || u.role === "super_admin"}
                    onChange={(e) => updateRole(u._id, e.target.value)}
                    className="rounded-xl border border-stone-200 dark:border-rose-900/50 bg-white dark:bg-rose-950 px-2.5 py-1 text-xs text-stone-800 dark:text-rose-100"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>

                  {u.role !== "super_admin" && (
                    <button
                      onClick={() => toggleBlock(u._id, isBlocked)}
                      disabled={!isSuperAdmin || updatingId === u._id}
                      className={`px-3 py-1 rounded-xl text-xs font-bold ${
                        isBlocked
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                      }`}
                    >
                      {isBlocked ? "Unblock" : "Block"}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
