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
import { Menu, LogOut, LayoutDashboard, User as UserIcon, Heart } from "lucide-react";
import Cart from "./Cart";
import { useWishlist } from "@/context/WishlistContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { wishlistCount } = useWishlist();
  const router = useRouter();
  const pathname = usePathname();
  const tNav = useTranslations("nav");

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
    <header className="sticky top-0 z-50 w-full border-b border-rose-100/60 bg-white/85 backdrop-blur-md dark:border-white/10 dark:bg-[#1C1417]/85 transition-colors">
      <div className="mx-auto flex h-16 max-w-[1536px] items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <Image
            src="/logo.png"
            alt="Cherry Glow Korea"
            width={34}
            height={34}
            className="transition-transform group-hover:scale-105"
          />
          <div className="flex items-baseline gap-1">
            <span className="font-serif text-xl font-bold tracking-tight text-stone-900 dark:text-white">
              Cherry Glow
            </span>
            <span className="font-serif text-xl italic font-semibold text-rose-500 dark:text-rose-400">
              Korea
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
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

        {/* Right Actions */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Wishlist Button */}
          <Link
            href="/wishlist"
            title="Wishlist"
            className="relative p-2 rounded-full hover:bg-rose-50 dark:hover:bg-white/5 text-stone-700 dark:text-rose-100 transition duration-300 flex items-center justify-center"
          >
            <Heart className="w-5 h-5 hover:text-rose-500 transition" />
            {wishlistCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center shadow-2xs">
                {wishlistCount}
              </span>
            )}
          </Link>

          {/* Cart */}
          <Cart />

          {/* Dark / Light Mode Toggle */}
          <ThemeToggle />


          {/* User Avatar & Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="relative rounded-full transition hover:scale-105 cursor-pointer outline-none shrink-0"
              >
                <Avatar className="h-10 w-10 border border-rose-200/60 bg-white/70 text-rose-500 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-rose-300">
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

          {/* Mobile Menu Sheet */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden rounded-full text-stone-700 dark:text-rose-100 hover:bg-rose-50 dark:hover:bg-white/10"
              >
                <Menu size={22} />
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="w-72 dark:bg-[#1C1417] dark:border-white/10">
              <SheetTitle className="font-serif text-lg font-bold text-stone-900 dark:text-white">
                Cherry Glow <span className="italic text-rose-500">Korea</span>
              </SheetTitle>

              <nav className="mt-8 flex flex-col gap-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-base font-medium text-stone-700 transition-colors hover:text-rose-500 dark:text-rose-100/80"
                  >
                    {link.name}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
