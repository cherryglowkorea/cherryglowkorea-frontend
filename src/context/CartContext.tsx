"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { toast } from "sonner";
import LoginModal from "@/components/auth/LoginModal";
import { trackAddToCart } from "@/lib/metaPixel";

export interface VariantType {
  weight?: string | number;
  unit?: string;
  price: number;
  stock?: number;
  [key: string]: any;
}

export interface CartItemType {
  productId: string;
  _id: string;
  name: string;
  image?: string | null;
  variants?: VariantType[];
  selectedVariant?: VariantType | null;
  price: number;
  quantity: number;
  type?: string;
  comboProducts?: any[];
  [key: string]: any;
}

export interface CouponType {
  type: "percentage" | "flat";
  value: number;
  [key: string]: any;
}

interface CartContextType {
  cart: CartItemType[];
  isLoaded: boolean;
  addToCart: (product: any) => void;
  selectVariant: (productId: string, variant: VariantType | null) => void;
  updateQuantity: (productId: string, type: "inc" | "dec") => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  coupon: CouponType | null;
  totalItems: number;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItemType[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [coupon, setCoupon] = useState<CouponType | null>(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedCart = localStorage.getItem("cart");
      if (storedCart) {
        try {
          const parsed = JSON.parse(storedCart);
          const normalized = parsed.map((item: CartItemType) => {
            if (!item.selectedVariant && item.variants && item.variants.length > 0) {
              const firstVariant = item.variants[0];
              return {
                ...item,
                selectedVariant: firstVariant,
                price: firstVariant?.price || item.price || 0,
              };
            }
            return item;
          });
          setCart(normalized);
        } catch {
          setCart([]);
        }
      }
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage ONLY AFTER initial load has completed
  useEffect(() => {
    if (isLoaded && typeof window !== "undefined") {
      localStorage.setItem("cart", JSON.stringify(cart));
    }
  }, [cart, isLoaded]);

  const addToCart = (product: any) => {
    setCart((prev) => {
      const pId = product._id || product.productId;
      const exists = prev.find((i) => i.productId === pId || i._id === pId);
      const addedQty = Math.max(1, Number(product.quantity) || 1);

      if (exists) {
        return prev.map((i) =>
          (i.productId === pId || i._id === pId)
            ? { ...i, quantity: i.quantity + addedQty }
            : i
        );
      }

      const firstVariant = product.variants && product.variants.length > 0
        ? product.variants[0]
        : null;

      const resolvedVariant = product.selectedVariant || firstVariant;
      const itemPrice = Number(resolvedVariant?.price || product.price || product.salePrice || 0);

      return [
        ...prev,
        {
          productId: pId,
          _id: pId,
          name: product.name,
          image: product.image || null,
          variants: product.variants || [],
          selectedVariant: resolvedVariant,
          price: isNaN(itemPrice) ? 0 : itemPrice,
          quantity: addedQty,
          type: product.type || "single",
          comboProducts: product.comboProducts || [],
        },
      ];
    });

    const pId = product._id || product.productId;
    const price = Number(product.selectedVariant?.price || product.price || product.salePrice || 0);
    const addedQty = Math.max(1, Number(product.quantity) || 1);
    trackAddToCart({
      id: pId,
      name: product.name || "Product",
      price: isNaN(price) ? 0 : price,
      quantity: addedQty,
    });

    toast.success("Added to cart");
  };

  const selectVariant = (productId: string, variant: VariantType | null) => {
    setCart((prev) =>
      prev.map((item) =>
        (item.productId === productId || item._id === productId)
          ? {
              ...item,
              selectedVariant: variant,
              price: Number(variant?.price || item.price || 0),
            }
          : item,
      ),
    );

    if (typeof window !== "undefined") {
      try {
        const storedCombo = localStorage.getItem("combo");
        if (storedCombo) {
          const combo = JSON.parse(storedCombo);
          const updatedCombo = combo.map((p: any) =>
            (p._id === productId || p.productId === productId)
              ? { ...p, selectedVariant: variant }
              : p
          );
          localStorage.setItem("combo", JSON.stringify(updatedCombo));
          window.dispatchEvent(new Event("comboUpdated"));
        }
      } catch (e) {}
    }
  };

  const updateQuantity = (productId: string, type: "inc" | "dec") => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId !== productId && item._id !== productId) return item;

        const isPreOrder = Boolean(item.isPreOrder) || item.allowPreOrder === true || item.type === "pre-order";
        const rawStock = Number(item.selectedVariant?.stock ?? item.stock ?? 999);
        const effectiveStock = (isPreOrder || rawStock <= 0) ? 99 : rawStock;

        const qty =
          type === "inc"
            ? Math.min(item.quantity + 1, effectiveStock)
            : Math.max(item.quantity - 1, 1);

        return { ...item, quantity: qty };
      }),
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId && i._id !== productId));

    if (typeof window !== "undefined") {
      try {
        const storedCombo = localStorage.getItem("combo");
        if (storedCombo) {
          const combo = JSON.parse(storedCombo);
          const updatedCombo = combo.filter(
            (p: any) => p._id !== productId && p.productId !== productId
          );
          localStorage.setItem("combo", JSON.stringify(updatedCombo));
          window.dispatchEvent(new Event("comboUpdated"));
        }
      } catch (e) {}
    }
  };

  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
    localStorage.removeItem("combo");
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("comboUpdated"));
    }
  };

  const totalItems = cart.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        isLoaded,
        addToCart,
        selectVariant,
        updateQuantity,
        removeFromCart,
        clearCart,
        coupon,
        totalItems,
        isLoginModalOpen,
        setIsLoginModalOpen,
      }}
    >
      {children}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        redirectPath={typeof window !== "undefined" ? window.location.pathname : "/products"}
      />
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
