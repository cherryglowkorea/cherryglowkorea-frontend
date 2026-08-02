"use client";

import Link from "next/link";
import Image from "next/image";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { Heart, Trash2, ShoppingBag, ArrowLeft, Sparkles } from "lucide-react";

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();

  return (
    <main className="relative min-h-screen bg-stone-50/50 dark:bg-[#160d10] text-stone-800 dark:text-rose-100 overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-10 right-10 w-96 h-96 bg-pink-300/15 dark:bg-rose-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-rose-200/15 dark:bg-pink-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 space-y-8">
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-rose-100/60 dark:border-white/5 pb-6">
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-300 bg-rose-100/70 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 shadow-2xs">
              <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" /> Saved Favorites
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 dark:text-white">
              My Wishlist ({wishlist.length})
            </h1>
          </div>

          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#1e1215] border border-stone-200/80 dark:border-white/10 text-xs font-bold text-stone-700 dark:text-rose-100 hover:bg-rose-50 dark:hover:bg-white/5 transition shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>

        {/* Empty Wishlist State */}
        {wishlist.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-[#1e1215] rounded-3xl border border-stone-200/60 dark:border-white/10 p-8 shadow-[0_2px_8px_rgba(0,0,0,0.04)] space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-900/30">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
              Your Wishlist is Empty
            </h2>
            <p className="text-xs text-stone-500 dark:text-rose-100/60 leading-relaxed max-w-sm mx-auto">
              Explore our Korean skincare collection and tap the heart icon on any product to save your favorite items here!
            </p>
            <div className="pt-2">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs uppercase tracking-wider shadow-md transition"
              >
                <Sparkles className="w-4 h-4" /> Browse Products
              </Link>
            </div>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {wishlist.map((item, idx) => {
              const pId = item._id || item.id;
              const pName = item.name || "Product";
              const pImg = item.image || "/placeholder.png";
              const pPrice = item.price || 0;

              return (
                <div
                  key={pId || idx}
                  className="group relative flex flex-col justify-between rounded-2xl bg-white dark:bg-[#1e1215] p-4 border border-stone-200/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)] transition-all duration-300"
                >
                  {/* Remove Button */}
                  <button
                    onClick={(e) => toggleWishlist(item, e)}
                    title="Remove from Wishlist"
                    aria-label="Remove item"
                    className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 dark:bg-[#1e1215]/90 border border-stone-200/80 dark:border-white/10 text-stone-400 hover:text-red-500 hover:border-red-200 flex items-center justify-center transition shadow-2xs cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {/* Image */}
                  <Link href={`/products/${pId}`} className="block relative w-full h-48 mb-3 bg-stone-50/50 dark:bg-stone-900/40 rounded-xl overflow-hidden">
                    <Image
                      src={pImg}
                      alt={pName}
                      fill
                      sizes="(max-width: 768px) 100vw, 300px"
                      className="object-contain p-2 group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Content */}
                  <div className="space-y-3 flex-1 flex flex-col justify-between">
                    <div>
                      {item.category && (
                        <span className="text-[10px] font-semibold text-rose-500 uppercase tracking-wider">
                          {item.category}
                        </span>
                      )}
                      <h3 className="font-semibold text-stone-900 dark:text-rose-50 text-sm line-clamp-2 mt-0.5">
                        <Link href={`/products/${pId}`} className="hover:text-pink-600 transition">
                          {pName}
                        </Link>
                      </h3>
                    </div>

                    <div className="pt-2 border-t border-stone-100 dark:border-white/5 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-base font-extrabold text-pink-600 dark:text-pink-400">
                          ৳ {pPrice}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <Link
                          href={`/products/${pId}`}
                          className="w-full text-center py-2 rounded-xl border border-stone-200 dark:border-white/10 text-stone-700 dark:text-rose-100 text-xs font-bold hover:bg-stone-50 dark:hover:bg-white/5 transition"
                        >
                          View Details
                        </Link>
                        <button
                          onClick={() => addToCart(item)}
                          className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs tracking-wider transition shadow-2xs cursor-pointer"
                        >
                          <ShoppingBag className="w-3.5 h-3.5" /> Add
                        </button>
                      </div>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}

      </div>
    </main>
  );
}
