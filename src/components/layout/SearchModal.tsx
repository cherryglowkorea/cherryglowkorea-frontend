"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
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

export default function SearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState("");
  const [productResults, setProductResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);
  const router = useRouter();

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  // Auto focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      setQuery("");
      setProductResults([]);
    }
  }, [isOpen]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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
          )}&limit=8`
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
    onClose();
    router.push(`/products?search=${encodeURIComponent(query.trim())}`);
  };

  const handleCategoryClick = (catName) => {
    onClose();
    router.push(`/products?category=${encodeURIComponent(catName)}`);
  };

  const handleProductClick = (productId) => {
    onClose();
    router.push(`/products/${productId}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col animate-in slide-in-from-top-4 duration-200">
      
      {/* 1. TOP NAVBAR SEARCH BAR (Opens right over the Navbar) */}
      <div className="relative z-20 w-full h-16 sm:h-18 bg-white dark:bg-[#1C1417] border-b border-rose-200/80 dark:border-rose-900/60 shadow-md flex items-center px-3 sm:px-6 lg:px-8">
        <form
          onSubmit={handleFullSearchSubmit}
          className="mx-auto max-w-[1536px] w-full flex items-center gap-3"
        >
          <Search className="h-5 w-5 sm:h-6 sm:w-6 text-rose-500 shrink-0" />

          <input
            ref={inputRef}
            type="text"
            placeholder="Search Korean skincare, products, brands, categories..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-base sm:text-lg font-semibold text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-rose-100/40 outline-none"
          />

          {loading && <Loader2 className="h-5 w-5 animate-spin text-rose-500 shrink-0" />}

          {query && !loading && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white transition cursor-pointer"
              title="Clear text"
            >
              <X className="h-5 w-5" />
            </button>
          )}

          <button
            type="submit"
            disabled={!query.trim()}
            className={`px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition cursor-pointer shrink-0 ${
              query.trim()
                ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-xs"
                : "bg-stone-100 dark:bg-white/10 text-stone-400 cursor-not-allowed"
            }`}
          >
            Search
          </button>

          {/* Close Search Button */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close search"
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-stone-100 dark:bg-white/10 text-stone-600 dark:text-rose-100 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-500 flex items-center justify-center transition-all cursor-pointer shrink-0 shadow-xs"
          >
            <X className="w-5 h-5" />
          </button>
        </form>
      </div>

      {/* 2. RESULTS CONTAINER & BACKDROP (Opens directly below the top searchbar) */}
      <div className="relative z-10 flex-1 flex flex-col">
        
        {/* Dark Dimmed Backdrop */}
        <div
          onClick={onClose}
          className="absolute inset-0 bg-stone-950/60 dark:bg-black/80 backdrop-blur-xs transition-opacity cursor-pointer"
        />

        {/* Live Search Suggestions Panel Below Header */}
        <div className="relative max-w-[1536px] w-full mx-auto bg-white dark:bg-[#1C1417] border-b border-stone-200 dark:border-rose-900/60 shadow-2xl max-h-[calc(85vh-4rem)] overflow-y-auto p-4 sm:p-6 space-y-6 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-rose-300 dark:[&::-webkit-scrollbar-thumb]:bg-rose-900">
          
          {/* A. Popular Search Keywords (When query is empty) */}
          {!query.trim() && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <TrendingUp className="h-4 w-4" /> Popular Searches
              </div>

              <div className="flex flex-wrap gap-2">
                {TRENDING_KEYWORDS.map((kw) => (
                  <button
                    key={kw}
                    type="button"
                    onClick={() => setQuery(kw)}
                    className="px-4 py-2 rounded-full bg-stone-100 dark:bg-white/5 text-stone-800 dark:text-rose-100 border border-stone-200/80 dark:border-white/10 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:text-rose-600 hover:border-rose-300 transition cursor-pointer flex items-center gap-1.5"
                  >
                    <span>{kw}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* B. Matched Categories */}
          {query.trim() && matchedCategories.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-stone-400">
                <Tag className="h-4 w-4 text-pink-500" /> Categories Matching "{query}"
              </div>

              <div className="flex flex-wrap gap-2">
                {matchedCategories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleCategoryClick(cat)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-xs shadow-xs hover:opacity-95 transition cursor-pointer flex items-center gap-2"
                  >
                    <span>{cat}</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* C. Live Product Results Grid */}
          {query.trim() && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold uppercase tracking-wider text-stone-400 flex items-center gap-1.5">
                  <PackageCheck className="h-4 w-4 text-rose-500" /> Products Suggested ({productResults.length})
                </span>

                {productResults.length > 0 && (
                  <button
                    type="button"
                    onClick={handleFullSearchSubmit}
                    className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    View All Results ({productResults.length}) <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>

              {loading ? (
                <div className="py-8 text-center text-xs font-semibold text-stone-400 flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-rose-500" /> Searching products...
                </div>
              ) : productResults.length === 0 ? (
                <div className="p-8 text-center bg-stone-50 dark:bg-white/5 rounded-2xl border border-stone-200/80 dark:border-white/10 space-y-1">
                  <p className="text-sm font-bold text-stone-700 dark:text-white">No products found for "{query}"</p>
                  <p className="text-xs text-stone-400">Try searching for cleanser, toner, sunscreen, or COSRX</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {productResults.map((product) => {
                    const img = product.thumbnail || product.image || product.images?.[0]?.url || "/placeholder.png";
                    const price = product.salePrice || product.price || product.minPrice || 0;

                    return (
                      <div
                        key={product._id}
                        onClick={() => handleProductClick(product._id)}
                        className="p-3 rounded-2xl bg-stone-50/80 dark:bg-white/5 border border-stone-200/80 dark:border-white/10 flex items-center gap-3.5 hover:bg-rose-50/70 dark:hover:bg-rose-950/40 hover:border-rose-300 transition cursor-pointer group shadow-2xs"
                      >
                        {/* Image Thumbnail */}
                        <div className="relative h-14 w-14 rounded-xl overflow-hidden bg-white border border-stone-200 shrink-0">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        </div>

                        {/* Title & Info */}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-white truncate group-hover:text-rose-600 transition-colors">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 text-xs mt-1">
                            {product.category && (
                              <span className="text-[10px] font-bold text-stone-600 dark:text-rose-300 bg-white dark:bg-white/10 px-2 py-0.5 rounded-md border border-stone-200/60 dark:border-white/10">
                                {product.category}
                              </span>
                            )}
                            <span className="font-mono font-extrabold text-rose-600 dark:text-rose-400 text-xs sm:text-sm">
                              ৳ {Number(price).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-rose-500 group-hover:translate-x-1 transition-all shrink-0" />
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* D. Footer Search Action Bar */}
          {query.trim() && (
            <div className="pt-3 border-t border-stone-100 dark:border-white/10 flex items-center justify-between text-xs">
              <span className="text-stone-500 dark:text-rose-100/60 text-xs">
                Press <kbd className="px-2 py-0.5 font-mono font-bold bg-stone-100 dark:bg-white/10 rounded border border-stone-200 dark:border-white/10">Enter</kbd> to see full catalog search
              </span>
              <button
                type="button"
                onClick={handleFullSearchSubmit}
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs shadow-xs transition cursor-pointer"
              >
                Search All Products →
              </button>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
