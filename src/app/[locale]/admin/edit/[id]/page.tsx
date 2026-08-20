"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ArrowLeft,
  Package,
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Sparkles,
  CheckCircle2,
  Save,
  Tag,
  DollarSign,
  Boxes,
  FileText,
  Loader2,
  X,
  Layers,
  Flame,
  Star,
  Info,
} from "lucide-react";

const CATEGORIES = [
  "CLEANSER",
  "TONER",
  "SERUM",
  "EYE CARE",
  "MOISTURIZER",
  "SUNSCREEN",
  "MASK",
  "OIL",
  "COMBO DEALS",
];

const UNITS = ["ml", "g", "pcs", "oz"];
const POPULAR_BRANDS = [
  "Cherry Glow",
  "Beauty of Joseon",
  "COSRX",
  "Anua",
  "Innisfree",
  "Laneige",
  "SK-II",
  "Torriden",
  "Some By Mi",
];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "",
    description: "",
    useCase: "",
    discountType: "none",
    discountValue: "",
    isFeatured: false,
    isBestSelling: false,
    type: "single", // "single" | "combo"
    price: "",
    salePrice: "",
  });

  const [variants, setVariants] = useState<any[]>([]);
  const [existingImages, setExistingImages] = useState<any[]>([]);
  const [newImages, setNewImages] = useState<{ file: File | null; preview?: string }[]>([
    { file: null },
  ]);

  // Combo specific states
  const [allSingleProducts, setAllSingleProducts] = useState<any[]>([]);
  const [selectedComboProducts, setSelectedComboProducts] = useState<any[]>([]);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    return token;
  };

  /* ---------------- Fetch Product Details ---------------- */
  useEffect(() => {
    const fetchAllAndProduct = async () => {
      try {
        setLoading(true);
        const token = getToken();

        // 1. Fetch single products list
        const productsRes = await axios.get(`${API_BASE}/products/allProduct`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const singles = (productsRes.data || []).filter((p: any) => p.type !== "combo");
        setAllSingleProducts(singles);

        // 2. Fetch product details
        const res = await axios.get(`${API_BASE}/products/singleProduct/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const p = res.data;

        setForm({
          name: p.name || "",
          brand: p.brand || "",
          category: p.category || "",
          description: p.description || "",
          useCase: p.useCase || "",
          discountType: p.discountType || "none",
          discountValue: p.discountValue || "",
          isFeatured: p.isFeatured || false,
          isBestSelling: p.isBestSelling || false,
          type: p.type || "single",
          price: p.type === "combo" ? String(p.price || "") : "",
          salePrice: p.type === "combo" ? String(p.salePrice || "") : "",
        });

        setVariants(p.variants || []);
        setExistingImages(p.images || []);

        if (p.type === "combo" && p.comboProducts && p.comboProducts.length > 0) {
          const mapped = p.comboProducts.map((item: any) => {
            const originalProduct = singles.find((x: any) => String(x._id) === String(item.productId));
            const rawP = Number(item.price) || Number(originalProduct?.price) || Number(originalProduct?.salePrice) || Number(originalProduct?.variants?.[0]?.price) || 0;
            const rawSp = Number(item.salePrice) || Number(originalProduct?.salePrice) || Number(originalProduct?.price) || Number(originalProduct?.variants?.[0]?.price) || 0;
            return {
              productId: String(item.productId || item._id),
              quantity: Number(item.quantity) || 1,
              name: item.name || originalProduct?.name || "Product Item",
              brand: item.brand || originalProduct?.brand || "",
              price: isNaN(rawP) ? 0 : rawP,
              salePrice: isNaN(rawSp) ? 0 : rawSp,
              variants: originalProduct?.variants || item.variants || [],
              stock: Number(originalProduct?.stock ?? item.stock ?? 10),
            };
          });
          setSelectedComboProducts(mapped);
        }
      } catch (err) {
        console.error(err);
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchAllAndProduct();
  }, [id, API_BASE]);

  /* ---------------- Auto Pricing calculation for Combo ---------------- */
  const { calculatedRegularPrice, calculatedSalePrice, calculatedStock } = useMemo(() => {
    let reg = 0;
    let sale = 0;
    let stock = Infinity;

    selectedComboProducts.forEach((item) => {
      const qty = Math.max(1, Number(item.quantity) || 1);
      const rawPrice = Number(item.price);
      const rawSalePrice = Number(item.salePrice);

      const p = isNaN(rawPrice) ? 0 : rawPrice;
      const sp = isNaN(rawSalePrice) ? p : rawSalePrice;

      reg += p * qty;
      sale += sp * qty;

      const totalComponentStock =
        item.variants && item.variants.length > 0
          ? item.variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0)
          : Number(item.stock) || 0;

      const safeComponentStock = isNaN(totalComponentStock) ? 0 : totalComponentStock;
      const possibleStock = Math.floor(safeComponentStock / qty);
      if (possibleStock < stock) {
        stock = possibleStock;
      }
    });

    return {
      calculatedRegularPrice: isNaN(reg) ? 0 : reg,
      calculatedSalePrice: isNaN(sale) ? 0 : sale,
      calculatedStock: stock === Infinity || isNaN(stock) ? 0 : stock,
    };
  }, [selectedComboProducts]);

  /* ---------------- Variant Handlers ---------------- */
  const updateVariant = (i: number, field: string, value: any) => {
    const updated = [...variants];
    updated[i][field] = value;
    setVariants(updated);
  };

  const addVariant = () => {
    setVariants([...variants, { weight: "", unit: "ml", price: "", stock: "" }]);
  };

  const removeVariant = (i: number) => {
    setVariants(variants.filter((_, idx) => idx !== i));
  };

  /* ---------------- Image Handlers ---------------- */
  const removeExistingImage = (i: number) => {
    setExistingImages(existingImages.filter((_, idx) => idx !== i));
  };

  const updateNewImage = (i: number, file: File | null) => {
    const updated = [...newImages];
    const previewUrl = file ? URL.createObjectURL(file) : undefined;
    updated[i] = { file, preview: previewUrl };
    setNewImages(updated);
  };

  const addNewImageField = () => {
    setNewImages([...newImages, { file: null }]);
  };

  const removeNewImageField = (i: number) => {
    setNewImages(newImages.filter((_, idx) => idx !== i));
  };

  /* ---------------- Submit Handler ---------------- */
  const handleSubmit = async () => {
    if (!form.name.trim()) return toast.error("Product name is required");

    try {
      setSubmitting(true);
      const token = getToken();

      const formData = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          formData.append(k, String(v));
        }
      });

      // Keep existing images
      formData.append("existingImages", JSON.stringify(existingImages));

      // Append new images
      newImages.forEach((img) => {
        if (img.file) formData.append("images", img.file);
      });

      let endpointUrl = "";

      if (form.type === "combo") {
        if (selectedComboProducts.length < 2) {
          toast.error("A combo must contain at least 2 products");
          setSubmitting(false);
          return;
        }

        formData.append(
          "comboProducts",
          JSON.stringify(
            selectedComboProducts.map((p) => ({
              productId: p.productId,
              quantity: p.quantity,
            }))
          )
        );

        const finalPrice = form.price ? Number(form.price) : calculatedRegularPrice;
        const finalSalePrice = form.salePrice ? Number(form.salePrice) : calculatedSalePrice;

        formData.set("price", String(finalPrice));
        formData.set("salePrice", String(finalSalePrice));

        endpointUrl = `${API_BASE}/combos/${id}`;
      } else {
        formData.append("variants", JSON.stringify(variants));
        endpointUrl = `${API_BASE}/products/updateProduct/${id}`;
      }

      const method = form.type === "combo" ? "patch" : "put";

      await axios({
        method: method,
        url: endpointUrl,
        data: formData,
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Product updated successfully!");

      setTimeout(() => {
        router.replace("/admin/products");
      }, 600);
    } catch (err: any) {
      console.error("Update error:", err);
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 text-rose-500 animate-spin" />
        <p className="text-xs text-stone-500 font-semibold">Loading product editor...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 pb-16">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent p-6 rounded-3xl border border-stone-200 dark:border-rose-900/40 bg-white/70 dark:bg-[#160E12]/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/products"
              className="p-2 rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-white dark:bg-rose-950 text-stone-600 dark:text-rose-200 hover:bg-rose-500 hover:text-white transition-all shadow-xs"
              title="Back to products list"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-rose-50 flex items-center gap-2">
              Edit Product Details
              <Sparkles className="h-5 w-5 text-rose-500" />
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-rose-300/70 mt-1">
            Modify product information, variants, combo components, images, and pricing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2.5 rounded-2xl border border-stone-200 dark:border-rose-900/50 text-stone-600 dark:text-rose-200 text-xs font-bold hover:bg-stone-100 dark:hover:bg-rose-950 transition-all"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* 2. Main Form Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Main Form Sections (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Card 1: Basic Information */}
          <div className="p-6 rounded-3xl border border-stone-200 dark:border-rose-900/40 bg-white dark:bg-[#180f14] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-rose-900/30 pb-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-base">
                <Package className="h-5 w-5" /> Basic Product Details
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wider bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                {form.type === "combo" ? "Combo Package" : "Single Product"}
              </span>
            </div>

            {/* Product Type Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                Product Type
              </label>
              <Select
                value={form.type}
                onValueChange={(v) =>
                  setForm({
                    ...form,
                    type: v,
                    category: v === "combo" ? "COMBO DEALS" : form.category,
                  })
                }
              >
                <SelectTrigger className="w-full rounded-2xl border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-rose-100">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl">
                  <SelectItem value="single">Single Product (Standard Skincare)</SelectItem>
                  <SelectItem value="combo">Combo Deal (Custom Bundle Package)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Product Name & Brand */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  Product Title / Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. 1025 Dokdo Cleanser 150ml"
                  className="rounded-2xl border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-rose-100"
                />
              </div>

              {/* Brand Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  Brand Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                  placeholder="e.g. Cherry Glow / Beauty of Joseon"
                  className="rounded-2xl border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-rose-100"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  Category <span className="text-rose-500">*</span>
                </label>
                <Select
                  value={form.category}
                  onValueChange={(v) => setForm({ ...form, category: v })}
                >
                  <SelectTrigger className="w-full rounded-2xl border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-rose-100">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl">
                    {CATEGORIES.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Card 2: Descriptions */}
          <div className="p-6 rounded-3xl border border-stone-200 dark:border-rose-900/40 bg-white dark:bg-[#180f14] shadow-xs space-y-5">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-base border-b border-stone-100 dark:border-rose-900/30 pb-3">
              <FileText className="h-5 w-5" /> Product Description & Usage Guidelines
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  Full Product Description
                </label>
                <Textarea
                  rows={4}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter detailed benefits, key ingredients, and formula description..."
                  className="rounded-2xl border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-rose-100 leading-relaxed"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  Use Case & Directions for Use
                </label>
                <Textarea
                  rows={3}
                  value={form.useCase}
                  onChange={(e) => setForm({ ...form, useCase: e.target.value })}
                  placeholder="How to apply: e.g. Dispense appropriate amount onto wet hands and gently massage face..."
                  className="rounded-2xl border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 text-xs sm:text-sm text-stone-900 dark:text-rose-100 leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Card 3: Variants / Combo Components */}
          {form.type === "combo" ? (
            /* Combo Products Configurator */
            <div className="p-6 rounded-3xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-rose-950/20 shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-rose-200/60 dark:border-rose-900/40 pb-3">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-base">
                  <Layers className="h-5 w-5" /> Included Combo Products
                </div>
                <span className="text-xs text-stone-500 font-mono">
                  {selectedComboProducts.length} items bundled
                </span>
              </div>

              {/* Add Combo Component Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  Add Product to Bundle
                </label>
                <select
                  className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-white dark:bg-rose-950/60 p-3 text-xs sm:text-sm text-stone-900 dark:text-rose-100 outline-none focus:ring-2 focus:ring-rose-500/20"
                  onChange={(e) => {
                    const prodId = e.target.value;
                    if (prodId) {
                      const alreadyAdded = selectedComboProducts.some(
                        (p) => p.productId === prodId
                      );
                      if (alreadyAdded) {
                        toast.error("Product already added to combo");
                        return;
                      }
                      const originalProduct = allSingleProducts.find((p) => p._id === prodId);
                      if (originalProduct) {
                        const rawP = Number(originalProduct.price) || Number(originalProduct.salePrice) || Number(originalProduct.variants?.[0]?.price) || 0;
                        const rawSp = Number(originalProduct.salePrice) || Number(originalProduct.price) || Number(originalProduct.variants?.[0]?.price) || 0;
                        setSelectedComboProducts([
                          ...selectedComboProducts,
                          {
                            productId: prodId,
                            quantity: 1,
                            name: originalProduct.name,
                            brand: originalProduct.brand,
                            price: isNaN(rawP) ? 0 : rawP,
                            salePrice: isNaN(rawSp) ? 0 : rawSp,
                            variants: originalProduct.variants || [],
                            stock: Number(originalProduct.stock || 10),
                          },
                        ]);
                      }
                    }
                  }}
                >
                  <option value="">-- Choose Product from Catalog --</option>
                  {allSingleProducts.map((p) => (
                    <option key={p._id} value={p._id}>
                      {p.brand ? `${p.brand} - ` : ""}
                      {p.name} (৳{p.salePrice || p.price || p.variants?.[0]?.price || 0})
                    </option>
                  ))}
                </select>
              </div>

              {/* Selected Combo Products List */}
              <div className="space-y-2.5">
                {selectedComboProducts.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between gap-3 bg-white dark:bg-[#1C1218] p-3 rounded-2xl border border-stone-200 dark:border-rose-900/40 shadow-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-xs sm:text-sm text-stone-900 dark:text-rose-100 truncate">
                        {item.name}
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-rose-300/70">
                        {item.brand ? `${item.brand} • ` : ""}Base Price: ৳{item.salePrice || item.price}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-semibold text-stone-500">Qty:</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => {
                            const qty = Math.max(1, parseInt(e.target.value) || 1);
                            const updated = [...selectedComboProducts];
                            updated[idx].quantity = qty;
                            setSelectedComboProducts(updated);
                          }}
                          className="w-14 rounded-xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950 p-1.5 text-center text-xs font-bold font-mono text-stone-900 dark:text-rose-100 focus:outline-none"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          setSelectedComboProducts(
                            selectedComboProducts.filter((_, i) => i !== idx)
                          )
                        }
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition cursor-pointer"
                        title="Remove component"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Dynamic Combo Price Calculation & Override Summary */}
              {selectedComboProducts.length > 0 && (
                <div className="p-4 rounded-2xl bg-white dark:bg-[#1C1218] border border-rose-200 dark:border-rose-900/40 text-xs space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-stone-600 dark:text-rose-200">
                    <div>
                      <span className="text-[10px] text-stone-400 block">Auto Regular Total</span>
                      <span className="font-mono font-bold text-sm">৳{calculatedRegularPrice}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">Auto Bundle Sale Total</span>
                      <span className="font-mono font-bold text-sm text-rose-600 dark:text-rose-400">
                        ৳{calculatedSalePrice}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 block">Available Bundle Stock</span>
                      <span className="font-mono font-bold text-sm">{calculatedStock} units</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-stone-100 dark:border-rose-900/30">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-stone-700 dark:text-rose-200">
                        Custom Combo Price Override (৳)
                      </label>
                      <Input
                        type="number"
                        placeholder={`Default: ৳${calculatedRegularPrice}`}
                        value={form.price}
                        onChange={(e) => setForm({ ...form, price: e.target.value })}
                        className="rounded-xl border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-stone-700 dark:text-rose-200">
                        Custom Combo Sale Price Override (৳)
                      </label>
                      <Input
                        type="number"
                        placeholder={`Default: ৳${calculatedSalePrice}`}
                        value={form.salePrice}
                        onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                        className="rounded-xl border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Single Product Variants Configurator */
            <div className="p-6 rounded-3xl border border-stone-200 dark:border-rose-900/40 bg-white dark:bg-[#180f14] shadow-xs space-y-5">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-rose-900/30 pb-3">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-base">
                  <Boxes className="h-5 w-5" /> Product Options & Variants
                </div>
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Variant
                </button>
              </div>

              {variants.length === 0 ? (
                <p className="text-xs text-stone-400 italic text-center py-4">
                  No variants configured. Click "Add Variant" above to add product sizes (e.g. 50ml, 150ml).
                </p>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-2 px-1 text-[11px] font-bold text-stone-500 dark:text-rose-300 uppercase">
                    <span className="col-span-3">Weight / Size</span>
                    <span className="col-span-2">Unit</span>
                    <span className="col-span-3">Price (৳)</span>
                    <span className="col-span-3">Stock Qty</span>
                    <span className="col-span-1 text-right">Action</span>
                  </div>

                  {variants.map((v, i) => (
                    <div
                      key={i}
                      className="grid grid-cols-12 gap-2 bg-stone-50 dark:bg-rose-950/30 p-2.5 rounded-2xl border border-stone-200 dark:border-rose-900/40 items-center"
                    >
                      <div className="col-span-3">
                        <Input
                          placeholder="e.g. 150"
                          value={v.weight}
                          onChange={(e) => updateVariant(i, "weight", e.target.value)}
                          className="rounded-xl border-stone-200 dark:border-rose-900/50 bg-white dark:bg-rose-950 text-xs"
                        />
                      </div>
                      <div className="col-span-2">
                        <select
                          value={v.unit || "ml"}
                          onChange={(e) => updateVariant(i, "unit", e.target.value)}
                          className="w-full rounded-xl border border-stone-200 dark:border-rose-900/50 bg-white dark:bg-rose-950 p-2 text-xs text-stone-900 dark:text-rose-100 outline-none"
                        >
                          {UNITS.map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          placeholder="Price"
                          value={v.price}
                          onChange={(e) => updateVariant(i, "price", e.target.value)}
                          className="rounded-xl border-stone-200 dark:border-rose-900/50 bg-white dark:bg-rose-950 text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-3">
                        <Input
                          type="number"
                          placeholder="Stock"
                          value={v.stock}
                          onChange={(e) => updateVariant(i, "stock", e.target.value)}
                          className="rounded-xl border-stone-200 dark:border-rose-900/50 bg-white dark:bg-rose-950 text-xs font-mono"
                        />
                      </div>
                      <div className="col-span-1 text-right">
                        <button
                          type="button"
                          onClick={() => removeVariant(i)}
                          className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950/60 transition cursor-pointer"
                          title="Delete variant"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Media & Marketing Flags (4 Cols Sticky) */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
          {/* Card 4: Media Gallery Management */}
          <div className="p-6 rounded-3xl border border-stone-200 dark:border-rose-900/40 bg-white dark:bg-[#180f14] shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-rose-900/30 pb-3">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-base">
                <ImageIcon className="h-5 w-5" /> Product Images
              </div>
              <span className="text-xs text-stone-400 font-mono">
                {existingImages.length + newImages.filter((img) => img.file).length} images
              </span>
            </div>

            {/* Existing Cloudinary Images */}
            {existingImages.length > 0 && (
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-stone-500 dark:text-rose-300 uppercase tracking-wider block">
                  Current Uploaded Images
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {existingImages.map((img, i) => (
                    <div
                      key={i}
                      className="relative group rounded-2xl overflow-hidden border border-stone-200 dark:border-rose-900/40 aspect-square bg-stone-100 dark:bg-rose-950/30"
                    >
                      <img
                        src={img.url || img}
                        alt="Product preview"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(i)}
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-red-600 text-white shadow-md hover:bg-red-700 transition cursor-pointer"
                        title="Remove existing image"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Upload New Images Section */}
            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-rose-900/30">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-stone-500 dark:text-rose-300 uppercase tracking-wider">
                  Upload Additional Images
                </label>
                <button
                  type="button"
                  onClick={addNewImageField}
                  className="text-xs text-rose-600 dark:text-rose-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Image
                </button>
              </div>

              <div className="space-y-2.5">
                {newImages.map((img, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 p-2 rounded-2xl border border-dashed border-stone-300 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/20"
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => updateNewImage(i, e.target.files?.[0] || null)}
                      className="text-xs text-stone-600 dark:text-rose-200 file:mr-2 file:py-1 file:px-2.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-rose-50 file:text-rose-600 dark:file:bg-rose-950 dark:file:text-rose-300 hover:file:bg-rose-100 cursor-pointer flex-1"
                    />

                    {img.preview && (
                      <img
                        src={img.preview}
                        alt="New upload preview"
                        className="w-10 h-10 object-cover rounded-xl border border-stone-200 dark:border-rose-900/40 shrink-0"
                      />
                    )}

                    {newImages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeNewImageField(i)}
                        className="p-1 rounded-lg text-stone-400 hover:text-red-500 transition cursor-pointer"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 5: Visibility Badges & Marketing Flags */}
          <div className="p-6 rounded-3xl border border-stone-200 dark:border-rose-900/40 bg-white dark:bg-[#180f14] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-bold text-base border-b border-stone-100 dark:border-rose-900/30 pb-3">
              <Sparkles className="h-5 w-5" /> Marketing Flags & Highlights
            </div>

            <div className="space-y-3">
              {/* Featured Flag */}
              <label className="flex items-center justify-between p-3 rounded-2xl border border-stone-200 dark:border-rose-900/40 bg-stone-50 dark:bg-rose-950/20 cursor-pointer hover:border-rose-400 transition">
                <div className="flex items-center gap-2.5">
                  <Star className="h-4 w-4 text-amber-500" />
                  <div>
                    <p className="font-bold text-xs text-stone-900 dark:text-rose-100">
                      Featured Product
                    </p>
                    <p className="text-[10px] text-stone-400">Display on home featured section</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="h-4 w-4 rounded border-stone-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
              </label>

              {/* Best Selling Flag */}
              <label className="flex items-center justify-between p-3 rounded-2xl border border-stone-200 dark:border-rose-900/40 bg-stone-50 dark:bg-rose-950/20 cursor-pointer hover:border-rose-400 transition">
                <div className="flex items-center gap-2.5">
                  <Flame className="h-4 w-4 text-rose-500" />
                  <div>
                    <p className="font-bold text-xs text-stone-900 dark:text-rose-100">
                      Best Seller Badge
                    </p>
                    <p className="text-[10px] text-stone-400">Highlight in top selling products</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={form.isBestSelling}
                  onChange={(e) => setForm({ ...form, isBestSelling: e.target.checked })}
                  className="h-4 w-4 rounded border-stone-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
