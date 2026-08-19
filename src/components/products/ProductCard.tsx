"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import AnimatedDiscountBorder from "../shared/AnimatedDiscountBorder";
import { cleanProductName } from "@/lib/utils";

export default function ProductCard({ product, onAddToCart, index = 0, viewMode = "grid" }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product._id || product.id);

  const {
    _id,
    id,
    name,
    image,
    thumbnail,
    images = [],
    variants = [],
    discountType,
    discountValue,
    type,
    category,
  } = product;

  const productId = _id || id;

  // 👉 Default variant (lowest price or first)
  const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);

  /* ---------------- Price Logic ---------------- */
  const { originalPrice, finalPrice } = useMemo(() => {
    let base = selectedVariant ? Number(selectedVariant.price) : Number(product.price || product.basePrice || product.minPrice || 0);
    let sale = Number(product.salePrice) || base;

    if (discountType === "percentage" && discountValue > 0) {
      sale = Math.round(base - (base * discountValue) / 100);
    } else if (discountType === "flat" && discountValue > 0) {
      sale = Math.max(base - discountValue, 0);
    }

    return {
      originalPrice: base,
      finalPrice: sale,
    };
  }, [selectedVariant, product, discountType, discountValue]);

  const hasDiscount = (discountValue > 0) || (originalPrice > finalPrice && finalPrice > 0);
  const calculatedDiscountPercent = hasDiscount && originalPrice > finalPrice
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : (discountValue || 0);

  /* ---------------- Stock Calculation ---------------- */
  const inStock = useMemo(() => {
    // If selected variant explicitly has stock defined
    if (selectedVariant && typeof selectedVariant.stock === "number") {
      return selectedVariant.stock > 0;
    }
    // If product has numeric stock defined
    if (typeof product.stock === "number") {
      return product.stock > 0;
    }
    // If variants array has stock defined
    if (variants && variants.length > 0) {
      const sumStock = variants.reduce((sum, v) => sum + (typeof v.stock === "number" ? v.stock : 10), 0);
      return sumStock > 0;
    }
    // Default to in stock if not explicitly set to 0
    return true;
  }, [selectedVariant, product.stock, variants]);

  /* ---------------- Cart Payload ---------------- */
  const handleAddToCart = (e) => {
    if (e) e.stopPropagation();
    if (!inStock) return;

    const productForCart = {
      _id: productId,
      name,
      image: thumbnail || image || images?.[0]?.url || "/placeholder.png",
      variants,
      selectedVariant,
      price: finalPrice,
      type: type || "single",
    };

    if (onAddToCart) {
      onAddToCart(productForCart);
    }
  };

  const displayImage = thumbnail || image || images?.[0]?.url || "/placeholder.jpg";

  const optimizedImage =
    displayImage && typeof displayImage === "string" && displayImage.includes("/upload/")
      ? displayImage.replace("/upload/", "/upload/w_600,f_auto,q_auto:good/")
      : displayImage;

  const [imgSrc, setImgSrc] = useState(optimizedImage);

  /* ---------------- LIST VIEW LAYOUT ---------------- */
  if (viewMode === "list") {
    return (
      <div className="flex flex-col sm:flex-row items-center gap-5 rounded-2xl bg-white dark:bg-[#1e1215] p-4 border border-stone-200/80 dark:border-white/10 shadow-xs hover:shadow-md transition-all duration-300 w-full group">
        {/* Full-Bleed Image Container */}
        <div className="relative w-full sm:w-48 h-44 shrink-0 bg-stone-100 dark:bg-stone-900/60 rounded-xl overflow-hidden">
          <Link href={`/products/${productId}`} className="block w-full h-full relative group/img cursor-pointer">
            <Image
              src={imgSrc || "/placeholder.jpg"}
              alt={name}
              fill
              sizes="(max-width: 768px) 100vw, 220px"
              priority={index < 4}
              onError={() => setImgSrc("/placeholder.jpg")}
              className="object-cover transition-transform duration-500 group-hover/img:scale-105"
            />

            {/* Floating Badges */}
            <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
              {type === "combo" ? (
                <span className="text-[10px] font-black uppercase tracking-wider text-white bg-rose-600/90 backdrop-blur-md px-2 py-0.5 rounded-md shadow-xs">
                  🔥 Combo Deal
                </span>
              ) : (
                category && (
                  <span className="text-[10px] font-bold text-stone-900 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md shadow-xs">
                    {category}
                  </span>
                )
              )}

              {hasDiscount && (
                <span className="text-[10px] font-black text-white bg-red-600/90 backdrop-blur-md px-2 py-0.5 rounded-md shadow-xs">
                  -{calculatedDiscountPercent}% OFF
                </span>
              )}
            </div>
          </Link>

          {/* Floating Wishlist Heart */}
          <button
            onClick={(e) => toggleWishlist(product, e)}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            aria-label="Wishlist"
            className={`absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-110 active:scale-95 cursor-pointer ${
              isWishlisted
                ? "bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-900/50 text-rose-500"
                : "bg-white/90 dark:bg-[#1e1215]/90 border-stone-200/80 dark:border-white/10 text-stone-600 dark:text-rose-100 hover:text-rose-500"
            }`}
          >
            <Heart className={`w-4 h-4 transition ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 flex flex-col justify-between h-full w-full">
          <div>
            <Link href={`/products/${productId}`} className="block">
              <h3 className="font-bold text-stone-900 dark:text-rose-50 text-base line-clamp-1 hover:text-rose-600 dark:hover:text-rose-400 hover:underline transition cursor-pointer">
                {cleanProductName(name)}
              </h3>
            </Link>

            {/* Variant Selector */}
            {variants.length > 1 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {variants.map((v, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border transition cursor-pointer ${
                      selectedVariant === v
                        ? "bg-rose-500 text-white border-rose-500 shadow-2xs"
                        : "bg-stone-50 dark:bg-white/5 text-stone-600 dark:text-rose-100/70 border-stone-200 dark:border-white/10 hover:bg-rose-50"
                    }`}
                  >
                    {v.size || `${v.weight || ""}${v.unit || ""}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                ৳ {finalPrice.toLocaleString()}
              </span>
              {hasDiscount && (
                <span className="text-xs line-through text-stone-400 font-mono">
                  ৳ {originalPrice.toLocaleString()}
                </span>
              )}
              <span
                className={`text-[11px] font-bold ${
                  inStock ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
                }`}
              >
                {inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            <div className="flex gap-2">
              <Link
                href={`/products/${productId}`}
                className="px-4 py-2 rounded-xl border border-rose-400/80 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
              >
                Details
              </Link>

              <button
                onClick={handleAddToCart}
                disabled={!inStock}
                className={`px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer shadow-2xs ${
                  inStock
                    ? "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                    : "bg-stone-200 dark:bg-white/10 text-stone-400 cursor-not-allowed"
                }`}
              >
                {inStock ? "Add To Cart" : "Out of Stock"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- GRID VIEW LAYOUT (FULL-BLEED BEAUTY CARDS) ---------------- */
  const CardContent = (
    <div className="flex h-full flex-col rounded-2xl bg-white dark:bg-[#1e1215] p-3 sm:p-3.5 border border-stone-200/80 dark:border-white/10 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
      
      {/* Full-Bleed Image Banner */}
      <div className="relative w-full h-40 sm:h-52 md:h-56 mb-2.5 sm:mb-3 bg-stone-100 dark:bg-stone-900/60 rounded-xl overflow-hidden group/img">
        <Link href={`/products/${productId}`} className="block w-full h-full relative cursor-pointer">
          <Image
            src={imgSrc || "/placeholder.jpg"}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={index < 4}
            onError={() => setImgSrc("/placeholder.jpg")}
            className="object-cover transition-transform duration-500 group-hover/img:scale-105"
          />

          {/* Floating Top-Left Badges */}
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 flex flex-col gap-1 items-start">
            {type === "combo" ? (
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white bg-rose-600/90 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs">
                🔥 Combo
              </span>
            ) : (
              category && (
                <span className="text-[9px] sm:text-[10px] font-bold text-stone-900 bg-white/90 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs max-w-[100px] truncate">
                  {category}
                </span>
              )
            )}

            {hasDiscount && (
              <span className="text-[9px] sm:text-[10px] font-black text-white bg-red-600/90 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs">
                -{calculatedDiscountPercent}%
              </span>
            )}
          </div>
        </Link>

        {/* Floating Wishlist Love Heart Button */}
        <button
          onClick={(e) => toggleWishlist(product, e)}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          aria-label="Wishlist"
          className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-110 active:scale-95 cursor-pointer ${
            isWishlisted
              ? "bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-900/50 text-rose-500"
              : "bg-white/90 dark:bg-[#1e1215]/90 border-stone-200/80 dark:border-white/10 text-stone-600 dark:text-rose-100 hover:text-rose-500"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between space-y-2.5">
        <div>
          <Link href={`/products/${productId}`} className="block">
            <h3 className="font-semibold text-stone-900 dark:text-rose-50 text-xs sm:text-sm line-clamp-2 leading-snug hover:text-rose-600 dark:hover:text-rose-400 hover:underline transition cursor-pointer">
              {cleanProductName(name)}
            </h3>
          </Link>

          {/* Variant Selector */}
          {variants.length > 1 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {variants.map((v, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedVariant(v)}
                  className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-full border transition cursor-pointer ${
                    selectedVariant === v
                      ? "bg-rose-500 text-white border-rose-500 shadow-2xs"
                      : "bg-stone-50 dark:bg-white/5 text-stone-600 dark:text-rose-100/70 border-stone-200 dark:border-white/10 hover:bg-rose-50"
                  }`}
                >
                  {v.size || `${v.weight || ""}${v.unit || ""}`}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {/* Price & Stock */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-1.5 sm:gap-2 items-baseline flex-wrap">
              <span className="text-xs sm:text-base font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                ৳ {finalPrice.toLocaleString()}
              </span>

              {hasDiscount && (
                <span className="text-[10px] sm:text-xs line-through text-stone-400 font-mono">
                  ৳ {originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            <span
              className={`text-[9px] sm:text-[10px] font-bold ${
                inStock ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"
              }`}
            >
              {inStock ? "In Stock" : "Sold Out"}
            </span>
          </div>

          {/* Actions Footer */}
          <div className="flex gap-1.5 sm:gap-2 pt-2.5">
            <Link
              href={`/products/${productId}`}
              className="w-1/2 text-center rounded-xl border border-rose-400/80 text-rose-600 dark:text-rose-400 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer flex items-center justify-center truncate"
            >
              Details
            </Link>

            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className={`w-1/2 rounded-xl py-1.5 sm:py-2 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider transition cursor-pointer shadow-2xs flex items-center justify-center truncate ${
                inStock
                  ? "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                  : "bg-stone-200 dark:bg-white/10 text-stone-400 cursor-not-allowed"
              }`}
            >
              {inStock ? "Add" : "Out"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return hasDiscount && calculatedDiscountPercent >= 10 ? (
    <AnimatedDiscountBorder>{CardContent}</AnimatedDiscountBorder>
  ) : (
    CardContent
  );
}
