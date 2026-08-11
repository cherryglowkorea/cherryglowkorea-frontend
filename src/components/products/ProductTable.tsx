"use client";

import Image from "next/image";
import { Pencil, Trash2, Copy, Sparkles, Flame, Gift, Package, AlertTriangle, Eye, ExternalLink } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";

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
  return p.thumbnail || p.images?.[0]?.url || p.image || "/placeholder.png";
};

const getTotalStock = (p) => {
  if (typeof p.stock === "number") return p.stock;
  if (p.variants && p.variants.length > 0) {
    return p.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }
  return 0;
};

export default function ProductTable({ products, loading, onEdit, onDelete, onDuplicate, onViewDetails }: any) {
  if (loading) {
    return (
      <div className="hidden sm:block mt-4 rounded-2xl border border-stone-200 dark:border-rose-900/30 bg-white dark:bg-[#160E12] overflow-hidden shadow-xs">
        <div className="p-6 space-y-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl bg-stone-100 dark:bg-rose-950/40" />
          ))}
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="hidden sm:flex flex-col items-center justify-center p-12 mt-4 rounded-2xl border border-stone-200 dark:border-rose-900/30 bg-white dark:bg-[#160E12] text-center space-y-3">
        <Package className="h-12 w-12 text-stone-300 dark:text-rose-900/50" />
        <h3 className="text-base font-bold text-stone-800 dark:text-rose-100">No products found</h3>
        <p className="text-xs text-stone-500 dark:text-slate-400 max-w-sm">
          No matching products found for your filter criteria. Try adjusting your search query or filters.
        </p>
      </div>
    );
  }

  return (
    <div className="hidden sm:block mt-4 rounded-2xl border border-stone-200/80 dark:border-rose-900/30 bg-white dark:bg-[#160E12] overflow-hidden shadow-xs dark:shadow-xl transition-all">
      <Table>
        <TableHeader className="bg-stone-50/80 dark:bg-rose-950/50 border-b border-stone-200/60 dark:border-rose-900/40">
          <TableRow className="hover:bg-transparent border-b-0">
            <TableHead className="w-[80px] font-bold text-stone-600 dark:text-rose-300 text-xs">Image</TableHead>
            <TableHead className="font-bold text-stone-600 dark:text-rose-300 text-xs">Product Details</TableHead>
            <TableHead className="font-bold text-stone-600 dark:text-rose-300 text-xs">Category</TableHead>
            <TableHead className="font-bold text-stone-600 dark:text-rose-300 text-xs">Type</TableHead>
            <TableHead className="font-bold text-stone-600 dark:text-rose-300 text-xs">Price</TableHead>
            <TableHead className="font-bold text-stone-600 dark:text-rose-300 text-xs">Stock</TableHead>
            <TableHead className="font-bold text-stone-600 dark:text-rose-300 text-xs">Badges</TableHead>
            <TableHead className="text-right font-bold text-stone-600 dark:text-rose-300 text-xs pr-6">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody className="divide-y divide-stone-100 dark:divide-rose-950/40">
          {products.map((p) => {
            const stockCount = getTotalStock(p);
            const isLowStock = stockCount <= 5;
            const isCombo = p.type === "combo";

            return (
              <TableRow
                key={p.id || p._id}
                className="hover:bg-stone-50/80 dark:hover:bg-rose-950/20 transition-colors group"
              >
                {/* 1. Thumbnail */}
                <TableCell className="py-3">
                  <div className="relative h-12 w-12 rounded-xl overflow-hidden border border-stone-200 dark:border-slate-800 bg-stone-100 dark:bg-slate-900 shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-300">
                    <Image
                      src={getThumbnail(p)}
                      alt={p.name}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                </TableCell>

                {/* 2. Product Name & Brand */}
                <TableCell className="py-3 max-w-[280px]">
                  <div className="space-y-0.5">
                    <p className="font-bold text-xs text-stone-900 dark:text-white line-clamp-1 group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                      {p.name}
                    </p>
                    <div className="flex items-center gap-2 text-[10px] text-stone-500 dark:text-slate-400">
                      {p.brand && <span className="font-medium text-rose-600 dark:text-rose-300">{p.brand}</span>}
                      {p.sku && <span>SKU: {p.sku}</span>}
                    </div>
                  </div>
                </TableCell>

                {/* 3. Category */}
                <TableCell className="py-3">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-stone-100 dark:bg-slate-900 text-stone-700 dark:text-slate-300 border border-stone-200 dark:border-slate-800">
                    {p.category || "General"}
                  </span>
                </TableCell>

                {/* 4. Type (Single / Combo) */}
                <TableCell className="py-3">
                  {isCombo ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-gradient-to-r from-pink-500/15 to-rose-500/15 dark:from-rose-950/60 dark:to-pink-950/60 text-rose-600 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60 shadow-xs">
                      <Gift className="h-3 w-3 text-rose-500" /> Combo Deal
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                      <Package className="h-3 w-3 text-blue-500" /> Single
                    </span>
                  )}
                </TableCell>

                {/* 5. Price Range */}
                <TableCell className="py-3 font-mono font-bold text-xs text-stone-900 dark:text-white">
                  {getPriceRange(p.variants, p.basePrice || p.salePrice || p.price, p.type)}
                </TableCell>

                {/* 6. Stock Count */}
                <TableCell className="py-3">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                      isLowStock
                        ? "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60"
                        : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                    }`}
                  >
                    {isLowStock && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                    {stockCount} in stock
                  </span>
                </TableCell>

                {/* 7. Badges (Featured / Best Seller) */}
                <TableCell className="py-3">
                  <div className="flex gap-1.5 flex-wrap">
                    {p.isFeatured && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-800/50">
                        <Sparkles className="h-2.5 w-2.5 text-pink-500" /> Featured
                      </span>
                    )}
                    {p.isBestSelling && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50">
                        <Flame className="h-2.5 w-2.5 text-emerald-500" /> Best
                      </span>
                    )}
                  </div>
                </TableCell>

                {/* 8. Action Buttons */}
                <TableCell className="py-3 text-right pr-6">
                  <div className="flex items-center justify-end gap-1.5">
                    {/* View Details Button */}
                    <button
                      onClick={() => onViewDetails && onViewDetails(p)}
                      title="View Product Details"
                      className="p-1.5 rounded-lg border border-stone-200 dark:border-rose-900/50 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition-all cursor-pointer shadow-xs"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>

                    {isCombo && (
                      <button
                        onClick={() => onDuplicate && onDuplicate(p.id || p._id)}
                        title="Duplicate Combo Deal"
                        className="p-1.5 rounded-lg border border-stone-200 dark:border-rose-900/50 text-stone-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/50 hover:text-rose-600 dark:hover:text-white transition-all cursor-pointer shadow-xs"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    )}

                    <button
                      onClick={() => onEdit(p)}
                      title="Edit Product"
                      className="p-1.5 rounded-lg border border-stone-200 dark:border-rose-900/50 text-stone-600 dark:text-rose-300 hover:bg-rose-500 hover:text-white dark:hover:bg-rose-600 transition-all cursor-pointer shadow-xs"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete "${p.name}"?`)) {
                          onDelete(p.id || p._id);
                        }
                      }}
                      title="Delete Product"
                      className="p-1.5 rounded-lg border border-stone-200 dark:border-rose-900/50 text-rose-500 hover:bg-rose-600 hover:text-white transition-all cursor-pointer shadow-xs"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
