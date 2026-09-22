"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useGetCategoriesQuery } from "@/redux/api/ecommerceApi";
import { useLocale, useTranslations } from "next-intl";
import { Sparkles, ArrowRight, LayoutGrid, Search } from "lucide-react";

const defaultCategories = [
  { id: 1, name: "Cleanser", nameBn: "ক্লিনজার", image: "https://i.ibb.co/XZmby8wp/body-care.jpg" },
  { id: 2, name: "Toner", nameBn: "টোনার", image: "https://i.ibb.co/DTj6vTX/fragrance.jpg" },
  { id: 3, name: "Serum", nameBn: "সিরাম", image: "https://i.ibb.co/jPVqmVjK/hair-care.jpg" },
  { id: 4, name: "Eye Care", nameBn: "আই কেয়ার", image: "https://i.ibb.co/WNXFcJdX/makeup.jpg" },
  { id: 5, name: "Moisturizer", nameBn: "ময়েশ্চারাইজার", image: "https://i.ibb.co/vxBd6rWx/skin-care.jpg" },
  { id: 6, name: "Sunscreen", nameBn: "সানস্ক্রিন", image: "https://i.ibb.co/XZmby8wp/body-care.jpg" },
  { id: 7, name: "Mask", nameBn: "মাস্ক", image: "https://i.ibb.co/jPVqmVjK/hair-care.jpg" },
  { id: 8, name: "Essence", nameBn: "এসেন্স", image: "https://i.ibb.co/WNXFcJdX/makeup.jpg" },
  { id: 9, name: "Lip Care", nameBn: "লিপ কেয়ার", image: "https://i.ibb.co/WNXFcJdX/makeup.jpg" },
  { id: 10, name: "Acne Care", nameBn: "একনি কেয়ার", image: "https://i.ibb.co/vxBd6rWx/skin-care.jpg" },
  { id: 11, name: "Body Care", nameBn: "বডি কেয়ার", image: "https://i.ibb.co/XZmby8wp/body-care.jpg" },
  { id: 12, name: "Hair Care", nameBn: "হেয়ার কেয়ার", image: "https://i.ibb.co/jPVqmVjK/hair-care.jpg" },
];

export default function CategoriesPage() {
  const locale = useLocale();
  const tNav = useTranslations("nav");
  const { data: dbCategories, isLoading } = useGetCategoriesQuery() as any;
  const [searchQuery, setSearchQuery] = useState("");

  const rawCategories = useMemo(() => {
    if (Array.isArray(dbCategories)) return dbCategories;
    if (dbCategories && Array.isArray(dbCategories?.data)) return dbCategories.data;
    return defaultCategories;
  }, [dbCategories]);

  const activeCategories = useMemo(() => {
    const list = rawCategories.filter((c: any) => c.status !== "inactive");
    return list.length > 0 ? list : defaultCategories;
  }, [rawCategories]);

  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return activeCategories;
    const q = searchQuery.toLowerCase();
    return activeCategories.filter(
      (c: any) =>
        (c.name && c.name.toLowerCase().includes(q)) ||
        (c.nameBn && c.nameBn.toLowerCase().includes(q))
    );
  }, [activeCategories, searchQuery]);

  return (
    <main className="min-h-screen bg-stone-50/60 dark:bg-[#12090c] pb-24 pt-4 sm:pt-8 px-4 sm:px-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-rose-100/70 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
              <LayoutGrid size={20} />
            </span>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-white">
                {locale === "bn" ? "ক্যাটাগরি সমূহ" : locale === "ko" ? "카테고리" : "Explore Categories"}
              </h1>
              <p className="text-xs text-stone-500 dark:text-rose-200/60">
                {locale === "bn"
                  ? "আপনার ত্বকের যত্নে সেরা কোরিয়ান কালেকশন"
                  : locale === "ko"
                  ? "원하는 스킨케어 카테고리를 선택하세요"
                  : "Discover authentic Korean skincare tailored to your skin"}
              </p>
            </div>
          </div>
          <Link
            href="/products"
            className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
          >
            <span>{tNav("products")}</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {/* Search input */}
        <div className="relative mt-2">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              locale === "bn"
                ? "ক্যাটাগরি খুঁজুন..."
                : locale === "ko"
                ? "카테고리 검색..."
                : "Search categories..."
            }
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-[#1e1215] border border-stone-200/80 dark:border-white/10 text-xs sm:text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/30 transition shadow-2xs"
          />
        </div>
      </div>

      {/* Categories Grid */}
      {isLoading ? (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-32 rounded-2xl bg-stone-200/60 dark:bg-white/5 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 sm:gap-4">
          {filteredCategories.map((cat: any, index: number) => {
            const displayName = locale === "bn" && cat.nameBn ? cat.nameBn : cat.name;
            const catImg =
              cat.image ||
              "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400&auto=format&fit=crop";

            return (
              <Link
                key={cat.id || cat._id || index}
                href={`/products?category=${encodeURIComponent(cat.name || "")}`}
                className="group flex flex-col items-center p-3 rounded-2xl bg-white dark:bg-[#1e1215] border border-stone-200/70 dark:border-white/10 hover:border-rose-300 dark:hover:border-rose-900/60 shadow-xs hover:shadow-md transition-all duration-200 active:scale-95 text-center"
              >
                <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden p-0.5 bg-gradient-to-tr from-rose-400 to-pink-500 mb-2 shadow-2xs">
                  <div className="relative h-full w-full rounded-full overflow-hidden bg-stone-100 dark:bg-stone-900">
                    <Image
                      src={catImg}
                      alt={cat.name || "Category"}
                      fill
                      sizes="(max-width: 640px) 70px, 90px"
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                </div>
                <span className="text-xs font-bold text-stone-800 dark:text-rose-100 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition line-clamp-1">
                  {displayName}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Quick Link to All Products */}
      <div className="mt-8 text-center sm:hidden">
        <Link
          href="/products"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white text-xs font-bold shadow-sm shadow-rose-500/20 active:scale-95 transition"
        >
          <span>{tNav("products")}</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </main>
  );
}
