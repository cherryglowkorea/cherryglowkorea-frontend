"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/utils";
import { Plus, Check, Clock } from "lucide-react";

export default function ComboList({ products }) {
  const router = useRouter();
  const tCombo = useTranslations("buildCombo");
  const { addToCart } = useCart();

  const [combo, setCombo] = useState([]);

  // Sync state with localStorage & comboUpdated events
  useEffect(() => {
    const sync = () => {
      const stored = localStorage.getItem("combo");
      setCombo(stored ? JSON.parse(stored) : []);
    };
    sync();

    window.addEventListener("storage", sync);
    window.addEventListener("comboUpdated", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("comboUpdated", sync);
    };
  }, []);

  const addToCombo = (product) => {
    if (combo.find((p) => (p._id || p.productId) === product._id)) return;

    // Default select the first variant if available
    const defaultVariant = product.variants && product.variants.length > 0 ? product.variants[0] : null;
    const updated = [...combo, { ...product, selectedVariant: defaultVariant }];

    localStorage.setItem("combo", JSON.stringify(updated));
    setCombo(updated);
    window.dispatchEvent(new Event("comboUpdated"));

    // Sync to global CartContext so top Navbar cart badge count updates live!
    addToCart({ ...product, selectedVariant: defaultVariant });
  };

  const isSelected = (id) => {
    return combo.some((p) => (p._id || p.productId) === id);
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
          {tCombo("step1")}
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
            {Array.isArray(items) && items.map((p: any) => {
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
  const minPrice = p.variants && p.variants.length > 0 ? p.variants[0].price : (p.salePrice || p.price || p.basePrice || 0);

  const isFree = p.type === "free" || p.isFree || (minPrice === 0 && (p.salePrice === 0 || p.price === 0));
  const inStock = (typeof p.stock === "number" ? p.stock > 0 : true);
  const allowPreOrder = p.allowPreOrder === true;
  const canPreOrder = !inStock && allowPreOrder;
  const formatted = formatPrice(p.price || p.basePrice || minPrice, isFree ? 0 : minPrice);

  return (
    <div
      className={`
        flex items-center gap-4 p-3.5 border-2 rounded-2xl transition-all duration-200 
        ${
          selected
            ? "bg-pink-50/20 dark:bg-pink-950/20 border-pink-500 dark:border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.15)]"
            : canPreOrder
            ? "bg-amber-500/5 dark:bg-amber-950/10 border-amber-500/70 dark:border-amber-500/60 hover:border-amber-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.2)]"
            : "bg-white dark:bg-[#1e1215] border-stone-200/60 dark:border-white/10 hover:border-pink-500/80 dark:hover:border-pink-500/70 hover:shadow-[0_0_20px_rgba(236,72,153,0.15)]"
        }
      `}
    >
      {/* Thumbnail Image */}
      <Link
        href={`/products/${p._id || p.productId}`}
        className="relative w-16 h-16 cursor-pointer bg-stone-50 dark:bg-stone-900 border border-stone-100 dark:border-white/5 rounded-xl overflow-hidden shrink-0 group/img block"
      >
        <Image
          src={imgSrc}
          alt={p.name}
          fill
          sizes="64px"
          className="object-contain p-1 transition-transform duration-200 group-hover/img:scale-105"
          onError={() => setImgSrc("/placeholder.jpg")}
        />
      </Link>

      {/* Info details */}
      <div className="flex-1 min-w-0">
        <Link href={`/products/${p._id || p.productId}`} className="block">
          <p className="font-semibold text-stone-855 dark:text-rose-50 text-xs md:text-sm line-clamp-1 hover:text-pink-500 transition-colors cursor-pointer">
            {p.name}
          </p>
        </Link>
        <p className="text-[9px] text-pink-500 uppercase tracking-widest font-bold mt-0.5">
          {p.brand}
        </p>
        <div className="flex items-center gap-1.5 mt-1">
          {formatted.originalText && (
            <span className="text-[10px] line-through text-stone-400 font-mono">
              {formatted.originalText}
            </span>
          )}
          <span
            className={`text-xs font-black ${
              formatted.isFree
                ? "text-emerald-600 dark:text-emerald-400 uppercase tracking-wide font-sans"
                : "text-stone-600 dark:text-rose-100/80 font-mono"
            }`}
          >
            {formatted.isFree ? "FREE" : `Starts from ${formatted.finalText}`}
          </span>
        </div>
      </div>

      {/* Add Button */}
      <button
        onClick={() => addToCombo(p)}
        disabled={selected}
        className={`
          flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-extrabold transition cursor-pointer shrink-0 min-w-[90px] shadow-2xs ${
            selected
              ? "bg-emerald-50 text-emerald-600 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/50"
              : isFree
              ? "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-500/20"
              : canPreOrder
              ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-amber-500/20"
              : "bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-pink-500/20"
          }
        `}
      >
        {selected ? (
          <>
            <Check size={13} className="stroke-[2.5]" />
            <span>Added</span>
          </>
        ) : isFree ? (
          <>
            <Plus size={13} className="stroke-[2.5]" />
            <span>+ Free</span>
          </>
        ) : canPreOrder ? (
          <>
            <Clock size={13} className="stroke-[2.5]" />
            <span>Pre-Order</span>
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
