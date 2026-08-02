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
import { ThemeToggle } from "@/components/theme-toggle";

export default function Topbar({ title = "Super Admin Dashboard" }) {
  const { user, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const isSuperAdmin = user?.role === "super_admin";

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-stone-200 dark:border-rose-950/60 bg-white/90 dark:bg-[#160E12]/95 px-4 sm:px-6 backdrop-blur-md text-stone-800 dark:text-white transition-colors shadow-xs">
      {/* Left Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 dark:text-rose-100 flex items-center gap-2">
          {title}
          {isSuperAdmin && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
              <Sparkles className="h-3 w-3" /> SUPER ADMIN
            </span>
          )}
        </h1>
      </div>

      {/* Center Search Bar */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-rose-300/60" />
          <input
            type="text"
            placeholder="Search orders, products, customers..."
            className="w-full rounded-full border border-stone-200 dark:border-rose-800/40 bg-stone-100 dark:bg-rose-900/40 py-1.5 pl-9 pr-4 text-xs text-stone-800 dark:text-rose-100 placeholder-stone-400 dark:placeholder-rose-300/50 focus:border-rose-400 focus:outline-none focus:ring-1 focus:ring-rose-400 transition-colors"
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
          target="_blank"
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-stone-700 dark:text-rose-200 hover:text-stone-900 dark:hover:text-white bg-stone-100 dark:bg-rose-900/50 hover:bg-stone-200 dark:hover:bg-rose-800/60 border border-stone-200 dark:border-rose-800/50 px-3 py-1.5 rounded-full transition-all"
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
            className="relative rounded-full p-2 text-stone-600 dark:text-rose-200 hover:bg-stone-100 dark:hover:bg-rose-900/60 hover:text-stone-900 dark:hover:text-white transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-rose-950 animate-pulse" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-stone-200 dark:border-rose-900 bg-white dark:bg-[#1C1014] p-4 shadow-2xl z-50 text-stone-800 dark:text-rose-100">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-rose-900/60 pb-2 mb-3">
                <h3 className="font-semibold text-sm">Notifications</h3>
                <span className="text-[10px] text-rose-500 dark:text-rose-400 font-mono">Real-time alerts</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/30">
                  <ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-amber-900 dark:text-amber-200">Low Stock Alert</p>
                    <p className="text-[11px] text-amber-700 dark:text-amber-300/80">
                      3 products have less than 5 items in inventory.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/30 border border-rose-200/80 dark:border-rose-800/30">
                  <Bell className="h-4 w-4 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-rose-900 dark:text-rose-200">New Order Received</p>
                    <p className="text-[11px] text-rose-700 dark:text-rose-300/70">
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
            className="flex items-center gap-2.5 rounded-full bg-stone-100 dark:bg-rose-900/50 hover:bg-stone-200 dark:hover:bg-rose-800/70 border border-stone-200 dark:border-rose-800/60 p-1 pl-3 text-left transition-all cursor-pointer"
          >
            {/* User Name & Role stacked vertically */}
            <div className="hidden sm:flex flex-col text-right leading-none">
              <span className="text-xs font-bold text-stone-800 dark:text-rose-100 line-clamp-1">
                {user?.name || "Admin User"}
              </span>
              <span className="text-[9px] uppercase font-extrabold text-rose-600 dark:text-rose-300 tracking-wider mt-0.5">
                {user?.role || "Admin"}
              </span>
            </div>

            {/* Avatar Circle */}
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white font-extrabold text-xs shadow-sm shrink-0">
              {user?.name ? user.name[0].toUpperCase() : <User className="h-4 w-4" />}
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-stone-500 dark:text-rose-300 pr-1 shrink-0" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-stone-200 dark:border-rose-900 bg-white dark:bg-[#1C1014] p-2 shadow-2xl z-50 text-stone-800 dark:text-rose-100">
              <div className="px-3 py-2 bg-stone-50 dark:bg-rose-950/40 rounded-xl border border-stone-100 dark:border-rose-900/40 mb-1.5">
                <p className="text-xs font-bold text-stone-900 dark:text-white line-clamp-1">{user?.name}</p>
                <p className="text-[10px] text-stone-500 dark:text-rose-300/70 truncate font-mono mt-0.5">{user?.email}</p>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-semibold text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/60 rounded-xl transition-colors cursor-pointer"
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
