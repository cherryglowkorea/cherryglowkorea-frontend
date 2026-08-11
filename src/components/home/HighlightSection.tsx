"use client";

import { ShieldCheck, Leaf, Heart, Truck, Sparkles, Award } from "lucide-react";

export default function HighlightsSection() {
  const highlights = [
    {
      icon: ShieldCheck,
      title: "Dermatologically Tested",
      subtitle: "Gentle & safe for sensitive skin",
    },
    {
      icon: Leaf,
      title: "100% Authentic Korean",
      subtitle: "Imported directly from South Korea",
    },
    {
      icon: Heart,
      title: "Cruelty-Free & Clean",
      subtitle: "Formulated without harsh chemicals",
    },
    {
      icon: Truck,
      title: "Fast Nationwide Delivery",
      subtitle: "Free shipping on orders over ৳2,000",
    },
  ];

  return (
    <section className="py-6 sm:py-8 border-b border-rose-100/60 dark:border-white/5 bg-gradient-to-r from-rose-50/50 via-white to-pink-50/50 dark:from-[#1c1215] dark:via-[#160d10] dark:to-[#1c1215] transition-colors">
      <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-[#1e1215] border border-stone-200/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center border border-rose-100 dark:border-rose-900/30 shrink-0 group-hover:bg-gradient-to-r group-hover:from-pink-500 group-hover:to-rose-500 group-hover:text-white transition duration-300 shadow-2xs">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-serif font-bold text-stone-900 dark:text-white group-hover:text-rose-500 transition">
                    {item.title}
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-rose-100/60 mt-0.5 font-medium leading-tight">
                    {item.subtitle}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
