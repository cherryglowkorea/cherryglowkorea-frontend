"use client";

import React from "react";
import { Link } from "@/i18n/navigation";
import { Lock, LogIn, UserPlus, X } from "lucide-react";

export default function LoginModal({ isOpen, onClose, redirectPath = "/products" }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-[#1e1215] border border-stone-200 dark:border-white/10 rounded-3xl p-6 shadow-2xl space-y-5 text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-1.5 rounded-full text-stone-400 hover:text-stone-700 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/10 transition cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Icon Header */}
        <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-100 dark:border-rose-900/30 text-rose-500 flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>

        {/* Text Content */}
        <div className="space-y-1.5">
          <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
            Login Required
          </h2>
          <p className="text-xs text-stone-600 dark:text-rose-100/70 max-w-xs mx-auto leading-relaxed">
            Please log in or create an account to add items to your cart and complete your order.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          <Link
            href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition cursor-pointer"
          >
            <LogIn size={16} /> Log In Now
          </Link>

          <Link
            href={`/register?redirect=${encodeURIComponent(redirectPath)}`}
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-100 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 text-stone-800 dark:text-rose-100 font-bold text-xs rounded-xl border border-stone-200/80 dark:border-white/10 transition cursor-pointer"
          >
            <UserPlus size={16} /> Create New Account
          </Link>
        </div>

        {/* Footer Note */}
        <p className="text-[11px] text-stone-400 dark:text-rose-100/40 font-medium">
          Fast & secure checkout for registered customers
        </p>
      </div>
    </div>
  );
}
