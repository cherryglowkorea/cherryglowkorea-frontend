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
import { trackViewContent } from "@/lib/metaPixel";

const FALLBACK_IMAGE = "/placeholder.png";

export default function ProductDetailsClient({ initialProduct, id }: { initialProduct?: any; id: string }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<any>(initialProduct || null);
  const [loading, setLoading] = useState(!initialProduct);
  const [selectedImage, setSelectedImage] = useState("");
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

  /* ---------------- Reviews State & Handlers ---------------- */
  const [productReviews, setProductReviews] = useState<any[]>([]);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ userName: "", rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  /* ---------------- Dynamic Rating Calculations ---------------- */
  const ratingDistribution = useMemo(() => {
    const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
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
  const renderFormattedContent = (content: any) => {
    if (!content) return null;

    const rawStr = Array.isArray(content) ? content.join(", ") : String(content);
    const blocks = rawStr.split(/\n\s*\n/).filter(Boolean);

    return (
      <div className="space-y-4 text-stone-700 dark:text-rose-100/90 font-sans leading-relaxed text-xs sm:text-sm">
        {blocks.map((block, bIdx) => {
          const lines = block.split("\n").map((l) => l.trim()).filter(Boolean);
          
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
      if (initialProduct && initialProduct._id === id) {
        setProduct(initialProduct);
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(`${API_BASE}/products/singleProduct/${id}`);
        const p = res.data;
        setProduct(p);

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
  }, [id, API_BASE, initialProduct]);

  // Trigger Meta Pixel ViewContent event when product is loaded
  useEffect(() => {
    if (product) {
      trackViewContent({
        id: product._id || (id as string),
        name: product.name || "",
        price: product.price || product.salePrice || 0,
        category: product.category?.name || product.category || "Skincare",
      });
    }
  }, [product, id]);

  // Sync logged in user name automatically
  useEffect(() => {
    if (user?.name && !newReview.userName) {
      setNewReview((prev) => ({ ...prev, userName: user.name }));
    }
  }, [user, newReview.userName]);

  const handleReviewSubmit = async (e: any) => {
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
    
    const galleryUrls = product.gallery || [];
    const imageObjectUrls = product.images?.map((i: any) => i?.url).filter(Boolean) || [];
    const all = [product.image, product.thumbnail, ...galleryUrls, ...imageObjectUrls].filter(Boolean);
    return Array.from(new Set(all));
  }, [product]);

  /* ---------------- Default Image ---------------- */
  useEffect(() => {
    if (imageList.length > 0 && !selectedImage) {
      setSelectedImage(imageList[0] as string);
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
              {imageList.map((img: any, idx: number) => (
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
              {category?.name || category}
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
                {product.variants.map((v: any, idx: number) => {
                  const isSelected =
                    selectedVariant === v ||
                    (v.size && selectedVariant?.size === v.size) ||
                    (v.weight && selectedVariant?.weight === v.weight && selectedVariant?.unit === v.unit) ||
                    (v._id && selectedVariant?._id === v._id);

                  const key = v.size ? `size-${v.size}-${idx}` : (v.weight ? `${v.weight}-${v.unit || ""}-${idx}` : `variant-${idx}`);

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? "bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/20"
                          : "bg-stone-50 dark:bg-rose-950/30 text-stone-700 dark:text-rose-200 border-stone-200 dark:border-rose-900/40 hover:border-rose-300"
                      }`}
                    >
                      <span>{v.size || `${v.weight} ${v.unit || "ml"}`}</span>
                      <span className="opacity-80 font-mono text-[11px]">৳{v.price}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="flex items-center gap-4 pt-2">
            <span className="text-xs font-bold text-stone-800 dark:text-rose-100 uppercase tracking-wider">
              Quantity:
            </span>
            <div className="flex items-center border border-stone-200 dark:border-rose-900/40 rounded-xl bg-stone-50 dark:bg-rose-950/40 p-1">
              <button
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 dark:text-rose-300 hover:bg-white dark:hover:bg-rose-900/50 transition-colors"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="w-10 text-center font-bold font-mono text-sm text-stone-800 dark:text-rose-100">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity((q) => q + 1)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-stone-600 dark:text-rose-300 hover:bg-white dark:hover:bg-rose-900/50 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={stock <= 0 || adding}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-stone-900 to-stone-800 dark:from-rose-950 dark:to-stone-900 text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all border border-stone-700/50 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{adding ? "Adding..." : "Add to Cart"}</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={stock <= 0}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Buy Now</span>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="pt-6 border-t border-stone-200/80 dark:border-white/10">
            <div className="flex border-b border-stone-200/80 dark:border-white/10 gap-6">
              {["description", "howToUse", "ingredients", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors relative cursor-pointer ${
                    activeTab === tab
                      ? "text-rose-600 dark:text-rose-400"
                      : "text-stone-400 hover:text-stone-600 dark:hover:text-rose-200"
                  }`}
                >
                  {tab === "description" && "Description"}
                  {tab === "howToUse" && "How to Use"}
                  {tab === "ingredients" && "Ingredients"}
                  {tab === "reviews" && `Reviews (${productReviews.length})`}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-rose-600 dark:bg-rose-400 rounded-full"></span>
                  )}
                </button>
              ))}
            </div>

            {/* Tab Contents */}
            <div className="py-4">
              {activeTab === "description" && renderFormattedContent(description || useCase || "Authentic Korean skincare product.")}
              {activeTab === "howToUse" && renderFormattedContent(howToUse || "Apply appropriate amount on clean skin and gently massage until fully absorbed.")}
              {activeTab === "ingredients" && renderFormattedContent(ingredients || "Key active Korean botanical extracts.")}
              
              {activeTab === "reviews" && (
                <div className="space-y-6">
                  {/* Rating Summary */}
                  <div className="p-4 rounded-2xl bg-stone-50 dark:bg-white/5 border border-stone-100 dark:border-white/5 flex flex-col sm:flex-row items-center gap-6 justify-between">
                    <div className="text-center sm:text-left">
                      <div className="text-3xl font-extrabold font-mono text-rose-600 dark:text-rose-400">
                        {averageRating} / 5.0
                      </div>
                      <div className="flex items-center gap-1 my-1 justify-center sm:justify-start">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= Math.round(averageRating)
                                ? "fill-amber-400 text-amber-400"
                                : "text-stone-300 dark:text-stone-600"
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-xs text-stone-500">Based on {productReviews.length} customer review(s)</p>
                    </div>

                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="px-4 py-2 rounded-xl bg-stone-900 text-white text-xs font-bold hover:bg-stone-800 transition-colors"
                    >
                      {showReviewForm ? "Cancel Review" : "Write a Review"}
                    </button>
                  </div>

                  {/* Review Form */}
                  {showReviewForm && (
                    <form onSubmit={handleReviewSubmit} className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 space-y-3">
                      <h4 className="text-xs font-bold uppercase text-stone-800 dark:text-rose-200">Submit Your Experience</h4>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-stone-600">Rating:</span>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            onClick={() => setNewReview((p) => ({ ...p, rating: star }))}
                            className={`w-5 h-5 cursor-pointer transition-transform hover:scale-110 ${
                              star <= newReview.rating
                                ? "fill-amber-400 text-amber-400"
                                : "text-stone-300 dark:text-stone-600"
                            }`}
                          />
                        ))}
                      </div>

                      <input
                        type="text"
                        placeholder="Your Name"
                        value={newReview.userName}
                        onChange={(e) => setNewReview((p) => ({ ...p, userName: e.target.value }))}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200 dark:border-rose-900/40 bg-white dark:bg-rose-950/40 focus:outline-none focus:border-rose-500"
                      />

                      <textarea
                        rows={3}
                        placeholder="Share your experience with this product..."
                        value={newReview.comment}
                        onChange={(e) => setNewReview((p) => ({ ...p, comment: e.target.value }))}
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200 dark:border-rose-900/40 bg-white dark:bg-rose-950/40 focus:outline-none focus:border-rose-500 resize-none"
                      />

                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 transition-colors disabled:opacity-50"
                      >
                        {submittingReview ? "Submitting..." : "Post Review"}
                      </button>
                    </form>
                  )}

                  {/* Reviews List */}
                  <div className="space-y-3">
                    {productReviews.length === 0 ? (
                      <p className="text-xs text-stone-400 italic">No reviews yet. Be the first to write a review!</p>
                    ) : (
                      productReviews.map((r, idx) => (
                        <div key={idx} className="p-3.5 rounded-2xl bg-stone-50/70 dark:bg-white/5 border border-stone-100 dark:border-white/5 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-stone-800 dark:text-rose-100">{r.userName || "Verified Buyer"}</span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${s <= (r.rating || 5) ? "fill-amber-400 text-amber-400" : "text-stone-300"}`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-stone-600 dark:text-rose-200/80">{r.comment}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Helper Subcomponents ---------------- */

function ProductImagePanel({ selectedImage, altText }: { selectedImage: string; altText?: string }) {
  const displaySrc = selectedImage || FALLBACK_IMAGE;
  return (
    <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-stone-100 dark:bg-rose-950/30 border border-stone-200/60 dark:border-rose-900/30 group">
      <Image
        src={displaySrc}
        alt={altText || "Authentic Korean Skincare Product"}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover group-hover:scale-105 transition-transform duration-500"
      />
    </div>
  );
}

function ThumbnailButton({ imgSrc, active, onClick }: { imgSrc: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
        active ? "border-rose-600 scale-105 shadow-md" : "border-stone-200 dark:border-rose-900/30 opacity-70 hover:opacity-100"
      }`}
    >
      <Image src={imgSrc} alt="Thumbnail" fill sizes="64px" className="object-cover" />
    </button>
  );
}

function ProductSkeleton() {
  return (
    <div className="max-w-[1536px] mx-auto px-4 py-12 animate-pulse space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div className="md:col-span-6 aspect-square bg-stone-200 dark:bg-rose-950/40 rounded-3xl"></div>
        <div className="md:col-span-6 space-y-4">
          <div className="h-4 bg-stone-200 dark:bg-rose-950/40 rounded w-1/4"></div>
          <div className="h-8 bg-stone-200 dark:bg-rose-950/40 rounded w-3/4"></div>
          <div className="h-6 bg-stone-200 dark:bg-rose-950/40 rounded w-1/3"></div>
          <div className="h-24 bg-stone-200 dark:bg-rose-950/40 rounded-2xl"></div>
        </div>
      </div>
    </div>
  );
}
