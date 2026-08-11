"use client";

import { createContext, useContext, useState, useEffect, ReactNode, MouseEvent } from "react";
import { toast } from "sonner";

export interface WishlistItem {
  _id: string;
  id?: string;
  name: string;
  image?: string;
  price?: number;
  category?: string;
  [key: string]: any;
}

interface WishlistContextType {
  wishlist: WishlistItem[];
  wishlistCount: number;
  isInWishlist: (productId: string) => boolean;
  toggleWishlist: (product: any, e?: MouseEvent<any>) => void;
}

const WishlistContext = createContext<WishlistContextType | null>(null);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Load wishlist from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const savedWishlist = localStorage.getItem("cherry_glow_wishlist");
        if (savedWishlist) {
          setWishlist(JSON.parse(savedWishlist));
        }
      } catch (err) {
        console.error("Failed to load wishlist:", err);
      }
    }
  }, []);

  const saveWishlist = (newWishlist: WishlistItem[]) => {
    setWishlist(newWishlist);
    if (typeof window !== "undefined") {
      localStorage.setItem("cherry_glow_wishlist", JSON.stringify(newWishlist));
    }
  };

  const isInWishlist = (productId: string) => {
    if (!productId) return false;
    return wishlist.some((item) => (item._id || item.id) === productId);
  };

  const toggleWishlist = (product: any, e?: MouseEvent<any>) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!product) return;
    const productId = product._id || product.id;

    if (isInWishlist(productId)) {
      const updated = wishlist.filter(
        (item) => (item._id || item.id) !== productId
      );
      saveWishlist(updated);
      toast.info(`Removed "${product.name || 'Product'}" from Wishlist 💔`);
    } else {
      const itemToAdd: WishlistItem = {
        _id: productId,
        name: product.name || "Product",
        image: product.image || product.thumbnail || product.images?.[0]?.url || "/placeholder.png",
        price: product.price || product.basePrice || product.variants?.[0]?.price || 0,
        category: product.category || "",
      };
      const updated = [...wishlist, itemToAdd];
      saveWishlist(updated);
      toast.success(`Added "${product.name || 'Product'}" to Wishlist ❤️`);
    }
  };

  const wishlistCount = wishlist.length;

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount,
        isInWishlist,
        toggleWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
