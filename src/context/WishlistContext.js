"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);

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

  // Save wishlist to localStorage on update
  const saveWishlist = (newWishlist) => {
    setWishlist(newWishlist);
    if (typeof window !== "undefined") {
      localStorage.setItem("cherry_glow_wishlist", JSON.stringify(newWishlist));
    }
  };

  // Check if product is in wishlist
  const isInWishlist = (productId) => {
    if (!productId) return false;
    return wishlist.some((item) => (item._id || item.id || item) === productId);
  };

  // Toggle wishlist state
  const toggleWishlist = (product, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!product) return;
    const productId = product._id || product.id;

    if (isInWishlist(productId)) {
      // Remove from wishlist
      const updated = wishlist.filter(
        (item) => (item._id || item.id || item) !== productId
      );
      saveWishlist(updated);
      toast.info(`Removed "${product.name || 'Product'}" from Wishlist 💔`);
    } else {
      // Add to wishlist
      const itemToAdd = {
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

export const useWishlist = () => useContext(WishlistContext);
