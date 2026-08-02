"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import LoginModal from "@/components/auth/LoginModal";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  // Load
  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      try {
        const parsed = JSON.parse(storedCart);
        // ✅ Fix existing items: auto-select first variant if none selected
        const normalized = parsed.map((item) => {
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

    // 🔥 simulate user-specific coupon (later from API)
    const userCoupon = {
      type: "percentage", // or "flat"
      value: 10,
    };

    setCoupon(userCoupon);
  }, []);

  // Save
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // ✅ Add to cart (auto-selects first variant for price display)
  const addToCart = (product) => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      toast.error("Please log in to add products to your cart and place an order.");
      setIsLoginModalOpen(true);
      return;
    }

    setCart((prev) => {
      const pId = product._id || product.productId;
      const exists = prev.find((i) => i.productId === pId || i._id === pId);

      if (exists) {
        return prev.map((i) =>
          (i.productId === pId || i._id === pId)
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }

      // Auto-select first variant so price shows immediately
      const firstVariant = product.variants && product.variants.length > 0
        ? product.variants[0]
        : null;

      // Use passed-in selectedVariant if provided, otherwise first variant
      const resolvedVariant = product.selectedVariant || firstVariant;

      return [
        ...prev,
        {
          productId: pId,
          _id: pId,
          name: product.name,
          image: product.image || null,
          variants: product.variants || [],
          selectedVariant: resolvedVariant,
          price: resolvedVariant?.price || product.price || product.salePrice || 0,
          quantity: 1,
          type: product.type || "single",
          comboProducts: product.comboProducts || []
        },
      ];
    });

    toast.success("Added to cart");
  };

  // ✅ Select variant in cart & sync to combo builder if present
  const selectVariant = (productId, variant) => {
    setCart((prev) =>
      prev.map((item) =>
        (item.productId === productId || item._id === productId)
          ? {
              ...item,
              selectedVariant: variant,
              price: variant?.price || item.price,
              quantity: 1, // reset for safety
            }
          : item,
      ),
    );

    // Sync to combo storage if item is in combo builder
    if (typeof window !== "undefined") {
      try {
        const storedCombo = localStorage.getItem("combo");
        if (storedCombo) {
          const combo = JSON.parse(storedCombo);
          const updatedCombo = combo.map((p) =>
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

  // ✅ Quantity
  const updateQuantity = (productId, type) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.productId !== productId && item._id !== productId) return item;

        if (!item.selectedVariant) return item;

        const stock = item.selectedVariant.stock || 999;

        let qty =
          type === "inc"
            ? Math.min(item.quantity + 1, stock)
            : Math.max(item.quantity - 1, 1);

        return { ...item, quantity: qty };
      }),
    );
  };

  // ✅ Remove from cart & sync reverse-removal to combo builder
  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId && i._id !== productId));

    if (typeof window !== "undefined") {
      try {
        const storedCombo = localStorage.getItem("combo");
        if (storedCombo) {
          const combo = JSON.parse(storedCombo);
          const updatedCombo = combo.filter(
            (p) => p._id !== productId && p.productId !== productId
          );
          localStorage.setItem("combo", JSON.stringify(updatedCombo));
          window.dispatchEvent(new Event("comboUpdated"));
        }
      } catch (e) {}
    }
  };

  // ✅ Clear cart & sync combo removal
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

export const useCart = () => useContext(CartContext);
