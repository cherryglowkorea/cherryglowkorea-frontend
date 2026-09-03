// Rendering Strategy: ISR (revalidate: 300s) — Server Component pre-fetches base product catalog for fast load while BuildComboClient handles client selection, cart & coupon state.
export const revalidate = 300;

import { Metadata } from "next";
import BuildComboClient from "./BuildComboClient";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "Build Your Custom Korean Skincare Combo | Cherry Glow Korea",
    description: "Create your personalized K-Beauty skincare bundle with extra volume discounts and instant savings.",
  };
}

async function getProducts() {
  try {
    const res = await fetch(`${API_BASE}/products/allProduct/public?limit=50`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const products = Array.isArray(data) ? data : data.products || [];
    return products.filter((p: any) => p.type !== "combo");
  } catch (err) {
    return [];
  }
}

export default async function ComboPage() {
  const products = await getProducts();

  return <BuildComboClient initialProducts={products} />;
}
