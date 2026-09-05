"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, LayoutDashboard, User as UserIcon, Heart, ChevronRight, Sparkles, Truck, Flame, Sun, LogIn, UserPlus, ShieldCheck, CreditCard, Settings, Package } from "lucide-react";
import Cart from "./Cart";
import { useWishlist } from "@/context/WishlistContext";
import NavbarSearch from "./NavbarSearch";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();
  const tNav = useTranslations("nav");
  const tTopbar = useTranslations("topbar");

  const [freeShippingThreshold, setFreeShippingThreshold] = useState(3000);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const apiHost =
          process.env.NEXT_PUBLIC_API_URL ||
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          "http://localhost:5000";

        let res;
        try {
          res = await axios.get(`${apiHost}/api/settings`);
        } catch {
          res = await axios.get(`${apiHost}/settings`);
        }

        const s = res?.data?.data || res?.data;
        const threshold =
          s?.shipping?.freeShippingThreshold ??
          s?.freeShippingThreshold ??
          s?.shipping?.freeShippingMinimum ??
          s?.freeShippingMinimum;

        if (threshold !== undefined && threshold !== null) {
          setFreeShippingThreshold(Number(threshold));
        }
      } catch (err) {
        console.error("Failed to load settings in Topbar:", err);
      }
    };

    fetchSettings();

    const handleSettingsUpdate = () => {
      fetchSettings();
    };

    window.addEventListener("settingsUpdated", handleSettingsUpdate);
    return () => {
      window.removeEventListener("settingsUpdated", handleSettingsUpdate);
    };
  }, []);

  // Do not render public Navbar on Admin or Checkout pages
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/checkout")) {
    return null;
  }

  const navLinks = [
    { name: tNav("home"), href: "/" },
    { name: tNav("products"), href: "/products" },
    { name: tNav("combo"), href: "/combo" },
    { name: tNav("about"), href: "/about" },
    { name: tNav("contact"), href: "/contact" },
  ];

  const handleLogout = () => {
    try {
      logout();
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleBestSellersClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/" || pathname === "" || pathname === "/en" || pathname === "/bn") {
      const el = document.getElementById("best-sellers");
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/" || pathname === "" || pathname === "/en" || pathname === "/bn") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-rose-100/80 bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-[#1C1417]/95 transition-colors shadow-xs">

      {/* 1. Amazon/Daraz Style Top Utility Bar (Desktop Only) */}
      <div className="hidden md:block bg-stone-900 text-stone-200 text-xs py-2 px-4 sm:px-8 border-b border-stone-800 dark:bg-[#140A0D] dark:border-white/5">
        <div className="mx-auto flex max-w-[1536px] items-center justify-between">
          <div className="flex items-center gap-5 font-semibold text-xs sm:text-[13px]">
            <span className="flex items-center gap-1.5 text-amber-300">
              <ShieldCheck size={15} className="text-amber-400 shrink-0" />
              <span>{tTopbar("authentic")}</span>
            </span>
            <span className="text-stone-700">•</span>
            <span className="flex items-center gap-1.5 text-emerald-300">
              <CreditCard size={15} className="text-emerald-400 shrink-0" />
              <span>{tTopbar("cod")}</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-rose-300 font-semibold text-xs sm:text-[13px]">
              <Truck size={15} className="text-rose-400 shrink-0" />
              <span>{tTopbar("freeDeliveryOver", { threshold: freeShippingThreshold.toLocaleString() })}</span>
            </span>
            <div className="flex items-center gap-2">
              <LanguageSwitcher variant="dark" />
              <ThemeToggle variant="dark" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Primary Header Bar (Logo + Full Search Bar + Quick Actions) */}
      <div className="mx-auto flex h-16 max-w-[1536px] items-center justify-between px-3 sm:px-6 lg:px-8 gap-3 sm:gap-6">

        {/* Brand Logo */}
        <Link href="/" onClick={handleLogoClick} className="flex items-center gap-2 group shrink-0 min-w-0">
          <Image
            src="/logo.png"
            alt="Cherry Glow Korea"
            width={34}
            height={34}
            className="transition-transform group-hover:scale-105 shrink-0"
          />
          <div className="flex items-baseline gap-1 truncate">
            <span className="font-serif text-lg sm:text-2xl font-bold tracking-tight text-stone-900 dark:text-white truncate">
              Cherry Glow
            </span>
            <span className="font-serif text-lg sm:text-2xl italic font-semibold text-rose-500 dark:text-rose-400 hidden sm:inline">
              Korea
            </span>
          </div>
        </Link>

        {/* Amazon/Daraz Style Wide Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-xl lg:max-w-2xl mx-2">
          <NavbarSearch />
        </div>

        {/* Right Action Icons (Wishlist, Cart, Profile) */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Wishlist Button */}
          <Link
            href="/wishlist"
            title="Wishlist"
            className="group relative flex h-10 items-center gap-1.5 px-3.5 rounded-full border border-stone-200/80 bg-stone-50/60 hover:bg-rose-50 hover:border-rose-200 text-stone-700 dark:border-white/10 dark:bg-white/5 dark:text-rose-100 dark:hover:bg-white/10 transition-all cursor-pointer"
          >
            <div className="relative flex items-center justify-center">
              <Heart size={18} className="text-rose-500 dark:text-rose-400 transition-transform group-hover:scale-110" />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-extrabold text-white">
                  {wishlistCount}
                </span>
              )}
            </div>
            <span className="hidden lg:inline text-xs font-semibold">{tNav("wishlist")}</span>
          </Link>

          {/* Cart Drawer */}
          <Cart />

          {/* User Profile Avatar & Dropdown */}
          <div className="hidden md:block">
            {!user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 items-center gap-1.5 px-4 rounded-full border border-rose-200/80 bg-rose-50/60 hover:bg-rose-100/80 hover:border-rose-300 text-rose-600 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 dark:hover:bg-rose-900/50 text-xs font-bold transition cursor-pointer outline-none"
                  >
                    <UserIcon size={16} className="text-rose-500 dark:text-rose-300" />
                    <span>{tNav("loginOrRegister")}</span>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-48 rounded-2xl p-1.5 shadow-xl border border-stone-200 dark:border-white/10 dark:bg-[#23181C]">
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                    <Link href="/login" className="flex w-full items-center gap-2 font-bold text-stone-800 dark:text-stone-200 py-2 px-1">
                      <LogIn size={15} className="text-stone-500" />
                      <span>{tNav("login")}</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                    <Link href="/register" className="flex w-full items-center gap-2 font-bold text-rose-600 dark:text-rose-400 py-2 px-1">
                      <UserPlus size={15} className="text-rose-500" />
                      <span>{tNav("register")}</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex h-10 items-center gap-2 px-2 rounded-full border border-stone-200/80 hover:border-rose-300 dark:border-white/10 hover:bg-stone-50 dark:hover:bg-white/5 transition cursor-pointer outline-none"
                  >
                    <Avatar className="h-8 w-8 border border-rose-200/60 bg-white text-rose-500 shadow-xs dark:border-white/10 dark:bg-white/5 dark:text-rose-300">
                      {user?.photoURL || user?.avatar ? (
                        <AvatarImage src={user.photoURL || user.avatar} alt={user.name || "User"} />
                      ) : (
                        <AvatarFallback className="bg-rose-50 text-rose-600 font-semibold text-xs dark:bg-white/10 dark:text-rose-300">
                          {user?.name?.charAt(0)?.toUpperCase() || <UserIcon size={15} />}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="hidden xl:inline text-xs font-bold text-stone-800 dark:text-stone-200 pr-1 max-w-[100px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                  </button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 shadow-xl border border-stone-200 dark:border-white/10 dark:bg-[#23181C]">
                  <div className="px-2 py-2 text-xs">
                    <p className="font-bold text-stone-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-stone-500 dark:text-stone-400 text-[11px] truncate">
                      {user.email || user.phone}
                    </p>
                  </div>

                  <DropdownMenuSeparator className="bg-stone-100 dark:bg-white/10" />

                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                    <Link href="/profile" className="flex items-center gap-2 font-medium">
                      <Settings size={16} />
                      <span>My Profile & Settings</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                    <Link href="/profile?tab=orders" className="flex items-center gap-2 font-medium">
                      <Package size={16} />
                      <span>My Orders</span>
                    </Link>
                  </DropdownMenuItem>

                  {["admin", "super_admin", "manager"].includes(user.role) && (
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link href="/admin" className="flex items-center gap-2 font-medium">
                        <LayoutDashboard size={16} />
                        {tNav("dashboard")}
                      </Link>
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="rounded-xl cursor-pointer text-red-600 dark:text-red-400 font-medium focus:bg-red-50 dark:focus:bg-red-950/30"
                  >
                    <LogOut size={16} className="mr-2" />
                    {tNav("logout")}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Mobile Menu Drawer Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="md:hidden flex items-center justify-center rounded-full text-stone-700 dark:text-rose-100 hover:bg-rose-50 dark:hover:bg-white/10 h-9 w-9 shrink-0 transition cursor-pointer"
                aria-label="Open Mobile Menu"
              >
                <Menu size={22} />
              </button>
            </SheetTrigger>

            <SheetContent side="right" className="w-[82vw] max-w-xs dark:bg-[#1C1417] dark:border-white/10 p-5 flex flex-col justify-between">

              <div className="space-y-6">
                {/* Mobile Drawer Title */}
                <SheetTitle className="font-serif text-lg font-bold text-stone-900 dark:text-white border-b border-stone-100 dark:border-white/10 pb-3 flex items-center gap-2">
                  <Image src="/logo.png" alt="Cherry Glow" width={28} height={28} />
                  <span>Cherry Glow <span className="italic text-rose-500">Korea</span></span>
                </SheetTitle>

                {/* Mobile User Profile Card */}
                <div className="p-3.5 rounded-2xl bg-stone-50 dark:bg-white/5 border border-stone-200/80 dark:border-white/10">
                  {!user ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-xs">
                        <p className="font-bold text-stone-900 dark:text-white">{tNav("welcomeGuest")}</p>
                        <p className="text-stone-400 text-[10px]">{tNav("signInTracking")}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href="/login"
                          className="px-3 py-1.5 rounded-xl bg-rose-500 text-white font-bold text-xs"
                        >
                          {tNav("login")}
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-rose-200">
                          {user?.photoURL || user?.avatar ? (
                            <AvatarImage src={user.photoURL || user.avatar} alt={user.name} />
                          ) : (
                            <AvatarFallback className="bg-rose-50 text-rose-600 font-bold">
                              {user?.name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="min-w-0 text-xs">
                          <p className="font-bold text-stone-900 dark:text-white truncate">{user.name}</p>
                          <p className="text-[10px] text-stone-400 truncate">{user.email || user.phone}</p>
                        </div>
                      </div>

                      {["admin", "super_admin", "manager"].includes(user.role) && (
                        <Link href="/admin" className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600">
                          <LayoutDashboard size={16} />
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 px-3">{tNav("navigation")}</p>
                  {navLinks.map((link) => {
                    const isActive =
                      pathname === link.href ||
                      (link.href !== "/" && pathname?.startsWith(link.href));

                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`text-sm font-bold px-3 py-2.5 rounded-xl transition-all flex items-center justify-between ${
                          isActive
                            ? "bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200/60 dark:border-rose-900/40"
                            : "text-stone-700 dark:text-rose-100/80 hover:bg-stone-100 dark:hover:bg-white/5"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          {isActive && <span className="h-2 w-2 rounded-full bg-rose-500" />}
                          {link.name}
                        </span>
                        <ChevronRight size={14} className="opacity-40" />
                      </Link>
                    );
                  })}
                </nav>

                {/* Quick Featured Collections (Mobile) */}
                <div className="space-y-1.5 pt-2 border-t border-stone-100 dark:border-white/10">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 px-3">{tNav("featuredCollections")}</p>
                  <Link
                    href="/#best-sellers"
                    onClick={handleBestSellersClick}
                    className="text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center justify-between text-stone-800 dark:text-rose-100 hover:bg-rose-50 dark:hover:bg-white/5"
                  >
                    <span className="flex items-center gap-2">
                      <Flame size={15} className="text-amber-500 fill-amber-500/20" />
                      {tNav("bestSellers")}
                    </span>
                    <ChevronRight size={14} className="opacity-40" />
                  </Link>

                  <Link
                    href="/products?category=Serum"
                    className="text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center justify-between text-stone-800 dark:text-rose-100 hover:bg-rose-50 dark:hover:bg-white/5"
                  >
                    <span className="flex items-center gap-2">
                      <Sparkles size={14} className="text-rose-400" />
                      {tNav("serumsEssence")}
                    </span>
                    <ChevronRight size={14} className="opacity-40" />
                  </Link>

                  <Link
                    href="/products?category=Sunscreen"
                    className="text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center justify-between text-stone-800 dark:text-rose-100 hover:bg-rose-50 dark:hover:bg-white/5"
                  >
                    <span className="flex items-center gap-2">
                      <Sun size={15} className="text-amber-400" />
                      {tNav("sunProtection")}
                    </span>
                    <ChevronRight size={14} className="opacity-40" />
                  </Link>
                </div>

                {/* Mobile App Settings (Language & Theme) */}
                <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-white/10">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 px-3">{tNav("preferences")}</p>
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-50 dark:bg-white/5">
                    <span className="text-xs font-bold text-stone-600 dark:text-rose-100/70">{tNav("language")}</span>
                    <LanguageSwitcher />
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-50 dark:bg-white/5">
                    <span className="text-xs font-bold text-stone-600 dark:text-rose-100/70">{tNav("themeMode")}</span>
                    <ThemeToggle />
                  </div>
                </div>

              </div>

              {/* Mobile Logout Button */}
              {user && (
                <button
                  onClick={handleLogout}
                  className="w-full mt-6 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 text-xs font-bold flex items-center justify-center gap-2 border border-rose-200/60 dark:border-rose-900/40 cursor-pointer"
                >
                  <LogOut size={16} /> {tNav("logout")}
                </button>
              )}

            </SheetContent>
          </Sheet>

        </div>
      </div>

      {/* 3. Sub-Header Category Nav Bar (Desktop Row 2) */}
      <div className="hidden md:block border-t border-stone-100 bg-stone-50/80 dark:border-white/5 dark:bg-[#140A0D]/80 py-2.5 px-4 sm:px-8">
        <div className="mx-auto flex max-w-[1536px] items-center justify-between text-sm font-semibold">
          <nav className="flex items-center gap-7">
            {navLinks.map((link) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/" && pathname?.startsWith(link.href));

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-[14px] font-bold transition-all hover:text-rose-600 dark:hover:text-rose-300 py-1 ${
                    isActive
                      ? "text-rose-600 dark:text-rose-400 font-extrabold"
                      : "text-stone-800 dark:text-rose-100/90"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <span className="absolute -bottom-1 left-0 right-0 h-[2.5px] rounded-full bg-rose-500 dark:bg-rose-400 shadow-xs" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4 text-stone-700 dark:text-stone-200 text-xs sm:text-[13px] font-semibold">
            <Link
              href="/#best-sellers"
              onClick={handleBestSellersClick}
              className="hover:text-rose-600 dark:hover:text-rose-300 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Flame size={15} className="text-amber-500 fill-amber-500/20 shrink-0" />
              <span>{tNav("bestSellers")}</span>
            </Link>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <Link href="/products?category=Serum" className="hover:text-rose-600 dark:hover:text-rose-300 transition flex items-center gap-1.5">
              <Sparkles size={14} className="text-rose-400 shrink-0" />
              <span>{tNav("serumsEssence")}</span>
            </Link>
            <span className="text-stone-300 dark:text-stone-700">•</span>
            <Link href="/products?category=Sunscreen" className="hover:text-rose-600 dark:hover:text-rose-300 transition flex items-center gap-1.5">
              <Sun size={15} className="text-amber-400 shrink-0" />
              <span>{tNav("sunProtection")}</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4. Mobile Search Bar Row (Mobile Row 2) */}
      <div className="block md:hidden border-t border-stone-100 dark:border-white/10 px-3 py-2 bg-stone-50/70 dark:bg-[#160D10]/80">
        <NavbarSearch isMobile={true} />
      </div>

    </header>
  );
}
