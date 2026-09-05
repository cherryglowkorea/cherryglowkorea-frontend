"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { Flame, Heart, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

import "swiper/css";
import "swiper/css/navigation";

// Optional alias for SlideItem as per Swiper React usage
export const SlideItem = SwiperSlide;

export type ProductStatus = "in-stock" | "sold-out" | "pre-order";

export interface Product {
  id: string | number;
  badge?: string; // Category badge (e.g. "Serum", "Cleanser", "Toner")
  category?: string; // Alternative category fallback
  discount?: string | number; // e.g. "-20%", "-43%" or 20
  image: string;
  title: string;
  sizes: string[]; // e.g. ["30ml", "50ml", "100ml"]
  originalPrice?: number;
  currentPrice: number;
  status: ProductStatus;
  href?: string;
}

export interface BestSellersSectionProps {
  products?: Product[];
  title?: string;
  subtitle?: string;
  badgeLabel?: string;
  browseAllLink?: string;
  onAddToCart?: (product: Product, selectedSize?: string) => void;
  onViewDetails?: (product: Product) => void;
  className?: string;
}

const FALLBACK_IMAGE = "/placeholder.jpg";
const SVG_FALLBACK =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400" fill="none">
      <rect width="400" height="400" fill="#180e14"/>
      <circle cx="200" cy="180" r="60" fill="#ff2d55" fill-opacity="0.12"/>
      <path d="M185 170C185 161.716 191.716 155 200 155C208.284 155 215 161.716 215 170V195C215 203.284 208.284 210 200 210C191.716 210 185 203.284 185 195V170Z" fill="#ff2d55" fill-opacity="0.4"/>
      <text x="200" y="270" text-anchor="middle" fill="#9ca3af" font-family="sans-serif" font-size="14" font-weight="600">Cherry Glow</text>
    </svg>`
  );

// Single Product Card Component
function BestSellerCard({
  product,
  onAddToCart,
  onViewDetails,
}: {
  product: Product;
  onAddToCart?: (product: Product, selectedSize?: string) => void;
  onViewDetails?: (product: Product) => void;
}) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [imgSrc, setImgSrc] = useState(product.image || FALLBACK_IMAGE);
  const [selectedSize, setSelectedSize] = useState<string>(
    product.sizes?.[0] || ""
  );

  const handleImageError = () => {
    if (imgSrc !== FALLBACK_IMAGE) {
      setImgSrc(FALLBACK_IMAGE);
    } else {
      setImgSrc(SVG_FALLBACK);
    }
  };

  // Format discount string (e.g. -20% or -43%)
  const discountText = React.useMemo(() => {
    if (product.discount !== undefined && product.discount !== null) {
      const disc = String(product.discount).trim();
      if (disc.startsWith("-")) return disc.endsWith("%") ? disc : `${disc}%`;
      return `-${disc}%`;
    }
    if (
      product.originalPrice &&
      product.originalPrice > product.currentPrice &&
      product.currentPrice > 0
    ) {
      const percent = Math.round(
        ((product.originalPrice - product.currentPrice) / product.originalPrice) * 100
      );
      if (percent > 0) return `-${percent}%`;
    }
    return null;
  }, [product.discount, product.originalPrice, product.currentPrice]);

  const isPreOrder = product.status === "pre-order";
  const categoryBadge = product.badge || product.category || "Skincare";
  const productLink = product.href || `/products/${product.id}`;

  return (
    <div
      className={`group relative flex h-full flex-col rounded-xl border p-3 transition-all duration-300 ${
        isPreOrder
          ? "border-amber-500/70 dark:border-amber-500/60 bg-amber-500/5 hover:border-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.25)]"
          : "border-white/10 bg-[#160e13] hover:border-[#ff2d55]/40 hover:shadow-[0_8px_30px_rgba(255,45,85,0.14)]"
      }`}
    >
      {/* Product Image Area */}
      <div className="relative aspect-square w-full overflow-hidden rounded-t-xl bg-white/5">
        <Link
          href={productLink}
          onClick={(e) => {
            if (onViewDetails) {
              e.preventDefault();
              onViewDetails(product);
            }
          }}
          className="block h-full w-full relative cursor-pointer"
        >
          <Image
            src={imgSrc}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            onError={handleImageError}
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </Link>

        {/* Top-Left Floating Badges */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col items-start gap-1">
          {/* Category or Pre-Order Badge */}
          {isPreOrder ? (
            <span className="rounded bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-white shadow-xs">
              ⏳ PRE-ORDER
            </span>
          ) : (
            categoryBadge && (
              <span className="rounded-full bg-black/65 backdrop-blur-md px-2.5 py-0.5 text-[10px] font-semibold text-white border border-white/15 shadow-sm">
                {categoryBadge}
              </span>
            )
          )}

          {/* Discount Badge */}
          {discountText && (
            <span className="rounded bg-[#ff2d55] px-2 py-0.5 text-[10px] font-extrabold text-white shadow-sm tracking-wide">
              {discountText}
            </span>
          )}
        </div>

        {/* Top-Right Heart / Wishlist Button */}
        <button
          type="button"
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            setIsWishlisted((prev) => !prev);
          }}
          className="absolute top-2.5 right-2.5 z-20 flex h-8 w-8 items-center justify-center rounded-full bg-black/65 backdrop-blur-md border border-white/15 text-white shadow-sm transition-all duration-200 hover:scale-110 active:scale-95 cursor-pointer"
        >
          <Heart
            className={`h-4 w-4 transition-colors duration-200 ${
              isWishlisted
                ? "fill-[#ff2d55] text-[#ff2d55]"
                : "text-white/90 hover:text-white"
            }`}
          />
        </button>
      </div>

      {/* Product Content Area */}
      <div className="flex flex-1 flex-col justify-between pt-3">
        <div>
          {/* Title */}
          <Link
            href={productLink}
            onClick={(e) => {
              if (onViewDetails) {
                e.preventDefault();
                onViewDetails(product);
              }
            }}
            className="block"
          >
            <h3
              title={product.title}
              className="line-clamp-2 text-sm sm:text-base font-bold text-white leading-snug hover:text-[#ff6b81] transition-colors cursor-pointer min-h-[2.5rem]"
            >
              {product.title}
            </h3>
          </Link>

          {/* Size / Volume Pill Options */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setSelectedSize(size);
                  }}
                  className={`cursor-pointer rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-all ${
                    selectedSize === size
                      ? "border-[#ff2d55]/60 bg-[#ff2d55]/20 text-[#ff6b81] shadow-xs"
                      : "border-white/10 bg-white/5 text-stone-300 hover:border-white/25 hover:bg-white/10"
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {/* Price Row & Stock Status */}
          <div className="mt-3 flex items-center justify-between border-t border-white/5 pt-2.5">
            <div className="flex items-baseline gap-2">
              {product.originalPrice && product.originalPrice > product.currentPrice && (
                <span className="font-mono text-xs text-stone-400 line-through">
                  ৳{product.originalPrice.toLocaleString()}
                </span>
              )}
              <span className="font-mono text-base sm:text-lg font-black text-[#ff2d55]">
                ৳{product.currentPrice.toLocaleString()}
              </span>
            </div>

            {/* Right-aligned Stock Status */}
            <span
              className={`text-[11px] font-bold text-right ${
                product.status === "in-stock"
                  ? "text-emerald-400"
                  : product.status === "pre-order"
                  ? "text-amber-400"
                  : "text-rose-400"
              }`}
            >
              {product.status === "in-stock"
                ? "In Stock"
                : product.status === "pre-order"
                ? "Pre-Order Available"
                : "Sold Out"}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-3 flex items-center gap-2">
            <Link
              href={productLink}
              onClick={(e) => {
                if (onViewDetails) {
                  e.preventDefault();
                  onViewDetails(product);
                }
              }}
              className="flex-1 rounded-lg border border-[#ff2d55]/70 py-2 px-3 text-center text-xs font-bold text-[#ff4b72] hover:border-[#ff2d55] hover:bg-[#ff2d55]/10 transition-colors duration-200 cursor-pointer"
            >
              Details
            </Link>

            {product.status === "in-stock" && (
              <button
                type="button"
                onClick={() => onAddToCart?.(product, selectedSize)}
                className="flex-1 rounded-lg bg-gradient-to-r from-[#ff2d55] to-[#ff6b81] py-2 px-3 text-center text-xs font-extrabold uppercase tracking-wider text-white shadow-md transition-all duration-200 hover:from-[#ff1a47] hover:to-[#ff5c74] hover:shadow-[0_0_15px_rgba(255,45,85,0.4)] active:scale-98 cursor-pointer"
              >
                ADD
              </button>
            )}

            {product.status === "pre-order" && (
              <button
                type="button"
                onClick={() => onAddToCart?.(product, selectedSize)}
                className="flex-1 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 py-2 px-3 text-center text-xs font-extrabold uppercase tracking-wider text-white shadow-md transition-all duration-200 hover:from-amber-600 hover:to-orange-600 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] active:scale-98 cursor-pointer"
              >
                PRE-ORDER
              </button>
            )}

            {product.status === "sold-out" && (
              <button
                type="button"
                disabled
                className="flex-1 rounded-lg border border-white/5 bg-white/10 py-2 px-3 text-center text-xs font-extrabold uppercase tracking-wider text-stone-500 cursor-not-allowed"
              >
                OUT
              </button>
            )}
          </div>

          {/* Pre-order helper note */}
          {isPreOrder && (
            <span className="block text-center text-[10px] text-amber-500 italic mt-1.5 font-medium">
              Ships when back in stock
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// Sample fallback products to ensure seamless rendering when no items passed
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: "bs-1",
    badge: "Serum",
    discount: "-25%",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop&q=80",
    title: "Glow Deep Serum : Rice + Alpha-Arbutin",
    sizes: ["30ml", "50ml", "100ml"],
    originalPrice: 2200,
    currentPrice: 1650,
    status: "in-stock",
  },
  {
    id: "bs-2",
    badge: "Cleanser",
    discount: "-20%",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80",
    title: "Green Plum Refreshing Low pH Cleanser",
    sizes: ["100ml", "150ml"],
    originalPrice: 1850,
    currentPrice: 1480,
    status: "in-stock",
  },
  {
    id: "bs-3",
    badge: "Toner",
    discount: "-15%",
    image: "https://images.unsplash.com/photo-1608248597359-00e932b70f03?w=600&auto=format&fit=crop&q=80",
    title: "Ginseng Essence Water Deep Hydration Toner",
    sizes: ["40ml", "150ml"],
    originalPrice: 2100,
    currentPrice: 1785,
    status: "pre-order",
  },
  {
    id: "bs-4",
    badge: "Sunscreen",
    discount: "-43%",
    image: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&auto=format&fit=crop&q=80",
    title: "Relief Sun : Rice + Probiotics SPF50+ PA++++",
    sizes: ["50ml", "100ml (Twin)"],
    originalPrice: 2400,
    currentPrice: 1368,
    status: "in-stock",
  },
  {
    id: "bs-5",
    badge: "Moisturizer",
    discount: "-18%",
    image: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=600&auto=format&fit=crop&q=80",
    title: "Dynasty Barrier Repair Glow Cream",
    sizes: ["50ml", "100ml"],
    originalPrice: 2600,
    currentPrice: 2132,
    status: "sold-out",
  },
];

export default function BestSellersSection({
  products = DEFAULT_PRODUCTS,
  title = "Customer Favorites",
  subtitle = "Top-rated skincare formulas loved by our community for radiant glow",
  badgeLabel = "CUSTOMER FAVORITES",
  browseAllLink = "/products",
  onAddToCart,
  onViewDetails,
  className = "",
}: BestSellersSectionProps) {
  const swiperRef = useRef<SwiperType | null>(null);
  const [isBeginning, setIsBeginning] = useState(true);
  const [isEnd, setIsEnd] = useState(false);

  const displayProducts = products && products.length > 0 ? products : DEFAULT_PRODUCTS;

  return (
    <section
      id="best-sellers-section"
      className={`w-full bg-[#0f0a0d] py-12 sm:py-16 text-white ${className}`}
    >
      <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            {/* Red Pill Label with Icon */}
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#ff2d55]/25 bg-[#ff2d55]/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-[#ff2d55] shadow-xs">
              <Flame className="h-3.5 w-3.5 fill-[#ff2d55] text-[#ff2d55]" />
              {badgeLabel}
            </span>

            {/* Large Bold Title */}
            <h2 className="mt-2 font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white">
              {title}
            </h2>

            {/* Subtitle in Gray */}
            <p className="mt-1 text-xs sm:text-sm text-stone-400">
              {subtitle}
            </p>
          </div>

          {/* Right Header Navigation Controls & Browse All Link */}
          <div className="flex items-center gap-4 self-start sm:self-auto">
            {/* Prev / Next Arrows */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Previous slide"
                disabled={displayProducts.length < 4 && isBeginning}
                onClick={() => swiperRef.current?.slidePrev()}
                className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/60 backdrop-blur-md transition-all duration-200 cursor-pointer ${
                  displayProducts.length < 4 && isBeginning
                    ? "opacity-30 cursor-not-allowed text-stone-500"
                    : "text-white hover:border-[#ff2d55]/60 hover:bg-[#ff2d55]/20 hover:text-[#ff6b81]"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Next slide"
                disabled={displayProducts.length < 4 && isEnd}
                onClick={() => swiperRef.current?.slideNext()}
                className={`flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/60 backdrop-blur-md transition-all duration-200 cursor-pointer ${
                  displayProducts.length < 4 && isEnd
                    ? "opacity-30 cursor-not-allowed text-stone-500"
                    : "text-white hover:border-[#ff2d55]/60 hover:bg-[#ff2d55]/20 hover:text-[#ff6b81]"
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Browse All Link in Pink */}
            <Link
              href={browseAllLink}
              className="group inline-flex items-center gap-1 text-xs sm:text-sm font-extrabold uppercase tracking-wider text-[#ff2d55] hover:text-[#ff6b81] transition-colors"
            >
              <span>Browse All</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </div>
        </div>

        {/* Swiper Carousel */}
        <div className="relative">
          <Swiper
            modules={[Navigation, Autoplay]}
            autoplay={{
              delay: 2000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
              reverseDirection: false,
            }}
            loop={displayProducts.length >= 4}
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
              1024: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
              1280: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
            }}
            className="cherry-glow-swiper !pt-3 !pb-3 !px-1 -mt-2 -mb-2"
          >
            {displayProducts.map((product) => (
              <SwiperSlide key={product.id} className="!h-auto pt-1 pb-1">
                <BestSellerCard
                  product={product}
                  onAddToCart={onAddToCart}
                  onViewDetails={onViewDetails}
                />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
