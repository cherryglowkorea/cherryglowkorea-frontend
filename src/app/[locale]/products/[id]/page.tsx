"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import {
  ShoppingCart,
  Check,
  CheckCircle2,
  ShieldCheck,
  Truck,
  Heart,
  Share2,
  Sparkles,
  Gift,
  Layers,
  ChevronRight,
  Minus,
  Plus,
  FileText,
  Leaf,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";

const FALLBACK_IMAGE = "/placeholder.png";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  /* ---------------- Reviews State & Handlers ---------------- */
  const [productReviews, setProductReviews] = useState([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ userName: "", rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  /* ---------------- Dynamic Rating Calculations ---------------- */
  const ratingDistribution = useMemo(() => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    if (!productReviews || productReviews.length === 0) return counts;
    productReviews.forEach((r) => {
      const star = Math.min(Math.max(Math.round(r.rating || 5), 1), 5);
      counts[star] = (counts[star] || 0) + 1;
    });
    return counts;
  }, [productReviews]);

  const averageRating = useMemo(() => {
    if (!productReviews || productReviews.length === 0) return product?.rating || 5.0;
    const sum = productReviews.reduce((acc, r) => acc + Number(r.rating || 5), 0);
    return +(sum / productReviews.length).toFixed(1);
  }, [productReviews, product?.rating]);

  /* ---------------- Smart Rich Text Description Formatter ---------------- */
  const renderFormattedContent = (content) => {
    if (!content) return null;

    const rawStr = Array.isArray(content) ? content.join(", ") : String(content);
    const blocks = rawStr.split(/\n\s*\n/).filter(Boolean);

    return (
      <div className="space-y-4 text-stone-700 dark:text-rose-100/90 font-sans leading-relaxed text-xs sm:text-sm">
        {blocks.map((block, bIdx) => {
          const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
          
          // Header titles like 'ব্যবহারের নিয়ম:' or 'কেন এই ক্লিনজারটি বেছে নেবেন?'
          const isHeading = lines.length === 1 && (lines[0].endsWith(":") || lines[0].endsWith("?") || lines[0].length < 45);

          if (isHeading) {
            return (
              <div key={bIdx} className="pt-2">
                <h4 className="font-extrabold text-xs sm:text-sm text-rose-600 dark:text-rose-400 border-l-4 border-rose-500 pl-3 py-1 bg-rose-50/60 dark:bg-rose-950/40 rounded-r-xl">
                  {lines[0]}
                </h4>
              </div>
            );
          }

          // Bullet list items or features
          const isFeatureList = lines.length > 1 && lines.every((l) => l.length < 100 || l.startsWith("-") || l.startsWith("•") || l.startsWith("✓"));

          if (isFeatureList) {
            return (
              <div key={bIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3">
                {lines.map((line, lIdx) => {
                  const cleanText = line.replace(/^[-•✓]\s*/, "");
                  return (
                    <div key={lIdx} className="p-3 rounded-2xl bg-stone-50/90 dark:bg-slate-900/50 border border-stone-200/70 dark:border-slate-800 flex items-start gap-2.5 shadow-2xs hover:border-rose-200 transition-colors">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="font-semibold text-stone-800 dark:text-stone-200 text-xs">{cleanText}</span>
                    </div>
                  );
                })}
              </div>
            );
          }

          // Standard paragraph block
          return (
            <div key={bIdx} className="p-4 rounded-2xl bg-stone-50/40 dark:bg-white/5 border border-stone-100 dark:border-white/5 space-y-1.5">
              {lines.map((line, lIdx) => (
                <p key={lIdx} className="leading-relaxed">
                  {line}
                </p>
              ))}
            </div>
          );
        })}
      </div>
    );
  };

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  /* ---------------- Fetch Product Details & Reviews ---------------- */
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

    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API_BASE}/reviews/product/${id}`);
        setProductReviews(res.data || []);
      } catch (err) {
        // silent fail
      }
    };

    fetchProduct();
    fetchReviews();
  }, [id, API_BASE]);

  // Sync logged in user name automatically
  useEffect(() => {
    if (user?.name && !newReview.userName) {
      setNewReview((prev) => ({ ...prev, userName: user.name }));
    }
  }, [user, newReview.userName]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    const finalUserName = newReview.userName?.trim() || user?.name || "Customer";
    const commentText = newReview.comment?.trim();

    if (!commentText) {
      return toast.error("Please write your review comment");
    }

    setSubmittingReview(true);
    try {
      await axios.post(`${API_BASE}/reviews`, {
        productId: id,
        userName: finalUserName,
        userAvatar: user?.avatar || user?.photoURL || "",
        rating: newReview.rating || 5,
        comment: commentText,
      });

      toast.success("Thank you! Your review has been submitted successfully.");
      setShowReviewForm(false);
      setNewReview({ userName: user?.name || "", rating: 5, comment: "" });

      // Refresh product reviews
      const res = await axios.get(`${API_BASE}/reviews/product/${id}`);
      setProductReviews(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

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
    if (imageList.length > 0 && !selectedImage) {
      setSelectedImage(imageList[0]);
    }
  }, [imageList, selectedImage]);

  /* ---------------- Default Variant ---------------- */
  useEffect(() => {
    if (product && product.type !== "combo" && product.variants?.length > 0 && !selectedVariant) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product, selectedVariant]);

  /* ---------------- Prices ---------------- */
  const finalPrice = useMemo(() => {
    if (!product) return 0;
    if (product.type === "combo") return product.salePrice || product.price || 0;
    return selectedVariant ? (selectedVariant.price || product.price || 0) : (product.price || product.basePrice || 0);
  }, [product, selectedVariant]);

  const originalPrice = useMemo(() => {
    if (!product) return 0;
    if (product.type === "combo") return product.price || 0;
    return product.price || product.basePrice || finalPrice;
  }, [product, finalPrice]);

  const discountAmount = originalPrice > finalPrice ? originalPrice - finalPrice : 0;
  const discountPercent = originalPrice > 0 && discountAmount > 0
    ? Math.round((discountAmount / originalPrice) * 100)
    : 0;

  /* ---------------- Stock ---------------- */
  const stock = product?.type === "combo" ? (product.stock || 0) : (selectedVariant?.stock || 0);

  /* ---------------- Add To Cart ---------------- */
  const handleAddToCart = () => {
    if (!product) return;
    if (product.type !== "combo" && !selectedVariant) {
      return toast.error("Select a variant option first");
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
      comboProducts: product.comboProducts || [],
      quantity: quantity,
    };

    addToCart(productForCart);
    toast.success(`Added ${quantity} item(s) to your cart!`);
    setTimeout(() => setAdding(false), 400);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (product.type !== "combo" && !selectedVariant) {
      return toast.error("Select a variant option first");
    }

    const productForCart = {
      _id: product._id,
      name: product.name,
      image: selectedImage || product.thumbnail || product.images?.[0]?.url || FALLBACK_IMAGE,
      variants: product.variants || [],
      selectedVariant: selectedVariant,
      price: product.type === "combo" ? product.salePrice : finalPrice,
      type: product.type || "single",
      comboProducts: product.comboProducts || [],
      quantity: quantity,
    };

    addToCart(productForCart);
    router.push("/cart");
  };

  if (loading) return <ProductSkeleton />;

  if (!product)
    return <p className="text-center py-20 text-gray-500">Product not found</p>;

  const { name, brand, category, description, useCase, howToUse, ingredients } = product;

  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-24 md:pb-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
        
        {/* LEFT COLUMN: IMAGES */}
        <div className="md:col-span-6 space-y-4 md:sticky md:top-24">
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

        {/* RIGHT COLUMN: BUY BOX & DETAILS */}
        <div className="md:col-span-6 space-y-6">
          
          {/* Brand Tag, Title, and Category */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-pink-600 bg-pink-50 dark:bg-pink-950/40 px-2.5 py-1 rounded-md border border-pink-200 dark:border-pink-900/40 inline-block w-fit">
              {brand || "Cherry Glow"}
            </span>
            <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-stone-900 dark:text-rose-50 leading-tight">
              {name}
            </h1>
            <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">
              {category}
            </p>
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-3.5 border-b border-stone-200/80 dark:border-white/10 pb-4">
            <span className="text-2xl md:text-3xl font-extrabold text-rose-600 dark:text-rose-400 font-mono">
              ৳{finalPrice.toLocaleString()}
            </span>
            {originalPrice > finalPrice && (
              <div className="flex items-center gap-2">
                <span className="line-through text-xs md:text-sm text-stone-400 font-mono">
                  ৳{originalPrice.toLocaleString()}
                </span>
                <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-200 uppercase tracking-wider">
                  Save ৳{discountAmount.toFixed(0)} ({discountPercent}% OFF)
                </span>
              </div>
            )}
          </div>

          {/* Stock Indicator Status Badge */}
          <div className="flex items-center gap-2">
            <span className={`inline-block w-2.5 h-2.5 rounded-full ${stock > 0 ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
            <span className={`text-xs font-bold ${stock > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
              {stock > 0 ? `In Stock (${stock} units ready to ship)` : "Out of Stock"}
            </span>
          </div>

          {/* Variants (Only for Single Products) */}
          {product.type !== "combo" && product.variants?.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <h3 className="font-serif font-bold text-stone-800 dark:text-rose-100 text-xs uppercase tracking-wider">
                Select Size / Option:
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v, idx) => {
                  const isSelected =
                    selectedVariant === v ||
                    (v.size && selectedVariant?.size === v.size) ||
                    (v.weight && selectedVariant?.weight === v.weight && selectedVariant?.unit === v.unit) ||
                    (v._id && selectedVariant?._id === v._id);

                  const key = v.size ? `size-${v.size}-${idx}` : (v.weight ? `${v.weight}-${v.unit || ""}-${idx}` : `variant-${idx}`);
                  const label = v.size || (v.weight ? `${v.weight}${v.unit || ""}` : `Option #${idx + 1}`);

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedVariant(v)}
                      className={`
                        px-4.5 py-2 text-xs rounded-full font-bold transition cursor-pointer border
                        ${isSelected
                          ? "bg-rose-500 text-white border-rose-500 shadow-sm scale-105"
                          : "bg-white text-stone-700 hover:bg-rose-50 border-stone-200 dark:bg-white/5 dark:text-rose-100/80 dark:border-white/10"
                        }
                      `}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================== */}
          {/* 🔥 PRIMARY BUY BOX (QUANTITY & ACTION BUTTONS) */}
          {/* ========================================== */}
          <div className="space-y-3 pt-2 pb-2 border-y border-stone-200/80 dark:border-white/10 my-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              
              {/* Quantity Counter */}
              <div className="flex items-center justify-between border border-stone-200 dark:border-slate-800 rounded-full p-1 bg-stone-50 dark:bg-slate-900 shrink-0">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1}
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-stone-700 dark:text-white hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer shadow-xs transition-all"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="w-10 text-center font-bold text-sm font-mono text-stone-900 dark:text-white">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(stock || 99, q + 1))}
                  disabled={quantity >= (stock || 99)}
                  className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-stone-700 dark:text-white hover:bg-white dark:hover:bg-slate-800 disabled:opacity-30 cursor-pointer shadow-xs transition-all"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Action Buttons Row */}
              <div className="flex items-center gap-2.5 flex-1">
                <button
                  onClick={handleAddToCart}
                  disabled={stock === 0 || adding}
                  className="
                    flex-1
                    bg-white hover:bg-rose-50 dark:bg-transparent dark:hover:bg-white/5
                    text-rose-600 dark:text-rose-400 border-2 border-rose-500 py-3 rounded-full font-extrabold uppercase text-xs tracking-wider shadow-sm
                    transition-all duration-200 cursor-pointer disabled:border-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed
                  "
                >
                  {adding ? "Adding..." : "Add to Cart"}
                </button>

                <button
                  onClick={handleBuyNow}
                  disabled={stock === 0}
                  className="
                    flex-1
                    bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700
                    text-white py-3.5 rounded-full font-extrabold uppercase text-xs tracking-wider shadow-md hover:shadow-lg hover:scale-[1.02]
                    transition-all duration-200 cursor-pointer disabled:from-stone-200 disabled:to-stone-300 disabled:cursor-not-allowed
                  "
                >
                  Buy Now
                </button>
              </div>
            </div>
          </div>

          {/* Trust & Delivery Badges */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl border border-stone-200/80 dark:border-white/5 bg-stone-50/60 dark:bg-white/5 space-y-1 flex items-start gap-3">
              <Truck className="text-rose-500 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-[11px] font-bold text-stone-800 dark:text-rose-100">Estimated Delivery</p>
                <p className="text-[10px] text-stone-500 dark:text-rose-100/45 mt-0.5">1-2 Days Inside Dhaka, 2-3 Days Outside</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl border border-stone-200/80 dark:border-white/5 bg-stone-50/60 dark:bg-white/5 space-y-1 flex items-start gap-3">
              <ShieldCheck className="text-rose-500 shrink-0 mt-0.5" size={18} />
              <div>
                <p className="text-[11px] font-bold text-stone-800 dark:text-rose-100">100% Authentic Guaranteed</p>
                <p className="text-[10px] text-stone-500 dark:text-rose-100/45 mt-0.5">Direct Original Korean Import</p>
              </div>
            </div>
          </div>

          {/* What's Included (Combo specific populated view) */}
          {product.type === "combo" && product.comboProducts && product.comboProducts.length > 0 && (
            <div className="space-y-4 border border-rose-200/80 dark:border-rose-900/40 p-4.5 rounded-2xl bg-rose-50/40 dark:bg-[#23181C]/20">
              <h3 className="font-serif font-bold text-stone-850 dark:text-rose-50 text-xs uppercase tracking-wider flex items-center gap-2">
                <Gift className="h-4 w-4 text-rose-500" />
                What's Included in this Combo Box Set:
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

          {/* Premium Modern Tab Navigation with Lucide Vector Icons */}
          <div className="border-t border-stone-200/80 dark:border-white/10 pt-6 space-y-6">
            <div className="flex flex-wrap gap-2 sm:gap-6 border-b border-stone-200/80 dark:border-white/10 pb-3">
              
              <button
                onClick={() => setActiveTab("description")}
                className={`pb-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 relative ${
                  activeTab === "description"
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-stone-400 hover:text-stone-700 dark:hover:text-rose-100/70"
                }`}
              >
                <FileText className={`h-4 w-4 transition-colors ${activeTab === "description" ? "text-rose-500" : "text-stone-400"}`} />
                <span>Description</span>
                {activeTab === "description" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full shadow-xs" />
                )}
              </button>

              {(howToUse || useCase) && (
                <button
                  onClick={() => setActiveTab("useCase")}
                  className={`pb-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 relative ${
                    activeTab === "useCase"
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-stone-400 hover:text-stone-700 dark:hover:text-rose-100/70"
                  }`}
                >
                  <Sparkles className={`h-4 w-4 transition-colors ${activeTab === "useCase" ? "text-rose-500" : "text-stone-400"}`} />
                  <span>How To Use</span>
                  {activeTab === "useCase" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full shadow-xs" />
                  )}
                </button>
              )}

              {ingredients && ingredients.length > 0 && (
                <button
                  onClick={() => setActiveTab("ingredients")}
                  className={`pb-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 relative ${
                    activeTab === "ingredients"
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-stone-400 hover:text-stone-700 dark:hover:text-rose-100/70"
                  }`}
                >
                  <Leaf className={`h-4 w-4 transition-colors ${activeTab === "ingredients" ? "text-rose-500" : "text-stone-400"}`} />
                  <span>Ingredients</span>
                  {activeTab === "ingredients" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full shadow-xs" />
                  )}
                </button>
              )}

              <button
                onClick={() => setActiveTab("reviews")}
                className={`pb-3 text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer flex items-center gap-2 relative ${
                  activeTab === "reviews"
                    ? "text-rose-600 dark:text-rose-400"
                    : "text-stone-400 hover:text-stone-700 dark:hover:text-rose-100/70"
                }`}
              >
                <Star className={`h-4 w-4 transition-colors ${activeTab === "reviews" ? "fill-rose-500 text-rose-500" : "text-stone-400"}`} />
                <span>Customer Reviews</span>
                <span className="px-2 py-0.5 text-[10px] rounded-full font-black bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
                  {productReviews.length}
                </span>
                {activeTab === "reviews" && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-500 rounded-full shadow-xs" />
                )}
              </button>

            </div>

            {/* Smart Formatted Tab Content Area */}
            <div className="min-h-[120px] text-stone-700 dark:text-rose-100/80 text-xs md:text-sm leading-relaxed">
              {activeTab === "description" && renderFormattedContent(description)}
              {activeTab === "useCase" && renderFormattedContent(howToUse || useCase)}
              {activeTab === "ingredients" && renderFormattedContent(ingredients)}
              {activeTab === "reviews" && (
                <div className="space-y-6">
                  {/* Rating Summary Box */}
                  <div className="p-5 rounded-3xl bg-stone-50/80 dark:bg-slate-900/60 border border-stone-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-center sm:text-left">
                      <div className="text-center min-w-[80px]">
                        <span className="text-3xl font-black font-mono text-stone-900 dark:text-white">
                          {averageRating}
                        </span>
                        <div className="flex justify-center text-amber-400 text-xs mt-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i}>{i < Math.round(averageRating) ? "★" : "☆"}</span>
                          ))}
                        </div>
                        <span className="text-[10px] font-bold text-stone-400 uppercase mt-1 block">
                          {productReviews.length} {productReviews.length === 1 ? "VERIFIED REVIEW" : "VERIFIED REVIEWS"}
                        </span>
                      </div>

                      <div className="border-l border-stone-200 dark:border-slate-800 pl-4 space-y-1.5 text-[11px] hidden sm:block">
                        {[5, 4, 3, 2, 1].map((star) => {
                          const count = ratingDistribution[star] || 0;
                          const total = productReviews.length;
                          const percent = total > 0 ? Math.round((count / total) * 100) : (star === 5 ? 100 : 0);

                          return (
                            <div key={star} className="flex items-center gap-2">
                              <span className="w-10 text-stone-500 font-bold">{star} Star</span>
                              <div className="w-28 h-2 rounded-full bg-stone-200 dark:bg-slate-800 overflow-hidden">
                                <div
                                  className="h-full bg-amber-400 transition-all duration-500 rounded-full"
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                              <span className="text-stone-400 font-mono text-[10px] w-8">{percent}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="px-5 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-sm hover:shadow transition cursor-pointer shrink-0"
                    >
                      {showReviewForm ? "Close Form" : "★ Write a Review"}
                    </button>
                  </div>

                  {/* Review Submission Form Card */}
                  {showReviewForm && (
                    <form onSubmit={handleReviewSubmit} className="p-5 rounded-3xl bg-rose-50/40 dark:bg-rose-950/20 border-2 border-rose-200 dark:border-rose-900/60 space-y-4 shadow-xs">
                      <div className="flex items-center justify-between border-b border-rose-200/60 dark:border-rose-900/40 pb-3">
                        <div>
                          <h5 className="font-extrabold text-xs text-stone-900 dark:text-white uppercase tracking-wider">Share Your Honest Experience</h5>
                          <p className="text-[11px] text-stone-500">Your feedback helps skincare lovers choose the right product!</p>
                        </div>
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-100 dark:bg-rose-950 px-2.5 py-0.5 rounded-md">Verified Buyer</span>
                      </div>
                      
                      <div className="space-y-1.5">
                        <label className="text-xs font-extrabold text-stone-700 dark:text-slate-300 block">Overall Star Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReview({ ...newReview, rating: star })}
                              className="p-1 cursor-pointer transition-transform hover:scale-125"
                            >
                              <span className={`text-2xl ${star <= newReview.rating ? "text-amber-400" : "text-stone-300 dark:text-slate-700"}`}>★</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block">Your Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Anika Tabassum"
                          value={newReview.userName || user?.name || ""}
                          onChange={(e) => setNewReview({ ...newReview, userName: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-950 border border-stone-200 dark:border-slate-800 text-xs font-medium outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block">Detailed Review & Skin Experience *</label>
                        <textarea
                          required
                          rows={4}
                          placeholder="Tell us about the formula, scent, texture, skin feeling, and results..."
                          value={newReview.comment}
                          onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-950 border border-stone-200 dark:border-slate-800 text-xs leading-relaxed font-sans outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400 transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-6 py-2.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                      >
                        {submittingReview ? "Submitting Review..." : "Submit Review"}
                      </button>
                    </form>
                  )}

                  {/* Customer Reviews List */}
                  {productReviews.length === 0 ? (
                    <div className="text-center py-10 space-y-2 bg-stone-50/50 dark:bg-slate-900/20 rounded-3xl border border-dashed border-stone-200 dark:border-slate-800">
                      <p className="text-xs font-bold text-stone-600 dark:text-rose-100/70">
                        No customer reviews yet for this product.
                      </p>
                      <p className="text-[11px] text-stone-400">Be the first to share your skin experience and review!</p>
                    </div>
                  ) : (
                    <div className="space-y-3.5">
                      {productReviews.map((rev, idx) => {
                        const dateStr = rev.createdAt
                          ? new Date(rev.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                          : "Verified Buyer";

                        return (
                          <div key={rev._id || idx} className="p-4 rounded-3xl bg-white dark:bg-slate-900/60 border border-stone-200/80 dark:border-slate-800 space-y-2 shadow-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-xs text-stone-900 dark:text-white">{rev.userName}</span>
                                <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200">
                                  ✓ Verified Buyer
                                </span>
                              </div>
                              <span className="text-[10px] text-stone-400 font-medium">{dateStr}</span>
                            </div>

                            <div className="flex gap-0.5 text-amber-400 text-xs">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i}>{i < (rev.rating || 5) ? "★" : "☆"}</span>
                              ))}
                            </div>

                            <p className="text-xs text-stone-700 dark:text-rose-100/80 leading-relaxed font-sans">
                              “{rev.comment}”
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* 📱 MOBILE STICKY BUY BAR */}
      {/* ========================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#160E12]/95 border-t border-stone-200 dark:border-rose-900/40 p-3 backdrop-blur-md md:hidden shadow-lg flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] text-stone-400 font-bold uppercase">Total Price</p>
          <p className="text-base font-extrabold text-rose-600 dark:text-rose-400 font-mono">
            ৳{(finalPrice * quantity).toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-1 max-w-[240px]">
          <button
            onClick={handleAddToCart}
            disabled={stock === 0 || adding}
            className="flex-1 bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-300 py-2.5 rounded-full font-bold text-xs cursor-pointer"
          >
            Add
          </button>
          <button
            onClick={handleBuyNow}
            disabled={stock === 0}
            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white py-2.5 rounded-full font-bold text-xs shadow-md cursor-pointer"
          >
            Buy Now
          </button>
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
    <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-stone-200/80 dark:border-white/5 bg-stone-100 dark:bg-[#1A0F13] shadow-xs">
      <Image
        src={imgSrc}
        alt={altText || "Product Image"}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover transition duration-500"
        onError={() => setImgSrc(FALLBACK_IMAGE)}
      />
    </div>
  );
}

// Subcomponent for thumbnail button
function ThumbnailButton({ imgSrc, active, onClick }) {
  const [currentSrc, setCurrentSrc] = useState(imgSrc);

  useEffect(() => {
    setCurrentSrc(imgSrc);
  }, [imgSrc]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border transition cursor-pointer
        ${active
          ? "border-rose-500 ring-2 ring-rose-500/20 scale-105"
          : "border-stone-200 hover:border-rose-300 dark:border-white/10 dark:hover:border-white/20 opacity-70 hover:opacity-100"
        }
      `}
    >
      <Image
        src={currentSrc}
        alt="Product thumbnail"
        fill
        sizes="64px"
        className="object-cover"
        onError={() => setCurrentSrc(FALLBACK_IMAGE)}
      />
    </button>
  );
}

// Subcomponent for displaying populating combo items
function ComboProductRow({ pInfo, quantity }) {
  const img = pInfo.thumbnail || pInfo.image || pInfo.images?.[0]?.url || FALLBACK_IMAGE;

  return (
    <div className="flex items-center justify-between gap-3 bg-white dark:bg-[#160E12] p-2.5 rounded-xl border border-stone-200 dark:border-slate-800">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-stone-200 shrink-0 bg-stone-100">
          <Image src={img} alt={pInfo.name || "Combo item"} fill sizes="40px" className="object-cover" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-xs text-stone-900 dark:text-white truncate">{pInfo.name || "Product Item"}</p>
          <p className="text-[10px] text-stone-500 dark:text-slate-400 font-mono">৳{(pInfo.price || 0).toLocaleString()}</p>
        </div>
      </div>
      <span className="text-xs font-extrabold text-rose-600 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 px-2 py-0.5 rounded-md">
        x{quantity}
      </span>
    </div>
  );
}

// Skeleton Component
function ProductSkeleton() {
  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-6 h-[450px] bg-stone-200 dark:bg-slate-800 rounded-3xl" />
        <div className="md:col-span-6 space-y-6">
          <div className="h-6 bg-stone-200 dark:bg-slate-800 rounded-md w-1/4" />
          <div className="h-10 bg-stone-200 dark:bg-slate-800 rounded-md w-3/4" />
          <div className="h-8 bg-stone-200 dark:bg-slate-800 rounded-md w-1/3" />
          <div className="h-14 bg-stone-200 dark:bg-slate-800 rounded-2xl w-full" />
        </div>
      </div>
    </div>
  );
}
