"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import CheckoutModal from "@/components/CheckoutModal";
import ComboSelected from "./ComboSelected";
import ComboList from "./ComboList";
import { useAuth } from "@/context/AuthContext";
import FloatingSummary from "./FloatingSummary";

export default function ComboPage() {
  const [products, setProducts] = useState([]);
  const [combo, setCombo] = useState([]);
  const [open, setOpen] = useState(false);

  const router = useRouter();
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
      setProducts(data.filter(p => p.type !== "combo"));
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

  // 🔥 Update variant
  const updateVariant = (id, variant) => {
    const updated = combo.map((p) =>
      p._id === id ? { ...p, selectedVariant: variant } : p,
    );
    localStorage.setItem("combo", JSON.stringify(updated));
    window.dispatchEvent(new Event("comboUpdated"));
  };

  // 🔥 Remove
  const removeFromCombo = (id) => {
    const updated = combo.filter((p) => p._id !== id);
    localStorage.setItem("combo", JSON.stringify(updated));
    window.dispatchEvent(new Event("comboUpdated"));
  };

  // 🔥 Pricing
  const subtotal = useMemo(() => {
    return combo.reduce((sum, p) => {
      if (!p.selectedVariant) return sum;
      return sum + p.selectedVariant.price;
    }, 0);
  }, [combo]);

  const discountRate = subtotal > 8000 ? 0.1 : subtotal > 4000 ? 0.05 : 0;

  const discount = subtotal * discountRate;
  const total = subtotal - discount;

  // 🔥 Checkout
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

    setOpen(true);
  };

  return (
    <div className="max-w-[1536px] mx-auto px-4 py-12 space-y-8 relative min-h-screen">
      {/* Header Info Block */}
      <div className="text-center space-y-3 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-pink-500 bg-pink-50 dark:bg-pink-950/20 px-3 py-1 rounded-full border border-pink-100 dark:border-white/5">
          ✨ Custom Skincare Creator
        </span>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 dark:text-white">
          Make Your Own Combo
        </h1>
        <p className="text-sm text-stone-500 dark:text-rose-100/50">
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
        <div className="lg:col-span-4 lg:sticky lg:top-24 space-y-6 bg-stone-50/50 dark:bg-stone-950/25 p-5 rounded-3xl border border-rose-100/40 dark:border-white/5">
          <ComboSelected
            combo={combo}
            removeFromCombo={removeFromCombo}
            updateVariant={updateVariant}
          />

          {/* Desktop Inline Summary */}
          {combo.length > 0 && (
            <div className="hidden lg:block border-t border-rose-100/40 dark:border-white/5 pt-5 space-y-4">
              <h3 className="font-serif font-bold text-stone-800 dark:text-rose-50 text-sm uppercase tracking-wider">
                Package Summary
              </h3>

              <div className="space-y-2.5">
                <div className="flex justify-between text-xs text-stone-600 dark:text-rose-100/70">
                  <span>Package Subtotal</span>
                  <span className="font-semibold text-stone-850 dark:text-rose-100">৳{subtotal}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-500 font-semibold bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-100 dark:border-white/5">
                    <span>Combo Discount ({discountRate * 100}%)</span>
                    <span>-৳{discount.toFixed(0)}</span>
                  </div>
                )}

                <div className="border-t border-rose-100/40 dark:border-white/5 my-2" />

                <div className="flex justify-between text-sm font-bold text-stone-850 dark:text-rose-50">
                  <span>Total Payable</span>
                  <span className="text-base text-pink-600 dark:text-pink-400 font-extrabold">৳{total.toFixed(0)}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                className="
                  w-full
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

      <CheckoutModal open={open} onClose={() => setOpen(false)} />
    </div>
  );
}
