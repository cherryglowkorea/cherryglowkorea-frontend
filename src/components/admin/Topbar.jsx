"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Bell,
  Search,
  User,
  ShieldAlert,
  ExternalLink,
  ChevronDown,
  LogOut,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

export default function Topbar({ title = "Super Admin Dashboard" }) {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isSuperAdmin = user?.role === "super_admin";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-rose-950/20 bg-rose-950/90 px-4 sm:px-6 backdrop-blur-md text-white">
      {/* Left Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-rose-100 flex items-center gap-2">
          {title}
          {isSuperAdmin && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-300">
              <Sparkles className="h-3 w-3" /> SUPER ADMIN
            </span>
          )}
        </h1>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-rose-300/60" />
          <input
            type="text"
            placeholder="Search orders, products, customers..."
            className="w-full rounded-full border border-rose-800/40 bg-rose-900/40 py-1.5 pl-9 pr-4 text-xs text-rose-100 placeholder-rose-300/50 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400"
          />
        </div>
      </div>

      {/* Right Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Visit Store Link */}
        <Link
          href="/"
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-rose-200 hover:text-white bg-rose-900/50 hover:bg-rose-800/60 border border-rose-800/50 px-3 py-1.5 rounded-full transition-all"
        >
          <span>Live Store</span>
          <ExternalLink className="h-3 w-3" />
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-full p-2 text-rose-200 hover:bg-rose-900/60 hover:text-white transition-colors"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-rose-950 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl border border-rose-900 bg-rose-950 p-4 shadow-2xl z-50 text-rose-100">
              <div className="flex items-center justify-between border-b border-rose-900/60 pb-2 mb-3">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <span className="text-[10px] text-rose-400 font-mono">Real-time alerts</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-amber-950/40 border border-amber-800/30">
                  <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-200">Low Stock Alert</p>
                    <p className="text-[11px] text-amber-300/80">
                      3 products have less than 5 items in inventory.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2 rounded-lg bg-rose-900/30 border border-rose-800/30">
                  <Bell className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-rose-200">New Order Received</p>
                    <p className="text-[11px] text-rose-300/70">
                      Order #CG-8902 was placed recently.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Badge */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-full bg-rose-900/60 border border-rose-800/60 p-1 pl-3 text-left hover:border-rose-600 transition-all"
          >
            <div className="flex flex-col text-right hidden sm:block">
              <span className="text-xs font-semibold text-rose-100 leading-tight">
                {user?.name || "Admin"}
              </span>
              <span className="text-[10px] uppercase font-bold text-rose-300/80 tracking-wider">
                {user?.role || "Admin"}
              </span>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-rose-700 to-rose-500 flex items-center justify-center text-white font-bold text-xs shadow-inner">
              {user?.name ? user.name[0].toUpperCase() : <User className="h-4 w-4" />}
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-rose-300 pr-1" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 rounded-xl border border-rose-900 bg-rose-950 p-1.5 shadow-2xl z-50 text-rose-100">
              <div className="px-3 py-2 border-b border-rose-900/60 mb-1">
                <p className="text-xs font-bold text-rose-100">{user?.name}</p>
                <p className="text-[10px] text-rose-300/70 truncate">{user?.email}</p>
              </div>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-300 hover:text-white hover:bg-rose-900/60 rounded-lg transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
