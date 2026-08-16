"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";

import ComboSelected from "./ComboSelected";
import ComboList from "./ComboList";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import FloatingSummary from "./FloatingSummary";

export default function ComboPage() {
  const [products, setProducts] = useState([]);
  const [combo, setCombo] = useState([]);

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

  // 🔥 Pricing calculated strictly from backend product prices
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

  const discount = Math.max(0, regularSubtotal - subtotal);
  const total = subtotal;

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
        {/* Header Info Block */}
        <div className="border-b border-rose-100/60 dark:border-white/5 pb-3">
          <h1 className="text-xl md:text-2xl font-serif font-bold text-stone-900 dark:text-white">
            Make Your Own Combo
          </h1>
          <p className="text-xs text-stone-500 dark:text-rose-100/50 mt-1">
            Pick products across our categories to construct your personalized package. 
            Save <strong className="text-pink-500">5%</strong> on orders over ৳4,000, and <strong className="text-pink-500">10%</strong> on orders over ৳8,000!
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-6">
          {/* Catalog List Column */}
          <div className="lg:col-span-8 space-y-6">
            <ComboList products={products} />
          </div>

          {/* Selected Items Sticky Sidebar Column */}
          <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6 bg-white/70 dark:bg-stone-950/25 p-5 rounded-3xl border border-rose-100/40 dark:border-white/5 shadow-xs">
            <ComboSelected
              combo={combo}
              removeFromCombo={removeFromCombo}
              updateVariant={updateVariant}
            />

            {/* Desktop Inline Summary */}
            {combo.length > 0 && (
              <div className="hidden lg:block border-t border-rose-100/40 dark:border-white/5 pt-4 space-y-3">
                <h3 className="font-serif font-bold text-stone-800 dark:text-rose-50 text-xs uppercase tracking-wider">
                  Package Summary
                </h3>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-stone-600 dark:text-rose-100/70">
                    <span>Package Subtotal</span>
                    <span className="font-semibold text-stone-855 dark:text-rose-100">৳{subtotal}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between text-xs text-emerald-500 font-semibold bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-100 dark:border-white/5">
                      <span>Combo Discount</span>
                      <span>-৳{discount.toFixed(0)}</span>
                    </div>
                  )}

                  <div className="border-t border-rose-100/40 dark:border-white/5 my-1.5" />

                  <div className="flex justify-between text-xs font-bold text-stone-855 dark:text-rose-50">
                    <span>Total Payable</span>
                    <span className="text-sm text-pink-600 dark:text-pink-400 font-extrabold">৳{total.toFixed(0)}</span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="
                    w-full mt-2.5
                    bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600
                    text-white py-3 rounded-xl font-bold uppercase text-xs tracking-wider shadow-sm hover:shadow
                    transition duration-300 cursor-pointer
                  "
                >
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
            discount={discount}
            total={total}
            handleCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
}
