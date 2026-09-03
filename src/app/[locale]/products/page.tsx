// Rendering Strategy: ISR (revalidate: 60s) — Pre-renders initial static landing shell for fast LCP while client component handles dynamic filter, search, sort & tab state.
export const revalidate = 60;

import { Suspense } from "react";
import { Metadata } from "next";
import ProductsClient from "./ProductsClient";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "All Products & Skincare Collection | Cherry Glow Korea",
    description: "Browse authentic Korean skincare products, serums, cleansers, combo deals, pre-orders, and promotional free gifts.",
  };
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50/60 dark:bg-[#120a0d] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
        </div>
      }
    >
      <ProductsClient />
    </Suspense>
  );
}
