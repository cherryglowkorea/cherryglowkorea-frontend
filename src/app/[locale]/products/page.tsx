// Rendering Strategy: Hybrid ISR / Dynamic Rendering
// - Default view (/products): 60s ISR edge cache for high performance & instant LCP.
// - Stock-sensitive filters (?type=pre-order, ?type=free): Dynamic real-time fetch with cache: "no-store" for instant inventory & accurate button states.
export const revalidate = 60;

import { Suspense } from "react";
import { Metadata } from "next";
import ProductsClient from "./ProductsClient";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

interface ProductsPageProps {
  params?: Promise<{ locale?: string }>;
  searchParams?:
    | Promise<{ [key: string]: string | string[] | undefined }>
    | { [key: string]: string | string[] | undefined };
}

async function getInitialProducts(
  searchParamsObj?: { [key: string]: string | string[] | undefined }
) {
  try {
    const params = new URLSearchParams();

    if (searchParamsObj) {
      for (const [key, value] of Object.entries(searchParamsObj)) {
        if (typeof value === "string") {
          params.set(key, value);
        } else if (Array.isArray(value) && value[0]) {
          params.set(key, value[0]);
        }
      }
    }

    if (!params.has("page")) params.set("page", "1");
    if (!params.has("limit")) params.set("limit", "12");

    const requestedType = params.get("type");

    // Stock-sensitive criteria: pre-orders, promotional free gifts, or explicit live inventory queries
    const isStockSensitive =
      requestedType === "pre-order" ||
      requestedType === "free" ||
      Boolean(params.get("inStock")) ||
      Boolean(params.get("stock"));

    // If stock-sensitive: force dynamic execution by completely skipping edge/data cache
    // If standard all-products catalog: leverage 60s ISR cache for blazing-fast FCP/LCP
    const fetchOptions: RequestInit = isStockSensitive
      ? {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        }
      : {
          next: { revalidate: 60 },
        };

    const res = await fetch(
      `${API_BASE}/products/allProduct/public?${params.toString()}`,
      fetchOptions
    );

    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error("Products fetch error:", error);
    return null;
  }
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "All Products & Skincare Collection | Cherry Glow Korea",
    description:
      "Browse authentic Korean skincare products, serums, cleansers, combo deals, pre-orders, and promotional free gifts.",
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedSearchParams = searchParams
    ? await Promise.resolve(searchParams)
    : {};

  const initialData = await getInitialProducts(resolvedSearchParams);

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50/60 dark:bg-[#120a0d] flex items-center justify-center">
          <div className="w-8 h-8 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
        </div>
      }
    >
      <ProductsClient
        initialData={initialData}
        initialSearchParams={resolvedSearchParams}
      />
    </Suspense>
  );
}


