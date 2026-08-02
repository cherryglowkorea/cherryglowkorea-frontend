"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Users,
  Image as ImageIcon,
  Menu,
  X,
  Sparkles,
  Layers,
  Star,
  Tag,
  LogOut,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const isSuperAdmin = user?.role === "super_admin";

  const navigation = [
    {
      group: "MAIN",
      items: [
        { name: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
      ],
    },
    {
      group: "CATALOG & PRODUCTS",
      items: [
        { name: "All Products", href: "/admin/products", icon: Package },
        { name: "Add New Product", href: "/admin/create", icon: PlusCircle },
        { name: "Combo Deals", href: "/admin/products?type=combo", icon: Layers },
      ],
    },
    {
      group: "SALES & ORDERS",
      items: [
        { name: "All Orders", href: "/admin/orders", icon: ShoppingBag },
        { name: "Create Order", href: "/admin/orders/create", icon: PlusCircle },
      ],
    },
    {
      group: "CUSTOMERS & USERS",
      items: [
        { name: "Users & Roles", href: "/admin/roles", icon: Users },
      ],
    },
    {
      group: "MARKETING & MEDIA",
      items: [
        { name: "Hero Banners", href: "/admin/banner", icon: ImageIcon },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-50 rounded-xl border border-rose-800 bg-rose-950 p-2.5 shadow-xl sm:hidden text-rose-100 hover:bg-rose-900"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 transform bg-rose-950 border-r border-rose-900/60 p-4 text-rose-100 flex flex-col justify-between
          transition-transform duration-300 ease-in-out shadow-2xl
          sm:static sm:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div>
          {/* Brand Header */}
          <div className="mb-6 flex items-center justify-between border-b border-rose-900/60 pb-4 pt-1 px-2">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white font-extrabold text-lg shadow-lg">
                C
              </div>
              <div>
                <h2 className="text-base font-extrabold tracking-tight text-white leading-tight">
                  CHERRY GLOW
                </h2>
                <p className="text-[10px] uppercase font-semibold text-rose-300/80 tracking-widest">
                  Admin Panel
                </p>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="sm:hidden rounded-lg p-1.5 text-rose-300 hover:bg-rose-900 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Super Admin Status Pill */}
          {isSuperAdmin && (
            <div className="mb-5 rounded-xl bg-gradient-to-r from-amber-950/80 to-rose-950 border border-amber-500/30 p-3 flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs font-bold text-amber-200">Super Admin Mode</p>
                <p className="text-[10px] text-amber-300/70">Full control & permissions</p>
              </div>
            </div>
          )}

          {/* Nav Group List */}
          <nav className="space-y-5 overflow-y-auto max-h-[calc(100vh-220px)] pr-1 scrollbar-thin scrollbar-thumb-rose-800">
            {navigation.map((group, idx) => (
              <div key={idx} className="space-y-1.5">
                <h3 className="px-3 text-[10px] font-bold uppercase tracking-wider text-rose-400/70">
                  {group.group}
                </h3>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    item.href === "/admin"
                      ? pathname === "/admin"
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setOpen(false)}
                      className={`
                        group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-200
                        ${
                          isActive
                            ? "bg-rose-800 text-white font-semibold shadow-md shadow-rose-950 border border-rose-700/60"
                            : "text-rose-200/80 hover:bg-rose-900/60 hover:text-white"
                        }
                      `}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon
                          className={`h-4 w-4 transition-transform duration-200 group-hover:scale-110 ${
                            isActive ? "text-rose-200" : "text-rose-400"
                          }`}
                        />
                        <span>{item.name}</span>
                      </div>
                      {isActive && <ChevronRight className="h-3.5 w-3.5 text-rose-300" />}
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer / User Sign Out */}
        <div className="border-t border-rose-900/60 pt-3">
          <button
            onClick={logout}
            className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium text-rose-300 hover:bg-rose-900/70 hover:text-white transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="h-4 w-4 text-rose-400" />
              <span>Sign Out</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}
