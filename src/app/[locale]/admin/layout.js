"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/admin/Sidebar";
import { useAuth } from "@/context/AuthContext";

export default function AdminLayout({ children }) {
  const { loading, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // ⛔ wait

    if (!user || user.role !== "admin") {
      router.push("/login");
      return;
    }
  }, [user, loading, router]);


  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
