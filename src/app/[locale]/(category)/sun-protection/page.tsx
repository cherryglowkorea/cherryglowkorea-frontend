// Rendering Strategy: ISR (revalidate: 300s) — Pre-renders Sun Protection category page at edge with 5-minute background revalidation.
export const revalidate = 300;

import { Metadata } from "next";
import ProductCard from "@/components/products/ProductCard";
import { Sparkles, Sun } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Sun Protection & Sunscreens | Cherry Glow Korea",
    description: "Shop lightweight, zero-white-cast authentic Korean sunscreens SPF50+ PA++++ from top brands.",
  };
}

async function getSunProducts() {
  try {
    const res = await fetch(`${API_BASE}/products/allProduct/public?category=Sunscreen&limit=24`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : data.products || [];
  } catch (err) {
    return [];
  }
}

export default async function SunProtectionPage() {
  const products = await getSunProducts();

  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 space-y-8">
      {/* Category Header */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
            <Sun className="w-4 h-4 text-amber-200 fill-amber-200" />
            Broad Spectrum UV Protection
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-black tracking-tight">
            Sun Protection & Sunscreen Essentials
          </h1>
          <p className="text-sm sm:text-base text-amber-100 font-medium">
            Hydrating, non-greasy, zero-white-cast SPF50+ PA++++ sunscreens for tropical Bangladeshi weather.
          </p>
        </div>
        <Sparkles className="absolute right-6 bottom-6 w-32 h-32 text-white/10 pointer-events-none" />
      </div>

      {/* Product Grid */}
      {products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((product: any) => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-stone-50 dark:bg-stone-900/40 rounded-3xl border border-stone-200 dark:border-stone-800">
          <p className="text-stone-500 font-semibold">No sunscreen products available right now.</p>
        </div>
      )}
    </div>
  );
}
