"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { ArrowRight, Flame } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ProductCard from "../products/ProductCard";

export default function BestSoldProducts() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { addToCart } = useCart();

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  useEffect(() => {
    const fetchBestProducts = async () => {
      try {
        // 1. Fetch featured product IDs to exclude duplicates across homepage sections
        let excludeIds: string[] = [];
        try {
          const featRes = await axios.get(`${API_BASE}/products/featured?limit=8`);
          const featData = featRes.data?.data || featRes.data || [];
          if (Array.isArray(featData)) {
            excludeIds = featData.map((p: any) => p._id).filter(Boolean);
          }
        } catch {
          // Ignore error if featured endpoint fails, proceed with best products
        }

        // 2. Fetch best products excluding featured product IDs
        const excludeStr = excludeIds.join(",");
        const res = await axios.get(
          `${API_BASE}/products/best?limit=4${excludeStr ? `&exclude=${excludeStr}` : ""}`
        );
        let fetched = res.data?.data || res.data || [];
        if (!Array.isArray(fetched)) fetched = [];

        // Fallback if backend returns fewer than 4 items
        if (fetched.length < 4) {
          try {
            const fallbackRes = await axios.get(
              `${API_BASE}/products/allProduct/public?limit=12`
            );
            const fallbackData =
              fallbackRes.data?.products ||
              fallbackRes.data?.data ||
              fallbackRes.data ||
              [];
            if (Array.isArray(fallbackData) && fallbackData.length > 0) {
              const existingIds = new Set([
                ...excludeIds,
                ...fetched.map((p: any) => p._id),
              ]);
              for (const p of fallbackData) {
                if (fetched.length >= 4) break;
                if (
                  p &&
                  p._id &&
                  p.type !== "combo" &&
                  !existingIds.has(p._id)
                ) {
                  fetched.push(p);
                  existingIds.add(p._id);
                }
              }
            }
          } catch {
            // Ignore fallback error
          }
        }

        setProducts(fetched.slice(0, 4));
      } catch (err) {
        setError("Failed to load best seller products");
      } finally {
        setLoading(false);
      }
    };

    fetchBestProducts();
  }, [API_BASE]);

  // Hide section completely if no products available
  if (!loading && products.length === 0) return null;

  return (
    <section id="best-sellers" className="scroll-mt-24 py-12 sm:py-16 bg-stone-50/50 dark:bg-[#1A1014]/40 border-b border-rose-100/60 dark:border-white/5">
      <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 shadow-2xs">
              <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> Customer Favorites
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white mt-2">
              Best Sellers
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-rose-100/60 mt-1">
              Loved, trusted, and reordered by skin care lovers
            </p>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:text-rose-700 transition"
          >
            Browse All Best Sellers <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-[380px] rounded-2xl bg-stone-100 dark:bg-white/5 animate-pulse border border-stone-200/60 dark:border-white/10"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <p className="text-center text-sm font-semibold text-rose-500 py-8">{error}</p>
        )}

        {/* 4-Column Uniform Products Grid */}
        {!loading && !error && products.length > 0 && (
          <div className="grid gap-3 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {products.map((product, idx) => (
              <ProductCard
                key={product._id || idx}
                product={product}
                onAddToCart={addToCart}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
