"use client";

import { useMemo } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

interface StockBadgeProps {
  stock?: number;
  product?: any;
  selectedVariant?: any;
  showUnits?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function StockBadge({
  stock,
  product,
  selectedVariant,
  showUnits = true,
  size = "md",
  className = "",
}: StockBadgeProps) {
  // Compute net available stock
  const availableStock = useMemo(() => {
    // If stock prop explicitly provided
    if (typeof stock === "number") return Math.max(0, stock);

    // If selected variant explicitly has stock
    if (selectedVariant && typeof selectedVariant.stock === "number") {
      return Math.max(0, selectedVariant.stock);
    }

    if (product) {
      // If product has comboProducts, stock is calculated bottleneck
      if (product.type === "combo" && Array.isArray(product.comboProducts) && product.comboProducts.length > 0) {
        let minStock = Infinity;
        product.comboProducts.forEach((item: any) => {
          const qty = Number(item.quantity) || 1;
          const totalCompStock =
            item.variants && item.variants.length > 0
              ? item.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
              : item.stock || 0;
          const possible = Math.floor(totalCompStock / qty);
          if (possible < minStock) minStock = possible;
        });
        return minStock === Infinity ? 0 : minStock;
      }

      // If product has numeric stock
      if (typeof product.stock === "number") {
        return Math.max(0, product.stock);
      }

      // If product has variants
      if (Array.isArray(product.variants) && product.variants.length > 0) {
        const totalVariantStock = product.variants.reduce(
          (sum: number, v: any) => sum + (typeof v.stock === "number" ? v.stock : 0),
          0
        );
        return totalVariantStock;
      }
    }

    return 10; // Default fallback
  }, [stock, product, selectedVariant]);

  const isInStock = availableStock > 0;

  // Size styling variants
  const sizeStyles = {
    sm: "text-[10px] px-2 py-0.5 gap-1",
    md: "text-xs px-3 py-1 gap-1.5",
    lg: "text-sm px-4 py-1.5 gap-2 font-bold",
  };

  const iconSizes = {
    sm: 12,
    md: 14,
    lg: 16,
  };

  return (
    <div
      className={`inline-flex items-center rounded-full font-bold transition-all border ${
        isInStock
          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50"
          : "bg-red-50 dark:bg-red-950/60 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50"
      } ${sizeStyles[size]} ${className}`}
    >
      {isInStock ? (
        <>
          <CheckCircle2 size={iconSizes[size]} className="text-emerald-500 shrink-0" />
          <span>
            In Stock{" "}
            {showUnits && availableStock > 0 && (
              <span className="font-mono text-[0.9em] opacity-90">
                ({availableStock} {availableStock === 1 ? "unit" : "units"} ready to ship)
              </span>
            )}
          </span>
        </>
      ) : (
        <>
          <XCircle size={iconSizes[size]} className="text-red-500 shrink-0" />
          <span>Out of Stock</span>
        </>
      )}
    </div>
  );
}
