"use client";

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
import { Menu, LogOut, LayoutDashboard, User as UserIcon, Heart, ChevronRight } from "lucide-react";
import Cart from "./Cart";
import { useWishlist } from "@/context/WishlistContext";
import NavbarSearch from "./NavbarSearch";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();
  const tNav = useTranslations("nav");

  // Do not render public Navbar on Admin or Checkout pages
  if (pathname?.startsWith("/admin") || pathname?.startsWith("/checkout")) {
    return null;
  }

  const navLinks = [
    { name: tNav("home"), href: "/" },
    { name: tNav("products"), href: "/products" },
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

  return (
    <header className="sticky top-0 z-50 w-full border-b border-rose-100/60 bg-white/95 backdrop-blur-md dark:border-white/10 dark:bg-[#1C1417]/95 transition-colors">
      
      {/* Primary Amazon-Style Header Bar */}
      <div className="mx-auto flex h-16 max-w-[1536px] items-center justify-between px-3 sm:px-6 lg:px-8 gap-3 sm:gap-6">
        
        {/* 1. Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group shrink-0 min-w-0">
          <Image
            src="/logo.png"
            alt="Cherry Glow Korea"
            width={32}
            height={32}
            className="transition-transform group-hover:scale-105 shrink-0"
          />
          <div className="flex items-baseline gap-1 truncate">
            <span className="font-serif text-base sm:text-xl font-bold tracking-tight text-stone-900 dark:text-white truncate">
              Cherry Glow
            </span>
            <span className="font-serif text-base sm:text-xl italic font-semibold text-rose-500 dark:text-rose-400 hidden sm:inline">
              Korea
            </span>
          </div>
        </Link>

        {/* 2. Amazon Style Permanent Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-sm lg:max-w-md">
          <NavbarSearch />
        </div>

        {/* 3. Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center gap-6">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`text-[14px] font-medium transition-colors hover:text-rose-500 dark:hover:text-rose-300 ${
                  isActive
                    ? "text-rose-600 font-semibold dark:text-rose-400"
                    : "text-stone-600 dark:text-rose-100/70"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* 4. Right Actions Header */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Desktop-only items */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>

          {/* Wishlist Button (Mobile & Desktop) */}
          <Link
            href="/wishlist"
            title="Wishlist"
            className="group relative flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full border border-rose-200/60 bg-white/70 text-rose-500 shadow-xs backdrop-blur transition-all hover:bg-rose-50 dark:border-white/10 dark:bg-white/5 dark:text-rose-300 dark:hover:bg-white/10 cursor-pointer"
          >
            <Heart size={18} className="transition-transform group-hover:scale-110 text-rose-500 dark:text-rose-300" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-rose-500 px-1 text-[10px] font-extrabold text-white shadow-xs ring-2 ring-white dark:ring-[#1C1417]">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart Drawer (Mobile & Desktop) */}
          <Cart />

          {/* Desktop User Profile Avatar & Dropdown */}
          <div className="hidden md:block">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="relative rounded-full transition hover:scale-105 cursor-pointer outline-none shrink-0"
                >
                  <Avatar className="h-10 w-10 border border-rose-200/60 bg-white/70 text-rose-500 shadow-xs dark:border-white/10 dark:bg-white/5 dark:text-rose-300">
                    {user?.photoURL || user?.avatar ? (
                      <AvatarImage src={user.photoURL || user.avatar} alt={user.name || "User"} />
                    ) : (
                      <AvatarFallback className="bg-rose-50 text-rose-600 font-semibold text-sm dark:bg-white/10 dark:text-rose-300">
                        {user?.name?.charAt(0)?.toUpperCase() || <UserIcon size={18} />}
                      </AvatarFallback>
                    )}
                  </Avatar>
                </button>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="w-52 rounded-xl p-2 shadow-xl border border-stone-200 dark:border-white/10 dark:bg-[#23181C]">
                {!user ? (
                  <>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                      <Link href="/login" className="flex w-full items-center font-medium">
                        {tNav("login")}
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-lg cursor-pointer text-rose-600 dark:text-rose-400 font-medium">
                      <Link href="/register" className="flex w-full items-center">
                        {tNav("register")}
                      </Link>
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <div className="px-2 py-1.5 text-xs">
                      <p className="font-semibold text-stone-900 dark:text-white truncate">
                        {user.name}
                      </p>
                      <p className="text-stone-500 dark:text-stone-400 truncate">
                        {user.email || user.phone}
                      </p>
                    </div>

                    <DropdownMenuSeparator className="bg-stone-100 dark:bg-white/10" />

                    {["admin", "super_admin"].includes(user.role) && (
                      <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                        <Link href="/admin" className="flex items-center gap-2 font-medium">
                          <LayoutDashboard size={16} />
                          {tNav("dashboard")}
                        </Link>
                      </DropdownMenuItem>
                    )}

                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="rounded-lg cursor-pointer text-red-600 dark:text-red-400 font-medium focus:bg-red-50 dark:focus:bg-red-950/30"
                    >
                      <LogOut size={16} className="mr-2" />
                      {tNav("logout")}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Mobile Menu Drawer Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full text-stone-700 dark:text-rose-100 hover:bg-rose-50 dark:hover:bg-white/10 h-9 w-9 shrink-0"
                aria-label="Open Mobile Menu"
              >
                <Menu size={22} />
              </Button>
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
                        <p className="font-bold text-stone-900 dark:text-white">Welcome Guest!</p>
                        <p className="text-stone-400 text-[10px]">Sign in for order tracking</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Link
                          href="/login"
                          className="px-3 py-1.5 rounded-xl bg-rose-500 text-white font-bold text-xs"
                        >
                          Login
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

                      {["admin", "super_admin"].includes(user.role) && (
                        <Link href="/admin" className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600">
                          <LayoutDashboard size={16} />
                        </Link>
                      )}
                    </div>
                  )}
                </div>

                {/* Mobile Navigation Links */}
                <nav className="flex flex-col gap-1.5">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 px-3">Navigation</p>
                  {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        className={`text-sm font-bold px-3 py-2.5 rounded-xl transition-all flex items-center justify-between ${
                          isActive
                            ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300"
                            : "text-stone-700 dark:text-rose-100/80 hover:bg-stone-100 dark:hover:bg-white/5"
                        }`}
                      >
                        <span>{link.name}</span>
                        <ChevronRight size={14} className="opacity-40" />
                      </Link>
                    );
                  })}
                </nav>

                {/* Mobile App Settings (Language & Theme) */}
                <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-white/10">
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 px-3">Preferences</p>
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-50 dark:bg-white/5">
                    <span className="text-xs font-bold text-stone-600 dark:text-rose-100/70">Language</span>
                    <LanguageSwitcher />
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-50 dark:bg-white/5">
                    <span className="text-xs font-bold text-stone-600 dark:text-rose-100/70">Theme Mode</span>
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
                  <LogOut size={16} /> Log Out
                </button>
              )}

            </SheetContent>
          </Sheet>

        </div>
      </div>

      {/* Amazon Style Permanent Mobile Search Bar (Row 2 on Mobile) */}
      <div className="block md:hidden border-t border-stone-100 dark:border-white/10 px-3 py-2 bg-stone-50/70 dark:bg-[#160D10]/80">
        <NavbarSearch isMobile={true} />
      </div>

    </header>
  );
}
