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
import { Link } from "@/i18n/navigation";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Topbar({ title = "Super Admin Dashboard" }) {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isSuperAdmin = user?.role === "super_admin";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-stone-200 dark:border-stone-800/80 bg-white/90 dark:bg-[#140A0D]/95 px-4 sm:px-6 backdrop-blur-md text-stone-800 dark:text-stone-100 transition-colors shadow-xs">
      {/* Left Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
          {title}
          {isSuperAdmin && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
              <Sparkles className="h-3 w-3 text-amber-500" /> SUPER ADMIN
            </span>
          )}
        </h1>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
          <input
            type="text"
            placeholder="Search orders, products, customers..."
            className="w-full rounded-full border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-[#0d0709] py-1.5 pl-9 pr-4 text-xs text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/20 transition-colors"
          />
        </div>
      </div>

      {/* Right Actions & Profile */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Visit Store Link */}
        <Link
          href="/"
          className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 bg-stone-100 dark:bg-[#161113] hover:bg-stone-200 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 px-3 py-1.5 rounded-full transition-all"
        >
          <span>Live Store</span>
          <ExternalLink className="h-3 w-3" />
        </Link>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative rounded-full p-2 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5 hover:text-stone-900 dark:hover:text-stone-100 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-5 w-5 text-stone-400" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#140A0D] animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#161113] p-4 shadow-2xl z-50 text-stone-800 dark:text-stone-100">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800/60 pb-2 mb-3">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <span className="text-[10px] text-rose-500 font-mono">Real-time alerts</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/30">
                  <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-900 dark:text-amber-200">Low Stock Alert</p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300/80">
                      3 products have less than 5 items in inventory.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-stone-100 dark:bg-[#0d0709] border border-stone-200 dark:border-stone-800">
                  <Bell className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-stone-900 dark:text-stone-200">New Order Received</p>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      Order #CG-8902 was placed recently.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill Button & Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2.5 rounded-full bg-stone-100 dark:bg-[#161113] hover:bg-stone-200 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 p-1 pl-3 text-left transition-all cursor-pointer"
          >
            {/* User Name & Role stacked vertically */}
            <div className="hidden sm:flex flex-col text-right leading-none">
              <span className="text-xs font-bold text-stone-800 dark:text-stone-100 line-clamp-1">
                {user?.name || "Admin User"}
              </span>
              <span className="text-[9px] uppercase font-bold text-rose-500 tracking-wider mt-0.5">
                {user?.role || "Admin"}
              </span>
            </div>

            {/* Avatar Circle */}
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white font-extrabold text-xs shadow-sm shrink-0">
              {user?.name ? user.name[0].toUpperCase() : <User className="h-4 w-4" />}
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-stone-400 pr-1 shrink-0" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#161113] p-2 shadow-2xl z-50 text-stone-800 dark:text-stone-100">
              <div className="px-3 py-2 bg-stone-50 dark:bg-[#0d0709] rounded-xl border border-stone-100 dark:border-stone-800 mb-1.5">
                <p className="text-xs font-bold text-stone-900 dark:text-stone-100 line-clamp-1">{user?.name}</p>
                <p className="text-[10px] text-stone-500 dark:text-stone-400 truncate font-mono mt-0.5">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-stone-400 hover:text-rose-500 hover:bg-white/5 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

