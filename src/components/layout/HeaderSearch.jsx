"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Link, useRouter } from "@/i18n/navigation";
import axios from "axios";
import {
  Search,
  X,
  Tag,
  ArrowRight,
  Loader2,
  TrendingUp,
  PackageCheck,
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

export default function HeaderSearch({ isMobile = false, onCloseMobile }) {
  const [query, setQuery] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
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
        setIsOpen(false);
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
    }, 250);

    return () => clearTimeout(timer);
  }, [query, API_BASE]);

  // Dynamic Category suggestions matching query
  const matchedCategories = CATEGORIES_LIST.filter((cat) =>
    cat.toLowerCase().includes(query.toLowerCase().trim())
  );

  const handleFullSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  const handleCategoryClick = (catName) => {
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
    router.push(`/products?category=${encodeURIComponent(catName)}`);
  };

  const handleProductClick = (productId) => {
    setIsOpen(false);
    if (onCloseMobile) onCloseMobile();
    router.push(`/products/${productId}`);
  };

  return (
    <div ref={containerRef} className={`relative ${isMobile ? "w-full" : "w-full max-w-sm lg:max-w-md"}`}>
      
      {/* Search Input Bar */}
      <form onSubmit={handleFullSearchSubmit} className="relative flex items-center w-full">
        <input
          ref={inputRef}
          type="text"
          placeholder="Search products, brands, categories..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          className="w-full pl-9 pr-9 py-2 rounded-full bg-stone-100/90 dark:bg-white/10 border border-stone-200/80 dark:border-white/10 text-xs sm:text-sm font-medium text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-rose-100/50 outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition"
        />

        <Search className="h-4 w-4 text-stone-400 dark:text-rose-100/60 absolute left-3 pointer-events-none" />

        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin text-rose-500 absolute right-3" />
        ) : query ? (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setProductResults([]);
            }}
            className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-white absolute right-2.5 cursor-pointer"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </form>

      {/* Instant Amazon/Daraz Dropdown Suggestions Panel */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#1C1417] border border-stone-200 dark:border-rose-900/40 rounded-2xl shadow-2xl overflow-hidden z-50 p-4 space-y-4 max-h-[75vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-rose-200 dark:[&::-webkit-scrollbar-thumb]:bg-rose-950">
          
          {/* Header Close Button */}
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-white/10 pb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500 flex items-center gap-1">
              <Search className="w-3 h-3" /> Live Search Suggestions
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-600 dark:hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              Close <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 1. Popular Search Keywords (When query is empty) */}
          {!query.trim() && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-wider text-stone-400">
                <TrendingUp className="h-3.5 w-3.5 text-rose-500" /> Popular Searches
              </div>

              <div className="flex flex-wrap gap-1.5">
                {TRENDING_KEYWORDS.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => {
                      setQuery(kw);
                      setIsOpen(true);
                    }}
                    className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-white/5 text-stone-700 dark:text-rose-100/90 text-xs font-medium hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 transition cursor-pointer"
                  >
                    {kw}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 2. Matched Categories */}
          {query.trim() && matchedCategories.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-stone-400">
                <Tag className="h-3 w-3 text-pink-500" /> Categories ({matchedCategories.length})
              </div>

              <div className="flex flex-wrap gap-1.5">
                {matchedCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryClick(cat)}
                    className="px-3 py-1 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-2xs hover:opacity-95 transition cursor-pointer flex items-center gap-1"
                  >
                    <span>{cat}</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 3. Live Product Results */}
          {query.trim() && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 flex items-center gap-1">
                  <PackageCheck className="h-3 w-3 text-rose-500" /> Products ({productResults.length})
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
                <div className="py-6 text-center text-xs text-stone-400">Searching products...</div>
              ) : productResults.length === 0 ? (
                <div className="p-4 text-center bg-stone-50 dark:bg-slate-900/40 rounded-xl border border-stone-100 dark:border-slate-800 space-y-1">
                  <p className="text-xs font-bold text-stone-700 dark:text-white">No products found for "{query}"</p>
                  <p className="text-[10px] text-stone-400">Try searching for cleanser, toner, sunscreen, or COSRX</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {productResults.map((product) => {
                    const img = product.thumbnail || product.image || product.images?.[0]?.url || "/placeholder.png";
                    const price = product.salePrice || product.price || product.minPrice || 0;

                    return (
                      <div
                        key={product._id}
                        onClick={() => handleProductClick(product._id)}
                        className="p-2 rounded-xl bg-stone-50/70 dark:bg-white/5 border border-stone-100 dark:border-white/5 flex items-center gap-3 hover:bg-rose-50/60 dark:hover:bg-rose-950/40 hover:border-rose-200 transition cursor-pointer group"
                      >
                        {/* Thumbnail */}
                        <div className="relative h-10 w-10 rounded-lg overflow-hidden bg-white border border-stone-200 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>

                        {/* Text */}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs text-stone-900 dark:text-white truncate group-hover:text-rose-600 transition-colors">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-stone-400">
                            {product.category && <span className="font-semibold text-rose-500">{product.category}</span>}
                            <span className="font-mono font-bold text-stone-700 dark:text-rose-200">৳ {Number(price).toLocaleString()}</span>
                          </div>
                        </div>

                        <ArrowRight className="h-3.5 w-3.5 text-stone-400 group-hover:text-rose-500 group-hover:translate-x-0.5 transition-all shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* Search Footer */}
          {query.trim() && (
            <div className="pt-2 border-t border-stone-100 dark:border-white/10 flex items-center justify-between">
              <span className="text-[10px] text-stone-400">Press Enter for full results</span>
              <button
                type="button"
                onClick={handleFullSearchSubmit}
                className="px-3 py-1 rounded-lg bg-rose-500 text-white font-bold text-xs hover:bg-rose-600 transition cursor-pointer"
              >
                Search All →
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
