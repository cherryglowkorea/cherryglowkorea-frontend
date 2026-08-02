"use client";


import BenefitsSection from "@/components/home/BenefitsSection";
import BestSoldProducts from "@/components/home/BestSoldProducts";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import HeroSection from "@/components/home/HeroSection";
import HighlightsSection from "@/components/home/HighlightSection";
import Testimonials from "@/components/home/Testimonials";
import FeaturedComboDeals from "@/components/home/FeaturedComboDeals";
import { useEffect, useState } from "react";


export default function Page() {
  return (
    <main className="space-y-12 sm:space-y-16 pb-12 font-sans">
      <HeroSection />
      <HighlightsSection />
      <CategoriesSection />
      <FeaturedProducts />
      <FeaturedComboDeals />
      <BestSoldProducts />
      <BenefitsSection />
      <Testimonials />
    </main>
  );
}