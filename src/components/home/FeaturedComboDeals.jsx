"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "../products/ProductCard";
import { useCart } from "@/context/CartContext";

export default function FeaturedComboDeals() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const res = await axios.get(`${API_BASE}/combos`);
        // Limit to 4 combos for display on home page
        setCombos(res.data?.slice(0, 4) || []);
      } catch (err) {
        setError("Failed to load combo deals");
      } finally {
        setLoading(false);
      }
    };

    fetchCombos();
  }, [API_BASE]);

  if (!loading && combos.length === 0) {
    return null; // Don't render the section if no combos exist
  }

  return (
    <section className="py-12 sm:py-16 bg-rose-50/20 dark:bg-[#1E1518]/30 border-b border-rose-100/60 dark:border-white/5">
      <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header (Matching Featured Products & Best Sellers) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 shadow-2xs">
              🔥 Special Bundles
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white mt-2">
              Featured Combo Deals
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-rose-100/60 mt-1">
              Get your skincare routine essentials in a bundle and save big!
            </p>
          </div>

          <Link
            href="/products?type=combo"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:text-rose-700 transition"
          >
            Explore All Combo Deals <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Loading State */}
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

        {/* Combos Grid */}
        {!loading && !error && combos.length > 0 && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {combos.map((combo, idx) => (
              <ProductCard key={combo._id || idx} product={combo} onAddToCart={addToCart} index={idx} />
            ))}
          </div>
        )}

      </div>
    </section>
  );
}
