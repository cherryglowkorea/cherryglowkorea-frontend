"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Sparkles, ArrowRight, ShoppingBag, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";

export default function HeroSection() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [dynamicSlides, setDynamicSlides] = useState([]);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const tHome = useTranslations("home");

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  // Fallback default slides
  const defaultSlides = [
    {
      id: "1",
      title: tHome("slide1Title") || "Glow Naturally",
      description: tHome("slide1Desc") || "Clean K-Beauty skincare crafted to enhance your natural glow.",
      image: "/hero-1.jpg",
      primaryBtnText: tHome("shopNow") || "Shop Now",
      primaryBtnLink: "/products",
      secondaryBtnText: tHome("explore") || "Explore Products",
      secondaryBtnLink: "/about",
    },
    {
      id: "2",
      title: tHome("slide2Title") || "Beauty That Cares",
      description: tHome("slide2Desc") || "Dermatologically tested skincare made for every skin type.",
      image: "/hero-2.jpg",
      primaryBtnText: tHome("viewProducts") || "View Products",
      primaryBtnLink: "/products",
      secondaryBtnText: tHome("learnMore") || "Learn More",
      secondaryBtnLink: "/about",
    },
  ];

  // Fetch dynamic banners from backend API
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await axios.get(`${API_BASE}/banners/hero`);
        const data = res.data?.data || res.data || [];
        if (Array.isArray(data) && data.length > 0) {
          setDynamicSlides(data);
        }
      } catch (err) {
        console.warn("Using default hero slides fallback");
      } finally {
        setLoadingBanners(false);
      }
    };

    fetchBanners();
  }, [API_BASE]);

  const activeSlides = dynamicSlides.length > 0 ? dynamicSlides : defaultSlides;

  // Auto slide timer
  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      paginate(1);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlides.length, index]);

  const paginate = (newDirection) => {
    setDirection(newDirection);
    setIndex((prev) => (prev + newDirection + activeSlides.length) % activeSlides.length);
  };

  // Scroll-based parallax
  const { scrollY } = useScroll();
  const parallaxY = useTransform(scrollY, [0, 300], [0, 50]);

  const currentSlide = activeSlides[index] || activeSlides[0];

  return (
    <section className="relative h-[65vh] sm:h-[75vh] lg:h-[85vh] min-h-[440px] overflow-hidden bg-stone-950">
      
      {/* Slide Animation with mode="wait" to eliminate text overlap */}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentSlide._id || currentSlide.id || index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          className="absolute inset-0"
        >
          {/* Parallax Background Image */}
          <motion.div style={{ y: parallaxY }} className="absolute inset-0">
            <Image
              src={currentSlide.image}
              alt={currentSlide.title}
              fill
              priority
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>

          {/* High-Contrast Gradient Overlay (Darker on left for 100% text readability) */}
          <div className="absolute inset-0 bg-gradient-to-r from-stone-950/85 via-stone-950/60 to-black/30" />

          {/* Slide Text & Actions Content Container */}
          <div className="relative z-10 flex h-full items-center">
            <div className="mx-auto max-w-[1536px] w-full px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="max-w-xl text-white space-y-4 sm:space-y-5"
              >
                {/* Badge */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-pink-300 bg-pink-500/20 border border-pink-400/30 backdrop-blur-md">
                  <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Authentic K-Beauty Korea
                </span>

                {/* Title */}
                <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-extrabold leading-[1.15] drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)] break-words text-white">
                  {currentSlide.title}
                </h1>

                {/* Description */}
                {currentSlide.description && (
                  <p className="text-xs sm:text-base md:text-lg text-stone-200 font-medium leading-relaxed drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)] max-w-md">
                    {currentSlide.description}
                  </p>
                )}

                {/* Highly User-Friendly Brand Buttons (Full Rounded Pill Shape) */}
                <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row gap-2.5 sm:gap-4">
                  <Button
                    size="lg"
                    asChild
                    className="w-full sm:w-auto text-xs sm:text-sm md:text-base bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-600 text-white font-extrabold shadow-xl shadow-rose-500/25 hover:scale-105 transition-all h-10.5 sm:h-13 px-6 sm:px-8 rounded-full cursor-pointer flex items-center justify-center gap-2 border border-rose-300/30"
                  >
                    <Link href={currentSlide.primaryBtnLink || "/products"}>
                      <ShoppingBag className="w-4 h-4" />
                      <span>{currentSlide.primaryBtnText || currentSlide.primary || "Shop Now"}</span>
                    </Link>
                  </Button>

                  <Button
                    size="lg"
                    variant="outline"
                    asChild
                    className="w-full sm:w-auto text-xs sm:text-sm md:text-base bg-rose-950/40 hover:bg-rose-900/60 text-white border-2 border-rose-400/60 backdrop-blur-md font-extrabold shadow-lg hover:scale-105 transition-all h-10.5 sm:h-13 px-6 sm:px-8 rounded-full cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Link href={currentSlide.secondaryBtnLink || "/about"}>
                      <span>{currentSlide.secondaryBtnText || currentSlide.secondary || "Explore"}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Brand Navigation Arrows (Perfect Circles - Visible on Tablet/Desktop) */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={() => paginate(-1)}
            className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 z-20 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-rose-500/90 hover:bg-rose-600 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer items-center justify-center shrink-0 shadow-lg hover:scale-110"
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-6 h-6 stroke-[2.5]" />
          </button>

          <button
            onClick={() => paginate(1)}
            className="hidden sm:flex absolute right-4 sm:right-6 top-1/2 z-20 -translate-y-1/2 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-rose-500/90 hover:bg-rose-600 text-white backdrop-blur-md border border-white/20 transition-all cursor-pointer items-center justify-center shrink-0 shadow-lg hover:scale-110"
            aria-label="Next Slide"
          >
            <ChevronRight className="w-6 h-6 stroke-[2.5]" />
          </button>
        </>
      )}

      {/* Navigation Dots Indicator */}
      {activeSlides.length > 1 && (
        <div className="absolute bottom-4 sm:bottom-6 left-1/2 z-20 flex -translate-x-1/2 gap-2 bg-black/40 px-3.5 py-1.5 rounded-full backdrop-blur-md border border-white/10">
          {activeSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setDirection(i > index ? 1 : -1);
                setIndex(i);
              }}
              className={`h-2.5 rounded-full transition-all cursor-pointer ${
                i === index ? "w-7 bg-rose-500" : "w-2.5 bg-white/50 hover:bg-white"
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}

    </section>
  );
}
