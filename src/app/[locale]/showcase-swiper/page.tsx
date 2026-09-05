"use client";

import BestSellersSection from "@/components/home/BestSellersSection";
import FeaturedComboSection from "@/components/home/FeaturedComboSection";

export default function ShowcaseSwiperPage() {
  return (
    <main className="min-h-screen bg-[#0f0a0d] text-white py-10 space-y-12">
      <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-center text-white mb-2">
          Cherry Glow — Swiper Component Showcase
        </h1>
        <p className="text-stone-400 text-center text-sm mb-8">
          Previewing BestSellersSection and FeaturedComboSection with responsive Swiper carousels
        </p>
      </div>

      <BestSellersSection />

      <FeaturedComboSection />
    </main>
  );
}
