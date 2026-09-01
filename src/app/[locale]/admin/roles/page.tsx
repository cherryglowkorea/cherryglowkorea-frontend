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
  X,
  Briefcase,
  UserPlus,
  Crown,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function AdminRolesPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Tab & Filter States
  const [activeTab, setActiveTab] = useState<"team" | "staff" | "customers">("team");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Create Team Member Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    role: "admin",
  });

  const isSuperAdmin = currentUser?.role === "super_admin";
  const isAdmin = currentUser?.role === "admin" || isSuperAdmin;
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
      });

      if (res.data.success) {
        setUsers(res.data.data.users || []);
      } else if (Array.isArray(res.data)) {
        setUsers(res.data);
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

  /* ---------------- Update User Role (Super Admin Only) ---------------- */
  const updateRole = async (id: string, role: string) => {
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
      toast.success(`User role successfully changed to ${role.toUpperCase()}`);
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update role");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ---------------- Block / Unblock User ---------------- */
  const toggleBlock = async (id: string, currentBlocked: boolean, targetRole: string) => {
    if (!isAdmin) {
      toast.error("Access denied");
      return;
    }

    if (!isSuperAdmin && targetRole !== "user") {
      toast.error("Admins can only block or unblock customer accounts");
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
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ---------------- Create Team Member ---------------- */
  const handleCreateTeamMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim() || (!addForm.email.trim() && !addForm.phone.trim()) || !addForm.password) {
      toast.error("Name, email/phone, and password are required.");
      return;
    }

    try {
      setAddLoading(true);
      const token = getToken();

      const res = await axios.post(`${API}/admin/users`, addForm, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        toast.success(res.data.message || "Team member created successfully!");
        setShowAddModal(false);
        setAddForm({ name: "", email: "", phone: "", password: "", role: "admin" });
        fetchUsers();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to create team member");
    } finally {
      setAddLoading(false);
    }
  };

  /* ---------------- Metrics Calculation ---------------- */
  const metrics = useMemo(() => {
    const total = users.length;
    const teamCount = users.filter((u) => u.role === "super_admin" || u.role === "admin").length;
    const staffCount = users.filter((u) => u.role === "manager").length;
    const customerCount = users.filter((u) => u.role === "user" || !u.role).length;
    const blockedCount = users.filter(
      (u) => u.lockUntil && new Date(u.lockUntil) > new Date()
    ).length;

    return { total, teamCount, staffCount, customerCount, blockedCount };
  }, [users]);

  /* ---------------- Filter Users by Active Tab & Search ---------------- */
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // 1. Tab Filter
      if (activeTab === "team") {
        if (u.role !== "super_admin" && u.role !== "admin") return false;
      } else if (activeTab === "staff") {
        if (u.role !== "manager") return false;
      } else if (activeTab === "customers") {
        if (u.role && u.role !== "user") return false;
      }

      // 2. Status Filter
      const isBlocked = u.lockUntil && new Date(u.lockUntil) > new Date();
      if (statusFilter === "blocked" && !isBlocked) return false;
      if (statusFilter === "active" && isBlocked) return false;

      // 3. Search Query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const name = (u.name || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        const phone = (u.phone || "").toLowerCase();
        return name.includes(q) || email.includes(q) || phone.includes(q);
      }

      return true;
    });
  }, [users, activeTab, statusFilter, search]);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(text);
    toast.success(`${label} copied to clipboard`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
  };

  const isFiltered = search !== "" || statusFilter !== "all";

  const getInitial = (name?: string) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="w-full space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
              Users & Authority Management
            </h1>
            {isSuperAdmin && (
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20 flex items-center gap-1">
                <Crown className="h-3.5 w-3.5" /> Super Admin Mode
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Manage leadership team members, staff managers, customer accounts, and system access rights.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {isSuperAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>+ Add Team Member</span>
            </button>
          )}

          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0d0709] text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all shadow-2xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-stone-400 ${loading ? "animate-spin text-rose-500" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 2. 3-Tab Main Navigation Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-stone-100/80 dark:bg-[#0d0709] p-1.5 rounded-3xl border border-stone-200 dark:border-stone-800/80">
        {/* Tab 1: Team (Super Admin + Admin) */}
        <button
          type="button"
          onClick={() => setActiveTab("team")}
          className={`flex items-center justify-between px-5 py-3.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === "team"
              ? "bg-white dark:bg-[#161113] text-rose-600 dark:text-rose-400 shadow-sm border border-rose-500/30"
              : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-white/5"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="h-4 w-4 text-rose-500" />
            <span>Team (Admins)</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === "team"
                ? "bg-rose-500 text-white"
                : "bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
            }`}
          >
            {metrics.teamCount}
          </span>
        </button>

        {/* Tab 2: Staff / Managers */}
        <button
          type="button"
          onClick={() => setActiveTab("staff")}
          className={`flex items-center justify-between px-5 py-3.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === "staff"
              ? "bg-white dark:bg-[#161113] text-indigo-600 dark:text-indigo-400 shadow-sm border border-indigo-500/30"
              : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-white/5"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Briefcase className="h-4 w-4 text-indigo-500" />
            <span>Staff / Managers</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === "staff"
                ? "bg-indigo-600 text-white"
                : "bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
            }`}
          >
            {metrics.staffCount}
          </span>
        </button>

        {/* Tab 3: Customers */}
        <button
          type="button"
          onClick={() => setActiveTab("customers")}
          className={`flex items-center justify-between px-5 py-3.5 rounded-2xl text-xs font-extrabold transition-all cursor-pointer ${
            activeTab === "customers"
              ? "bg-white dark:bg-[#161113] text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/30"
              : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-white/5"
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Users className="h-4 w-4 text-emerald-500" />
            <span>Customers</span>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === "customers"
                ? "bg-emerald-600 text-white"
                : "bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
            }`}
          >
            {metrics.customerCount}
          </span>
        </button>
      </div>

      {/* Tab Context Banner */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#161113] border border-stone-200 dark:border-stone-800/80 text-xs text-stone-600 dark:text-stone-300 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {activeTab === "team" && (
            <>
              <Crown size={16} className="text-amber-500 shrink-0" />
              <span>
                <strong>Team Management:</strong> Super Admin and Admin accounts. Super Admin can change roles and add new team members here.
              </span>
            </>
          )}
          {activeTab === "staff" && (
            <>
              <Briefcase size={16} className="text-indigo-500 shrink-0" />
              <span>
                <strong>Staff / Managers:</strong> Staff role for handling order fulfillment & catalog views. Managed by Super Admin.
              </span>
            </>
          )}
          {activeTab === "customers" && (
            <>
              <UserCheck size={16} className="text-emerald-500 shrink-0" />
              <span>
                <strong>Registered Customers:</strong> Regular store shoppers. Admins and Super Admins can restrict or unblock accounts here.
              </span>
            </>
          )}
        </div>

        {metrics.blockedCount > 0 && (
          <button
            onClick={() => setStatusFilter(statusFilter === "blocked" ? "all" : "blocked")}
            className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 hover:underline shrink-0"
          >
            ⚠️ {metrics.blockedCount} Blocked Account{metrics.blockedCount > 1 ? "s" : ""}
          </button>
        )}
      </div>

      {/* 3. Search & Multi-Filter Control Bar */}
      <div className="space-y-4 bg-white dark:bg-[#161113] p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800/80 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, email or phone number..."
              className="w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] py-2.5 pl-10 pr-10 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/20 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Selector */}
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] px-3.5 py-2.5 text-xs text-stone-800 dark:text-stone-200 focus:border-rose-500 focus:outline-none"
            >
              <option value="all">All Account Status</option>
              <option value="active">Active Only</option>
              <option value="blocked">Blocked Only</option>
            </select>

            {isFiltered && (
              <button
                onClick={clearFilters}
                className="p-2.5 rounded-2xl border border-stone-200 dark:border-stone-800 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold shrink-0 cursor-pointer"
                title="Clear Filters"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4. Results Summary */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
        <span>
          Showing <strong className="text-stone-900 dark:text-stone-100 font-mono">{filteredUsers.length}</strong> of {users.length} total accounts
        </span>
      </div>

      {/* 5. Users Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113] shadow-xs">
        {loading ? (
          <div className="flex h-64 items-center justify-center text-stone-500 dark:text-stone-400 text-xs">
            <RefreshCw className="h-5 w-5 animate-spin text-rose-500 mr-2" /> Loading accounts...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-stone-400 dark:text-stone-500">
            <Users className="h-10 w-10 mx-auto mb-2 text-stone-300 dark:text-stone-700" />
            <p className="font-semibold text-base text-stone-800 dark:text-stone-200">No matching accounts found</p>
            <p className="text-xs mt-1">Try switching tabs or resetting search parameters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-[#0d0709] border-b border-stone-200 dark:border-stone-800">
                <tr className="text-stone-600 dark:text-stone-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">User</th>
                  <th className="py-3.5 px-4">Contact Info</th>
                  <th className="py-3.5 px-4 text-center">Role Status</th>
                  <th className="py-3.5 px-4 text-center">Role Management</th>
                  <th className="py-3.5 px-4 text-right">Account Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {filteredUsers.map((u) => {
                  const isBlocked = u.lockUntil && new Date(u.lockUntil) > new Date();
                  const isCurrentSelf = currentUser?._id === u._id;

                  return (
                    <tr
                      key={u._id}
                      className="hover:bg-stone-50/80 dark:hover:bg-white/5 transition-colors"
                    >
                      {/* USER INFO */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="relative shrink-0">
                            {u.avatar ? (
                              <img
                                src={u.avatar}
                                alt={u.name || "User"}
                                className="h-10 w-10 rounded-full object-cover border border-stone-200 dark:border-stone-800"
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center font-bold text-rose-600 dark:text-rose-400">
                                {getInitial(u.name)}
                              </div>
                            )}

                            {/* Role indicator mini dot */}
                            {u.role === "super_admin" && (
                              <span
                                className="absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full bg-amber-500 text-white"
                                title="Super Admin"
                              >
                                <Crown size={9} />
                              </span>
                            )}
                          </div>

                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                              <span>{u.name || "Anonymous User"}</span>
                              {isCurrentSelf && (
                                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-pink-100 text-pink-700 dark:bg-pink-950 dark:text-pink-300 rounded">
                                  YOU
                                </span>
                              )}
                            </p>
                            <p className="text-[11px] text-stone-400 dark:text-stone-500 font-mono">
                              Joined {u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "N/A"}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* CONTACT INFO */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1 text-xs">
                          {u.email ? (
                            <div className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300">
                              <Mail size={12} className="text-stone-400 shrink-0" />
                              <span className="truncate max-w-[180px]">{u.email}</span>
                              <button
                                onClick={() => handleCopy(u.email, "Email")}
                                className="p-0.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                                title="Copy Email"
                              >
                                {copiedText === u.email ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[11px] text-stone-400 italic">No email</span>
                          )}

                          {u.phone ? (
                            <div className="flex items-center gap-1.5 font-mono text-stone-600 dark:text-stone-400">
                              <Phone size={12} className="text-stone-400 shrink-0" />
                              <span>{u.phone}</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-stone-400 italic block">No phone</span>
                          )}
                        </div>
                      </td>

                      {/* ROLE STATUS BADGE */}
                      <td className="py-3.5 px-4 text-center">
                        {u.role === "super_admin" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60">
                            <Sparkles size={11} /> SUPER_ADMIN
                          </span>
                        ) : u.role === "admin" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60">
                            <Shield size={11} /> ADMIN
                          </span>
                        ) : u.role === "manager" ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800/60">
                            <Briefcase size={11} /> MANAGER
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-bold bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                            <User size={11} /> USER
                          </span>
                        )}
                      </td>

                      {/* ROLE MANAGEMENT DROPDOWN */}
                      <td className="py-3.5 px-4 text-center">
                        {isSuperAdmin ? (
                          <select
                            value={u.role || "user"}
                            disabled={updatingId === u._id || u.role === "super_admin"}
                            onChange={(e) => updateRole(u._id, e.target.value)}
                            className="rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] px-3 py-1.5 text-xs font-semibold text-stone-800 dark:text-stone-200 focus:border-rose-500 focus:outline-none cursor-pointer disabled:opacity-60"
                          >
                            <option value="super_admin">Super Admin</option>
                            <option value="admin">Admin</option>
                            <option value="manager">Manager / Staff</option>
                            <option value="user">User / Customer</option>
                          </select>
                        ) : (
                          <span className="text-[11px] font-medium text-stone-400 italic">
                            {u.role === "super_admin" ? "Super Admin" : u.role === "admin" ? "Admin" : u.role === "manager" ? "Manager" : "User"} (View Only)
                          </span>
                        )}
                      </td>

                      {/* ACCOUNT ACTIONS */}
                      <td className="py-3.5 px-4 text-right">
                        {u.role === "super_admin" ? (
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 italic">
                            Protected
                          </span>
                        ) : (
                          <button
                            onClick={() => toggleBlock(u._id, isBlocked, u.role || "user")}
                            disabled={
                              updatingId === u._id ||
                              (!isSuperAdmin && u.role !== "user")
                            }
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                              isBlocked
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                                : "bg-rose-100 text-rose-700 hover:bg-rose-200 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                            }`}
                          >
                            {isBlocked ? (
                              <>
                                <Unlock size={13} /> Unblock
                              </>
                            ) : (
                              <>
                                <Lock size={13} /> Block Account
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

      {/* 6. CREATE TEAM MEMBER MODAL (Super Admin Only) */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#161113] border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-3">
              <h2 className="text-lg font-extrabold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <UserPlus size={18} className="text-rose-500" />
                <span>Add New Team Member</span>
              </h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateTeamMember} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rakibul Hasan"
                  value={addForm.name}
                  onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] text-stone-900 dark:text-stone-100 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="e.g. member@cherryglow.com"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] text-stone-900 dark:text-stone-100 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Phone Number
                </label>
                <input
                  type="text"
                  placeholder="e.g. 01700000000"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] text-stone-900 dark:text-stone-100 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Assigned Team Role *
                </label>
                <select
                  value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] text-stone-900 dark:text-stone-100 focus:border-rose-500 focus:outline-none font-semibold"
                >
                  <option value="admin">Admin (Full Store Management)</option>
                  <option value="manager">Manager (Fulfillment & Orders Staff)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-stone-700 dark:text-stone-300 mb-1">
                  Initial Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="Minimum 6 characters"
                  value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] text-stone-900 dark:text-stone-100 focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-100 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addLoading}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition shadow-md cursor-pointer disabled:opacity-60"
                >
                  {addLoading ? "Creating..." : "Create Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
