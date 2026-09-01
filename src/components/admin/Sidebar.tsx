"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  ShoppingBag,
  Users,
  Image as ImageIcon,
  Menu,
  X,
  Layers,
  Star,
  Tag,
  Ticket,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  User,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, logout } = useAuth();

  const toggleGroup = (groupName: string) => {
    setCollapsedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
  };

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
        { name: "Categories", href: "/admin/categories", icon: Tag },
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
        { name: "Coupons & Discounts", href: "/admin/coupons", icon: Ticket },
        { name: "Customer Reviews", href: "/admin/reviews", icon: Star },
        { name: "Hero Banners", href: "/admin/banner", icon: ImageIcon },
      ],
    },
    {
      group: "SYSTEM & SETTINGS",
      items: [
        { name: "Store Settings", href: "/admin/settings", icon: Settings },
      ],
    },
  ];

  const isItemActive = (href: string) => {
    if (!pathname) return false;

    const currentType = searchParams?.get("type");

    if (href === "/admin") {
      return (
        pathname === "/admin" ||
        pathname === "/en/admin" ||
        pathname === "/bn/admin" ||
        pathname === "/ko/admin"
      );
    }

    if (href.includes("?")) {
      const [basePath, search] = href.split("?");
      const params = new URLSearchParams(search);
      const targetType = params.get("type");
      const matchesPath = pathname.endsWith(basePath) || pathname.includes(basePath);
      return matchesPath && currentType === targetType;
    }

    if (href === "/admin/products") {
      const matchesPath = pathname.endsWith("/admin/products") || pathname.includes("/admin/products");
      return matchesPath && currentType !== "combo";
    }

    if (href === "/admin/orders") {
      return (
        (pathname.endsWith("/admin/orders") || pathname.includes("/admin/orders")) &&
        !pathname.includes("/create")
      );
    }

    return pathname.endsWith(href) || pathname.includes(href);
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 left-3 z-50 rounded-xl border border-rose-900/60 bg-[#140A0D] p-2.5 shadow-xl sm:hidden text-stone-200 hover:bg-rose-950 transition-colors cursor-pointer"
        aria-label="Open Sidebar"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Backdrop (mobile) */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm sm:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`
          fixed top-0 left-0 z-40 h-screen w-64 transform bg-[#140A0D] border-r border-rose-950/60 p-4 text-stone-300 flex flex-col justify-between
          transition-all duration-300 ease-in-out shadow-2xl
          sm:sticky sm:top-0 sm:translate-x-0 shrink-0
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex flex-col min-h-0 flex-1">
          {/* Brand Header */}
          <div className="mb-5 flex items-center justify-between border-b border-rose-950/60 pb-4 pt-1 px-2 shrink-0">
            <Link href="/admin" className="flex items-center gap-2.5 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white font-extrabold text-lg shadow-md group-hover:scale-105 transition-transform shrink-0">
                C
              </div>
              <div>
                <h2 className="text-base font-extrabold tracking-tight text-stone-100 leading-tight">
                  CHERRY GLOW
                </h2>
                <p className="text-[10px] uppercase font-bold text-rose-400/90 tracking-widest">
                  Admin Panel
                </p>
              </div>
            </Link>

            {/* Mobile Close Button */}
            <button
              onClick={() => setOpen(false)}
              className="sm:hidden rounded-lg p-1.5 text-stone-400 hover:bg-rose-950 hover:text-white transition-colors cursor-pointer"
              aria-label="Close Sidebar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Nav Group List */}
          <nav className="flex-1 space-y-4 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-stone-800 scrollbar-track-transparent">
            {navigation.map((group, idx) => {
              const isCollapsed = !!collapsedGroups[group.group];

              return (
                <div key={idx} className="space-y-1">
                  {/* Collapsible Section Header */}
                  <button
                    type="button"
                    onClick={() => toggleGroup(group.group)}
                    className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-stone-400 hover:text-stone-200 transition-colors group cursor-pointer select-none"
                  >
                    <span>{group.group}</span>
                    <span className="text-stone-500 group-hover:text-stone-300 transition-colors">
                      {isCollapsed ? (
                        <ChevronRight className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                    </span>
                  </button>

                  {/* Nav Items */}
                  {!isCollapsed && (
                    <div className="space-y-1 pt-0.5">
                      {group.items.map((item) => {
                        const Icon = item.icon;
                        const active = isItemActive(item.href);

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={`
                              relative group flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-medium transition-all duration-150 overflow-hidden
                              ${
                                active
                                  ? "bg-rose-950/70 text-rose-300 font-semibold border border-rose-500/20 shadow-sm before:absolute before:left-0 before:top-1.5 before:bottom-1.5 before:w-1 before:bg-rose-500 before:rounded-r-full"
                                  : "text-stone-300 hover:text-stone-100 hover:bg-white/5"
                              }
                            `}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <Icon
                                className={`h-4 w-4 shrink-0 transition-transform duration-150 group-hover:scale-105 ${
                                  active
                                    ? "text-rose-400"
                                    : "text-stone-400 group-hover:text-rose-400 transition-colors"
                                }`}
                                strokeWidth={1.75}
                              />
                              <span className="truncate">{item.name}</span>
                            </div>
                            {active && (
                              <div className="h-1.5 w-1.5 rounded-full bg-rose-500 shrink-0 shadow-[0_0_8px_#f43f5e]" />
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer / User & Sign Out */}
        <div className="border-t border-rose-950/60 pt-3 mt-3 shrink-0 space-y-2">
          {/* User Info Card */}
          <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-white/5 border border-white/5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-rose-600 to-rose-400 flex items-center justify-center text-white font-extrabold text-xs shadow-sm shrink-0">
                {user?.name ? user.name[0].toUpperCase() : <User className="h-4 w-4" />}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-stone-200 truncate leading-tight">
                  {user?.name || "Admin User"}
                </p>
                <p className="text-[10px] uppercase font-semibold text-rose-400/90 tracking-wider truncate mt-0.5">
                  {user?.role || "Admin"}
                </p>
              </div>
            </div>
          </div>

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium text-stone-400 hover:text-rose-400 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/40 transition-all duration-150 cursor-pointer group"
          >
            <div className="flex items-center gap-2.5">
              <LogOut className="h-4 w-4 text-stone-400 group-hover:text-rose-400 transition-colors" strokeWidth={1.75} />
              <span>Sign Out</span>
            </div>
          </button>
        </div>
      </aside>
    </>
  );
}

