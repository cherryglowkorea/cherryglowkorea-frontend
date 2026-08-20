"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { Tag, Sparkles, CheckCircle2, X } from "lucide-react";

import ComboSelected from "./ComboSelected";
import ComboList from "./ComboList";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import FloatingSummary from "./FloatingSummary";

export default function ComboPage() {
  const [products, setProducts] = useState([]);
  const [combo, setCombo] = useState([]);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const router = useRouter();
  const { addToCart, removeFromCart, selectVariant } = useCart();
  const API = `${process.env.NEXT_PUBLIC_API_URL}/products/allProduct/public`;

  const { user } = useAuth();

  // 🔥 Load combo
  useEffect(() => {
    const stored = localStorage.getItem("combo");
    if (stored) setCombo(JSON.parse(stored));
  }, []);

  // 🔥 Fetch products
  useEffect(() => {
    axios.get(API).then((res) => {
      const data = res.data || [];
      // Only single products can be added to custom combo builder
      setProducts(data.filter((p) => p.type !== "combo"));
    });
  }, [API]);

  // 🔥 Sync listener (when ComboList updates localStorage)
  useEffect(() => {
    const sync = () => {
      const stored = localStorage.getItem("combo");
      setCombo(stored ? JSON.parse(stored) : []);
    };

    window.addEventListener("storage", sync);
    window.addEventListener("comboUpdated", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("comboUpdated", sync);
    };
  }, []);

  // 🔥 Update variant (Syncs both Combo builder & global CartContext)
  const updateVariant = (id, variant) => {
    const updated = combo.map((p) =>
      p._id === id ? { ...p, selectedVariant: variant } : p
    );
    localStorage.setItem("combo", JSON.stringify(updated));
    window.dispatchEvent(new Event("comboUpdated"));
    selectVariant(id, variant);
  };

  // 🔥 Remove (Syncs both Combo builder & global CartContext)
  const removeFromCombo = (id) => {
    const updated = combo.filter((p) => p._id !== id);
    localStorage.setItem("combo", JSON.stringify(updated));
    window.dispatchEvent(new Event("comboUpdated"));
    removeFromCart(id);
    toast.info("Product removed");
  };

  // 🔥 Subtotal calculation
  const regularSubtotal = useMemo(() => {
    return combo.reduce((sum, p) => {
      const orig = p.price || p.basePrice || p.selectedVariant?.price || 0;
      return sum + Number(orig);
    }, 0);
  }, [combo]);

  const subtotal = useMemo(() => {
    return combo.reduce((sum, p) => {
      const finalP = p.selectedVariant?.price || p.salePrice || p.price || 0;
      return sum + Number(finalP);
    }, 0);
  }, [combo]);

  // Base package discount
  const baseDiscount = Math.max(0, regularSubtotal - subtotal);

  // Admin Coupon Validation Handler
  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (subtotal === 0) {
      toast.error("Please add products to your combo first");
      return;
    }

    setCouponLoading(true);
    try {
      const apiHost = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiHost}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, amount: subtotal }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon(data);
        setCouponCode(code);
        toast.success(`Coupon ${code} applied successfully!`);
      } else {
        // Fallback for demo codes if server route error
        if (code === "COMBO20") {
          const fallbackData = {
            code: "COMBO20",
            discountType: "percentage",
            discountAmount: 20,
            discount: (subtotal * 20) / 100,
          };
          setAppliedCoupon(fallbackData);
          setCouponCode("COMBO20");
          toast.success("Coupon COMBO20 applied (20% OFF)!");
        } else if (code === "COMBO500") {
          const fallbackData = {
            code: "COMBO500",
            discountType: "fixed",
            discountAmount: 500,
            discount: Math.min(subtotal, 500),
          };
          setAppliedCoupon(fallbackData);
          setCouponCode("COMBO500");
          toast.success("Coupon COMBO500 applied (৳500 OFF)!");
        } else {
          toast.error(data.message || "Invalid coupon code");
        }
      }
    } catch {
      toast.error("Unable to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  // Calculated Coupon Discount
  const couponDiscountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === "percentage") {
      return (subtotal * appliedCoupon.discountAmount) / 100;
    }
    return Math.min(subtotal, appliedCoupon.discountAmount);
  }, [appliedCoupon, subtotal]);

  const totalDiscount = baseDiscount + couponDiscountAmount;
  const total = Math.max(0, subtotal - couponDiscountAmount);

  // 🔥 Direct Checkout (Redirects to /checkout)
  const handleCheckout = () => {
    if (!user) {
      toast.error("Please login first");
      router.push("/login");
      return;
    }

    if (combo.length === 0) {
      toast.error("Select at least one product");
      return;
    }

    const missing = combo.find((p) => !p.selectedVariant);
    if (missing) {
      toast.error("Select variant for all products");
      return;
    }

    // Ensure all custom package items are synced in cart
    combo.forEach((product) => {
      addToCart(product);
    });

    toast.success("Proceeding to Checkout...");
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-stone-50/60 dark:bg-[#120a0d] text-stone-800 dark:text-rose-50 pt-5 pb-16 sm:pt-8 sm:pb-24 relative overflow-hidden">
      
      {/* Ambient Glow Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-5 right-5 w-96 h-96 bg-pink-300/10 dark:bg-pink-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-5 w-80 h-80 bg-rose-300/10 dark:bg-rose-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        
        {/* Header Info Block with Admin Coupon Banner */}
        <div className="border-b border-rose-100/60 dark:border-white/5 pb-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl md:text-2xl font-serif font-bold text-stone-900 dark:text-white flex items-center gap-2">
                Make Your Own Combo
                <Sparkles className="w-5 h-5 text-pink-500 animate-pulse" />
              </h1>
              <p className="text-xs text-stone-500 dark:text-rose-100/50 mt-1">
                Select 2 or more items to build your customized K-Beauty set and apply special admin coupons for maximum savings!
              </p>
            </div>

            {/* Quick Admin Coupon Badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-bold text-stone-400 dark:text-rose-100/50">Admin Coupons:</span>
              <button
                onClick={() => handleApplyCoupon("COMBO20")}
                className="px-2.5 py-1 rounded-xl bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 text-[11px] font-extrabold hover:bg-pink-200 transition border border-pink-200 dark:border-pink-900/50 cursor-pointer flex items-center gap-1"
              >
                <Tag size={11} /> COMBO20 (20% OFF)
              </button>
              <button
                onClick={() => handleApplyCoupon("COMBO500")}
                className="px-2.5 py-1 rounded-xl bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-[11px] font-extrabold hover:bg-rose-200 transition border border-rose-200 dark:border-rose-900/50 cursor-pointer flex items-center gap-1"
              >
                <Tag size={11} /> COMBO500 (৳500 OFF)
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
          {/* Catalog List Column */}
          <div className="lg:col-span-8 space-y-6">
            <ComboList products={products} />
          </div>

          {/* Selected Items Sticky Sidebar Column */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-5 bg-white/80 dark:bg-stone-950/40 p-5 rounded-3xl border border-rose-100/60 dark:border-white/10 shadow-xs backdrop-blur-md">
            <ComboSelected
              combo={combo}
              removeFromCombo={removeFromCombo}
              updateVariant={updateVariant}
            />

            {/* Admin Combo Coupon Input Section */}
            <div className="pt-2 border-t border-rose-100/40 dark:border-white/5 space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 dark:text-rose-200 flex items-center gap-1.5">
                <Tag size={12} className="text-pink-500" /> Apply Combo Coupon
              </label>

              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 p-2.5 rounded-2xl text-xs">
                  <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                    <CheckCircle2 size={14} />
                    <span>
                      {appliedCoupon.code} (
                      {appliedCoupon.discountType === "percentage"
                        ? `${appliedCoupon.discountAmount}% OFF`
                        : `৳${appliedCoupon.discountAmount} OFF`}
                      )
                    </span>
                  </div>
                  <button
                    onClick={handleRemoveCoupon}
                    className="p-1 text-stone-400 hover:text-stone-600 dark:hover:text-rose-200"
                    title="Remove coupon"
                  >
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter coupon (e.g. COMBO20, COMBO500)"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="flex-1 uppercase font-mono text-xs px-3 py-2 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-white/5 text-stone-900 dark:text-white placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                  <button
                    type="button"
                    onClick={() => handleApplyCoupon()}
                    disabled={couponLoading}
                    className="px-3.5 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl text-xs font-bold transition cursor-pointer disabled:opacity-50"
                  >
                    {couponLoading ? "..." : "Apply"}
                  </button>
                </div>
              )}
            </div>

            {/* Desktop Inline Package Summary */}
            {combo.length > 0 && (
              <div className="hidden lg:block border-t border-rose-100/40 dark:border-white/5 pt-4 space-y-3">
                <h3 className="font-serif font-bold text-stone-800 dark:text-rose-50 text-xs uppercase tracking-wider">
                  Package Summary
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-stone-600 dark:text-rose-100/70">
                    <span>Package Subtotal ({combo.length} items)</span>
                    <span className="font-semibold text-stone-850 dark:text-rose-100">৳{subtotal.toLocaleString()}</span>
                  </div>

                  {couponDiscountAmount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/70 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                      <span>Admin Coupon Discount ({appliedCoupon?.code})</span>
                      <span>-৳{couponDiscountAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="border-t border-rose-100/40 dark:border-white/5 my-1.5" />

                  <div className="flex justify-between text-xs font-bold text-stone-850 dark:text-rose-50">
                    <span>Total Payable</span>
                    <span className="text-base text-pink-600 dark:text-pink-400 font-extrabold font-mono">৳{total.toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="
                    w-full mt-2.5
                    bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600
                    text-white py-3.5 rounded-2xl font-extrabold uppercase text-xs tracking-wider shadow-md hover:shadow-lg
                    transition duration-300 cursor-pointer flex items-center justify-center gap-2
                  "
                >
                  <Sparkles size={14} />
                  Checkout Custom Package
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 🔥 FLOATING SUMMARY (Only visible on mobile and tablet) */}
        <div className="lg:hidden">
          <FloatingSummary
            subtotal={subtotal}
            discount={couponDiscountAmount}
            total={total}
            handleCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
}

