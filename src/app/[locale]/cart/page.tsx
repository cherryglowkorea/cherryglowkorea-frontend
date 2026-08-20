"use client";

import { useCart } from "@/context/CartContext";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, Tag, Truck, MapPin, ChevronRight, Package, Sparkles } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";

const FALLBACK_IMAGE = "/placeholder.jpg";

export default function CartPage() {
  const { cart, isLoaded: isCartLoaded, selectVariant, updateQuantity, removeFromCart, coupon } = useCart();
  const router = useRouter();

  const [couponInput, setCouponInput] = useState("");
  const [mounted, setMounted] = useState(false);
  const [storeSettings, setStoreSettings] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    const fetchSettings = async () => {
      try {
        const apiHost = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${apiHost}/api/settings`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data) {
            setStoreSettings(data.data);
          }
        }
      } catch (e) {}
    };
    fetchSettings();
  }, []);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = item.selectedVariant?.price || item.price || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [cart]);

  const insideDhakaCost = Number(storeSettings?.shipping?.insideDhaka ?? 60);
  const freeThreshold = Number(storeSettings?.shipping?.freeShippingThreshold ?? 3000);
  const isFreeShipping = freeThreshold > 0 && subtotal >= freeThreshold;
  const shippingFee = isFreeShipping ? 0 : insideDhakaCost;

  const discount = useMemo(() => {
    if (!coupon) return 0;
    if (coupon.type === "percentage") return (subtotal * coupon.value) / 100;
    return coupon.value;
  }, [coupon, subtotal]);

  const handleCheckout = () => {
    if (cart.length === 0) { toast.error("Cart is empty"); return; }
    router.push("/checkout");
  };

  if (!mounted || !isCartLoaded) return null;

  return (
    <>
      {/* Background Decorations */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-20 right-20 w-80 h-80 bg-pink-200/15 dark:bg-pink-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-32 left-10 w-64 h-64 bg-rose-200/10 dark:bg-rose-900/8 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-14 min-h-screen">

        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8 md:mb-10">
          <div className="w-9 h-9 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl flex items-center justify-center shadow-sm">
            <ShoppingBag size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-stone-900 dark:text-rose-50 leading-tight">
              My Cart
            </h1>
            {cart.length > 0 && (
              <p className="text-xs text-stone-400 dark:text-rose-100/40 mt-0.5">
                {cart.length} item{cart.length !== 1 ? "s" : ""} in your cart
              </p>
            )}
          </div>
        </div>

        {/* Empty State */}
        {cart.length === 0 ? (
          <div className="max-w-sm mx-auto mt-16 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-950/30 dark:to-rose-950/20 border border-rose-100/60 dark:border-white/5 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
              <ShoppingBag size={36} className="text-pink-300 dark:text-pink-700" />
            </div>
            <h2 className="text-lg font-bold text-stone-800 dark:text-rose-100 mb-2">Your cart is empty</h2>
            <p className="text-sm text-stone-400 dark:text-rose-100/35 mb-8 leading-relaxed">
              Discover our skincare collection and find what your skin loves.
            </p>
            <button
              onClick={() => router.push("/products")}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase tracking-wider transition duration-300 cursor-pointer shadow-sm hover:shadow"
            >
              Shop Now <ChevronRight size={14} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-start">

            {/* ─── LEFT: Cart Items ─── */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              {cart.map((item, i) => (
                <CartItemRow
                  key={`${item.productId}-${i}`}
                  item={item}
                  router={router}
                  selectVariant={selectVariant}
                  updateQuantity={updateQuantity}
                  removeFromCart={removeFromCart}
                />
              ))}

              {/* Continue Shopping Link */}
              <button
                onClick={() => router.push("/products")}
                className="flex items-center gap-2 text-xs text-stone-400 dark:text-rose-100/35 hover:text-pink-500 dark:hover:text-pink-400 transition mt-2 cursor-pointer"
              >
                <ChevronRight size={12} className="rotate-180" />
                Continue Shopping
              </button>
            </div>

            {/* ─── RIGHT: Sidebar ─── */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-24">

              {/* 💰 ORDER SUMMARY CARD */}
              <div className="bg-white dark:bg-[#1e1215] backdrop-blur-sm border border-stone-200/50 dark:border-white/10 rounded-3xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(244,63,94,0.08)] transition-all duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <Package size={16} className="text-pink-500" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-rose-100">
                    Order Summary
                  </h2>
                </div>

                {/* 🚚 DYNAMIC FREE SHIPPING PROGRESS BAR */}
                {freeThreshold > 0 && (
                  <div className="bg-gradient-to-r from-pink-50/80 to-rose-50/80 dark:from-pink-950/30 dark:to-rose-950/20 border border-pink-100 dark:border-rose-900/30 p-3 rounded-2xl mb-4 text-xs">
                    {subtotal >= freeThreshold ? (
                      <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                        <Sparkles size={14} className="shrink-0 animate-pulse text-amber-400" />
                        <span>You unlocked FREE Nationwide Shipping!</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-stone-700 dark:text-rose-200 font-semibold">
                          <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-[11.5px]">
                            <Truck size={13} />
                            Add ৳{(freeThreshold - subtotal).toLocaleString()} more for FREE shipping
                          </span>
                          <span className="text-[10px] text-stone-400 font-mono">
                            {Math.round((subtotal / freeThreshold) * 100)}%
                          </span>
                        </div>
                        <div className="w-full bg-stone-200/60 dark:bg-stone-800 h-2 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-pink-500 to-rose-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, (subtotal / freeThreshold) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-500 dark:text-rose-100/50">
                      Subtotal ({cart.reduce((s, i) => s + i.quantity, 0)} items)
                    </span>
                    <span className="font-semibold text-stone-800 dark:text-rose-50">৳{subtotal.toLocaleString()}</span>
                  </div>

                  {discount > 0 && (
                    <div className="flex justify-between items-center bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-white/5 p-2.5 rounded-xl">
                      <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                        <Tag size={10} />
                        <span className="font-semibold">Coupon Applied</span>
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">-৳{discount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-stone-500 dark:text-rose-100/50 text-[11px]">
                    <span>Shipping Fee</span>
                    <span className="font-semibold text-stone-700 dark:text-rose-100">
                      {isFreeShipping ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          FREE (Over ৳{freeThreshold.toLocaleString()})
                        </span>
                      ) : (
                        <span className="italic text-stone-400 dark:text-rose-100/40">
                          Calculated at checkout (From ৳{insideDhakaCost})
                        </span>
                      )}
                    </span>
                  </div>

                  <div className="border-t border-dashed border-rose-100/60 dark:border-white/8 my-1" />

                  <div className="flex justify-between items-center">
                    <span className="font-bold text-sm text-stone-900 dark:text-white">Estimated Total</span>
                    <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
                      ৳{Math.max(0, subtotal - discount + shippingFee).toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleCheckout}
                  className="
                    mt-5 w-full
                    bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600
                    text-white py-4 rounded-2xl font-bold uppercase text-[11px] tracking-widest
                    shadow-md hover:shadow-lg transition duration-300 cursor-pointer
                    flex items-center justify-center gap-2
                  "
                >
                  <ChevronRight size={14} />
                  Proceed to Checkout
                </button>

                <p className="text-center text-[10px] text-stone-400 dark:text-rose-100/30 mt-3">
                  🔒 Secure checkout · 100% Authentic Products
                </p>
              </div>

            </div>
          </div>
        )}
      </div>
    </>
  );
}

/* ─── Cart Item Row ─── */
function CartItemRow({ item, router, selectVariant, updateQuantity, removeFromCart }) {
  const [imgSrc, setImgSrc] = useState(item.image || FALLBACK_IMAGE);
  const [removing, setRemoving] = useState(false);

  useEffect(() => { setImgSrc(item.image || FALLBACK_IMAGE); }, [item.image]);

  const handleRemove = () => {
    setRemoving(true);
    setTimeout(() => removeFromCart(item.productId), 250);
  };

  return (
    <div
      className={`
        flex gap-3 sm:gap-4 p-3 sm:p-4
        bg-white dark:bg-[#1e1215] backdrop-blur-sm
        border border-stone-200/50 dark:border-white/10
        rounded-2xl shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(244,63,94,0.08)]
        transition-all duration-300
        ${removing ? "opacity-0 scale-95" : "opacity-100 scale-100"}
      `}
    >
      {/* Product Image */}
      <button
        onClick={() => router.push(`/products/${item.productId}`)}
        className="relative w-20 h-20 sm:w-24 sm:h-24 cursor-pointer bg-stone-50 dark:bg-stone-900 border border-stone-100/80 dark:border-white/5 rounded-2xl overflow-hidden shrink-0 hover:opacity-90 transition"
      >
        <Image
          src={imgSrc}
          alt={item.name}
          fill
          sizes="96px"
          className="object-contain p-1.5"
          onError={() => setImgSrc(FALLBACK_IMAGE)}
        />
      </button>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between gap-2">

        {/* Name + Remove */}
        <div className="flex items-start justify-between gap-2">
          <button
            onClick={() => router.push(`/products/${item.productId}`)}
            className="font-semibold text-stone-800 dark:text-rose-50 text-xs sm:text-sm leading-snug line-clamp-2 text-left hover:text-pink-500 dark:hover:text-pink-400 transition cursor-pointer"
          >
            {item.name}
          </button>
          <button
            onClick={handleRemove}
            title="Remove item"
            className="p-1.5 text-red-400 hover:text-white hover:bg-red-500 dark:hover:bg-red-600 bg-red-50 dark:bg-red-950/20 rounded-xl transition duration-200 shrink-0 cursor-pointer"
          >
            <Trash2 size={13} />
          </button>
        </div>

        {/* Combo Details */}
        {item.type === "combo" && (
          <div className="bg-pink-50/50 dark:bg-white/5 border border-rose-100/50 dark:border-white/5 rounded-xl p-2">
            <span className="text-[9px] font-bold uppercase tracking-wider text-pink-500 block mb-1">🎁 Bundle</span>
            <ul className="space-y-0.5">
              {item.comboProducts?.map((cp, idx) => (
                <li key={idx} className="text-[10px] text-stone-500 dark:text-rose-100/40 truncate">
                  {cp.product?.name || "Product"} <span className="font-bold text-pink-400">×{cp.quantity}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Variant Selector */}
        {item.type !== "combo" && (
          <div>
            {item.variants && item.variants.length > 1 ? (
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-stone-400 dark:text-rose-100/35 font-bold uppercase tracking-wide shrink-0">Size</span>
                <select
                  value={
                    item.selectedVariant
                      ? String(item.variants.findIndex(
                          (v) => v === item.selectedVariant ||
                            (v.price === item.selectedVariant.price &&
                             String(v.weight) === String(item.selectedVariant.weight) &&
                             v.unit === item.selectedVariant.unit)
                        ))
                      : ""
                  }
                  onChange={(e) => {
                    const idx = Number(e.target.value);
                    const found = item.variants?.[idx];
                    if (found) selectVariant(item.productId, found);
                  }}
                  className="flex-1 text-[10px] bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-white/10 rounded-xl px-2.5 py-1 text-stone-700 dark:text-rose-100/70 outline-none focus:border-pink-400 cursor-pointer font-semibold max-w-[140px]"
                >
                  <option value="" disabled>Choose size…</option>
                  {item.variants.map((v, idx) => (
                    <option key={idx} value={String(idx)}>
                      {v.weight}{v.unit} — ৳{v.price}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              item.selectedVariant && (
                <span className="text-[10px] text-stone-400 dark:text-rose-100/35 font-medium">
                  {item.selectedVariant.weight}{item.selectedVariant.unit}
                </span>
              )
            )}

            {!item.selectedVariant && (
              <p className="text-[10px] text-red-500 font-semibold mt-0.5 animate-pulse">
                ⚠ Select size to continue
              </p>
            )}
          </div>
        )}

        {/* Price + Qty Row */}
        <div className="flex items-center justify-between mt-1">
          {/* Price */}
          <div>
            <p className="text-xs font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-400">
              ৳{((item.selectedVariant?.price || item.price || 0) * item.quantity).toLocaleString()}
            </p>
            {item.quantity > 1 && (
              <p className="text-[9px] text-stone-300 dark:text-rose-100/25">
                ৳{item.selectedVariant?.price || item.price || 0} × {item.quantity}
              </p>
            )}
          </div>

          {/* Quantity Pill */}
          <div className="flex items-center gap-0 border border-stone-200 dark:border-white/10 rounded-2xl overflow-hidden bg-stone-50 dark:bg-stone-900/60">
            <button
              onClick={() => updateQuantity(item.productId, "dec")}
              className="px-2.5 py-1.5 hover:bg-pink-50 dark:hover:bg-white/5 text-stone-500 dark:text-rose-100/60 transition cursor-pointer"
            >
              <Minus size={11} />
            </button>
            <span className="px-3 py-1 text-[11px] font-bold text-stone-800 dark:text-rose-50 border-x border-stone-200 dark:border-white/10 min-w-[2rem] text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQuantity(item.productId, "inc")}
              className="px-2.5 py-1.5 hover:bg-pink-50 dark:hover:bg-white/5 text-stone-500 dark:text-rose-100/60 transition cursor-pointer"
            >
              <Plus size={11} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
