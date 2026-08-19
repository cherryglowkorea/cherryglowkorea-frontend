"use client";

import Image from "next/image";
import { Pencil, Trash2, Copy, Sparkles, Flame, Gift, Package, AlertTriangle, Eye } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

/* ---------------- Helpers ---------------- */

const getPriceRange = (variants = [], basePrice, type) => {
  if (type === "combo" && basePrice) {
    return `৳ ${Number(basePrice).toLocaleString()}`;
  }

  if (!variants || !variants.length) return "—";

  const prices = variants.map((v) => Number(v.price) || 0).filter((p) => p > 0);
  if (!prices.length) return "—";

  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return min === max
    ? `৳ ${min.toLocaleString()}`
    : `৳ ${min.toLocaleString()} - ${max.toLocaleString()}`;
};

const getThumbnail = (p) => {
  return p.thumbnail || p.images?.[0]?.url || p.image || "/placeholder.jpg";
};

const getTotalStock = (p) => {
  if (typeof p.stock === "number") return p.stock;
  if (p.variants && p.variants.length > 0) {
    return p.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }
  return 0;
};

export default function ProductMobileCard({
  products,
  loading,
  onEdit,
  onDelete,
  onDuplicate,
  onViewDetails,
}) {
  if (loading) {
    return (
      <div className="grid gap-4 sm:hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-44 rounded-2xl bg-stone-100 dark:bg-rose-950/40" />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="flex sm:hidden flex-col items-center justify-center p-8 mt-4 rounded-2xl border border-stone-200 dark:border-rose-900/30 bg-white dark:bg-[#160E12] text-center space-y-2">
        <Package className="h-10 w-10 text-stone-300 dark:text-rose-900/50" />
        <h3 className="text-sm font-bold text-stone-800 dark:text-rose-100">No products found</h3>
        <p className="text-xs text-stone-500 dark:text-slate-400">
          Try adjusting your search query or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-3.5 sm:hidden mt-4">
      {products.map((p) => {
        const stockCount = getTotalStock(p);
        const isLowStock = stockCount <= 5;
        const isCombo = p.type === "combo";

        return (
          <div
            key={p.id || p._id}
            className="rounded-2xl border border-stone-200/80 dark:border-rose-900/40 bg-white dark:bg-[#160E12] p-4 shadow-xs space-y-3"
          >
            <div className="flex items-start gap-3">
              {/* Image */}
              <div className="relative h-16 w-16 rounded-xl overflow-hidden border border-stone-200 dark:border-slate-800 bg-stone-100 dark:bg-slate-900 shrink-0 shadow-xs">
                <Image
                  src={getThumbnail(p)}
                  alt={p.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>

              {/* Title & Brand */}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-xs text-stone-900 dark:text-white line-clamp-2">
                  {p.name}
                </p>
                <div className="flex items-center gap-2 text-[10px] text-stone-500 dark:text-slate-400 mt-0.5">
                  <span className="font-semibold text-rose-600 dark:text-rose-300">{p.category || "General"}</span>
                  {p.brand && <span>• {p.brand}</span>}
                </div>
                <p className="font-mono font-extrabold text-xs text-stone-900 dark:text-white mt-1">
                  {getPriceRange(p.variants, p.basePrice || p.salePrice || p.price, p.type)}
                </p>
              </div>
            </div>

            {/* Badges & Stock */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100 dark:border-rose-950/50">
              <div className="flex items-center gap-1.5 flex-wrap">
                {isCombo ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60">
                    <Gift className="h-2.5 w-2.5" /> Combo
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                    Single
                  </span>
                )}

                {p.isFeatured && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300">
                    <Sparkles className="h-2.5 w-2.5 text-pink-500" /> Featured
                  </span>
                )}

                {p.isBestSelling && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                    <Flame className="h-2.5 w-2.5 text-emerald-500" /> Best
                  </span>
                )}
              </div>

              {/* Stock Badge */}
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold shrink-0 ${
                  isLowStock
                    ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200"
                    : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200"
                }`}
              >
                {isLowStock && <AlertTriangle className="h-2.5 w-2.5 text-amber-500" />}
                {stockCount} in stock
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-rose-950/50">
              <button
                onClick={() => onViewDetails && onViewDetails(p)}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/40 text-xs font-bold text-blue-600 dark:text-blue-300"
              >
                <Eye className="h-3.5 w-3.5" /> Details
              </button>

              {isCombo && (
                <button
                  onClick={() => onDuplicate && onDuplicate(p.id || p._id)}
                  className="p-1.5 rounded-xl border border-stone-200 dark:border-rose-900/50 text-stone-700 dark:text-rose-300 hover:bg-rose-50"
                  title="Duplicate Combo"
                >
                  <Copy className="h-3.5 w-3.5" />
                </button>
              )}

              <button
                onClick={() => onEdit(p)}
                className="p-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold shadow-xs"
                title="Edit Product"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => {
                  if (confirm(`Delete "${p.name}"?`)) {
                    onDelete(p.id || p._id);
                  }
                }}
                className="p-1.5 rounded-xl border border-stone-200 dark:border-rose-900/50 text-rose-500 hover:bg-rose-600 hover:text-white"
                title="Delete Product"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
