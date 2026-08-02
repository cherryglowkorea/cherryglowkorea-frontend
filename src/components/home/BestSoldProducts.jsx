"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { Sparkles, ArrowRight, Flame } from "lucide-react";
import { useCart } from "@/context/CartContext";
import ProductCard from "../products/ProductCard";

export default function BestSoldProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { addToCart } = useCart();

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const API = `${API_BASE}/products/best?limit=4`;

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await axios.get(API);
        const fetched = res.data?.data || res.data || [];
        setProducts(fetched.slice(0, 4));
      } catch (err) {
        setError("Failed to load best seller products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [API]);

  if (!loading && products.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-stone-50/50 dark:bg-[#1A1014]/40 border-b border-rose-100/60 dark:border-white/5">
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
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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
