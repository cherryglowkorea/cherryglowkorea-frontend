"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import ProductCard from "../shared/ProductCard";

export default function FeaturedComboDeals() {
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const res = await axios.get(`${API_BASE}/combos`);
        // Limit to 3 or 6 combos for display on home page
        setCombos(res.data?.slice(0, 6) || []);
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
    <section className="bg-rose-50/20 dark:bg-[#1E1518]/30 py-20 border-t border-rose-100/30">
      <div className="mx-auto max-w-[1536px] px-4">
        {/* Title */}
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-pink-500 bg-pink-50 px-3 py-1 rounded-full">
            🔥 Special Bundles
          </span>
          <h2 className="text-3xl font-bold mt-3 text-stone-900 dark:text-white">
            Featured Combo Deals
          </h2>
          <p className="text-sm text-stone-500 mt-2">
            Get your skincare routine essentials in a bundle and save big!
          </p>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-[350px] rounded-2xl bg-stone-200 dark:bg-stone-800 animate-pulse border"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <p className="text-center text-red-500">{error}</p>
        )}

        {/* Combos Grid */}
        {!loading && !error && combos.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {combos.map((combo) => (
              <ProductCard key={combo._id} product={combo} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
