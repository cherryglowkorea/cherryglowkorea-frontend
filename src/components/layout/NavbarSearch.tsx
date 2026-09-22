"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import axios from "axios";
import {
  Search,
  X,
  Tag,
  ArrowRight,
  Loader2,
  TrendingUp,
  PackageCheck,
  Sparkles,
  Clock,
} from "lucide-react";

const CATEGORIES_LIST = [
  "Cleanser",
  "Toner",
  "Serum",
  "Essence",
  "Moisturizer",
  "Sunscreen",
  "Eye Care",
  "Mask",
  "Lip Care",
  "Acne Care",
  "Body Care",
  "Hair Care",
];

const TRENDING_KEYWORDS = [
  "Beauty of Joseon",
  "Sunscreen",
  "COSRX Snail",
  "Anua Toner",
  "Cleanser",
  "Rice Toner",
];

export default function NavbarSearch({ isMobile = false }) {
  const tNav = useTranslations("nav");
  const [query, setQuery] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const router = useRouter();

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Fetch live search results with debouncing
  useEffect(() => {
    if (!query.trim()) {
      setProductResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/products/allProduct/public?search=${encodeURIComponent(
            query.trim()
          )}&limit=5`
        );
        const data = res.data?.products || res.data?.data || res.data || [];
        setProductResults(data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, API_BASE]);

  // Dynamic Category suggestions matching query
  const matchedCategories = CATEGORIES_LIST.filter((cat) =>
    cat.toLowerCase().includes(query.toLowerCase().trim())
  );

  const handleFullSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setIsFocused(false);
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  const handleCategoryClick = (catName) => {
    setIsFocused(false);
    router.push(`/products?category=${encodeURIComponent(catName)}`);
  };

  const handleProductClick = (productId) => {
    setIsFocused(false);
    router.push(`/products/${productId}`);
  };

  const showDropdown = isFocused;

  return (
    <div ref={containerRef} className="relative w-full">
      
      {/* ── Premium Search Bar ── */}
      <form
        onSubmit={handleFullSearchSubmit}
        className={`group/search flex items-center w-full rounded-2xl overflow-hidden transition-all duration-300 ${
          isFocused
            ? "bg-white dark:bg-[#1C1215] shadow-lg shadow-rose-500/10 ring-2 ring-rose-500/40 dark:ring-rose-500/30"
            : "bg-stone-100/80 dark:bg-white/[0.06] hover:bg-stone-100 dark:hover:bg-white/[0.08] shadow-sm hover:shadow-md"
        }`}
      >
        {/* Search Icon */}
        <div className={`pl-4 pr-1 shrink-0 transition-colors duration-300 ${isFocused ? "text-rose-500" : "text-stone-400 dark:text-rose-200/40"}`}>
          <Search className="h-[18px] w-[18px]" strokeWidth={2.2} />
        </div>

        {/* Input Field */}
        <input
          ref={inputRef}
          type="text"
          placeholder={tNav("searchPlaceholder")}
          value={query}
          onFocus={() => setIsFocused(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsFocused(true);
          }}
          className={`w-full py-3 px-2 text-sm font-medium bg-transparent outline-none transition-colors duration-200 ${
            isFocused
              ? "text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-rose-200/40"
              : "text-stone-700 dark:text-rose-100/80 placeholder-stone-400 dark:placeholder-rose-100/30"
          }`}
        />

        {/* Loading / Clear Button */}
        {loading ? (
          <div className="pr-3 shrink-0">
            <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
          </div>
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setProductResults([]);
              inputRef.current?.focus();
            }}
            className="mr-2 p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-white/10 transition-all cursor-pointer shrink-0"
          >
            <X className="h-3.5 w-3.5" strokeWidth={2.5} />
          </button>
        ) : null}

        {/* Search Button */}
        <button
          type="submit"
          className={`self-stretch px-5 sm:px-6 flex items-center justify-center gap-1.5 font-bold text-sm tracking-wide transition-all duration-300 cursor-pointer shrink-0 ${
            isFocused
              ? "bg-rose-600 hover:bg-rose-700 text-white"
              : "bg-rose-600/90 hover:bg-rose-600 text-white/95"
          }`}
        >
          <Search className="h-4 w-4 sm:hidden" strokeWidth={2.5} />
          <span className="hidden sm:inline">{tNav("searchBtn")}</span>
        </button>
      </form>

      {/* ── Instant Dropdown Suggestions Panel ── */}
      {showDropdown && (
        <div
          className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1E1216] border border-stone-200/80 dark:border-rose-900/50 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[75vh] overflow-y-auto"
          style={{ scrollbarWidth: "thin" }}
        >
          <div className="p-4 space-y-4">

            {/* A. Popular Search Keywords (When input query is empty) */}
            {!query.trim() && (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-rose-500 dark:text-rose-400">
                  <TrendingUp className="h-3.5 w-3.5" />
                  Popular Searches
                </div>

                <div className="flex flex-wrap gap-2">
                  {TRENDING_KEYWORDS.map((kw) => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => {
                        setQuery(kw);
                        setIsFocused(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-stone-100/80 dark:bg-white/[0.06] text-stone-700 dark:text-rose-100 text-xs font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:text-rose-600 dark:hover:text-rose-400 border border-transparent hover:border-rose-200 dark:hover:border-rose-900/50 transition-all cursor-pointer"
                    >
                      {kw}
                    </button>
                  ))}
                </div>

                {/* Quick Category Chips (show when empty) */}
                <div className="pt-1 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-wider text-stone-400">
                    <Sparkles className="h-3 w-3 text-amber-500" />
                    Browse Categories
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {CATEGORIES_LIST.slice(0, 8).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => handleCategoryClick(cat)}
                        className="px-2.5 py-1 rounded-lg bg-stone-50 dark:bg-white/5 text-stone-500 dark:text-rose-200/70 text-[11px] font-semibold hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 transition-all cursor-pointer"
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* B. Matched Categories */}
            {query.trim() && matchedCategories.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                  <Tag className="h-3.5 w-3.5 text-pink-500" />
                  Categories ({matchedCategories.length})
                </div>

                <div className="flex flex-wrap gap-1.5">
                  {matchedCategories.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategoryClick(cat)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>{cat}</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* C. Live Product Results */}
            {query.trim() && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                    <PackageCheck className="h-3.5 w-3.5 text-rose-500" />
                    Products ({productResults.length})
                  </span>

                  {productResults.length > 0 && (
                    <button
                      type="button"
                      onClick={handleFullSearchSubmit}
                      className="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                    >
                      View All <ArrowRight className="h-3 w-3" />
                    </button>
                  )}
                </div>

                {loading ? (
                  <div className="py-8 text-center">
                    <Loader2 className="h-5 w-5 animate-spin text-rose-500 mx-auto mb-2" />
                    <p className="text-xs text-stone-400">Searching products...</p>
                  </div>
                ) : productResults.length === 0 ? (
                  <div className="p-5 text-center bg-stone-50/80 dark:bg-white/[0.03] rounded-xl border border-stone-100 dark:border-white/5 space-y-1.5">
                    <Search className="h-6 w-6 text-stone-300 dark:text-stone-600 mx-auto mb-1" />
                    <p className="text-xs font-bold text-stone-700 dark:text-stone-300">
                      No products found for &quot;{query}&quot;
                    </p>
                    <p className="text-[11px] text-stone-400">
                      Try searching for cleanser, toner, sunscreen, or COSRX
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {productResults.map((product) => {
                      const img = product.thumbnail || product.image || product.images?.[0]?.url || "/placeholder.png";
                      const price = product.salePrice || product.price || product.minPrice || 0;

                      return (
                        <div
                          key={product._id}
                          onClick={() => handleProductClick(product._id)}
                          className="p-2.5 rounded-xl flex items-center gap-3 hover:bg-rose-50/70 dark:hover:bg-rose-950/30 transition-all cursor-pointer group"
                        >
                          {/* Thumbnail */}
                          <div className="relative h-11 w-11 rounded-xl overflow-hidden bg-stone-100 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={img}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                            />
                          </div>

                          {/* Text */}
                          <div className="min-w-0 flex-1">
                            <h4 className="font-bold text-[13px] text-stone-900 dark:text-white truncate group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                              {product.name}
                            </h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              {product.category && (
                                <span className="text-[10px] font-semibold text-rose-500 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-1.5 py-0.5 rounded">
                                  {product.category}
                                </span>
                              )}
                              <span className="text-[11px] font-mono font-bold text-stone-700 dark:text-rose-200">
                                ৳{Number(price).toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <ArrowRight className="h-4 w-4 text-stone-300 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* D. Dropdown Footer */}
            {query.trim() && (
              <div className="pt-3 border-t border-stone-100 dark:border-white/[0.06] flex items-center justify-between">
                <span className="text-[11px] text-stone-400 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Press Enter for full results
                </span>
                <button
                  type="button"
                  onClick={handleFullSearchSubmit}
                  className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all cursor-pointer"
                >
                  Search All →
                </button>
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
