"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronUp, ChevronDown, Sparkles } from "lucide-react";

export default function FloatingSummary({
  subtotal = 0,
  couponDiscount = 0,
  tierDiscount = 0,
  total = 0,
  handleCheckout,
  couponCode = "",
  tierPercent = 0,
}: any) {
  const tCombo = useTranslations("buildCombo");
  const [open, setOpen] = useState(false);
  const totalDiscount = couponDiscount + tierDiscount;

  const nextTierText = () => {
    if (subtotal === 0) return "Select products to build your custom combo bundle!";
    if (totalDiscount > 0) {
      return `🎉 Total Combo Discount: ৳${totalDiscount.toFixed(0)}`;
    }
    return "Custom Combo Package Ready!";
  };

  return (
    <div
      className="
        fixed z-50
        bottom-0 left-0 right-0
        sm:bottom-6 sm:right-6 sm:left-auto
        w-full sm:w-[340px]
        bg-white/95 dark:bg-[#1E1518]/95
        backdrop-blur-md
        border-t sm:border
        border-rose-100 dark:border-white/5
        shadow-[0_-8px_30px_rgb(0,0,0,0.06)] sm:shadow-[0_8px_30px_rgb(0,0,0,0.12)]
        rounded-none sm:rounded-2xl
        transition-all duration-300
      "
    >
      {/* Progress Tip Header (Desktop & Expanded Mobile) */}
      <div className="bg-rose-50/50 dark:bg-pink-950/20 px-4 py-2 border-b border-rose-100/40 dark:border-white/5 flex items-center gap-1.5 text-[11px] text-pink-600 dark:text-pink-300 font-semibold justify-center">
        <Sparkles size={12} className="animate-pulse" />
        <span>{nextTierText()}</span>
      </div>

      {/* Toggle Button for Mobile */}
      <div className="flex justify-center sm:hidden">
        <button
          onClick={() => setOpen(!open)}
          className="
            p-1.5 -mt-4
            bg-white dark:bg-[#1E1518]
            rounded-full shadow-md border border-rose-100 dark:border-white/5
            transition cursor-pointer
          "
        >
          {open ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        </button>
      </div>

      {/* MOBILE MINI BAR */}
      <div className="flex items-center justify-between px-4 py-3 sm:hidden">
        <div>
          <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">{tCombo("totalSavings")}</p>
          <p className="text-xs text-emerald-500 font-bold">-৳{totalDiscount.toFixed(0)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-stone-400 font-bold">{tCombo("payableTotal")}</p>
          <p className="font-extrabold text-base text-pink-600 dark:text-pink-400">৳{total.toFixed(0)}</p>
        </div>

        <button
          onClick={handleCheckout}
          className="
            bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600
            text-white px-5 py-2 font-bold
            rounded-xl text-xs uppercase tracking-widest shadow-sm
            transition cursor-pointer
          "
        >
          {tCombo("checkout")}
        </button>
      </div>

      {/* MOBILE EXPANDABLE DETAILS */}
      <div
        className={`
          sm:hidden
          overflow-hidden
          transition-all duration-300 ease-in-out
          ${open ? "max-h-52 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="px-4 pb-4 pt-1 space-y-2 border-t border-rose-100/30">
          <div className="flex justify-between text-xs text-stone-600 dark:text-rose-100/70">
            <span>{tCombo("packageSubtotal")}</span>
            <span>৳{subtotal.toLocaleString()}</span>
          </div>

          {couponDiscount > 0 && (
            <div className="flex justify-between text-xs text-emerald-500 font-medium">
              <span>Coupon ({couponCode})</span>
              <span>-৳{couponDiscount.toFixed(0)}</span>
            </div>
          )}

          {tierDiscount > 0 && (
            <div className="flex justify-between text-xs text-pink-500 font-medium">
              <span>Bundle Discount ({tierPercent}%)</span>
              <span>-৳{tierDiscount.toFixed(0)}</span>
            </div>
          )}

          <div className="border-t border-rose-100/30 my-2" />

          <div className="flex justify-between text-sm font-bold text-stone-800 dark:text-white">
            <span>Total Payable</span>
            <span className="text-pink-600 dark:text-pink-400 font-extrabold font-mono">৳{total.toFixed(0)}</span>
          </div>
        </div>
      </div>

      {/* DESKTOP BOX VERSION */}
      <div className="hidden sm:block p-5 space-y-4">
        <h2 className="font-serif font-bold text-stone-800 dark:text-rose-50 text-sm uppercase tracking-wider">
          Combo Package Summary
        </h2>

        <div className="space-y-2.5">
          <div className="flex justify-between text-xs text-stone-600 dark:text-rose-100/70">
            <span>Package Subtotal</span>
            <span className="font-mono font-semibold">৳{subtotal.toLocaleString()}</span>
          </div>

          {couponDiscount > 0 && (
            <div className="flex justify-between text-xs text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50/70 dark:bg-emerald-950/30 p-2 rounded-lg border border-emerald-100 dark:border-emerald-900/40">
              <span>Coupon ({couponCode})</span>
              <span>-৳{couponDiscount.toFixed(0)}</span>
            </div>
          )}

          {tierDiscount > 0 && (
            <div className="flex justify-between text-xs text-pink-600 dark:text-pink-400 font-bold bg-pink-50/70 dark:bg-pink-950/30 p-2 rounded-lg border border-pink-100 dark:border-pink-900/40">
              <span>Bundle Discount ({tierPercent}%)</span>
              <span>-৳{tierDiscount.toFixed(0)}</span>
            </div>
          )}

          <div className="border-t border-rose-100/40 dark:border-white/5 my-2" />

          <div className="flex justify-between text-sm font-bold text-stone-800 dark:text-rose-50">
            <span>Total Payable</span>
            <span className="text-base text-pink-600 dark:text-pink-400 font-extrabold font-mono">৳{total.toFixed(0)}</span>
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
    </div>
  );
}
