"use client";

import Image from "next/image";
import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { Truck, ShieldCheck } from "lucide-react";

const FALLBACK_IMAGE = "/placeholder.jpg";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const router = useRouter();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  /* ---------------- Fetch Product Details & Combo Populated Data ---------------- */
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/products/singleProduct/${id}`,
        );
        const p = res.data;
        setProduct(p);

        // If it's a combo, load the populated version
        if (p.type === "combo") {
          const comboRes = await axios.get(`${API_BASE}/combos/${id}`);
          setProduct(comboRes.data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, API_BASE]);

  /* ---------------- Images ---------------- */
  const imageList = useMemo(() => {
    if (!product) return [];
    
    // Merge gallery and images
    const galleryUrls = product.gallery || [];
    const imageObjectUrls = product.images?.map((i) => i?.url).filter(Boolean) || [];
    const all = [product.image, product.thumbnail, ...galleryUrls, ...imageObjectUrls].filter(Boolean);
    return Array.from(new Set(all));
  }, [product]);

  /* ---------------- Default Image ---------------- */
  useEffect(() => {
    if (imageList.length > 0) {
      setSelectedImage(imageList[0]);
    }
  }, [imageList]);

  /* ---------------- Default Variant ---------------- */
  useEffect(() => {
    if (product?.variants?.length) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  /* ---------------- Price ---------------- */
  const finalPrice = useMemo(() => {
    if (!product) return 0;
    if (product.type === "combo") return product.salePrice || 0;
    if (!selectedVariant) return 0;

    const base = selectedVariant.price;
    if (product.discountType === "percentage") {
      return Math.round(base - (base * product.discountValue) / 100);
    }
    if (product.discountType === "fixed") {
      return Math.max(0, base - product.discountValue);
    }
    return base;
  }, [product, selectedVariant]);

  const originalPrice = product?.type === "combo" ? (product.price || 0) : (selectedVariant?.price || 0);
  const discountAmount = originalPrice - finalPrice;
  const discountPercent = originalPrice > 0 ? Math.round((discountAmount / originalPrice) * 100) : 0;

  /* ---------------- Stock ---------------- */
  const stock = product?.type === "combo" ? (product.stock || 0) : (selectedVariant?.stock || 0);

  /* ---------------- Add To Cart ---------------- */
  const handleAddToCart = () => {
    if (!product) return;
    if (product.type !== "combo" && !selectedVariant) {
      return toast.error("Select a variant");
    }

    setAdding(true);

    const productForCart = {
      _id: product._id,
      name: product.name,
      image: selectedImage || product.thumbnail || product.images?.[0]?.url || FALLBACK_IMAGE,
      variants: product.variants || [],
      selectedVariant: selectedVariant,
      price: product.type === "combo" ? product.salePrice : finalPrice,
      type: product.type || "single",
      comboProducts: product.comboProducts || []
    };

    addToCart(productForCart);
    setTimeout(() => setAdding(false), 400);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (product.type !== "combo" && !selectedVariant) {
      return toast.error("Select a variant");
    }

    const productForCart = {
      _id: product._id,
      name: product.name,
      image: selectedImage || product.thumbnail || product.images?.[0]?.url || FALLBACK_IMAGE,
      variants: product.variants || [],
      selectedVariant: selectedVariant,
      price: product.type === "combo" ? product.salePrice : finalPrice,
      type: product.type || "single",
      comboProducts: product.comboProducts || []
    };

    addToCart(productForCart);
    router.push("/cart");
  };

  if (loading) return <ProductSkeleton />;

  if (!product)
    return <p className="text-center py-20 text-gray-500">Product not found</p>;

  const { name, brand, category, description, useCase, howToUse, ingredients } = product;

  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
        
        {/* LEFT COLUMN: IMAGES */}
        <div className="md:col-span-6 space-y-4">
          <ProductImagePanel selectedImage={selectedImage} altText={name} />
          
          {/* Thumbnails list */}
          {imageList.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto py-1.5 scrollbar-thin">
              {imageList.map((img, idx) => (
                <ThumbnailButton
                  key={idx}
                  imgSrc={img}
                  active={selectedImage === img}
                  onClick={() => setSelectedImage(img)}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: DETAILS */}
        <div className="md:col-span-6 space-y-6">
          
          {/* Brand Tag, Title, and Category */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-pink-500 bg-pink-50 dark:bg-pink-950/20 px-2.5 py-1 rounded-md border border-pink-100 dark:border-white/5 inline-block w-fit">
              {brand}
            </span>
            <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-stone-900 dark:text-rose-50 leading-tight">
              {name}
            </h1>
            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">
              {category}
            </p>
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-3.5 border-b border-rose-100/60 dark:border-white/5 pb-4">
            <span className="text-2xl md:text-3xl font-extrabold text-pink-600 dark:text-pink-400">
              ৳{finalPrice}
            </span>
            {originalPrice > finalPrice && (
              <div className="flex items-center gap-2">
                <span className="line-through text-xs md:text-sm text-stone-400">
                  ৳{originalPrice}
                </span>
                <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-100/60 dark:border-emerald-950/40 uppercase tracking-wider">
                  Save ৳{discountAmount.toFixed(0)} ({discountPercent}% OFF)
                </span>
              </div>
            )}
          </div>

          {/* Stock Indicator Status Badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${stock > 0 ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
            <span className={`text-xs font-semibold ${stock > 0 ? "text-emerald-600 dark:text-emerald-450" : "text-red-500"}`}>
              {stock > 0 ? `In Stock (${stock} units available)` : "Out of Stock"}
            </span>
          </div>

          {/* Trust/Delivery Badger Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl border border-rose-100/40 dark:border-white/5 bg-rose-50/5 dark:bg-white/5 space-y-1 flex items-start gap-3">
              <Truck className="text-pink-500 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-[11px] font-bold text-stone-800 dark:text-rose-100">Estimated Delivery</p>
                <p className="text-[10px] text-stone-500 dark:text-rose-100/45 mt-0.5">1-2 Days Dhaka, 2-3 Days Outside</p>
              </div>
            </div>
            <div className="p-3.5 rounded-2xl border border-rose-100/40 dark:border-white/5 bg-rose-50/5 dark:bg-white/5 space-y-1 flex items-start gap-3">
              <ShieldCheck className="text-pink-500 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-[11px] font-bold text-stone-800 dark:text-rose-100">100% Authentic</p>
                <p className="text-[10px] text-stone-500 dark:text-rose-100/45 mt-0.5">Korean Import Quality Guarantee</p>
              </div>
            </div>
          </div>

          {/* What's Included (Combo specific populated view) */}
          {product.type === "combo" && product.comboProducts && product.comboProducts.length > 0 && (
            <div className="space-y-4.5 border border-rose-100 dark:border-white/5 p-4.5 rounded-2xl bg-rose-50/10 dark:bg-[#23181C]/20">
              <h3 className="font-serif font-bold text-stone-850 dark:text-rose-50 text-xs uppercase tracking-wider">
                What's Included in this Custom Combo:
              </h3>
              <div className="space-y-2.5">
                {product.comboProducts.map((item, idx) => {
                  const pInfo = item.product || {};
                  return (
                    <ComboProductRow key={idx} pInfo={pInfo} quantity={item.quantity} />
                  );
                })}
              </div>
            </div>
          )}

          {/* Variants (Only for Single Products) */}
          {product.type !== "combo" && product.variants?.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h3 className="font-serif font-bold text-stone-800 dark:text-rose-100 text-xs uppercase tracking-wider">Select Option</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSelected =
                    selectedVariant?.weight === v.weight &&
                    selectedVariant?.unit === v.unit;

                  return (
                    <button
                      key={`${v.weight}-${v.unit}`}
                      onClick={() => setSelectedVariant(v)}
                      className={`
                        px-4.5 py-2.5 text-xs rounded-full font-semibold transition cursor-pointer border
                        ${isSelected
                          ? "bg-pink-500 text-white border-pink-500 shadow-sm"
                          : "bg-white text-stone-700 hover:bg-stone-55 border-stone-200 dark:bg-white/5 dark:text-rose-100/80 dark:border-white/10 dark:hover:bg-white/10"
                        }
                      `}
                    >
                      {v.weight || v.size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Premium Tabbed Interface (Details, How to Use, Ingredients) */}
          <div className="border-t border-rose-100/50 dark:border-white/5 pt-5 space-y-4">
            <div className="flex gap-4 border-b border-rose-50/50 dark:border-white/5 pb-2">
              <button
                onClick={() => setActiveTab("description")}
                className={`pb-2 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer ${
                  activeTab === "description"
                    ? "border-pink-500 text-pink-500"
                    : "border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-rose-100/60"
                }`}
              >
                Description
              </button>
              {(howToUse || useCase) && (
                <button
                  onClick={() => setActiveTab("useCase")}
                  className={`pb-2 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer ${
                    activeTab === "useCase"
                      ? "border-pink-500 text-pink-500"
                      : "border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-rose-100/60"
                  }`}
                >
                  How To Use
                </button>
              )}
              {ingredients && ingredients.length > 0 && (
                <button
                  onClick={() => setActiveTab("ingredients")}
                  className={`pb-2 text-xs font-bold uppercase tracking-wider transition border-b-2 cursor-pointer ${
                    activeTab === "ingredients"
                      ? "border-pink-500 text-pink-500"
                      : "border-transparent text-stone-400 hover:text-stone-600 dark:hover:text-rose-100/60"
                  }`}
                >
                  Ingredients
                </button>
              )}
            </div>

            <div className="min-h-[100px] text-stone-600 dark:text-rose-100/80 text-xs md:text-sm leading-relaxed">
              {activeTab === "description" && (
                <p className="whitespace-pre-line">{description}</p>
              )}
              {activeTab === "useCase" && (
                <p className="whitespace-pre-line">{howToUse || useCase}</p>
              )}
              {activeTab === "ingredients" && (
                <p className="whitespace-pre-line">
                  {Array.isArray(ingredients) ? ingredients.join(", ") : ingredients}
                </p>
              )}
            </div>
          </div>

          {/* Primary Call to Action Buttons */}
          <div className="flex gap-4 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={stock === 0 || adding}
              className="
                flex-1
                bg-white hover:bg-stone-50 dark:bg-transparent dark:hover:bg-white/5
                text-pink-500 border-2 border-pink-500 py-3 rounded-2xl font-bold uppercase text-xs tracking-wider shadow-sm
                transition duration-300 cursor-pointer disabled:border-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed
              "
            >
              {adding ? "Adding..." : "Add to Cart"}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={stock === 0}
              className="
                flex-1
                bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600
                text-white py-3 rounded-2xl font-bold uppercase text-xs tracking-wider shadow-sm hover:shadow
                transition duration-300 cursor-pointer disabled:from-stone-200 disabled:to-stone-300 disabled:cursor-not-allowed
              "
            >
              Buy Now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

// Subcomponent to isolate image fallback for main image display
function ProductImagePanel({ selectedImage, altText }) {
  const [imgSrc, setImgSrc] = useState(FALLBACK_IMAGE);

  useEffect(() => {
    setImgSrc(selectedImage || FALLBACK_IMAGE);
  }, [selectedImage]);

  return (
    <div className="relative w-full aspect-square max-h-[480px] rounded-3xl bg-white dark:bg-[#1C1417] shadow-xs border border-rose-100/40 dark:border-white/5 overflow-hidden flex items-center justify-center p-6">
      <Image
        src={imgSrc}
        alt={altText}
        fill
        className="object-contain p-4"
        sizes="(max-width: 768px) 100vw, 50vw"
        priority
        onError={() => setImgSrc(FALLBACK_IMAGE)}
      />
    </div>
  );
}

// Subcomponent to isolate image fallback for thumbnail list item buttons
function ThumbnailButton({ imgSrc, active, onClick }) {
  const [src, setSrc] = useState(imgSrc || FALLBACK_IMAGE);

  return (
    <button
      onClick={onClick}
      className={`
        relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 cursor-pointer transition
        ${active ? "border-pink-500 scale-105" : "border-rose-50/50 dark:border-white/5 hover:border-pink-300"}
      `}
    >
      <Image
        src={src}
        alt="thumbnail"
        fill
        className="object-contain p-1"
        onError={() => setSrc(FALLBACK_IMAGE)}
      />
    </button>
  );
}

// Subcomponent to isolate image fallback for combo list inline row items
function ComboProductRow({ pInfo, quantity }) {
  const [src, setSrc] = useState(pInfo.thumbnail || pInfo.image || FALLBACK_IMAGE);

  return (
    <div className="flex gap-3 items-center bg-white dark:bg-[#23181C] p-2.5 rounded-xl border border-rose-50/40 dark:border-white/5 shadow-xs">
      <div className="relative w-11 h-11 rounded-lg overflow-hidden shrink-0 bg-stone-50 dark:bg-stone-900 border border-stone-150 dark:border-white/5">
        <Image
          src={src}
          alt={pInfo.name || "Product"}
          fill
          className="object-contain"
          sizes="44px"
          onError={() => setSrc(FALLBACK_IMAGE)}
        />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-stone-850 dark:text-rose-100 text-xs truncate">
          {pInfo.name}
        </p>
        <p className="text-[9px] text-stone-400 dark:text-rose-100/35 uppercase tracking-widest font-bold">
          {pInfo.brand}
        </p>
      </div>
      <div className="text-right whitespace-nowrap">
        <span className="text-[9px] bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 px-2 py-0.5 rounded-full font-bold">
          Qty: {quantity}
        </span>
        <p className="text-[10px] font-semibold text-pink-500 mt-1">
          ৳{pInfo.salePrice || pInfo.price || 0}
        </p>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="aspect-square bg-stone-100 dark:bg-white/5 rounded-3xl" />
        <div className="space-y-6">
          <div className="h-6 w-24 bg-stone-100 dark:bg-white/5 rounded" />
          <div className="h-10 w-3/4 bg-stone-100 dark:bg-white/5 rounded" />
          <div className="h-6 w-32 bg-stone-100 dark:bg-white/5 rounded" />
          <div className="h-24 bg-stone-100 dark:bg-white/5 rounded" />
        </div>
      </div>
    </div>
  );
}
