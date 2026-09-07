"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Flame, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { useCart } from "@/context/CartContext";
import ProductCard from "../products/ProductCard";

import "swiper/css";
import "swiper/css/navigation";

export default function BestSoldProducts({
  initialProducts = [],
}: {
  initialProducts?: any[];
}) {
  const tBest = useTranslations("bestSellers");
  const [products, setProducts] = useState<any[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);
  const [error, setError] = useState("");
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const { addToCart } = useCart();

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  useEffect(() => {
    if (initialProducts.length > 0) return; // Skip client fetch if provided via ISR

    const fetchBestProducts = async () => {
      try {
        // 1. Fetch featured product IDs to exclude duplicates across homepage sections
        let excludeIds: string[] = [];
        try {
          const featRes = await axios.get(`${API_BASE}/products/featured?limit=8`);
          const featData = featRes.data?.data || featRes.data || [];
          if (Array.isArray(featData)) {
            excludeIds = featData.map((p: any) => p._id).filter(Boolean);
          }
        } catch {
          // Ignore error if featured endpoint fails, proceed with best products
        }

        // 2. Fetch best products excluding featured product IDs (fetch up to 12 items for slide carousel)
        const excludeStr = excludeIds.join(",");
        const res = await axios.get(
          `${API_BASE}/products/best?limit=12${excludeStr ? `&exclude=${excludeStr}` : ""}`
        );
        let fetched = res.data?.data || res.data || [];
        if (!Array.isArray(fetched)) fetched = [];

        // Fallback if backend returns fewer items
        if (fetched.length < 8) {
          try {
            const fallbackRes = await axios.get(
              `${API_BASE}/products/allProduct/public?limit=16`
            );
            const fallbackData =
              fallbackRes.data?.products ||
              fallbackRes.data?.data ||
              fallbackRes.data ||
              [];
            if (Array.isArray(fallbackData) && fallbackData.length > 0) {
              const existingIds = new Set([
                ...excludeIds,
                ...fetched.map((p: any) => p._id),
              ]);
              for (const p of fallbackData) {
                if (fetched.length >= 12) break;
                if (
                  p &&
                  p._id &&
                  p.type !== "combo" &&
                  !existingIds.has(p._id)
                ) {
                  fetched.push(p);
                  existingIds.add(p._id);
                }
              }
            }
          } catch {
            // Ignore fallback error
          }
        }

        setProducts(fetched.slice(0, 12));
      } catch (err) {
        setError("Failed to load best seller products");
      } finally {
        setLoading(false);
      }
    };

    fetchBestProducts();
  }, [API_BASE]);

  // Hide section completely if no products available
  if (!loading && products.length === 0) return null;

  return (
    <section id="best-sellers" className="scroll-mt-24 py-12 sm:py-16 bg-stone-50/50 dark:bg-[#1A1014]/40 border-b border-rose-100/60 dark:border-white/5">
      <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 shadow-2xs">
              <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> {tBest("badge")}
            </span>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white mt-2">
              {tBest("title")}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-rose-100/60 mt-1">
              {tBest("subtitle")}
            </p>
          </div>

          <div className="flex items-center gap-3 self-center sm:self-end">
            {/* Swiper Header Navigation Arrow Buttons */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                aria-label="Previous products"
                disabled={!products.length || (products.length < 4 && isBeginning)}
                onClick={() => swiperRef.current?.slidePrev()}
                className="w-8 h-8 rounded-full border border-stone-200 dark:border-white/10 flex items-center justify-center transition cursor-pointer text-stone-700 dark:text-white hover:border-rose-500 hover:text-rose-500 dark:hover:border-rose-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-white/5 disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                aria-label="Next products"
                disabled={!products.length || (products.length < 4 && isEnd)}
                onClick={() => swiperRef.current?.slideNext()}
                className="w-8 h-8 rounded-full border border-stone-200 dark:border-white/10 flex items-center justify-center transition cursor-pointer text-stone-700 dark:text-white hover:border-rose-500 hover:text-rose-500 dark:hover:border-rose-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-white/5 disabled:opacity-25 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-400 hover:text-rose-700 transition"
            >
              {tBest("browseAll")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid gap-3 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
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

        {/* Swiper Products Carousel Slider */}
        {!loading && !error && products.length > 0 && (
          <div className="relative">
            <Swiper
              modules={[Navigation, Autoplay]}
              autoplay={{
                delay: 2000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
                reverseDirection: false,
              }}
              loop={products.length >= 4}
              speed={600}
              spaceBetween={10}
              slidesPerView={2}
              onBeforeInit={(swiper) => {
                swiperRef.current = swiper;
              }}
              onSlideChange={(swiper) => {
                setIsBeginning(swiper.isBeginning);
                setIsEnd(swiper.isEnd);
              }}
              breakpoints={{
                480: {
                  slidesPerView: 2,
                  spaceBetween: 12,
                },
                640: {
                  slidesPerView: 2.5,
                  spaceBetween: 16,
                },
                768: {
                  slidesPerView: 3,
                  spaceBetween: 18,
                },
                1024: {
                  slidesPerView: 3.5,
                  spaceBetween: 20,
                },
                1280: {
                  slidesPerView: 4,
                  spaceBetween: 24,
                },
              }}
              className="cherry-glow-swiper !pt-3 !pb-3 !px-1 -mt-2 -mb-2"
            >
              {products.map((product, idx) => (
                <SwiperSlide key={product._id || idx} className="!h-auto pt-1 pb-1">
                  <ProductCard
                    product={product}
                    onAddToCart={addToCart}
                    index={idx}
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
      </div>
    </section>
  );
}

