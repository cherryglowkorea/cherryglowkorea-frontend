"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import axios from "axios";
import { X, Sparkles, ShoppingBag, Maximize2, Minimize2 } from "lucide-react";

export default function PromoPopup() {
  const [banner, setBanner] = useState<any>(null);
  const [open, setOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Only show promo popup on home page / landing page
  const normalizedPath = pathname ? pathname.replace(/^\/([a-z]{2})(\/|$)/i, "/") : "/";
  const isHomePage = normalizedPath === "/" || normalizedPath === "";

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";
  const API = `${API_BASE}/banners/promo-banner`;

  useEffect(() => {
    if (!isHomePage) return;
    // Check if user already dismissed promo in this session
    const dismissed = sessionStorage.getItem("promo_dismissed");
    if (dismissed) return;

    const fetchBanner = async () => {
      try {
        const res = await axios.get(API);

        const data = Array.isArray(res.data)
          ? res.data.find((b) => b.isActive)
          : res.data;

        if (data && data.isActive && data.image) {
          setBanner(data);
          setOpen(true);
        }
      } catch {
        // Silently ignore 404/network errors
      }
    };

    fetchBanner();
  }, [API, isHomePage]);

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(false);
    sessionStorage.setItem("promo_dismissed", "true");
  };

  if (!isHomePage || !open || !banner) return null;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 transition-all duration-300">
      {isMinimized ? (
        /* Minimized Floating Bubble Button */
        <button
          onClick={() => setIsMinimized(false)}
          className="group relative flex items-center gap-2.5 rounded-full bg-gradient-to-r from-rose-500 to-pink-600 p-2.5 pr-4 text-white shadow-2xl hover:scale-105 transition-all cursor-pointer border-2 border-white/20 animate-bounce"
          style={{ animationDuration: "3s" }}
        >
          <div className="relative h-9 w-9 overflow-hidden rounded-full border border-white/30 shrink-0">
            <Image
              src={banner.image}
              alt="Promo"
              fill
              sizes="36px"
              className="object-cover"
            />
          </div>
          <div className="text-left text-xs">
            <span className="font-extrabold block leading-tight flex items-center gap-1">
              <Sparkles size={12} className="text-amber-300 fill-amber-300" />
              Special Offer
            </span>
            <span className="text-[10px] text-rose-100 font-medium">Click to view</span>
          </div>

          <button
            onClick={handleClose}
            className="ml-1 p-1 rounded-full text-rose-200 hover:text-white hover:bg-white/20 transition"
            title="Dismiss"
          >
            <X size={13} />
          </button>
        </button>
      ) : (
        /* Compact Non-Intrusive Floating Corner Card with Zoom In/Out */
        <div className="relative w-80 sm:w-96 rounded-3xl bg-white dark:bg-[#1E1216] border border-rose-200 dark:border-rose-900/50 shadow-[0_15px_40px_rgba(0,0,0,0.3)] overflow-hidden animate-in zoom-in-95 duration-300 space-y-0">
          
          {/* Top Bar with Controls */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-rose-50 to-pink-50 dark:from-rose-950/60 dark:to-stone-900 border-b border-rose-100 dark:border-rose-900/30">
            <span className="text-xs font-black uppercase tracking-wider text-rose-600 dark:text-rose-300 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400 fill-amber-400" />
              <span>Special Offer</span>
            </span>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-200/50 dark:hover:bg-white/10 transition cursor-pointer"
                title="Minimize to side"
              >
                <Minimize2 size={14} />
              </button>

              <button
                onClick={handleClose}
                className="p-1 rounded-lg text-stone-400 hover:text-red-500 hover:bg-rose-100 dark:hover:bg-rose-950 transition cursor-pointer"
                title="Close"
              >
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Banner Image Preview */}
          <div className="relative w-full h-52 sm:h-64 bg-stone-900 overflow-hidden group">
            <Image
              src={banner.image}
              alt={banner.title || "Promo"}
              fill
              sizes="(max-width: 640px) 320px, 384px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              priority
            />
          </div>

          {/* CTA Footer Action */}
          <div className="p-3 bg-stone-50 dark:bg-[#160C10] flex items-center justify-between gap-2 border-t border-stone-100 dark:border-rose-950">
            <p className="text-[11px] font-semibold text-stone-600 dark:text-stone-300 truncate pl-1">
              {banner.title || "Don't miss our exclusive deals!"}
            </p>

            <button
              onClick={() => {
                setOpen(false);
                router.push("/products");
              }}
              className="h-8 px-4 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-xs transition active:scale-95 flex items-center gap-1.5 shrink-0 cursor-pointer"
            >
              <ShoppingBag size={13} />
              <span>Shop Now</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
