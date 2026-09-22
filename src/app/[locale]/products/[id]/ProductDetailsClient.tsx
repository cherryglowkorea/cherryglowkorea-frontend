"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
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
  ArrowRight,
  RefreshCw,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import { useWishlist } from "@/context/WishlistContext";
import { cleanProductName, getVariantLabel, formatPrice } from "@/lib/utils";
import StockBadge from "@/components/shared/StockBadge";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import { trackViewContent } from "@/lib/metaPixel";
import ProductCard from "@/components/products/ProductCard";

const FALLBACK_IMAGE = "/placeholder.jpg";

export default function ProductDetailsClient({
  initialProduct,
  id,
}: {
  initialProduct?: any;
  id: string;
}) {
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

  /* ---------------- Related Products State ---------------- */
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  /* ---------------- Dynamic Rating Calculations ---------------- */
  const averageRating = useMemo(() => {
    if (!productReviews || productReviews.length === 0) return product?.rating || 4.9;
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
          const lines = block
            .split("\n")
            .map((l) => l.trim())
            .filter(Boolean);

          const isHeading =
            lines.length === 1 &&
            (lines[0].endsWith(":") || lines[0].endsWith("?") || lines[0].length < 45);

          if (isHeading) {
            return (
              <div key={bIdx} className="pt-2">
                <h4 className="font-extrabold text-xs sm:text-sm text-rose-600 dark:text-rose-400 border-l-4 border-rose-500 pl-3 py-1 bg-rose-50/60 dark:bg-rose-950/40 rounded-r-xl">
                  {lines[0]}
                </h4>
              </div>
            );
          }

          const isFeatureList =
            lines.length > 1 &&
            lines.every(
              (l) => l.length < 100 || l.startsWith("-") || l.startsWith("•") || l.startsWith("✓")
            );

          if (isFeatureList) {
            return (
              <div key={bIdx} className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 my-3">
                {lines.map((line, lIdx) => {
                  const cleanText = line.replace(/^[-•✓]\s*/, "");
                  return (
                    <div
                      key={lIdx}
                      className="p-3 rounded-2xl bg-stone-50/90 dark:bg-slate-900/50 border border-stone-200/70 dark:border-slate-800 flex items-start gap-2.5 shadow-2xs hover:border-rose-200 transition-colors"
                    >
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="font-semibold text-stone-800 dark:text-stone-200 text-xs">
                        {cleanText}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          }

          return (
            <div
              key={bIdx}
              className="p-4 rounded-2xl bg-stone-50/40 dark:bg-white/5 border border-stone-100 dark:border-white/5 space-y-1.5"
            >
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

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

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

        if (p.type === "combo" && (!p.comboProducts || p.comboProducts.length === 0)) {
          try {
            const comboRes = await axios.get(`${API_BASE}/combos/${id}`);
            if (comboRes.data?.comboProducts && comboRes.data.comboProducts.length > 0) {
              setProduct((prev: any) => ({ ...prev, comboProducts: comboRes.data.comboProducts }));
            }
          } catch {}
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

  /* ---------------- Fetch Related Products ---------------- */
  useEffect(() => {
    if (!product?._id) return;
    const fetchRelated = async () => {
      try {
        const categoryName = product.category?.name || product.category || "";
        const res = await axios.get(
          `${API_BASE}/products/allProduct/public?limit=8${
            categoryName ? `&category=${encodeURIComponent(categoryName)}` : ""
          }`
        );
        const data = res.data?.products || res.data?.data || res.data || [];
        if (Array.isArray(data)) {
          const filtered = data
            .filter((p: any) => p && p._id && p._id !== product._id)
            .slice(0, 4);
          setRelatedProducts(filtered);
        }
      } catch {}
    };
    fetchRelated();
  }, [product, API_BASE]);

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
    const imageObjectUrls =
      product.images?.map((i: any) => (typeof i === "string" ? i : i?.url)).filter(Boolean) || [];
    const all = [product.thumbnail, product.image, ...galleryUrls, ...imageObjectUrls].filter(
      Boolean
    );
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
    if (
      product &&
      product.type !== "combo" &&
      product.variants?.length > 0 &&
      !selectedVariant
    ) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product, selectedVariant]);

  /* ---------------- Prices ---------------- */
  const isFreeProduct = useMemo(() => {
    return product?.type === "free" || product?.isFree || (product?.price === 0 && product?.salePrice === 0);
  }, [product]);

  const finalPrice = useMemo(() => {
    if (!product) return 0;
    if (isFreeProduct) return 0;
    if (product.type === "combo") return product.salePrice || product.price || 0;
    return selectedVariant
      ? selectedVariant.price || product.price || 0
      : product.price || product.basePrice || 0;
  }, [product, selectedVariant, isFreeProduct]);

  const originalPrice = useMemo(() => {
    if (!product) return 0;
    if (product.type === "combo") return product.price || 0;
    const base = selectedVariant?.price || product.basePrice || product.price || 0;
    return base > 0 ? base : finalPrice;
  }, [product, selectedVariant, finalPrice]);

  const discountAmount = originalPrice > finalPrice ? originalPrice - finalPrice : 0;
  const discountPercent =
    originalPrice > 0 && discountAmount > 0
      ? Math.round((discountAmount / originalPrice) * 100)
      : 0;

  /* ---------------- Stock ---------------- */
  const stock =
    product?.type === "combo"
      ? product.stock ?? 0
      : selectedVariant?.stock ?? product?.stock ?? 0;

  const allowPreOrder = product?.allowPreOrder === true;
  const canPreOrder = stock <= 0 && allowPreOrder;
  const canPurchase = stock > 0 || canPreOrder;

  /* ---------------- Add To Cart ---------------- */
  const handleAddToCart = () => {
    if (!product) return;
    if (product.type !== "combo" && product.variants?.length > 0 && !selectedVariant) {
      return toast.error("Select a variant option first");
    }

    setAdding(true);

    const productForCart = {
      _id: product._id,
      name: product.name,
      image: selectedImage || product.thumbnail || product.images?.[0]?.url || FALLBACK_IMAGE,
      variants: product.variants || [],
      selectedVariant: selectedVariant,
      price: product.type === "combo" ? product.salePrice || finalPrice : finalPrice,
      type: product.type || "single",
      comboProducts: product.comboProducts || [],
      quantity: quantity,
      isPreOrder: canPreOrder,
    };

    addToCart(productForCart);
    toast.success(canPreOrder ? `Added ${quantity} pre-order item(s) to your cart!` : `Added ${quantity} item(s) to your cart!`);
    setTimeout(() => setAdding(false), 400);
  };

  /* ---------------- Buy Now Direct Checkout ---------------- */
  const handleBuyNow = () => {
    if (!product) return;
    if (product.type !== "combo" && product.variants?.length > 0 && !selectedVariant) {
      return toast.error("Select a variant option first");
    }

    const productForCart = {
      _id: product._id,
      name: product.name,
      image: selectedImage || product.thumbnail || product.images?.[0]?.url || FALLBACK_IMAGE,
      variants: product.variants || [],
      selectedVariant: selectedVariant,
      price: product.type === "combo" ? product.salePrice || finalPrice : finalPrice,
      type: product.type || "single",
      comboProducts: product.comboProducts || [],
      quantity: quantity,
      isPreOrder: canPreOrder,
    };

    addToCart(productForCart);
    router.push("/checkout");
  };

  if (loading) return <ProductSkeleton />;

  if (!product)
    return <p className="text-center py-20 text-gray-500">Product not found</p>;

  const { name, brand, category, description, useCase, howToUse, ingredients, comboProducts } =
    product;

  const isCombo = product.type === "combo" || (comboProducts && comboProducts.length > 0);

  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 pb-28 md:pb-12 space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 items-start">
        {/* LEFT COLUMN: IMAGES (Vertical Thumbnail Strip on Left + Big Main Image) */}
        <div className="md:col-span-6 md:sticky md:top-24">
          <div className="flex flex-col-reverse md:flex-row gap-3.5 items-start">
            {/* Left Vertical Thumbnails Bar (Desktop: Left Column, Mobile: Bottom Horizontal Row) */}
            {imageList.length > 1 && (
              <div className="w-full md:w-20 lg:w-22 shrink-0">
                <p className="text-[10px] font-bold text-stone-400 uppercase tracking-wider mb-2 md:hidden">
                  Photo Gallery ({imageList.length} views)
                </p>
                <div className="flex md:flex-col flex-row gap-2.5 overflow-x-auto md:overflow-y-auto md:max-h-[520px] p-1 scrollbar-thin shrink-0">
                  {imageList.map((img: any, idx: number) => (
                    <ThumbnailButton
                      key={idx}
                      imgSrc={img}
                      active={selectedImage === img}
                      onClick={() => setSelectedImage(img)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Main Big Image Preview Panel */}
            <div className="flex-1 w-full min-w-0">
              <ProductImagePanel selectedImage={selectedImage} altText={name} />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: BUY BOX & DETAILS */}
        <div className="md:col-span-6 space-y-6">
          {/* Brand Tag, Title, and Rating Summary */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-2.5 py-1 rounded-md border border-rose-200 dark:border-rose-900/40 inline-block w-fit">
                {brand || "Beauty of Joseon"}
              </span>
              <span className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
                {category?.name || category || "K-Beauty Set"}
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl font-serif font-extrabold text-stone-900 dark:text-rose-50 leading-tight">
              {cleanProductName(name)}
            </h1>

            {/* SKU */}
            {product.sku && (
              <p className="text-[11px] text-stone-400 dark:text-rose-200/50 font-mono font-semibold tracking-wide">
                SKU: {product.sku}
              </p>
            )}

            {/* Rating Summary Bar */}
            <div className="flex items-center gap-3 pt-1">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-stone-300 dark:text-stone-700"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold text-stone-700 dark:text-rose-200">
                {averageRating} ({productReviews.length || 62} Customer Reviews)
              </span>
              <button
                onClick={() => setActiveTab("reviews")}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline font-semibold"
              >
                Read Reviews
              </button>
            </div>
          </div>

          {/* Pricing Row */}
          <div className="flex items-baseline gap-3.5 border-b border-stone-200/80 dark:border-white/10 pb-4">
            {(() => {
              const formatted = formatPrice(
                originalPrice * quantity,
                isFreeProduct ? 0 : finalPrice * quantity
              );
              return (
                <>
                  {formatted.originalText && (
                    <span className="line-through text-xs md:text-sm text-stone-400 dark:text-stone-500 font-mono">
                      {formatted.originalText}
                    </span>
                  )}
                  <span
                    className={`text-2xl md:text-3xl font-black ${
                      formatted.isFree
                        ? "text-emerald-600 dark:text-emerald-400 tracking-wider uppercase font-sans"
                        : "text-rose-600 dark:text-rose-400 font-mono"
                    }`}
                  >
                    {formatted.finalText}
                  </span>
                  {!formatted.isFree && originalPrice > finalPrice && (
                    <span className="text-[10px] font-extrabold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-200 uppercase tracking-wider">
                      Save ৳{((originalPrice - finalPrice) * quantity).toFixed(0)} ({discountPercent}% OFF)
                    </span>
                  )}
                </>
              );
            })()}
          </div>

          {/* Stock Indicator Status Badge (Reusable Component) */}
          <div>
            <StockBadge stock={stock} product={product} selectedVariant={selectedVariant} size="md" />
          </div>

          {/* WHAT'S INSIDE THIS SET Breakdown Card (For Combo Bundles) */}
          {isCombo && comboProducts && comboProducts.length > 0 && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50/80 via-white to-pink-50/80 dark:from-[#24151a] dark:via-[#1c1115] dark:to-[#24151a] border border-rose-200/80 dark:border-rose-900/50 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-rose-200/60 dark:border-rose-900/40 pb-3">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-rose-500" />
                  <h3 className="font-serif font-bold text-stone-900 dark:text-rose-50 text-sm uppercase tracking-wider">
                    What's Inside This Set ({comboProducts.length} Full-Size Products)
                  </h3>
                </div>
                <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-2.5 py-0.5 rounded-full">
                  Special Bundle Deal
                </span>
              </div>

              {/* Component Products Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {comboProducts.map((item: any, idx: number) => {
                  const itemImg =
                    item.image ||
                    item.thumbnail ||
                    (Array.isArray(item.images)
                      ? typeof item.images[0] === "string"
                        ? item.images[0]
                        : item.images[0]?.url
                      : null) ||
                    "/placeholder.jpg";
                  const itemPrice =
                    Number(item.price) ||
                    Number(item.salePrice) ||
                    Number(item.variants?.[0]?.price) ||
                    0;
                  const itemQty = Number(item.quantity || 1);
                  const fullName = cleanProductName(item.name || item.title || "");

                  return (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-white dark:bg-[#180f14] border border-stone-200/80 dark:border-rose-900/40 flex items-center gap-3 shadow-2xs hover:border-rose-300 transition-colors"
                    >
                      <img
                        src={itemImg}
                        alt={fullName}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "/placeholder.jpg";
                        }}
                        className="w-14 h-14 object-cover rounded-xl border border-stone-200 dark:border-rose-900/40 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-300">
                            Item {idx + 1}
                          </span>
                          {item.brand && (
                            <span className="text-[10px] text-stone-400 dark:text-rose-300/60 font-semibold truncate">
                              {item.brand}
                            </span>
                          )}
                        </div>
                        <h4
                          className="font-bold text-xs text-stone-900 dark:text-rose-100 line-clamp-1 cursor-help"
                          title={fullName}
                        >
                          {fullName}
                        </h4>
                        <div className="flex items-center justify-between text-[11px] mt-1 font-mono">
                          <span className="text-stone-600 dark:text-rose-200/80 font-bold">
                            Regular: ৳{itemPrice.toLocaleString()}
                          </span>
                          <span className="font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
                            Qty: {itemQty}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Total Value & Instant Bundle Savings Box */}
              {(() => {
                const totalReg = comboProducts.reduce((sum: number, it: any) => {
                  const p =
                    Number(it.price) ||
                    Number(it.salePrice) ||
                    Number(it.variants?.[0]?.price) ||
                    0;
                  return sum + p * (Number(it.quantity) || 1);
                }, 0) * quantity;

                const currentComboPrice = finalPrice * quantity;
                const savings = Math.max(0, totalReg - currentComboPrice);
                const savingsPercent = totalReg > 0 ? Math.round((savings / totalReg) * 100) : 0;

                return (
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#180f14] border border-rose-200 dark:border-rose-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
                    <div>
                      <span className="text-stone-500 dark:text-rose-300/70">Total Value: </span>
                      <span className="line-through font-mono font-bold text-stone-400">
                        ৳{totalReg.toLocaleString()}
                      </span>
                      <span className="mx-2 font-extrabold text-stone-400">→</span>
                      <span className="text-stone-700 dark:text-rose-200 font-bold">Combo Price: </span>
                      <span className="font-mono font-extrabold text-rose-600 dark:text-rose-400 text-sm">
                        ৳{currentComboPrice.toLocaleString()}
                      </span>
                    </div>
                    {savings > 0 && (
                      <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold text-xs shrink-0 w-fit border border-emerald-300 dark:border-emerald-800">
                        🎉 Save ৳{savings.toLocaleString()} ({savingsPercent}% OFF)
                      </span>
                    )}
                  </div>
                );
              })()}
            </div>
          )}

          {/* Variants (Only for Single Products) - Amazon & Daraz Style Pickers */}
          {!isCombo && product.variants?.length > 0 && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-stone-900 dark:text-rose-100 text-xs uppercase tracking-wider flex items-center gap-2">
                  <span>Select Size / Option:</span>
                  {selectedVariant && (
                    <span className="font-mono font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-200/60 dark:border-rose-900/40">
                      {getVariantLabel(selectedVariant)}
                    </span>
                  )}
                </h3>
                <span className="text-[11px] text-stone-400 font-semibold">
                  {product.variants.length} options
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((v: any, idx: number) => {
                  const isSelected =
                    selectedVariant === v ||
                    (v.size && selectedVariant?.size === v.size) ||
                    (v.weight &&
                      selectedVariant?.weight === v.weight &&
                      selectedVariant?.unit === v.unit) ||
                    (v._id && selectedVariant?._id === v._id);

                  const key = v.size
                    ? `size-${v.size}-${idx}`
                    : v.weight
                    ? `${v.weight}-${v.unit || ""}-${idx}`
                    : `variant-${idx}`;

                  const label = getVariantLabel(v, idx);

                  return (
                    <button
                      key={key}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all border flex items-center gap-2.5 cursor-pointer shadow-2xs ${
                        isSelected
                          ? "bg-rose-600 text-white border-rose-600 ring-2 ring-rose-500/30 shadow-md shadow-rose-600/20 scale-[1.02]"
                          : "bg-white dark:bg-[#180f14] text-stone-700 dark:text-rose-200 border-stone-200/90 dark:border-rose-900/40 hover:border-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/40"
                      }`}
                    >
                      <span>{label}</span>
                      {Boolean(v.price && Number(v.price) > 0) && (
                        <span
                          className={`font-mono text-[11px] ${
                            isSelected ? "text-white/90 font-bold" : "text-stone-500 dark:text-rose-300/70 font-semibold"
                          }`}
                        >
                          ৳{Number(v.price).toLocaleString()}
                        </span>
                      )}
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </button>
                  );
                })}
              </div>

              {/* Notice: 100ml not available */}
              {(() => {
                const has100ml = product.variants.some((v: any) => {
                  const label = getVariantLabel(v).toLowerCase().replace(/\s/g, "");
                  return label === "100ml" || label === "100g";
                });
                if (!has100ml) {
                  return (
                    <div className="mt-2.5 px-3.5 py-2.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 flex items-center gap-2 text-[11px] text-amber-700 dark:text-amber-300 font-semibold">
                      <svg className="w-4 h-4 text-amber-500 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
                      <span>100ml is not available for this product</span>
                    </div>
                  );
                }
                return null;
              })()}
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

          {/* Pre-Order Banner Notice */}
          {canPreOrder && (
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5 font-medium shadow-xs">
              <Clock className="w-4.5 h-4.5 text-amber-500 shrink-0" />
              <span>
                <strong>Pre-Order Item:</strong> Ships when back in stock. We will notify you as soon as restocked!
              </span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <button
              onClick={handleAddToCart}
              disabled={!canPurchase || adding}
              className={`w-full py-3.5 px-6 rounded-2xl text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all border flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                canPreOrder
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 border-amber-400/50"
                  : "bg-gradient-to-r from-stone-900 to-stone-800 dark:from-rose-950 dark:to-stone-900 border-stone-700/50"
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{adding ? "Adding..." : canPreOrder ? "Pre-Order Now" : "Add to Cart"}</span>
            </button>

            <button
              onClick={handleBuyNow}
              disabled={!canPurchase}
              className={`w-full py-3.5 px-6 rounded-2xl text-white font-extrabold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 ${
                canPreOrder
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700"
                  : "bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{canPreOrder ? "Pre-Order & Checkout" : "Buy Now (Instant Checkout)"}</span>
            </button>
          </div>

          {/* Trust Signals Badges (Delivery Estimate & Guarantee) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs">
            <div className="flex items-center gap-2.5 text-stone-700 dark:text-rose-200 bg-stone-50 dark:bg-white/5 p-3 rounded-2xl border border-stone-100 dark:border-white/5">
              <Truck className="w-4.5 h-4.5 text-emerald-500 shrink-0" />
              <div>
                <p className="font-bold text-stone-900 dark:text-rose-50 text-[11px]">Fast Delivery</p>
                <p className="text-[10px] text-stone-500 dark:text-rose-200/60">Dhaka 1-2 Days | Outside 2-4 Days</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-stone-700 dark:text-rose-200 bg-stone-50 dark:bg-white/5 p-3 rounded-2xl border border-stone-100 dark:border-white/5">
              <ShieldCheck className="w-4.5 h-4.5 text-rose-500 shrink-0" />
              <div>
                <p className="font-bold text-stone-900 dark:text-rose-50 text-[11px]">100% Authentic Korean</p>
                <p className="text-[10px] text-stone-500 dark:text-rose-200/60">Direct Import • 7 Days Return</p>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="pt-6 border-t border-stone-200/80 dark:border-white/10">
            <div className="flex border-b border-stone-200/80 dark:border-white/10 gap-6 overflow-x-auto no-scrollbar">
              {["description", "howToUse", "ingredients", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-3 text-xs font-bold uppercase tracking-wider transition-colors relative shrink-0 cursor-pointer ${
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
              {activeTab === "description" &&
                renderFormattedContent(
                  description || useCase || "Authentic Korean skincare product."
                )}
              {activeTab === "howToUse" &&
                renderFormattedContent(
                  howToUse ||
                    "Apply appropriate amount on clean skin and gently massage until fully absorbed."
                )}
              {activeTab === "ingredients" &&
                renderFormattedContent(
                  ingredients || "Key active Korean botanical extracts."
                )}

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
                      <p className="text-xs text-stone-500">
                        Based on {productReviews.length} customer review(s)
                      </p>
                    </div>

                    <button
                      onClick={() => setShowReviewForm(!showReviewForm)}
                      className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white dark:bg-rose-600 dark:hover:bg-rose-500 text-xs font-bold transition-all shadow-sm cursor-pointer"
                    >
                      {showReviewForm ? "Cancel Review" : "Write a Review"}
                    </button>
                  </div>

                  {/* Review Form */}
                  {showReviewForm && (
                    <form
                      onSubmit={handleReviewSubmit}
                      className="p-4 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 space-y-3"
                    >
                      <h4 className="text-xs font-bold uppercase text-stone-800 dark:text-rose-200">
                        Submit Your Experience
                      </h4>
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
                        onChange={(e) =>
                          setNewReview((p) => ({ ...p, userName: e.target.value }))
                        }
                        className="w-full text-xs p-2.5 rounded-xl border border-stone-200 dark:border-rose-900/40 bg-white dark:bg-rose-950/40 focus:outline-none focus:border-rose-500"
                      />

                      <textarea
                        rows={3}
                        placeholder="Share your experience with this product..."
                        value={newReview.comment}
                        onChange={(e) =>
                          setNewReview((p) => ({ ...p, comment: e.target.value }))
                        }
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
                      <p className="text-xs text-stone-400 italic">
                        No reviews yet. Be the first to write a review!
                      </p>
                    ) : (
                      productReviews.map((r, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-2xl bg-stone-50/70 dark:bg-white/5 border border-stone-100 dark:border-white/5 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs text-stone-800 dark:text-rose-100">
                              {r.userName || "Verified Buyer"}
                            </span>
                            <div className="flex items-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                  key={s}
                                  className={`w-3 h-3 ${
                                    s <= (r.rating || 5)
                                      ? "fill-amber-400 text-amber-400"
                                      : "text-stone-300"
                                  }`}
                                />
                              ))}
                            </div>
                          </div>
                          <p className="text-xs text-stone-600 dark:text-rose-200/80">
                            {r.comment}
                          </p>
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

      {/* YOU MAY ALSO LIKE (Cross-sell Related Products Section) */}
      {relatedProducts.length > 0 && (
        <div className="pt-12 border-t border-stone-200/80 dark:border-white/10 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-rose-500">
                Recommended For You
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900 dark:text-white mt-0.5">
                You May Also Like
              </h2>
            </div>
            <Link
              href="/products"
              className="text-xs font-extrabold uppercase tracking-wider text-rose-600 hover:underline flex items-center gap-1"
            >
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {relatedProducts.map((relProduct, idx) => (
              <ProductCard
                key={relProduct._id || idx}
                product={relProduct}
                onAddToCart={addToCart}
                index={idx}
              />
            ))}
          </div>
        </div>
      )}

      {/* MOBILE STICKY BUY BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#1c1216]/95 backdrop-blur-md p-3 border-t border-stone-200/80 dark:border-rose-900/40 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase font-bold text-stone-400">Total Price</p>
          <p className="text-lg font-extrabold text-rose-600 dark:text-rose-400 font-mono">
            ৳{finalPrice.toLocaleString()}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddToCart}
            disabled={stock <= 0 || adding}
            className="px-3.5 py-2.5 rounded-xl bg-stone-900 dark:bg-zinc-800 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            <ShoppingCart className="w-3.5 h-3.5" /> Cart
          </button>
          <button
            onClick={handleBuyNow}
            disabled={stock <= 0}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" /> Buy Now
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Helper Subcomponents ---------------- */

function ProductImagePanel({ selectedImage, altText }: { selectedImage: string; altText?: string }) {
  const displaySrc = selectedImage || FALLBACK_IMAGE;
  const [src, setSrc] = useState(displaySrc);

  useEffect(() => {
    setSrc(displaySrc);
  }, [displaySrc]);

  return (
    <div className="relative aspect-square w-full rounded-3xl overflow-hidden bg-stone-100 dark:bg-rose-950/30 border border-stone-200/60 dark:border-rose-900/30 group shadow-sm hover:shadow-md transition">
      <Image
        src={src || FALLBACK_IMAGE}
        alt={altText || "Authentic Korean Skincare Product"}
        fill
        priority
        sizes="(max-width: 768px) 100vw, 50vw"
        className="object-cover group-hover:scale-105 transition-transform duration-500"
        onError={() => setSrc(FALLBACK_IMAGE)}
      />
    </div>
  );
}

function ThumbnailButton({
  imgSrc,
  active,
  onClick,
}: {
  imgSrc: string;
  active: boolean;
  onClick: () => void;
}) {
  const [src, setSrc] = useState(imgSrc);

  useEffect(() => {
    setSrc(imgSrc);
  }, [imgSrc]);

  return (
    <button
      onClick={onClick}
      className={`relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl overflow-hidden shrink-0 border-2 transition-all duration-300 cursor-pointer ${
        active
          ? "border-rose-500 scale-105 shadow-md ring-2 ring-rose-200/50 dark:ring-rose-900/40"
          : "border-stone-200/80 dark:border-rose-900/30 opacity-75 hover:opacity-100 hover:border-rose-300"
      }`}
    >
      <Image
        src={src || FALLBACK_IMAGE}
        alt="Thumbnail"
        fill
        sizes="72px"
        className="object-cover"
        onError={() => setSrc(FALLBACK_IMAGE)}
      />
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
