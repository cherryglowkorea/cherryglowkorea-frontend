"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import ProductCard from "../products/ProductCard";
import { useCart } from "@/context/CartContext";
import { Sparkles, ArrowRight } from "lucide-react";

export default function FeaturedProducts() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { addToCart } = useCart();

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
  const API = `${API_BASE}/products/featured?limit=8`;

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        const res = await axios.get(API);
        const products = res?.data?.data || res?.data || [];
        setFeaturedProducts(products.slice(0, 8));
      } catch (err) {
        setError("Failed to load featured products");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, [API]);

  return (
    <section className="py-12 sm:py-16 border-b border-rose-100/60 dark:border-white/5 bg-gradient-to-b from-white via-rose-50/20 to-white dark:from-[#160d10] dark:via-[#1e1215] dark:to-[#160d10]">
      <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" /> Handpicked Best of Korean Skincare
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white mt-2">
              Featured Products
            </h2>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-pink-600 dark:text-pink-400 hover:text-pink-700 transition"
          >
            Explore All Products ({featuredProducts.length}) <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
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

        {/* 4-Column Responsive Grid Products */}
        {!loading && !error && featuredProducts.length > 0 && (
          <div className="grid gap-3 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {featuredProducts.map((product, idx) => (
              <ProductCard
                key={product._id || idx}
                product={product}
                onAddToCart={addToCart}
                index={idx}
              />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && featuredProducts.length === 0 && (
          <div className="text-center py-12 space-y-2">
            <p className="text-sm font-semibold text-stone-500 dark:text-rose-100/60">
              No featured products available at the moment.
            </p>
            <Link
              href="/products"
              className="inline-block text-xs font-bold text-pink-600 hover:underline"
            >
              Browse All Products
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
