import Image from "next/image";
import Link from "next/link";
import ProfileCard from "@/components/about/ProfileCard";
import { Sparkles, ShieldCheck, Heart, Leaf, Award, ArrowRight, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "About Us - Cherry Glow Korea",
  description:
    "Learn more about Cherry Glow Korea, our story, mission, and our passion for bringing authentic Korean skincare to you.",
};

const teamMembers = [
  {
    name: "Mirza Md Mozammel",
    post: "Founder & CEO",
    imgSrc: "https://i.ibb.co/0RV4Xf36/mirza.jpg",
    desc: "Sets the vision, makes strategic decisions, and oversees overall business growth and direction.",
    facebook: "https://www.facebook.com/mirza.mh.2025",
    instagram: "https://www.instagram.com/mirzakorea517/",
  },
  {
    name: "Abdullah Al Fahad",
    post: "Product Manager & Quality Control",
    imgSrc: "https://i.ibb.co/fdmgkwkD/fahad.jpg",
    desc: "Manages product development while ensuring all products meet quality standards before delivery.",
    facebook: "https://www.facebook.com/megla.meglaaksh.5",
    instagram: null,
  },
  {
    name: "Mohiuddin Sajjad",
    post: "Product Manager & Designer",
    imgSrc: "https://i.ibb.co/RG6RHjqJ/sajjad.jpg",
    desc: "Handles product planning and creates/designs products to align with brand identity and market demand.",
    facebook: "https://www.facebook.com/ahmed.sajjat.98",
    instagram: "https://www.instagram.com/ahme_dsajja_d/",
  },
  {
    name: "Rakibul Hasan",
    post: "CTO",
    imgSrc: "https://i.ibb.co/fVqCx3m2/rakib.jpg",
    desc: "Leads all technical aspects, manages systems, and ensures smooth digital operations.",
    facebook: "https://www.facebook.com/rk.rakib.180625/",
    instagram: "https://www.instagram.com/rakib.zone/",
  },
  {
    name: "Jehad Parvez",
    post: "Inventory Manager",
    imgSrc: "https://i.ibb.co/Y4842QV3/jehad-parvez.jpg",
    desc: "Tracks stock levels, manages supply, and ensures products are available when needed.",
    facebook: "https://facebook.com",
    instagram: null,
  },
];

const pillars = [
  {
    icon: ShieldCheck,
    title: "100% Authentic Korean",
    desc: "Directly sourced from trusted top skincare labs in South Korea.",
  },
  {
    icon: Leaf,
    title: "Clean & Cruelty-Free",
    desc: "Formulated without harsh chemicals, parabens, or animal testing.",
  },
  {
    icon: Sparkles,
    title: "Dermatologically Tested",
    desc: "Rigorously evaluated to ensure safety and performance for sensitive skin.",
  },
  {
    icon: Heart,
    title: "Made for All Skin Types",
    desc: "Designed to hydrate, restore, and unlock your skin's natural glow.",
  },
];

