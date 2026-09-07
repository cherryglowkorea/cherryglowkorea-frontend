"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useGetCategoriesQuery } from "@/redux/api/ecommerceApi";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

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

export default function CategoriesSection({
  initialCategories = [],
}: {
  initialCategories?: any[];
}) {
  const locale = useLocale();
  const tCat = useTranslations("categories");
  const { data: dbCategories, isLoading } = useGetCategoriesQuery() as any;
  const scrollRef = useRef(null);

  // Safely extract categories array from API response or ISR initialCategories
  const rawCategories = Array.isArray(dbCategories)
    ? dbCategories
    : (dbCategories && Array.isArray(dbCategories?.data)
    ? dbCategories.data
    : initialCategories.length > 0
    ? initialCategories
    : []);

  // Filter only active categories if status exists
  const activeCategories = rawCategories.filter((c) => c.status !== "inactive");

  // Fallback to default categories if API array is empty
  const categories = activeCategories.length > 0 ? activeCategories : defaultCategories;

  // Custom Navigation Scroll Handlers
  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -320, behavior: "smooth" });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  };

  return (
    <section className="relative py-10 sm:py-14 border-b border-rose-100/60 dark:border-white/5 bg-stone-50/40 dark:bg-[#180f12]">
      <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Header with Custom Navigation Controls */}
        <div className="flex items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1 text-xs font-extrabold uppercase tracking-wider text-rose-500">
              <Sparkles className="w-3.5 h-3.5" /> {tCat("eyebrow")}
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 dark:text-white mt-1">
              {tCat("title")}
            </h2>
          </div>

          {/* Custom Previous & Next Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleScrollLeft}
              aria-label="Previous Category"
              className="w-10 h-10 rounded-full bg-white dark:bg-[#1e1215] border border-stone-200/80 dark:border-white/10 shadow-xs hover:bg-rose-500 hover:text-white hover:border-rose-500 text-stone-700 dark:text-rose-100 flex items-center justify-center transition active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleScrollRight}
              aria-label="Next Category"
              className="w-10 h-10 rounded-full bg-white dark:bg-[#1e1215] border border-stone-200/80 dark:border-white/10 shadow-xs hover:bg-rose-500 hover:text-white hover:border-rose-500 text-stone-700 dark:text-rose-100 flex items-center justify-center transition active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
          </div>
        ) : (
          /* Single-Row Carousel Slider with Smooth Scroll & Zero Overflow Wrapping */
          <div
            ref={scrollRef}
            className="flex items-center gap-4 sm:gap-5 overflow-x-auto scroll-smooth py-3 px-1 -mx-1 no-scrollbar"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {categories.map((cat, index) => {
              const displayName = (locale === "bn" && cat.nameBn) ? cat.nameBn : cat.name;
              const catName = cat.name || "Category";
              const catImg = cat.image || "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=400&auto=format&fit=crop";

              return (
                <Link
                  key={cat.id || cat._id || index}
                  href={`/products?category=${encodeURIComponent(catName)}`}
                  className="group flex flex-col items-center gap-2.5 p-2.5 sm:p-3 rounded-2xl bg-white dark:bg-[#1e1215] border border-stone-200/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(244,63,94,0.12)] hover:border-pink-500/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer text-center shrink-0 w-[110px] sm:w-[130px]"
                >
                  {/* Category Image Avatar */}
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 overflow-hidden rounded-full p-0.5 bg-gradient-to-tr from-pink-500 to-rose-500 shadow-sm shrink-0">
                    <div className="relative h-full w-full rounded-full overflow-hidden bg-stone-100 dark:bg-white/5">
                      <Image
                        src={catImg}
                        alt={catName}
                        fill
                        sizes="(max-width: 640px) 90px, 110px"
                        priority={index < 6}
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  </div>

                  {/* Category Name */}
                  <span className="text-[11px] sm:text-xs font-bold text-stone-800 dark:text-rose-100 group-hover:text-pink-600 transition truncate w-full px-0.5">
                    {displayName}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
