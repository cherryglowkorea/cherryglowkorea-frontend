// Rendering Strategy: ISR (revalidate: 600s) — Pre-renders high-traffic homepage at build time and revalidates edge cache every 10 minutes for optimal LCP performance.
export const revalidate = 600;

import HeroSection from "@/components/home/HeroSection";
import HighlightsSection from "@/components/home/HighlightSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import CampaignSection from "@/components/home/CampaignSection";
import FeaturedComboDeals from "@/components/home/FeaturedComboDeals";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BestSoldProducts from "@/components/home/BestSoldProducts";
import BenefitsSection from "@/components/home/BenefitsSection";
import Testimonials from "@/components/home/Testimonials";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

async function getHomeData() {
  const fetchWithISR = async (url: string) => {
    try {
      const res = await fetch(url, { next: { revalidate: 600 } });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  const [featuredData, comboData, catData] = await Promise.all([
    fetchWithISR(`${API_BASE}/products/featured?limit=8`),
    fetchWithISR(`${API_BASE}/combos`),
    fetchWithISR(`${API_BASE}/categories`),
  ]);

  const featuredProducts = Array.isArray(featuredData?.data)
    ? featuredData.data
    : Array.isArray(featuredData)
    ? featuredData
    : [];

  const featuredIds = new Set(featuredProducts.map((p: any) => p._id || p.id).filter(Boolean));

  // Fetch best sellers excluding items already displayed in Featured Products
  const excludeParam = Array.from(featuredIds).join(",");
  const bestData = await fetchWithISR(
    `${API_BASE}/products/best?limit=12${excludeParam ? `&exclude=${excludeParam}` : ""}`
  );

  let bestProducts = bestData?.data || bestData || [];
  if (Array.isArray(bestProducts)) {
    bestProducts = bestProducts.filter((p: any) => !featuredIds.has(p._id || p.id));
  } else {
    bestProducts = [];
  }

  if (bestProducts.length < 6) {
    const fallbackData = await fetchWithISR(`${API_BASE}/products/allProduct/public?limit=16`);
    const rawFallback = fallbackData?.products || fallbackData?.data || fallbackData || [];
    if (Array.isArray(rawFallback)) {
      const extra = rawFallback.filter((p: any) => !featuredIds.has(p._id || p.id));
      bestProducts = Array.from(new Set([...bestProducts, ...extra])).slice(0, 12);
    }
  }

  return {
    featuredProducts,
    bestSoldProducts: Array.isArray(bestProducts) ? bestProducts : [],
    combos: Array.isArray(comboData) ? comboData : comboData?.data || [],
    categories: Array.isArray(catData) ? catData : catData?.data || [],
  };
}

export default async function Page() {
  const { featuredProducts, bestSoldProducts, combos, categories } = await getHomeData();

  return (
    <main className="space-y-12 sm:space-y-16 pb-12 font-sans">
      {/* 1. Hero Promo Banner */}
      <HeroSection />

      {/* 2. Trust Highlights (Authenticity & Fast Delivery) */}
      <HighlightsSection />

      {/* 3. Shop By Categories */}
      <CategoriesSection initialCategories={categories} />

      {/* 4. Dynamic Database Flash Sale Campaign Section */}
      <CampaignSection />

      {/* 5. High-Value Combo Bundles & Routine Sets (Max AOV & Conversion) */}
      <FeaturedComboDeals initialCombos={combos} />

      {/* 6. Featured K-Beauty Single Products */}
      <FeaturedProducts initialProducts={featuredProducts} />

      {/* 7. Best Sellers & Customer Favorites */}
      <BestSoldProducts initialProducts={bestSoldProducts} />

      {/* 8. Why Choose Cherry Glow Benefits */}
      <BenefitsSection />

      {/* 9. Verified Buyer Reviews */}
      <Testimonials />
    </main>
  );
}