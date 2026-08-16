"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useGetProductsQuery, useGetFeaturedProductsQuery } from "@/redux/api/ecommerceApi";
import { useCart } from "@/context/CartContext";
import {
  Zap,
  Clock,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  Star,
  Flame,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export default function CampaignSection() {
  const locale = useLocale();
  const isBn = locale === "bn";
  const { addToCart } = useCart();

  const { data: dbProducts = [], isLoading } = useGetProductsQuery() as any;

  // Helper: Extract valid price from product
  const getProductPrices = (p: any) => {
    const varPrice = (Array.isArray(p.variants) && p.variants.length > 0) ? Number(p.variants[0]?.price) : 0;
    const regular = Number(p.price || p.basePrice || varPrice) || 0;
    const sale = (Number(p.salePrice) > 0 && Number(p.salePrice) < regular)
      ? Number(p.salePrice)
      : regular;

    return { regularPrice: regular || sale, salePrice: sale || regular };
  };

  // Filter campaign products (products with sale discount or valid prices)
  const rawList = Array.isArray(dbProducts)
    ? dbProducts
    : dbProducts?.data && Array.isArray(dbProducts.data)
    ? dbProducts.data
    : [];

  const validProducts = rawList.filter((p: any) => {
    const { salePrice, regularPrice } = getProductPrices(p);
    return salePrice > 0 || regularPrice > 0;
  });

  const campaignProducts = validProducts
    .filter((p: any) => {
      const { regularPrice, salePrice } = getProductPrices(p);
      return salePrice < regularPrice;
    })
    .slice(0, 4);

  // If no discounted products found, fallback to top valid products
  const displayProducts = campaignProducts.length > 0 ? campaignProducts : validProducts.slice(0, 4);

  // Countdown timer state (Dynamic countdown timer e.g. 12h 45m 30s)
  const [timeLeft, setTimeLeft] = useState({ hours: 11, minutes: 48, seconds: 25 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (displayProducts.length === 0 && !isLoading) return null;

  return (
    <section className="relative my-8 sm:my-12 overflow-hidden">
      <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-8">
        {/* Main Campaign Container with Rich Gradient & Glassmorphic Accent */}
        <div className="relative rounded-3xl sm:rounded-[36px] bg-gradient-to-br from-[#1C0D13] via-[#2A121C] to-[#160B0F] border border-rose-500/30 p-5 sm:p-8 lg:p-10 shadow-[0_10px_40px_rgba(244,63,94,0.15)] text-white space-y-6 sm:space-y-8">
          
          {/* Decorative Glowing Background Effect */}
          <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-rose-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />

          {/* Campaign Header & Live Countdown */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5 border-b border-rose-900/40 pb-6">
            
            {/* Title & Badge */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-gradient-to-r from-rose-500/20 to-pink-500/20 border border-rose-500/40 text-rose-300 text-xs font-extrabold uppercase tracking-wider">
                <Zap size={14} className="text-amber-400 fill-amber-400 animate-pulse" />
                <span>{isBn ? "⚡ সীমিত সময়ের স্পেশাল ধামাকা অফার" : "⚡ Limited Time Flash Campaign"}</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight text-white flex items-center gap-2">
                <span>{isBn ? "আজকের স্পেশাল ক্যাম্পেইন ডিল" : "Special Campaign Deals"}</span>
                <Flame className="w-6 h-6 sm:w-8 sm:h-8 text-rose-500 fill-rose-500 animate-bounce" />
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-xl">
                {isBn
                  ? "অরিজিনাল কোরিয়ান স্কিনকেয়ার কসমেটিক্সে সেরা ডিসকাউন্ট। দ্রুত স্টক শেষ হওয়ার আগেই অর্ডার নিশ্চিত করুন!"
                  : "Authentic Korean Skincare items at unbeatable campaign prices. Claim your deals before stock runs out!"}
              </p>
            </div>

            {/* Live Countdown Timer Clock Box */}
            <div className="flex items-center gap-3 bg-white/5 border border-rose-500/30 backdrop-blur-md px-4 py-3 rounded-2xl shrink-0">
              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold mr-1">
                <Clock size={16} className="text-rose-400 animate-spin" style={{ animationDuration: "8s" }} />
                <span>{isBn ? "অফার শেষ হতে বাকি:" : "Ends In:"}</span>
              </div>

              <div className="flex items-center gap-1.5 text-center font-mono">
                <div className="bg-rose-950/80 border border-rose-500/40 rounded-xl px-2.5 py-1 min-w-[40px]">
                  <span className="block text-base sm:text-lg font-black text-white">
                    {String(timeLeft.hours).padStart(2, "0")}
                  </span>
                  <span className="block text-[9px] uppercase font-sans text-stone-400">{isBn ? "ঘণ্টা" : "Hrs"}</span>
                </div>
                <span className="text-rose-400 font-bold text-lg">:</span>
                <div className="bg-rose-950/80 border border-rose-500/40 rounded-xl px-2.5 py-1 min-w-[40px]">
                  <span className="block text-base sm:text-lg font-black text-white">
                    {String(timeLeft.minutes).padStart(2, "0")}
                  </span>
                  <span className="block text-[9px] uppercase font-sans text-stone-400">{isBn ? "মিঃ" : "Min"}</span>
                </div>
                <span className="text-rose-400 font-bold text-lg">:</span>
                <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-xl px-2.5 py-1 min-w-[40px] shadow-sm">
                  <span className="block text-base sm:text-lg font-black text-white">
                    {String(timeLeft.seconds).padStart(2, "0")}
                  </span>
                  <span className="block text-[9px] uppercase font-sans text-rose-100">{isBn ? "সেকেন্ড" : "Sec"}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Campaign Product Cards Grid */}
          {isLoading ? (
            <div className="flex h-48 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 relative z-10">
              {displayProducts.map((p: any) => {
                const { regularPrice, salePrice } = getProductPrices(p);
                const discountPercent = regularPrice > salePrice && regularPrice > 0
                  ? Math.round(((regularPrice - salePrice) / regularPrice) * 100)
                  : 0;

                const displayName = (isBn && p.nameBn) ? p.nameBn : p.name;

                return (
                  <div
                    key={p._id || p.id}
                    className="group relative rounded-2xl bg-[#23141A] border border-rose-900/40 hover:border-rose-500/60 p-4 flex flex-col justify-between space-y-3 transition-all duration-300 hover:-translate-y-1 shadow-md hover:shadow-rose-950/50"
                  >
                    {/* Discount Tag Badge */}
                    {discountPercent > 0 && (
                      <span className="absolute top-3 left-3 z-10 rounded-full bg-gradient-to-r from-rose-600 to-pink-600 px-2.5 py-1 text-[10px] font-black uppercase text-white shadow-md flex items-center gap-1">
                        <Zap size={11} className="fill-white" />
                        {discountPercent}% {isBn ? "ছাড়" : "OFF"}
                      </span>
                    )}

                    {/* Image Container */}
                    <Link href={`/products/${p._id || p.id}`} className="block relative aspect-square rounded-xl overflow-hidden bg-stone-900/60">
                      <Image
                        src={p.thumbnail || p.image || "/placeholder.png"}
                        alt={displayName}
                        fill
                        sizes="(max-width: 640px) 100vw, 250px"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </Link>

                    {/* Content Details */}
                    <div className="space-y-1.5 flex-1 flex flex-col justify-between pt-1">
                      <div>
                        {p.category && (
                          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block">
                            {p.category}
                          </span>
                        )}
                        <Link href={`/products/${p._id || p.id}`}>
                          <h3 className="font-bold text-xs sm:text-sm text-stone-100 group-hover:text-rose-300 group-hover:underline line-clamp-2 leading-snug">
                            {displayName}
                          </h3>
                        </Link>
                      </div>

                      {/* Pricing Display */}
                      <div className="pt-2 border-t border-rose-950/60 flex items-baseline gap-2">
                        <span className="text-base sm:text-lg font-black text-rose-400">
                          ৳{salePrice.toLocaleString()}
                        </span>
                        {regularPrice > salePrice && (
                          <span className="text-xs text-stone-400 line-through font-semibold">
                            ৳{regularPrice.toLocaleString()}
                          </span>
                        )}
                      </div>

                      {/* Instant Add To Cart CTA Button */}
                      <button
                        onClick={() => addToCart(p)}
                        className="w-full h-9 mt-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-sm transition active:scale-95 flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShoppingBag size={14} />
                        <span>{isBn ? "অর্ডার করুন" : "Add to Cart"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Campaign Bottom Bar Banner Link */}
          <div className="relative z-10 pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-rose-900/40">
            <div className="flex items-center gap-2 text-stone-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>{isBn ? "১০০% অরিজিনাল সাউথ কোরিয়ান ইমপোর্টেড কসমেটিক্স" : "100% Guaranteed Authentic South Korean Imports"}</span>
            </div>

            <Link
              href="/products?sort=discount"
              className="font-bold text-rose-400 hover:text-rose-300 transition flex items-center gap-1 hover:underline group"
            >
              <span>{isBn ? "সকল অফার প্রোডাক্ট দেখুন" : "Explore All Campaign Deals"}</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
