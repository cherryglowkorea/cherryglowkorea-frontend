"use client";

import HeroSection from "@/components/home/HeroSection";
import HighlightsSection from "@/components/home/HighlightSection";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedComboDeals from "@/components/home/FeaturedComboDeals";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import BestSoldProducts from "@/components/home/BestSoldProducts";
import BenefitsSection from "@/components/home/BenefitsSection";
import Testimonials from "@/components/home/Testimonials";

export default function Page() {
  return (
    <main className="space-y-12 sm:space-y-16 pb-12 font-sans">
      {/* 1. Hero Promo Banner */}
      <HeroSection />

      {/* 2. Trust Highlights (Authenticity & Fast Delivery) */}
      <HighlightsSection />

      {/* 3. Shop By Categories */}
      <CategoriesSection />

      {/* 4. High-Value Combo Bundles & Routine Sets (Max AOV & Conversion) */}
      <FeaturedComboDeals />

      {/* 5. Featured K-Beauty Single Products */}
      <FeaturedProducts />

      {/* 6. Best Sellers & Customer Favorites */}
      <BestSoldProducts />

      {/* 7. Why Choose Cherry Glow Benefits */}
      <BenefitsSection />

      {/* 8. Verified Buyer Reviews */}
      <Testimonials />
    </main>
  );
}