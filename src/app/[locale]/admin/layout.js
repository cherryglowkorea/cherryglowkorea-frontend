"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import Topbar from "@/components/admin/Topbar";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }) {
  const { loading, user } = useAuth();
  const router = useRouter();

  const ALLOWED_ROLES = ["admin", "super_admin", "manager"];

  useEffect(() => {
    if (loading) return; // ⛔ wait until auth state resolves

    // Allow 'admin', 'super_admin', and 'manager'
    if (!user || !ALLOWED_ROLES.includes(user.role)) {
      router.push("/");
      return;
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-rose-950 text-white font-medium">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
          <p className="text-sm text-rose-300">Loading Admin Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !ALLOWED_ROLES.includes(user.role)) {
    return null;
  }

  return (
    <div className="flex min-h-screen bg-stone-50 dark:bg-[#0E0709] text-stone-900 dark:text-slate-100 font-sans transition-colors">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Workspace Area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Topbar Navigation */}
        <Topbar />

        {/* Dashboard Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-stone-100/70 dark:bg-[#140A0D] text-stone-900 dark:text-slate-100 transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
}
