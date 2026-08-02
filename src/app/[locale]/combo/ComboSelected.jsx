"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ComboSelected({
  combo,
  removeFromCombo,
  updateVariant,
}) {
  const router = useRouter();

  if (combo.length === 0) {
    return (
      <div className="border border-dashed border-rose-200 dark:border-white/5 bg-rose-50/5 dark:bg-white/5 p-8 rounded-2xl text-center space-y-2">
        <p className="text-stone-500 dark:text-rose-100/50 text-sm font-medium">Your combo package is empty.</p>
        <p className="text-xs text-stone-400">Click "Add" on products below to build your custom skincare bundle!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b pb-3 border-rose-100 dark:border-white/5">
        <h2 className="text-sm font-serif font-bold text-stone-850 dark:text-rose-55 uppercase tracking-wide">
          Selected Products ({combo.length})
        </h2>
        <span className="text-[9px] uppercase font-bold tracking-widest text-pink-500 bg-pink-50 dark:bg-pink-950/20 px-2 py-0.5 rounded">
          Step 2
        </span>
      </div>

      {/* Scrollable list container with maximum height constraint */}
      <div className="max-h-[360px] overflow-y-auto py-1 pr-1.5 space-y-2.5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-pink-200 dark:[&::-webkit-scrollbar-thumb]:bg-pink-900/40 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-pink-300">
        {combo.map((p) => (
          <ComboItem
            key={p._id}
            p={p}
            router={router}
            removeFromCombo={removeFromCombo}
            updateVariant={updateVariant}
          />
        ))}
      </div>
    </div>
  );
}

// Subcomponent to isolate image fallback state for each product
function ComboItem({ p, router, removeFromCombo, updateVariant }) {
  const [imgSrc, setImgSrc] = useState(p.image || p.images?.[0]?.url || p.thumbnail || "/placeholder.jpg");

  return (
    <div
      className="bg-white dark:bg-[#23181C] p-2.5 border border-rose-100/50 dark:border-white/5 rounded-xl shadow-xs hover:shadow-sm transition"
    >
      <div className="flex gap-3 items-center">
        {/* Product Thumbnail */}
        <div
          onClick={() => router.push(`/products/${p._id}`)}
          className="relative w-12 h-12 cursor-pointer bg-stone-50 dark:bg-stone-900 border border-rose-100/60 dark:border-white/10 rounded-lg overflow-hidden shrink-0"
        >
          <Image
            src={imgSrc}
            alt={p.name}
            fill
            sizes="48px"
            className="object-contain"
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
              onClick={() => removeFromCombo(p._id)}
              className="text-red-500 hover:text-red-600 p-2 bg-red-50 hover:bg-red-100/85 dark:bg-red-950/20 dark:hover:bg-red-950/40 rounded-xl transition duration-300 shrink-0 cursor-pointer flex items-center justify-center"
              title="Remove product"
            >
              <Trash2 size={15} />
            </button>
          </div>
          
          <div className="flex justify-between items-center mt-1.5">
            <select
              value={p.selectedVariant ? p.variants?.findIndex(v => v.size === p.selectedVariant.size) : 0}
              onChange={(e) => {
                const idx = parseInt(e.target.value);
                const found = p.variants?.[idx];
                if (found) updateVariant(p._id, found);
              }}
              className="text-xs bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-white/10 rounded-lg px-2.5 py-1 text-stone-700 dark:text-rose-100/80 outline-none max-w-[125px] truncate cursor-pointer font-medium"
            >
              {p.variants?.map((v, idx) => (
                <option key={idx} value={idx}>
                  {v.size || v.weight}
                </option>
              ))}
            </select>

            {/* Price aligned to the right */}
            <span className="text-xs font-bold text-pink-500">
              ৳{p.selectedVariant ? p.selectedVariant.price : 0}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
