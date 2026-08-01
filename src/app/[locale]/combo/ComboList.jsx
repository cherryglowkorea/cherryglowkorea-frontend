"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Check } from "lucide-react";
import { useState } from "react";

export default function ComboList({ products }) {
  const router = useRouter();

  const getCombo = () => {
    if (typeof window === "undefined") return [];
    const stored = localStorage.getItem("combo");
    return stored ? JSON.parse(stored) : [];
  };

  const addToCombo = (product) => {
    const combo = getCombo();

    if (combo.find((p) => p._id === product._id)) return;

    // Default select the first variant if available
    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    const updated = [...combo, { ...product, selectedVariant: defaultVariant }];

    localStorage.setItem("combo", JSON.stringify(updated));
    window.dispatchEvent(new Event("comboUpdated"));
  };

  const isSelected = (id) => {
    return getCombo().some((p) => p._id === id);
  };

  const grouped = products.reduce((acc, p) => {
    const cat = p.category || "Others";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(p);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b pb-4 border-rose-100 dark:border-white/5">
        <h2 className="text-base font-serif font-bold text-stone-800 dark:text-rose-50 uppercase tracking-wide">
          Step 1: Choose Your Products
        </h2>
        <span className="text-[10px] text-stone-500 bg-stone-100 dark:bg-white/5 px-2.5 py-1 rounded-full font-bold uppercase tracking-wide">
          {products.length} Products
        </span>
      </div>

      {Object.entries(grouped).map(([cat, items]) => (
        <div key={cat} className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="w-1 h-4 bg-pink-500 rounded-full"></span>
            <h3 className="font-serif font-bold text-sm text-stone-800 dark:text-rose-100/90 tracking-wide uppercase">
              {cat}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((p) => {
              const selected = isSelected(p._id);
              return (
                <ComboProductCard
                  key={p._id}
                  p={p}
                  selected={selected}
                  addToCombo={addToCombo}
                  router={router}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

// Subcomponent to handle catalog cards with isolated image fallback state
function ComboProductCard({ p, selected, addToCombo, router }) {
  const [imgSrc, setImgSrc] = useState(p.image || p.images?.[0]?.url || p.thumbnail || "/placeholder.jpg");
  const minPrice = p.variants && p.variants.length > 0 ? p.variants[0].price : p.basePrice;

  return (
    <div
      className={`
        flex items-center gap-4 p-3.5 border rounded-2xl bg-white dark:bg-[#23181C] 
        transition-all duration-300 hover:shadow-sm hover:border-pink-200/60
        ${selected ? "border-pink-300 ring-2 ring-pink-100/50 bg-pink-50/10 dark:bg-pink-950/5" : "border-rose-100/60 dark:border-white/5"}
      `}
    >
      {/* Thumbnail Image */}
      <div
        onClick={() => router.push(`/products/${p._id}`)}
        className="relative w-16 h-16 cursor-pointer bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-white/5 rounded-xl overflow-hidden shrink-0"
      >
        <Image
          src={imgSrc}
          alt={p.name}
          fill
          sizes="64px"
          className="object-contain"
          onError={() => setImgSrc("/placeholder.jpg")}
        />
      </div>

      {/* Info details */}
      <div
        onClick={() => router.push(`/products/${p._id}`)}
        className="flex-1 min-w-0 cursor-pointer"
      >
        <p className="font-semibold text-stone-855 dark:text-rose-50 text-xs md:text-sm line-clamp-1 hover:text-pink-500 transition-colors">
          {p.name}
        </p>
        <p className="text-[9px] text-pink-500 uppercase tracking-widest font-bold mt-0.5">
          {p.brand}
        </p>
        <p className="text-xs font-semibold text-stone-500 dark:text-rose-100/40 mt-1.5">
          Starts from ৳{minPrice}
        </p>
      </div>

      {/* Add Button */}
      <button
        onClick={() => addToCombo(p)}
        disabled={selected}
        className={`
          flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shrink-0
          ${selected 
            ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-450 dark:border-emerald-900" 
            : "bg-pink-500 hover:bg-pink-600 text-white shadow-xs"
          }
        `}
      >
        {selected ? (
          <>
            <Check size={13} className="stroke-[2.5]" />
            <span>Added</span>
          </>
        ) : (
          <>
            <Plus size={13} className="stroke-[2.5]" />
            <span>Add</span>
          </>
        )}
      </button>
    </div>
  );
}