export default function AboutPage() {
  return (
    <main className="relative min-h-screen bg-stone-50/50 dark:bg-[#160d10] text-stone-800 dark:text-rose-100 overflow-hidden">
      {/* Background Ambient Blur Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 right-10 w-96 h-96 bg-pink-300/15 dark:bg-rose-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-rose-200/15 dark:bg-pink-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* 1. Hero Banner */}
        <section className="border-b border-rose-100/60 dark:border-white/5 bg-gradient-to-b from-rose-50/80 via-white to-stone-50/50 dark:from-[#211418] dark:via-[#1a0f13] dark:to-[#160d10] py-16 md:py-24 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 mb-4 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" /> Authentic Korean Skincare
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold text-stone-900 dark:text-white tracking-tight leading-tight">
              About <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Cherry Glow</span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-stone-600 dark:text-rose-100/70 max-w-2xl mx-auto leading-relaxed">
              Clean beauty inspired by Korean skincare traditions, crafted with science, and dedicated to restoring your natural confidence and radiance.
            </p>
          </div>
        </section>

        <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-20">

          {/* 2. Our Story Section */}
          <section className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-500">
                <Award className="w-4 h-4" /> Our Philosophy & Beginnings
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white">
                Empowering Confidence Through Honest Skincare
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-rose-100/80 leading-relaxed">
                Cherry Glow was born from a simple passion: skincare should be effective, gentle, and transparent. We started our journey to bridge the gap between premium South Korean skincare innovations and beauty enthusiasts seeking genuine skin health.
              </p>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-rose-100/80 leading-relaxed">
                Every product in our collection is carefully curated and tested. We focus on gentle botanicals, active repair ingredients, and non-comedogenic formulations that nurture your skin barrier day after day.
              </p>

              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3.5 bg-white dark:bg-[#1e1215] border border-stone-200/60 dark:border-white/10 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-pink-500/50 hover:shadow-[0_4px_16px_rgba(244,63,94,0.08)] transition-all duration-300 group cursor-pointer">
                  <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-500 flex items-center justify-center shrink-0 border border-pink-100 dark:border-pink-900/30 group-hover:bg-pink-500 group-hover:text-white transition">
                    <CheckCircle2 className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 dark:text-white group-hover:text-pink-600 transition">Direct From Korea</h4>
                    <p className="text-[11px] text-stone-500 dark:text-rose-100/60 font-medium">100% Sourced from KR Labs</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3.5 bg-white dark:bg-[#1e1215] border border-stone-200/60 dark:border-white/10 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.03)] hover:border-rose-500/50 hover:shadow-[0_4px_16px_rgba(244,63,94,0.08)] transition-all duration-300 group cursor-pointer">
                  <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100 dark:border-rose-900/30 group-hover:bg-rose-500 group-hover:text-white transition">
                    <ShieldCheck className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-stone-900 dark:text-white group-hover:text-rose-600 transition">Safe & Certified</h4>
                    <p className="text-[11px] text-stone-500 dark:text-rose-100/60 font-medium">Dermatologically Approved</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Layered 50% Overlapping Skincare Image Showcase */}
            <div className="relative w-full min-h-[420px] sm:min-h-[460px] lg:min-h-[480px] flex items-center justify-start lg:pl-4 my-4 lg:my-0">
              {/* Background Glow Ambient Light */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-96 sm:h-96 bg-gradient-to-tr from-rose-500/25 via-pink-400/20 to-amber-200/10 rounded-full blur-3xl opacity-70 pointer-events-none" />

              {/* Main Back Image (about 2) */}
              <div className="relative w-[72%] sm:w-[68%] h-[320px] sm:h-[370px] rounded-3xl overflow-hidden border-2 border-white/80 dark:border-white/10 shadow-2xl transition-transform duration-500 hover:scale-[1.02] z-10 group">
                <Image
                  src="/about/about (2).avif"
                  alt="Cherry Glow Skincare Product"
                  fill
                  priority
                  sizes="(max-width: 768px) 75vw, 450px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-60" />
              </div>

              {/* Overlapping Front Image (about 3) - 50% Offset Layering */}
              <div className="absolute bottom-0 right-0 sm:right-2 lg:-right-2 w-[62%] sm:w-[58%] h-[240px] sm:h-[290px] rounded-3xl overflow-hidden border-4 border-white dark:border-[#1e1215] shadow-[0_20px_50px_rgba(244,63,94,0.18)] transition-all duration-500 hover:scale-[1.04] z-20 group">
                <Image
                  src="/about/about (3).avif"
                  alt="Cherry Glow Organic Formulas"
                  fill
                  priority
                  sizes="(max-width: 768px) 60vw, 380px"
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-rose-950/20 via-transparent to-transparent" />
              </div>
            </div>
          </section>

          {/* 3. Why Choose Cherry Glow (Pillars) */}
          <section className="space-y-8">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white">
                Why Choose Cherry Glow
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-rose-100/60">
                Four core promises that guide every product we offer.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {pillars.map((pillar, idx) => {
                const IconComponent = pillar.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-2xl bg-white dark:bg-[#1e1215] border border-stone-200/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)] hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center space-y-3"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center border border-rose-100 dark:border-rose-900/30">
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-white font-serif">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-rose-100/60 leading-relaxed">
                      {pillar.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 4. Mission & Vision */}
          <section className="grid md:grid-cols-2 gap-8">
            <div className="p-8 rounded-3xl bg-gradient-to-br from-pink-500 to-rose-600 text-white shadow-md space-y-4">
              <span className="px-3 py-1 bg-white/20 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-white">
                Our Mission
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold">
                Empower Authentic Radiance
              </h3>
              <p className="text-xs sm:text-sm text-rose-50 leading-relaxed">
                To empower confidence through clean, effective, and accessible skincare solutions for every skin tone and type across Bangladesh and beyond.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-white dark:bg-[#1e1215] border border-stone-200/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4">
              <span className="px-3 py-1 bg-rose-50 dark:bg-rose-950/50 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-rose-500 border border-rose-100 dark:border-rose-900/30">
                Our Vision
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-white">
                Trusted Beauty Leadership
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-rose-100/70 leading-relaxed">
                To become the most trusted skincare destination prioritizing product transparency, skin-first innovation, and exceptional customer care.
              </p>
            </div>
          </section>

          {/* 5. Team Section */}
          <section className="space-y-10">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white">
                Meet Our Team
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-rose-100/60">
                The passionate minds behind Cherry Glow Korea.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {teamMembers.map((member) => (
                <ProfileCard key={member.name} member={member} />
              ))}
            </div>
          </section>

          {/* 6. CTA Banner */}
          <section className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-rose-50 to-pink-50 dark:from-[#211418] dark:to-[#1a0f13] border border-rose-200/60 dark:border-white/10 text-center space-y-6 shadow-sm">
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white max-w-xl mx-auto">
              Ready to Discover Your Natural Glow?
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-rose-100/70 max-w-md mx-auto">
              Explore our collection of authentic Korean skincare items, combo deals, and daily essentials.
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer"
              >
                Shop Collection <ArrowRight size={16} />
              </Link>
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
