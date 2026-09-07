// Rendering Strategy: ISR (revalidate: 60s) — Pre-renders initial static landing shell for fast LCP while client component handles dynamic filter, search, sort & tab state.
export const revalidate = 60;

import { Suspense } from "react";
import { Metadata } from "next";
import ProductsClient from "./ProductsClient";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

async function getInitialProducts() {
  try {
    const res = await fetch(`${API_BASE}/products/allProduct/public?page=1&limit=12`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("ISR initial products fetch error:", error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "All Products & Skincare Collection | Cherry Glow Korea",
    description: "Browse authentic Korean skincare products, serums, cleansers, combo deals, pre-orders, and promotional free gifts.",
  };
}

export default async function ProductsPage() {
  const initialData = await getInitialProducts();

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50/60 dark:bg-[#120a0d] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
        </div>
      }
    >
      <ProductsClient initialData={initialData} />
    </Suspense>
  );
}

