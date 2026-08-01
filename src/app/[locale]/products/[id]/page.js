"use client";

import Image from "next/image";
import axios from "axios";
import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

const FALLBACK_IMAGE = "/placeholder.jpg";

export default function ProductDetailsPage() {
  const { id } = useParams();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [adding, setAdding] = useState(false);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  /* ---------------- Fetch Product Details & Combo Populated Data ---------------- */
  useEffect(() => {
    if (!id) return;

    const fetchProduct = async () => {
      try {
        const res = await axios.get(
          `${API_BASE}/products/singleProduct/${id}`,
        );
        const p = res.data;
        setProduct(p);

        // If it's a combo, load the populated version
        if (p.type === "combo") {
          const comboRes = await axios.get(`${API_BASE}/combos/${id}`);
          setProduct(comboRes.data);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load product");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, API_BASE]);

  /* ---------------- Images ---------------- */
  const imageList = useMemo(() => {
    if (!product) return [];
    return product.images?.map((i) => i?.url).filter(Boolean) || [];
  }, [product]);

  /* ---------------- Default Image ---------------- */
  useEffect(() => {
    if (imageList.length > 0) {
      setSelectedImage(imageList[0]);
    }
  }, [imageList]);

  /* ---------------- Default Variant ---------------- */
  useEffect(() => {
    if (product?.variants?.length) {
      setSelectedVariant(product.variants[0]);
    }
  }, [product]);

  /* ---------------- Price ---------------- */
  const finalPrice = useMemo(() => {
    if (!product) return 0;
    if (product.type === "combo") return product.salePrice || 0;
    if (!selectedVariant) return 0;

    const base = selectedVariant.price;
    if (product.discountType === "percentage") {
      return Math.round(base - (base * product.discountValue) / 100);
    }
    if (product.discountType === "fixed") {
      return Math.max(0, base - product.discountValue);
    }
    return base;
  }, [product, selectedVariant]);

  const originalPrice = product?.type === "combo" ? (product.price || 0) : (selectedVariant?.price || 0);

  /* ---------------- Stock ---------------- */
  const stock = product?.type === "combo" ? (product.stock || 0) : (selectedVariant?.stock || 0);

  /* ---------------- Add To Cart ---------------- */
  const handleAddToCart = () => {
    if (!product) return;
    if (product.type !== "combo" && !selectedVariant) {
      return toast.error("Select a variant");
    }

    setAdding(true);

    const productForCart = {
      _id: product._id,
      name: product.name,
      image: product.thumbnail || product.images?.[0]?.url || FALLBACK_IMAGE,
      variants: product.variants || [],
      price: product.type === "combo" ? product.salePrice : undefined
    };

    addToCart(productForCart);
    setTimeout(() => setAdding(false), 400);
  };

  if (loading) return <ProductSkeleton />;

  if (!product)
    return <p className="text-center py-20 text-gray-500">Product not found</p>;

  const { name, brand, category, description, useCase } = product;

  return (
    <div className="max-w-[1536px] mx-auto px-6 py-12">
      <div className="grid md:grid-cols-2 gap-12">
        {/* IMAGES */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="relative w-full h-[420px] rounded-2xl bg-white shadow-md overflow-hidden border">
            <Image
              src={selectedImage || FALLBACK_IMAGE}
              alt={name}
              fill
              className="object-contain"
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
            />
          </div>

          {imageList.length > 1 && (
            <div className="flex gap-3 mt-4 flex-wrap">
              {imageList.map((img) => (
                <button
                  key={img}
                  onClick={() => setSelectedImage(img)}
                  className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImage === img
                      ? "border-pink-500 scale-105"
                      : "border-gray-200 hover:border-pink-300"
                  }`}
                >
                  <Image src={img} alt="thumb" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* DETAILS */}
        <motion.div
          initial={{ x: 40, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="space-y-6"
        >
          <div>
            <p className="text-sm text-pink-500 font-bold uppercase">{brand}</p>
            <h1 className="text-3xl font-bold mt-1">{name}</h1>
            <p className="text-gray-500 text-sm">{category}</p>
          </div>

          {/* Price */}
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-pink-600">
              ৳ {finalPrice}
            </span>

            {originalPrice > finalPrice && (
              <>
                <span className="line-through text-gray-400">
                  ৳ {originalPrice}
                </span>

                <span className="text-green-600 text-sm font-semibold">
                  ৳{originalPrice - finalPrice} SAVINGS (
                  {Math.round(((originalPrice - finalPrice) / originalPrice) * 100)}% OFF)
                </span>
              </>
            )}
          </div>

          {/* Stock */}
          <p
            className={`text-sm font-medium ${
              stock > 0 ? "text-green-600" : "text-red-500"
            }`}
          >
            {stock > 0 ? `In Stock (${stock} available)` : "Out of Stock"}
          </p>

          {/* Estimated Delivery & Info */}
          <div className="text-xs text-stone-500 space-y-1 bg-stone-50 dark:bg-white/5 p-3 rounded-xl border">
            <p>🚚 <strong>Estimated Delivery:</strong> 1-2 Days (Dhaka), 2-3 Days (Outside Dhaka)</p>
            <p>🛡️ <strong>Guarantee:</strong> 100% Authentic Korean Product Guarantee</p>
          </div>

          {/* What's Included (Combo specific) */}
          {product.type === "combo" && product.comboProducts && product.comboProducts.length > 0 && (
            <div className="space-y-4 border border-rose-100 dark:border-white/5 p-5 rounded-2xl bg-rose-50/10 dark:bg-white/5">
              <h3 className="font-serif font-bold text-stone-800 dark:text-white text-sm uppercase tracking-wider">
                What's Included in this Combo:
              </h3>
              <div className="space-y-3">
                {product.comboProducts.map((item, idx) => {
                  const pInfo = item.product || {};
                  return (
                    <div key={idx} className="flex gap-3 items-center bg-white dark:bg-stone-800 p-2.5 rounded-xl border border-stone-100 dark:border-white/5 shadow-sm">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden shrink-0 bg-stone-50 border">
                        <Image
                          src={pInfo.thumbnail || "/placeholder.png"}
                          alt={pInfo.name || "Product"}
                          fill
                          className="object-contain"
                          sizes="50px"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-stone-800 dark:text-rose-100 text-xs truncate">
                          {pInfo.name}
                        </p>
                        <p className="text-[10px] text-stone-500 dark:text-rose-100/40">
                          {pInfo.brand}
                        </p>
                      </div>
                      <div className="text-right whitespace-nowrap">
                        <span className="text-[10px] bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 px-2 py-0.5 rounded-full font-bold">
                          Qty: {item.quantity}
                        </span>
                        <p className="text-[10px] font-semibold text-stone-700 dark:text-stone-300 mt-1">
                          ৳{pInfo.salePrice || pInfo.price || 0} each
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Variants (Only for Single Products) */}
          {product.type !== "combo" && product.variants?.length > 0 && (
            <div>
              <h3 className="font-semibold mb-2 text-sm">Select Option</h3>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => {
                  const isSelected =
                    selectedVariant?.weight === v.weight &&
                    selectedVariant?.unit === v.unit;

                  return (
                    <button
                      key={`${v.weight}-${v.unit}`}
                      onClick={() => setSelectedVariant(v)}
                      className={`px-4 py-2 rounded-full border text-sm transition ${
                        isSelected
                          ? "bg-pink-500 text-white border-pink-500"
                          : "bg-white text-pink-500 border-pink-500 hover:bg-pink-50"
                      }`}
                    >
                      {v.weight} {v.unit}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-1 text-sm">Description</h3>
            <p className="text-gray-600 dark:text-rose-100/80 text-sm whitespace-pre-line">{description}</p>
          </div>

          {/* Use Case */}
          {useCase && (
            <div>
              <h3 className="font-semibold mb-1 text-sm">Use Case</h3>
              <p className="text-gray-600 dark:text-rose-100/80 text-sm whitespace-pre-line">{useCase}</p>
            </div>
          )}

          {/* CTA */}
          <Button
            onClick={handleAddToCart}
            disabled={stock === 0 || adding}
            className="w-full bg-pink-600 hover:bg-pink-700 text-white rounded-full py-3 font-semibold transition"
          >
            {adding ? "Adding..." : "Add to Cart"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="max-w-[1536px] mx-auto px-6 py-12 animate-pulse">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="h-[420px] bg-gray-200 rounded-2xl" />
        <div className="space-y-4">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-8 w-3/4 bg-gray-200 rounded" />
          <div className="h-6 w-32 bg-gray-200 rounded" />
          <div className="h-24 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}
