"use client";

import Image from "next/image";
import { Trash2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { formatPrice } from "@/lib/utils";

export default function ComboSelected({
  combo,
  removeFromCombo,
  updateVariant,
}) {
  const router = useRouter();
  const tCombo = useTranslations("buildCombo");

  const count = combo.length;
  let progressPercent = Math.min(100, Math.round((count / 8) * 100));
  let tierMessage = "";
  let tierBadge = "";

  if (count >= 8) {
    tierMessage = "🔥 MAX TIER: 15% Bundle Discount Active!";
    tierBadge = "15% OFF";
  } else if (count >= 5) {
    tierMessage = `🎉 10% OFF Active! Add ${8 - count} more for 15% OFF!`;
    tierBadge = "10% OFF";
  } else if (count >= 3) {
    tierMessage = `🎉 5% OFF Active! Add ${5 - count} more for 10% OFF!`;
    tierBadge = "5% OFF";
  } else {
    tierMessage = `Add ${3 - count} more item${3 - count === 1 ? "" : "s"} to unlock 5% OFF!`;
    tierBadge = "Tier Discounts";
  }

  if (count === 0) {
    return (
      <div className="border border-dashed border-rose-200 dark:border-white/5 bg-rose-50/5 dark:bg-white/5 p-8 rounded-2xl text-center space-y-2">
        <p className="text-stone-500 dark:text-rose-100/50 text-sm font-medium">{tCombo("emptyState")}</p>
        <p className="text-xs text-stone-400">{tCombo("emptyStateSub")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-3 border-rose-100 dark:border-white/5">
        <h2 className="text-sm font-serif font-bold text-stone-850 dark:text-rose-55 uppercase tracking-wide">
          {tCombo("selectedProducts")} ({count})
        </h2>
        <span className="text-[9px] uppercase font-extrabold tracking-wider text-pink-600 bg-pink-100 dark:bg-pink-950/60 dark:text-pink-300 px-2 py-0.5 rounded-full border border-pink-200 dark:border-pink-900/50 flex items-center gap-1">
          <Sparkles size={10} /> {tierBadge}
        </span>
      </div>

      {/* Bundle Tier Progress Bar */}
      <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/20 border border-pink-100 dark:border-pink-900/30 space-y-1.5 shadow-2xs">
        <div className="flex justify-between items-center text-[11px] font-bold text-pink-700 dark:text-pink-300">
          <span className="flex items-center gap-1">
            <Sparkles size={11} className="text-pink-500 animate-pulse" />
            {tierMessage}
          </span>
          <span className="font-mono text-[10px]">{count}/8 items</span>
        </div>
        <div className="w-full bg-pink-200/60 dark:bg-pink-950/60 h-2 rounded-full overflow-hidden p-0.5">
          <div
            className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full transition-all duration-500 shadow-sm"
            style={{ width: `${Math.max(5, progressPercent)}%` }}
          />
        </div>
      </div>

      {/* Scrollable list container with maximum height constraint & bottom fade gradient */}
      <div className="relative">
        <div className="max-h-[380px] sm:max-h-[420px] overflow-y-auto py-1 pr-1.5 space-y-2.5 scrollbar-thin scrollbar-thumb-pink-300 dark:scrollbar-thumb-rose-900 scrollbar-track-transparent">
          {combo.map((p) => (
            <ComboItem
              key={p._id || p.productId}
              p={p}
              router={router}
              removeFromCombo={removeFromCombo}
              updateVariant={updateVariant}
            />
          ))}
        </div>
        {count > 3 && (
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-[#180f14] to-transparent rounded-b-xl" />
        )}
      </div>
    </div>
  );
}

// Subcomponent to isolate image fallback state for each product
function ComboItem({ p, router, removeFromCombo, updateVariant }) {
  const [imgSrc, setImgSrc] = useState(p.image || p.images?.[0]?.url || p.thumbnail || "/placeholder.jpg");
  const priceVal = p.selectedVariant ? p.selectedVariant.price : (p.salePrice || p.price || 0);
  const isFree = p.type === "free" || p.isFree || (priceVal === 0);
  const formatted = formatPrice(0, isFree ? 0 : priceVal);

  return (
    <div
      className="bg-white dark:bg-[#23181C] p-2.5 border border-rose-100/50 dark:border-white/5 rounded-2xl shadow-2xs hover:shadow-xs transition"
    >
      <div className="flex gap-3 items-center">
        {/* Product Thumbnail */}
        <div
          onClick={() => router.push(`/products/${p._id || p.productId}`)}
          className="relative w-12 h-12 cursor-pointer bg-stone-50 dark:bg-stone-900 border border-rose-100/60 dark:border-white/10 rounded-xl overflow-hidden shrink-0"
        >
          <Image
            src={imgSrc}
            alt={p.name}
            fill
            sizes="48px"
            className="object-contain p-1"
            onError={() => setImgSrc("/placeholder.jpg")}
          />
        </div>

        {/* Info Details */}
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-1">
            <h3 className="font-semibold text-stone-855 dark:text-rose-100 text-xs line-clamp-1 truncate">
              {p.name}
            </h3>
            <button
              onClick={() => removeFromCombo(p._id || p.productId)}
              className="text-red-500 hover:text-red-600 p-1.5 bg-red-50 hover:bg-red-100/85 dark:bg-red-950/20 dark:hover:bg-red-950/40 rounded-xl transition duration-300 shrink-0 cursor-pointer flex items-center justify-center"
              title="Remove product"
            >
              <Trash2 size={14} />
            </button>
          </div>
          
          <div className="flex justify-between items-center mt-1.5">
            {p.variants && p.variants.length > 0 ? (
              <select
                value={p.selectedVariant ? p.variants?.findIndex(v => v.size === p.selectedVariant.size || v.price === p.selectedVariant.price) : 0}
                onChange={(e) => {
                  const idx = parseInt(e.target.value);
                  const found = p.variants?.[idx];
                  if (found) updateVariant(p._id || p.productId, found);
                }}
                className="text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-white/10 rounded-lg px-2 py-0.5 text-stone-700 dark:text-rose-100/80 outline-none max-w-[125px] truncate cursor-pointer font-medium"
              >
                {p.variants?.map((v, idx) => (
                  <option key={idx} value={idx}>
                    {v.size || v.weight || `Opt ${idx + 1}`}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-[10px] text-stone-400 font-medium">Standard</span>
            )}

            {/* Price aligned to the right */}
            <span className={`text-xs font-black ${formatted.isFree ? "text-emerald-600 dark:text-emerald-400 uppercase tracking-wide" : "text-pink-600 dark:text-pink-400 font-mono"}`}>
              {formatted.finalText}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
