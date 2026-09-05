"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import ProductCard from "../products/ProductCard";
import { useCart } from "@/context/CartContext";

import "swiper/css";
import "swiper/css/navigation";

export default function FeaturedComboDeals() {
  const tCombo = useTranslations("comboDeals");
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);
  const { addToCart } = useCart();

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchCombos = async () => {
      try {
        const res = await axios.get(`${API_BASE}/combos`);
        setCombos(res.data || []);
      } catch (err) {
        setError("Failed to load combo deals");
      } finally {
        setLoading(false);
      }
    };

    fetchCombos();
  }, [API_BASE]);

  if (!loading && combos.length === 0) {
    return null; // Don't render the section if no combos exist
  }

  return (
    <section className="py-12 sm:py-16 bg-rose-50/20 dark:bg-[#1E1518]/30 border-b border-rose-100/60 dark:border-white/5">
      <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header (Matching Featured Products & Best Sellers) */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 shadow-2xs">
              {tCombo("badge")}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white mt-2">
              {tCombo("title")}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-rose-100/60 mt-1">
              {tCombo("subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3 self-center sm:self-end">
            {/* Swiper Header Navigation Arrow Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Previous combos"
                disabled={!combos.length || (combos.length < 4 && isBeginning)}
                onClick={() => swiperRef.current?.slidePrev()}
                className="w-8 h-8 rounded-full border border-stone-200 dark:border-white/10 flex items-center justify-center transition cursor-pointer text-stone-700 dark:text-white hover:border-rose-500 hover:text-rose-500 dark:hover:border-rose-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-white/5 disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Next combos"
                disabled={!combos.length || (combos.length < 4 && isEnd)}
                onClick={() => swiperRef.current?.slideNext()}
                className="w-8 h-8 rounded-full border border-stone-200 dark:border-white/10 flex items-center justify-center transition cursor-pointer text-stone-700 dark:text-white hover:border-rose-500 hover:text-rose-500 dark:hover:border-rose-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-white/5 disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              href="/products?type=combo"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:text-rose-700 transition"
            >
              {tCombo("exploreAll")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-[380px] rounded-2xl bg-stone-100 dark:bg-white/5 animate-pulse border border-stone-200/60 dark:border-white/10"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <p className="text-center text-sm font-semibold text-rose-500 py-8">{error}</p>
        )}

        {/* Swiper Combos Carousel Slider */}
        {!loading && !error && combos.length > 0 && (
          <div className="relative">
            <Swiper
              modules={[Navigation, Autoplay]}
              autoplay={{
                delay: 2000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                reverseDirection: false,
              }}
              loop={combos.length >= 4}
              speed={600}
              spaceBetween={16}
              slidesPerView={1.2}
              onBeforeInit={(swiper) => {
                swiperRef.current = swiper;
              }}
              onSlideChange={(swiper) => {
                setIsBeginning(swiper.isBeginning);
                setIsEnd(swiper.isEnd);
              }}
              breakpoints={{
                540: {
                  slidesPerView: 2,
                  spaceBetween: 16,
                },
                768: {
                  slidesPerView: 2.5,
                  spaceBetween: 20,
                },
                1024: {
                  slidesPerView: 3,
                  spaceBetween: 20,
                },
                1280: {
                  slidesPerView: 4,
                  spaceBetween: 24,
                },
              }}
              className="cherry-glow-swiper !pt-3 !pb-3 !px-1 -mt-2 -mb-2"
            >
              {combos.map((combo, idx) => (
                <SwiperSlide key={combo._id || idx} className="!h-auto pt-1 pb-1">
                  <ProductCard key={combo._id || idx} product={combo} onAddToCart={addToCart} index={idx} />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}

      </div>
    </section>
  );
}

