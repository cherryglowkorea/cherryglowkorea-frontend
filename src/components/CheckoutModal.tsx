"use client";

import { useCart } from "@/context/CartContext";
import { useState } from "react";
import { X, User, Phone, MapPin, ShoppingBag, CheckCircle2 } from "lucide-react";
import CheckoutSuccessModal from "./CheckoutSuccessModal";

export default function CheckoutModal({
  open,
  onClose,
  successModal,
  setSuccessModal,
  deliveryCharge = 0,
  total = 0,
}) {
  const { cart, clearCart } = useCart();
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async () => {
    if (!name.trim()) { alert("Please enter your name"); return; }
    if (!phone.trim()) { alert("Please enter your phone number"); return; }
    if (!address.trim()) { alert("Please enter your delivery address"); return; }

    // Validate: all non-combo items must have a selected variant
    const hasMissingVariant = cart.some((item) => item.type !== "combo" && !item.selectedVariant);
    if (hasMissingVariant) {
      alert("Please go back and select a size for all products.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, address, phone, cart }),
      });

      if (!res.ok) { alert("Order failed. Please try again."); setLoading(false); return; }

      const data = await res.json();

      if (data.success) {
        setSuccessModal(true);
        clearCart();
        setTimeout(() => onClose(), 100);
      }
    } catch {
      alert("Something went wrong. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="relative w-full max-w-md bg-white dark:bg-[#1e1215] border border-rose-100/60 dark:border-white/5 rounded-3xl shadow-2xl overflow-hidden">

        {/* Top gradient bar */}
        <div className="h-1 bg-gradient-to-r from-pink-400 via-rose-400 to-pink-500 w-full" />

        {/* Header */}
        <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-rose-50/60 dark:border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center shadow-sm">
              <ShoppingBag size={14} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-stone-900 dark:text-rose-50">Confirm Your Order</h2>
              <p className="text-[10px] text-stone-400 dark:text-rose-100/35 mt-0.5">Fill in your delivery details</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-7 h-7 rounded-xl bg-stone-100 dark:bg-white/5 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-500 text-stone-400 dark:text-rose-100/40 flex items-center justify-center transition cursor-pointer"
          >
            <X size={14} />
          </button>
        </div>

        {/* Form */}
        <div className="px-6 py-5 space-y-4">

          {/* Name Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-rose-100/40 flex items-center gap-1.5">
              <User size={10} /> Full Name
            </label>
            <input
              placeholder="e.g. Farhan Rahman"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="
                w-full rounded-2xl border border-stone-200 dark:border-white/8
                bg-stone-50 dark:bg-stone-900/50
                text-stone-800 dark:text-rose-100
                placeholder-stone-300 dark:placeholder-rose-100/20
                px-4 py-2.5 text-xs outline-none
                focus:border-pink-400 dark:focus:border-pink-600 focus:ring-2 focus:ring-pink-100 dark:focus:ring-pink-950/30
                transition
              "
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-rose-100/40 flex items-center gap-1.5">
              <Phone size={10} /> Phone Number
            </label>
            <input
              placeholder="e.g. 01XXXXXXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="tel"
              className="
                w-full rounded-2xl border border-stone-200 dark:border-white/8
                bg-stone-50 dark:bg-stone-900/50
                text-stone-800 dark:text-rose-100
                placeholder-stone-300 dark:placeholder-rose-100/20
                px-4 py-2.5 text-xs outline-none
                focus:border-pink-400 dark:focus:border-pink-600 focus:ring-2 focus:ring-pink-100 dark:focus:ring-pink-950/30
                transition
              "
            />
          </div>

          {/* Address Field */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-rose-100/40 flex items-center gap-1.5">
              <MapPin size={10} /> Delivery Address
            </label>
            <textarea
              placeholder="House no, road, area, district…"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className="
                w-full rounded-2xl border border-stone-200 dark:border-white/8
                bg-stone-50 dark:bg-stone-900/50
                text-stone-800 dark:text-rose-100
                placeholder-stone-300 dark:placeholder-rose-100/20
                px-4 py-2.5 text-xs outline-none resize-none
                focus:border-pink-400 dark:focus:border-pink-600 focus:ring-2 focus:ring-pink-100 dark:focus:ring-pink-950/30
                transition
              "
            />
          </div>

          {/* Order Total Strip */}
          {total > 0 && (
            <div className="flex items-center justify-between bg-pink-50 dark:bg-pink-950/20 border border-pink-100 dark:border-white/5 rounded-2xl px-4 py-3">
              <span className="text-[11px] text-stone-600 dark:text-rose-100/60 font-semibold">Total Payable</span>
              <span className="font-extrabold text-sm text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
                ৳{total}
              </span>
            </div>
          )}

          {/* Confirm Button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="
              w-full
              bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600
              disabled:from-stone-200 disabled:to-stone-300 disabled:text-stone-400 disabled:cursor-not-allowed
              text-white py-3.5 rounded-2xl font-bold uppercase text-[11px] tracking-widest
              shadow hover:shadow-md transition duration-300 cursor-pointer
              flex items-center justify-center gap-2
            "
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Placing Order…
              </span>
            ) : (
              <>
                <CheckCircle2 size={14} />
                Confirm Order
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-stone-300 dark:text-rose-100/20">
            🔒 Your information is safe and secure
          </p>
        </div>
      </div>

      <CheckoutSuccessModal
        open={successModal}
        onClose={() => setSuccessModal(false)}
      />
    </div>
  );
}
