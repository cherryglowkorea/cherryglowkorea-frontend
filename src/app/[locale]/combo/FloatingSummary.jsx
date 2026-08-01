"use client";

import { useState } from "react";
import { ChevronUp, ChevronDown, Sparkles } from "lucide-react";

export default function FloatingSummary({
  subtotal = 0,
  discount = 0,
  total = 0,
  handleCheckout,
}) {
  const [open, setOpen] = useState(false);

  // Tiers progress calculation
  const nextTierText = () => {
    if (subtotal === 0) return "Build your combo to get up to 10% extra discount!";
    if (subtotal < 4000) {
      return `Add ৳${4000 - subtotal} more to unlock 5% discount!`;
    }
    if (subtotal < 8000) {
      return `Add ৳${8000 - subtotal} more to unlock 10% discount!`;
    }
    return "🎉 Max 10% Combo Discount Unlocked!";
  };

  const discountRatePercent = () => {
    if (subtotal >= 8000) return 10;
    if (subtotal >= 4000) return 5;
    return 0;
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
          <p className="text-[10px] text-stone-500 uppercase tracking-widest font-bold">Total Savings</p>
          <p className="text-xs text-emerald-500 font-bold">-৳{discount.toFixed(0)}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-stone-400 font-bold">Payable Total</p>
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
          Checkout
        </button>
      </div>

      {/* MOBILE EXPANDABLE DETAILS */}
      <div
        className={`
          sm:hidden
          overflow-hidden
          transition-all duration-300 ease-in-out
          ${open ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}
        `}
      >
        <div className="px-4 pb-4 pt-1 space-y-2 border-t border-rose-100/30">
          <div className="flex justify-between text-xs text-stone-600 dark:text-rose-100/70">
            <span>Package Subtotal</span>
            <span>৳{subtotal}</span>
          </div>

          <div className="flex justify-between text-xs text-emerald-500 font-medium">
            <span>Extra Combo Discount ({discountRatePercent()}%)</span>
            <span>-৳{discount.toFixed(0)}</span>
          </div>

          <div className="border-t border-rose-100/30 my-2" />

          <div className="flex justify-between text-sm font-bold text-stone-800 dark:text-white">
            <span>Total Payable</span>
            <span>৳{total.toFixed(0)}</span>
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
            <span className="font-semibold text-stone-800 dark:text-rose-100">৳{subtotal}</span>
          </div>

          {discount > 0 && (
            <div className="flex justify-between text-xs text-emerald-500 font-semibold bg-emerald-50/50 dark:bg-emerald-950/20 p-2 rounded-lg border border-emerald-100 dark:border-white/5">
              <span>Combo Discount ({discountRatePercent()}%)</span>
              <span>-৳{discount.toFixed(0)}</span>
            </div>
          )}

          <div className="border-t border-rose-100/40 dark:border-white/5 my-2" />

          <div className="flex justify-between text-sm font-bold text-stone-800 dark:text-rose-50">
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
    </div>
  );
}
