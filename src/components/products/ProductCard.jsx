"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import AnimatedDiscountBorder from "../shared/AnimatedDiscountBorder";

export default function ProductCard({ product, onAddToCart, index, viewMode = "grid" }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product._id || product.id);

  const {
    _id,
    name,
    image,
    variants = [],
    discountType,
    discountValue,
  } = product;

  // 👉 Default variant (lowest price or first)
  const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);

  /* ---------------- Price Logic ---------------- */

  const finalPrice = useMemo(() => {
    if (!selectedVariant) return 0;

    const base = selectedVariant.price;

    if (discountType === "percentage") {
      return Math.round(base - (base * discountValue) / 100);
    }

    if (discountType === "flat") {
      return Math.max(base - discountValue, 0);
    }

    return base;
  }, [selectedVariant, discountType, discountValue]);

  const hasDiscount = discountValue > 0;

  /* ---------------- Cart Payload ---------------- */
  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock === 0) return;

    const productForCart = {
      _id,
      name,
      image,
      variants,
    };
    onAddToCart(productForCart);
  };

  const optimizedImage =
    image && typeof image === "string" && image.includes("/upload/")
      ? image.replace("/upload/", "/upload/w_600,f_auto,q_auto:good/")
      : image || "/placeholder.png";

  /* ---------------- LIST VIEW LAYOUT ---------------- */
  if (viewMode === "list") {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-5 rounded-2xl bg-white dark:bg-[#1e1215] p-4.5 border border-stone-200/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)] transition-all duration-300 w-full">
        {/* Image */}
        <div className="relative w-full sm:w-44 h-40 shrink-0 bg-stone-50/50 dark:bg-stone-900/40 rounded-xl overflow-hidden">
          <Image
            src={optimizedImage || "/placeholder.png"}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 200px"
            priority={index < 4}
            className="object-contain p-2"
          />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full w-full">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              {product.type === "combo" && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-900/30">
                  🔥 Combo Deal
                </span>
              )}
              {product.category && (
                <span className="text-[10px] font-semibold text-stone-500 dark:text-rose-100/60 bg-stone-100 dark:bg-white/5 px-2 py-0.5 rounded-md">
                  {product.category}
                </span>
              )}
              {hasDiscount && (
                <span className="text-xs font-bold text-pink-500 bg-pink-50 dark:bg-pink-950/30 px-2 py-0.5 rounded-full border border-pink-100 dark:border-pink-900/30">
                  {discountType === "percentage"
                    ? `${discountValue}% OFF`
                    : `৳${discountValue} OFF`}
                </span>
              )}
            </div>

            <h3 className="font-semibold text-stone-900 dark:text-rose-50 text-base">{name}</h3>

            {/* Variant Selector */}
            {variants.length > 1 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {variants.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border transition cursor-pointer ${
                      selectedVariant === v
                        ? "bg-pink-500 text-white border-pink-500 shadow-2xs"
                        : "bg-stone-50 dark:bg-white/5 text-stone-600 dark:text-rose-100/70 border-stone-200 dark:border-white/10 hover:bg-pink-50"
                    }`}
                  >
                    {v.weight}
                    {v.unit}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-lg font-extrabold text-pink-600 dark:text-pink-400">
                ৳ {finalPrice}
              </span>
              {hasDiscount && (
                <span className="text-xs line-through text-stone-400">
                  ৳ {selectedVariant?.price}
                </span>
              )}
              <span
                className={`text-[11px] font-bold ${
                  selectedVariant?.stock > 0
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-red-500"
                }`}
              >
                {selectedVariant?.stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/products/${_id}`}
                className="px-4 py-2 rounded-xl border border-pink-400/80 text-pink-600 dark:text-pink-400 text-xs font-bold hover:bg-pink-50 dark:hover:bg-pink-950/30 transition cursor-pointer"
              >
                Details
              </Link>

              <button
                onClick={handleAddToCart}
                disabled={!selectedVariant || selectedVariant.stock === 0}
                className={`px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer shadow-2xs ${
                  selectedVariant?.stock > 0
                    ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                    : "bg-stone-200 dark:bg-white/10 text-stone-400 cursor-not-allowed"
                }`}
              >
                {selectedVariant?.stock > 0 ? "Add To Cart" : "Out of Stock"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- GRID VIEW LAYOUT ---------------- */
  const CardContent = (
    <div className="flex h-full flex-col rounded-2xl bg-white dark:bg-[#1e1215] p-4 border border-stone-200/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300">
      {/* Badges container */}
      <div className="flex justify-between items-center mb-2">
        {product.type === "combo" ? (
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-600 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md border border-rose-100 dark:border-rose-900/30">
            🔥 Combo Deal
          </span>
        ) : (
          <span></span>
        )}
        
        {hasDiscount && (
          <span className="text-xs font-bold text-pink-500 bg-pink-50 dark:bg-pink-950/30 px-2 py-0.5 rounded-full border border-pink-100 dark:border-pink-900/30">
            {discountType === "percentage"
              ? `${discountValue}% OFF`
              : `৳${discountValue} OFF`}
          </span>
        )}
      </div>

      {/* Image */}
      <div className="relative w-full h-48 mb-4 bg-stone-50/50 dark:bg-stone-900/40 rounded-xl overflow-hidden group/img">
        <Image
          src={optimizedImage || "/placeholder.png"}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          priority={index < 4}
          className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
        />

        {/* Wishlist Love Heart Button */}
        <button
          onClick={(e) => toggleWishlist(product, e)}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          aria-label="Wishlist"
          className={`absolute top-2.5 right-2.5 z-10 w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300 shadow-2xs hover:scale-110 active:scale-95 cursor-pointer ${
            isWishlisted
              ? "bg-rose-50 dark:bg-rose-950/80 border-rose-200 dark:border-rose-900/50 text-rose-500 shadow-sm"
              : "bg-white/90 dark:bg-[#1e1215]/90 border-stone-200/80 dark:border-white/10 text-stone-500 dark:text-rose-100/70 hover:text-rose-500 hover:border-rose-300"
          }`}
        >
          <Heart className={`w-4 h-4 transition ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col">
        <h3 className="font-semibold text-stone-850 dark:text-rose-50 text-sm line-clamp-2">{name}</h3>

        {/* Variant Selector */}
        {variants.length > 1 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {variants.map((v, i) => (
              <button
                key={i}
                onClick={() => setSelectedVariant(v)}
                className={`px-2.5 py-0.5 text-[11px] font-semibold rounded-full border transition cursor-pointer
                  ${
                    selectedVariant === v
                      ? "bg-pink-500 text-white border-pink-500 shadow-2xs"
                      : "bg-stone-50 dark:bg-white/5 text-stone-600 dark:text-rose-100/70 border-stone-200 dark:border-white/10 hover:bg-pink-50"
                  }`}
              >
                {v.weight}
                {v.unit}
              </button>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-2 items-baseline">
            <span className="text-base font-extrabold text-pink-600 dark:text-pink-400">
              ৳ {finalPrice}
            </span>

            {hasDiscount && (
              <span className="text-xs line-through text-stone-400">
                ৳ {selectedVariant?.price}
              </span>
            )}
          </div>

          {/* Stock */}
          <span
            className={`text-[11px] font-bold ${
              selectedVariant?.stock > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
            }`}
          >
            {selectedVariant?.stock > 0 ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-2 pt-4">
          <Link
            href={`/products/${_id}`}
            className="w-full text-center rounded-xl border border-pink-400/80 text-pink-600 dark:text-pink-400 py-2 text-xs font-bold hover:bg-pink-50 dark:hover:bg-pink-950/30 transition cursor-pointer"
          >
            Details
          </Link>

          <button
            onClick={handleAddToCart}
            disabled={!selectedVariant || selectedVariant.stock === 0}
            className={`w-full rounded-xl py-2 text-xs font-extrabold uppercase tracking-wider transition cursor-pointer shadow-2xs
              ${
                selectedVariant?.stock > 0
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white"
                  : "bg-stone-200 dark:bg-white/10 text-stone-400 cursor-not-allowed"
              }`}
          >
            {selectedVariant?.stock > 0 ? "Add" : "Out"}
          </button>
        </div>
      </div>
    </div>
  );

  return hasDiscount && discountValue >= 10 ? (
    <AnimatedDiscountBorder>{CardContent}</AnimatedDiscountBorder>
  ) : (
    CardContent
  );
}
