"use client";

import { useEffect, useState } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import {
  House,
  LayoutGrid,
  ShoppingCart,
  Heart,
  User,
} from "lucide-react";

export default function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { totalItems } = useCart();
  const { wishlistCount } = useWishlist();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const tBottomNav = useTranslations("bottomNav");

  // Safely get translated string or fallback to English default
  const getLabel = (key: string, fallback: string) => {
    try {
      const translation = tBottomNav(key);
      return translation && !translation.includes("bottomNav.") ? translation : fallback;
    } catch {
      return fallback;
    }
  };

  // Do not render bottom nav on admin routes
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  const currentPath = pathname || "/";

  const isHomeActive = currentPath === "/";
  const isCategoriesActive =
    currentPath === "/categories" ||
    currentPath.startsWith("/categories/") ||
    currentPath === "/products" ||
    currentPath.startsWith("/products/");
  const isCartActive = currentPath === "/cart" || currentPath.startsWith("/cart/");
  const isWishlistActive =
    currentPath === "/wishlist" || currentPath.startsWith("/wishlist/");
  const isAccountActive =
    currentPath === "/account" ||
    currentPath.startsWith("/account/") ||
    currentPath === "/profile" ||
    currentPath.startsWith("/profile/") ||
    (!user && (currentPath === "/login" || currentPath === "/register"));

  const navItems = [
    {
      id: "home",
      label: getLabel("home", "Home"),
      href: "/",
      icon: House,
      isActive: isHomeActive,
      badge: 0,
    },
    {
      id: "categories",
      label: getLabel("categories", "Categories"),
      href: "/categories",
      icon: LayoutGrid,
      isActive: isCategoriesActive,
      badge: 0,
    },
    {
      id: "cart",
      label: getLabel("cart", "Cart"),
      href: "/cart",
      icon: ShoppingCart,
      isActive: isCartActive,
      badge: mounted ? totalItems : 0,
    },
    {
      id: "wishlist",
      label: getLabel("wishlist", "Wishlist"),
      href: "/wishlist",
      icon: Heart,
      isActive: isWishlistActive,
      badge: mounted ? wishlistCount : 0,
    },
    {
      id: "account",
      label: getLabel("account", "Account"),
      href: user ? "/account" : "/login",
      icon: User,
      isActive: isAccountActive,
      badge: 0,
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 dark:bg-[#140b0f]/95 backdrop-blur-md border-t border-rose-100/70 dark:border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)] transition-all duration-300"
      style={{
        paddingBottom: "env(safe-area-inset-bottom, 0px)",
      }}
    >
      <div className="grid grid-cols-5 h-16 w-full max-w-lg mx-auto items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 select-none group ${
                active
                  ? "text-rose-600 dark:text-rose-400"
                  : "text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-rose-200"
              }`}
            >
              {/* Active Tab Top Indicator Glow */}
              {active && (
                <span className="absolute -top-[9px] w-8 h-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 shadow-sm shadow-rose-500/50 animate-in fade-in zoom-in duration-200" />
              )}

              {/* Icon Container with Badge */}
              <div className="relative flex items-center justify-center">
                <Icon
                  size={20}
                  strokeWidth={active ? 2.3 : 1.8}
                  className={`transition-transform duration-200 ${
                    active ? "scale-110 drop-shadow-xs" : "group-hover:scale-105"
                  }`}
                />

                {/* Badge for Cart & Wishlist */}
                {item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[17px] h-[17px] px-1 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-[10px] font-extrabold flex items-center justify-center ring-2 ring-white dark:ring-[#140b0f] shadow-xs animate-in zoom-in duration-150">
                    {item.badge > 99 ? "99+" : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] sm:text-[11px] mt-1 tracking-tight truncate max-w-[64px] leading-tight ${
                  active ? "font-bold text-rose-600 dark:text-rose-400" : "font-medium"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
