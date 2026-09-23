"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Heart, ShoppingBag, Sparkles } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import AnimatedDiscountBorder from "../shared/AnimatedDiscountBorder";
import { cleanProductName, getVariantLabel, formatPrice } from "@/lib/utils";
import {
  getProductDisplayImage,
  DEFAULT_FALLBACK_IMAGE,
} from "@/lib/imageUtils";

export default function ProductCard({ product, onAddToCart = null, index = 0, viewMode = "grid", layout = "grid" }: any) {
  const tCard = useTranslations("productCard");
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { addToCart: contextAddToCart } = useCart();
  const isWishlisted = isInWishlist(product?._id || product?.id);

  const {
    _id,
    id,
    name = "",
    brand = "",
    thumbnail = "",
    image = "",
    images = [],
    variants = [],
    isBestSelling = false,
    isFeatured = false,
    type = "single",
    allowPreOrder: allowPreOrderProp = true,
    discountType = "none",
    discountValue = 0,
    price: basePriceParam,
    salePrice: salePriceParam,
    comboProducts = [],
    category,
  } = product || {};

  const productId = _id || id;

  const displayImage = useMemo(
    () => getProductDisplayImage(product, { width: 600, optimize: true }),
    [product]
  );

  const [imgSrc, setImgSrc] = useState(displayImage);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(displayImage);
    setHasError(false);
  }, [displayImage]);

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(DEFAULT_FALLBACK_IMAGE);
    }
  };

  // 👉 Default variant (lowest price or first)
  const [selectedVariant, setSelectedVariant] = useState(variants[0] || null);

  /* ---------------- Price Logic ---------------- */
  const { originalPrice, finalPrice } = useMemo(() => {
    let base = Number(product.price || product.basePrice || product.minPrice || 0);
    let sale = Number(product.salePrice) || base;

    if (selectedVariant && selectedVariant.price) {
      const varP = Number(selectedVariant.price);
      if (varP > 0) base = varP;
    }

    if (discountType === "percentage" && discountValue > 0) {
      sale = Math.round(base - (base * discountValue) / 100);
    } else if (discountType === "flat" && discountValue > 0) {
      sale = Math.max(base - discountValue, 0);
    }

    // Handle products where product.price is regular and product.salePrice is offer price
    if (product.price && product.salePrice && Number(product.price) > Number(product.salePrice)) {
      base = Number(product.price);
      sale = Number(product.salePrice);
    }

    return {
      originalPrice: base,
      finalPrice: sale,
    };
  }, [selectedVariant, product, discountType, discountValue]);

  const hasDiscount = originalPrice > finalPrice && finalPrice >= 0;
  const calculatedDiscountPercent = hasDiscount
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
    : 0;

  /* ---------------- Stock Calculation ---------------- */
  const inStock = useMemo(() => {
    if (type === "combo") {
      return (product.stock ?? 0) > 0;
    }
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
      const anyStockPositive = variants.some((v) => (typeof v.stock === "number" ? v.stock > 0 : true));
      return anyStockPositive;
    }
    // Default to in stock if not explicitly set to 0
    return true;
  }, [selectedVariant, product.stock, variants, type]);

  const allowPreOrder = product.allowPreOrder === true;
  const canPreOrder = !inStock && allowPreOrder;
  const canAddToCart = inStock || canPreOrder;

  /* ---------------- Cart Payload ---------------- */
  const handleAddToCart = (e) => {
    if (e) e.stopPropagation();
    if (!canAddToCart) return;

    const productForCart = {
      _id: productId,
      productId: productId,
      name,
      image: getProductDisplayImage(product, { optimize: false }),
      variants,
      selectedVariant,
      price: finalPrice,
      type: type || "single",
      isPreOrder: canPreOrder,
      stock: product.stock,
      quantity: 1,
    };

    if (onAddToCart) {
      onAddToCart(productForCart);
    } else {
      contextAddToCart(productForCart);
    }
  };

  /* ---------------- LIST VIEW LAYOUT ---------------- */
  if (viewMode === "list") {
    return (
      <div
        className={`flex flex-col sm:flex-row items-center gap-5 rounded-2xl p-4 border-2 transition-all duration-200 w-full group ${
          canPreOrder
            ? "bg-amber-500/5 dark:bg-amber-950/10 border-amber-500/70 dark:border-amber-500/60 hover:border-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            : "bg-white dark:bg-[#1f1317] border-stone-200/80 dark:border-white/12 hover:border-pink-500/70 dark:hover:border-rose-500/60 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:shadow-lg"
        }`}
      >
        {/* Full-Bleed Image Container */}
        <div className="relative w-full sm:w-48 h-44 shrink-0 bg-stone-50 dark:bg-[#25171d] border border-stone-100 dark:border-white/5 rounded-xl overflow-hidden">
          <Link href={`/products/${productId}`} className="block w-full h-full relative group/img cursor-pointer">
            <Image
              src={imgSrc || DEFAULT_FALLBACK_IMAGE}
              alt={cleanProductName(name)}
              fill
              sizes="(max-width: 768px) 100vw, 220px"
              priority={index < 4}
              onError={handleImageError}
              className="object-cover transition-transform duration-500 group-hover/img:scale-105"
            />

            {/* Floating Badges */}
            <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
              {canPreOrder ? (
                <span className="text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-amber-500 to-orange-500 backdrop-blur-md px-2 py-0.5 rounded-md shadow-xs">
                  ⏳ {tCard("preOrder")}
                </span>
              ) : type === "free" || finalPrice === 0 ? (
                <span className="text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-emerald-500 to-teal-600 backdrop-blur-md px-2 py-0.5 rounded-md shadow-xs">
                  🎁 {tCard("freeOrder")}
                </span>
              ) : type === "combo" ? (
                <span className="text-[10px] font-black uppercase tracking-wider text-white bg-rose-600/90 backdrop-blur-md px-2 py-0.5 rounded-md shadow-xs">
                  🔥 {tCard("comboDeal")}
                </span>
              ) : (
                category && (
                  <span className="text-[10px] font-bold text-stone-900 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md shadow-xs">
                    {category}
                  </span>
                )
              )}

              {hasDiscount && (
                <span className="text-[10px] font-black text-white bg-gradient-to-r from-red-600 to-rose-600 px-2 py-0.5 rounded-md shadow-sm">
                  -{calculatedDiscountPercent}% OFF
                </span>
              )}
            </div>
          </Link>

          {/* Floating Wishlist Heart */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleWishlist(product, e);
            }}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            aria-label="Wishlist"
            className={`absolute top-2.5 right-2.5 z-20 w-8 h-8 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-110 active:scale-95 cursor-pointer ${
              isWishlisted
                ? "bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-900/50 text-rose-500"
                : "bg-white/90 dark:bg-[#1f1317]/90 border-stone-200/80 dark:border-white/10 text-stone-600 dark:text-rose-100 hover:text-rose-500"
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
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedVariant(v);
                    }}
                    className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border transition cursor-pointer ${
                      selectedVariant === v
                        ? "bg-rose-500 text-white border-rose-500 shadow-2xs"
                        : "bg-stone-50 dark:bg-white/5 text-stone-600 dark:text-rose-100/70 border-stone-200 dark:border-white/10 hover:bg-rose-50"
                    }`}
                  >
                    {getVariantLabel(v, i)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-stone-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <span className="text-lg font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                {finalPrice === 0 || type === "free" ? `${tCard("free")} (৳ 0)` : `৳ ${finalPrice.toLocaleString()}`}
              </span>
              {hasDiscount && (
                <span className="text-xs line-through text-stone-400 font-mono">
                  ৳ {originalPrice.toLocaleString()}
                </span>
              )}
              <span
                className={`text-[11px] font-bold ${
                  inStock
                    ? "text-emerald-600 dark:text-emerald-400"
                    : canPreOrder
                    ? "text-amber-600 dark:text-amber-400"
                    : "text-red-500"
                }`}
              >
                {inStock ? tCard("inStock") : canPreOrder ? tCard("preOrderAvailable") : tCard("outOfStock")}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href={`/products/${productId}`}
                className="px-4 py-2 rounded-xl border border-rose-400/80 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
              >
                {tCard("details")}
              </Link>

              <div className="flex flex-col items-end">
                <button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  className={`px-5 py-2 rounded-xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer shadow-2xs ${
                    inStock
                      ? "bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                      : canPreOrder
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white animate-pulse"
                      : "bg-stone-200 dark:bg-white/10 text-stone-400 cursor-not-allowed"
                  }`}
                >
                  {inStock ? tCard("addToCart") : canPreOrder ? tCard("preOrder") : tCard("outOfStock")}
                </button>
                {canPreOrder && (
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                    {tCard("shipsBackInStock")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------- GRID VIEW LAYOUT (FULL-BLEED BEAUTY CARDS) ---------------- */
  const CardContent = (
    <div
      className={`flex h-full flex-col rounded-2xl p-2.5 sm:p-3.5 border-2 hover:-translate-y-1 transition-all duration-300 group ${
        canPreOrder
          ? "bg-amber-500/5 dark:bg-amber-950/10 border-amber-500/70 dark:border-amber-500/60 hover:border-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          : "bg-white dark:bg-[#1f1317] border-stone-200/80 dark:border-white/12 hover:border-pink-500/70 dark:hover:border-rose-500/60 shadow-[0_2px_12px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.25)] hover:shadow-lg"
      }`}
    >
      {/* Full-Bleed Image Banner */}
      <div className="relative w-full h-36 sm:h-52 md:h-56 mb-2.5 sm:mb-3 bg-stone-50 dark:bg-[#25171d] border border-stone-100 dark:border-white/5 rounded-xl overflow-hidden group/img">
        <Link href={`/products/${productId}`} className="block w-full h-full relative cursor-pointer">
          <Image
            src={imgSrc || DEFAULT_FALLBACK_IMAGE}
            alt={cleanProductName(name)}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={index < 4}
            onError={handleImageError}
            className="object-cover transition-transform duration-500 group-hover/img:scale-105"
          />

          {/* Floating Top-Left Badges */}
          <div className="absolute top-2 left-2 sm:top-2.5 sm:left-2.5 z-10 flex flex-col gap-1 items-start">
            {canPreOrder ? (
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-amber-500 to-orange-500 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs">
                ⏳ {tCard("preOrder")}
              </span>
            ) : type === "free" || finalPrice === 0 ? (
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white bg-gradient-to-r from-emerald-500 to-teal-600 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs">
                🎁 {tCard("freeOrder")}
              </span>
            ) : type === "combo" ? (
              <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-white bg-rose-600/90 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs">
                🔥 {tCard("combo")}
              </span>
            ) : (
              category && (
                <span className="text-[9px] sm:text-[10px] font-bold text-stone-900 bg-white/90 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-md shadow-xs max-w-[90px] sm:max-w-[100px] truncate">
                  {category}
                </span>
              )
            )}

            {hasDiscount && (
              <span className="text-[10px] sm:text-[11px] font-black text-white bg-gradient-to-r from-red-600 to-rose-600 px-2 py-0.5 rounded-md shadow-sm">
                -{calculatedDiscountPercent}%
              </span>
            )}
          </div>

          {/* Combo Bundle Component Product Image Collage Stack */}
          {type === "combo" && product.comboProducts && product.comboProducts.length > 0 && (
            <div className="absolute bottom-2 left-2 z-20 flex items-center bg-white/95 dark:bg-[#1f1317]/95 backdrop-blur-md px-2.5 py-1 rounded-full shadow-md border border-stone-200/80 dark:border-rose-900/50">
              <div className="flex -space-x-2 overflow-hidden">
                {product.comboProducts.slice(0, 3).map((cp: any, i: number) => {
                  const cpImg = getProductDisplayImage(cp, { width: 100 });
                  const hasRealImg = cp.image || cp.thumbnail;
                  return hasRealImg ? (
                    <img
                      key={i}
                      src={cpImg}
                      alt={cp.name || "Item"}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = DEFAULT_FALLBACK_IMAGE;
                      }}
                      className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-rose-950 object-cover"
                    />
                  ) : (
                    <div
                      key={i}
                      title={cp.name}
                      className="inline-flex items-center justify-center h-6 w-6 rounded-full ring-2 ring-white dark:ring-rose-950 bg-gradient-to-tr from-pink-500 to-rose-500 text-white text-[9px] font-extrabold shadow-2xs"
                    >
                      {cp.name ? cp.name.charAt(0).toUpperCase() : <Sparkles className="w-3 h-3" />}
                    </div>
                  );
                })}
              </div>
              <span className="ml-1.5 text-[9px] sm:text-[10px] font-extrabold text-rose-600 dark:text-rose-400">
                {tCard("comboItems", { count: product.comboProducts.length })}
              </span>
            </div>
          )}
        </Link>

        {/* Floating Wishlist Love Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product, e);
          }}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          aria-label="Wishlist"
          className={`absolute top-2 right-2 sm:top-2.5 sm:right-2.5 z-20 w-7 h-7 sm:w-8.5 sm:h-8.5 rounded-full backdrop-blur-md border flex items-center justify-center transition-all duration-300 shadow-sm hover:scale-110 active:scale-95 cursor-pointer ${
            isWishlisted
              ? "bg-rose-50 dark:bg-rose-950/90 border-rose-200 dark:border-rose-900/50 text-rose-500"
              : "bg-white/90 dark:bg-[#1f1317]/90 border-stone-200/80 dark:border-white/10 text-stone-600 dark:text-rose-100 hover:text-rose-500"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition ${isWishlisted ? "fill-rose-500 text-rose-500" : ""}`} />
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col justify-between space-y-2.5">
        <div>
          <Link href={`/products/${productId}`} className="block">
            <h3 className="font-bold text-stone-900 dark:text-white text-xs sm:text-[13.5px] line-clamp-2 leading-[1.35] tracking-tight group-hover:text-rose-600 dark:group-hover:text-rose-400 transition cursor-pointer">
              {cleanProductName(name)}
            </h3>
          </Link>

          {/* Variant Selector */}
          {variants.length > 1 && (
            <div className="mt-1.5 flex flex-wrap gap-1">
              {variants.map((v, i) => (
                <button
                  key={i}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVariant(v);
                  }}
                  className={`px-2 py-0.5 text-[9px] sm:text-[10px] font-bold rounded-full border transition cursor-pointer ${
                    selectedVariant === v
                      ? "bg-rose-500 text-white border-rose-500 shadow-2xs"
                      : "bg-stone-50 dark:bg-white/5 text-stone-600 dark:text-rose-100/70 border-stone-200 dark:border-white/10 hover:bg-rose-50"
                  }`}
                >
                  {getVariantLabel(v, i)}
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {/* Price & Stock */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex gap-1.5 sm:gap-2 items-baseline flex-wrap">
              {(() => {
                const formatted = formatPrice(
                  originalPrice,
                  type === "free" ? 0 : finalPrice
                );
                return (
                  <>
                    {formatted.originalText && (
                      <span className="text-[11px] sm:text-xs line-through text-stone-400 dark:text-stone-400 font-mono">
                        {formatted.originalText}
                      </span>
                    )}
                    <span
                      className={`text-sm sm:text-lg font-black tracking-tight ${
                        formatted.isFree
                          ? "text-emerald-600 dark:text-emerald-400 uppercase"
                          : "text-rose-600 dark:text-rose-400 font-mono"
                      }`}
                    >
                      {formatted.finalText}
                    </span>
                  </>
                );
              })()}
            </div>

            <span
              className={`text-[9px] sm:text-[10px] font-bold ${
                inStock
                  ? "text-emerald-600 dark:text-emerald-400"
                  : canPreOrder
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-red-500"
              }`}
            >
              {inStock ? tCard("inStock") : canPreOrder ? tCard("preOrderAvailable") : tCard("outOfStock")}
            </span>
          </div>

          {/* Actions Footer */}
          <div className="flex flex-col gap-1 pt-2">
            <div className="flex gap-1.5 sm:gap-2">
              <Link
                href={`/products/${productId}`}
                className="w-1/2 text-center rounded-xl border border-rose-400/80 text-rose-600 dark:text-rose-400 py-1.5 sm:py-2 text-[10px] sm:text-xs font-bold hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer flex items-center justify-center truncate"
              >
                {tCard("details")}
              </Link>

              <button
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className={`w-1/2 rounded-xl py-2 text-[10px] sm:text-xs font-extrabold uppercase tracking-wider transition cursor-pointer shadow-sm flex items-center justify-center gap-1.5 truncate ${
                  inStock
                    ? "bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white shadow-rose-500/20 active:scale-[0.98]"
                    : canPreOrder
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold active:scale-[0.98]"
                    : "bg-stone-200 dark:bg-white/10 text-stone-400 cursor-not-allowed"
                }`}
              >
                {inStock ? (
                  <>
                    <ShoppingBag className="w-3.5 h-3.5 shrink-0" />
                    <span>{tCard("add")}</span>
                  </>
                ) : canPreOrder ? (
                  <span>{tCard("preOrder")}</span>
                ) : (
                  <span>{tCard("out")}</span>
                )}
              </button>
            </div>

            {canPreOrder && (
              <span className="text-[9px] sm:text-[10px] text-amber-600 dark:text-amber-400 font-medium text-center italic">
                {tCard("shipsBackInStock")}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return CardContent;
}
