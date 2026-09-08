"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import ImageUploader from "@/components/ui/ImageUploader";
import MultiImageUploader from "@/components/ui/MultiImageUploader";

import {
  Trash2,
  Plus,
  Package,
  Layers,
  Gift,
  Sparkles,
  Flame,
  ArrowLeft,
  Image as ImageIcon,
  CheckCircle2,
  Tag,
  Upload,
  Loader2,
  X,
  Eye,
  FileText,
  ShieldCheck,
  Globe,
  DollarSign,
  Boxes,
  Heart,
  Droplets,
  Sliders,
  Check,
  Info,
  Clock,
} from "lucide-react";
import Image from "next/image";
import { useGetCategoriesQuery, useGetAttributesQuery } from "@/redux/api/ecommerceApi";

const DEFAULT_SKIN_TYPES = ["Dry Skin", "Oily Skin", "Sensitive Skin", "Combination Skin", "Normal Skin", "All Skin Types"];
const DEFAULT_CONCERNS = [
  "Acne & Blemishes",
  "Dark Spots & Pigmentation",
  "Anti-Aging & Wrinkles",
  "Deep Hydration",
  "Pores & Oil Control",
  "Redness & Calming",
  "Sun Protection",
  "Skin Barrier Repair",
];

const POPULAR_BRANDS = ["Cherry Glow", "Beauty of Joseon", "COSRX", "Anua", "Innisfree", "Laneige", "SK-II", "Torriden"];

export default function CreateProductPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || "en";

  const [submitting, setSubmitting] = useState(false);
  const [images, setImages] = useState<string[]>([""]); // Array of image URLs

  const { data: dbCategories = [] } = useGetCategoriesQuery();
  const { data: dbAttributes = [] } = useGetAttributesQuery();

  const [form, setForm] = useState({
    name: "",
    nameBn: "",
    brand: "Cherry Glow",
    category: "",
    sku: "",
    barcode: "",
    country: "South Korea",
    manufacturer: "",
    shortDescription: "",
    description: "",
    howToUse: "",
    ingredientsText: "",
    price: "",
    salePrice: "",
    stock: "",
    type: "single", // "single" | "combo"
    skinType: [] as string[],
    concerns: [] as string[],
    tagsText: "",
    isFeatured: false,
    isBestSelling: false,
    isNewArrival: true,
    allowPreOrder: false,
    status: "active",
  });

  const [variants, setVariants] = useState([
    { size: "50ml", weight: "", price: "", stock: "", sku: "" },
  ]);

  // Combo specific states
  const [allSingleProducts, setAllSingleProducts] = useState<any[]>([]);
  const [selectedComboProducts, setSelectedComboProducts] = useState<any[]>([]);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    return token;
  };

  /* ---------------- Fetch Single Products list for Combo Selection ---------------- */
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const token = getToken();
        const res = await axios.get(`${API_BASE}/products/allProduct`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllSingleProducts((res.data || []).filter((p: any) => p.type !== "combo"));
      } catch (err) {
        console.error("Failed to load products for combo selection", err);
      }
    };
    fetchAllProducts();
  }, [API_BASE]);

  /* ---------------- Auto Pricing calculation for Combo ---------------- */
  const { calculatedRegularPrice, calculatedSalePrice, calculatedStock } = useMemo(() => {
    let reg = 0;
    let sale = 0;
    let stock = Infinity;

    selectedComboProducts.forEach((item) => {
      const qty = item.quantity || 1;
      reg += (item.price || 0) * qty;
      sale += (item.salePrice || item.price || 0) * qty;

      const totalComponentStock = item.variants && item.variants.length > 0
        ? item.variants.reduce((sum: number, v: any) => sum + (v.stock || 0), 0)
        : (item.stock || 0);

      const possibleStock = Math.floor(totalComponentStock / qty);
      if (possibleStock < stock) {
        stock = possibleStock;
      }
    });

    return {
      calculatedRegularPrice: reg,
      calculatedSalePrice: sale,
      calculatedStock: stock === Infinity ? 0 : stock,
    };
  }, [selectedComboProducts]);

  /* ---------------- Variants Handlers ---------------- */
  const addVariant = () => {
    setVariants([
      ...variants,
      { size: "", weight: "", price: "", stock: "", sku: "" },
    ]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: string, value: string) => {
    const updated = [...variants];
    (updated[index] as any)[field] = value;
    setVariants(updated);
  };

  /* ---------------- Images Handlers ---------------- */
  const addImageField = () => setImages([...images, ""]);
  const removeImageField = (index: number) => setImages(images.filter((_, i) => i !== index));
  const updateImageField = (index: number, value: string) => {
    const updated = [...images];
    updated[index] = value;
    setImages(updated);
  };

  /* ---------------- Tag Checkboxes Handlers ---------------- */
  const toggleSkinType = (type: string) => {
    setForm((prev) => ({
      ...prev,
      skinType: prev.skinType.includes(type)
        ? prev.skinType.filter((t) => t !== type)
        : [...prev.skinType, type],
    }));
  };

  const toggleConcern = (concern: string) => {
    setForm((prev) => ({
      ...prev,
      concerns: prev.concerns.includes(concern)
        ? prev.concerns.filter((c) => c !== concern)
        : [...prev.concerns, concern],
    }));
  };

  /* ---------------- Form Submission ---------------- */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Product name is required.");
      return;
    }

    if (!form.category) {
      toast.error("Please select a category.");
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken();

      const validImages = images.filter((img) => img.trim() !== "");
      const thumbnail = validImages[0] || "/placeholder.png";

      const ingredientsList = form.ingredientsText
        ? form.ingredientsText.split(",").map((i) => i.trim()).filter(Boolean)
        : [];

      const parsedVariants = variants
        .filter((v) => v.size || v.price)
        .map((v) => ({
          size: v.size || "50ml",
          weight: v.weight,
          price: Number(v.price) || Number(form.price) || 0,
          stock: Number(v.stock) || Number(form.stock) || 0,
          sku: v.sku || form.sku,
        }));

      const cleanSlug = form.name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/[\s_-]+/g, "-")
        .replace(/^-+|-+$/g, "");

      const payload = {
        name: form.name,
        nameBn: form.nameBn,
        slug: cleanSlug,
        brand: form.brand || "Cherry Glow",
        category: form.category,
        sku: form.sku || `CG-${Date.now().toString().slice(-6)}`,
        barcode: form.barcode,
        country: form.country,
        manufacturer: form.manufacturer,
        shortDescription: form.shortDescription,
        description: form.description,
        howToUse: form.howToUse,
        ingredients: ingredientsList,
        skinType: form.skinType,
        concerns: form.concerns,

        type: form.type,
        thumbnail,
        image: thumbnail,
        images: validImages.map((url) => ({ url })),
        gallery: validImages,

        price: Number(form.price) || (form.type === "combo" ? calculatedRegularPrice : 0),
        salePrice: Number(form.salePrice) || (form.type === "combo" ? calculatedSalePrice : 0),
        basePrice: Number(form.price) || (form.type === "combo" ? calculatedRegularPrice : 0),
        stock: Number(form.stock) || (form.type === "combo" ? calculatedStock : 0),

        variants: parsedVariants.length > 0 ? parsedVariants : [{ size: "Standard", price: Number(form.price) || 0, stock: Number(form.stock) || 10 }],

        comboProducts:
          form.type === "combo"
            ? selectedComboProducts.map((p) => ({
                productId: p._id,
                quantity: p.quantity,
                name: p.name,
                price: p.price,
              }))
            : [],

        isFeatured: form.isFeatured,
        isBestSelling: form.isBestSelling,
        isBestSeller: form.isBestSelling,
        isNewArrival: form.isNewArrival,
        allowPreOrder: form.allowPreOrder,
        status: form.status,
      };

      await axios.post(`${API_BASE}/products/create`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("✨ Product published successfully!");
      router.push("/admin/products");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 dark:border-stone-800/80 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-xl bg-white dark:bg-[#161113] border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer shadow-xs transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
                Add New Product / Combo
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                Skincare Catalog Form
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Fill out product info, select category, upload Cloudinary images, set pricing, and publish.
            </p>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="rounded-xl px-4 py-2 font-semibold text-xs cursor-pointer border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
          >
            Discard
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl px-6 py-2 text-xs shadow-md transition-all cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Publishing...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Publish Product</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Form Layout */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ========================================== */}
        {/* LEFT COLUMN: MAIN CONTENT (2 cols on LG) */}
        {/* ========================================== */}
        <div className="lg:col-span-2 space-y-6">

          {/* STEP 1: PRODUCT TYPE SELECTION */}
          <div className="p-5 rounded-3xl border border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113] space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
              <Package size={15} className="text-rose-500" />
              <span>Product Type Selection</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-medium">
              <button
                type="button"
                onClick={() => setForm({ ...form, type: "single" })}
                className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                  form.type === "single"
                    ? "bg-white dark:bg-[#181215] border-rose-500 text-stone-900 dark:text-stone-100 shadow-sm ring-1 ring-rose-500/30"
                    : "bg-stone-50 dark:bg-[#0d0709] border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-700"
                }`}
              >
                <div>
                  <div className="font-bold text-sm flex items-center gap-1.5 text-stone-900 dark:text-stone-100">
                    <Droplets size={16} className="text-rose-500" />
                    <span>Single Product</span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    Standard skincare item
                  </p>
                </div>
                {form.type === "single" && <CheckCircle2 className="h-5 w-5 text-rose-500 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, type: "combo" })}
                className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                  form.type === "combo"
                    ? "bg-white dark:bg-[#181215] border-rose-500 text-stone-900 dark:text-stone-100 shadow-sm ring-1 ring-rose-500/30"
                    : "bg-stone-50 dark:bg-[#0d0709] border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-700"
                }`}
              >
                <div>
                  <div className="font-bold text-sm flex items-center gap-1.5 text-stone-900 dark:text-stone-100">
                    <Gift size={16} className="text-rose-500" />
                    <span>Combo Bundle</span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    Set / Kit of multiple items
                  </p>
                </div>
                {form.type === "combo" && <CheckCircle2 className="h-5 w-5 text-rose-500 shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => setForm({ ...form, type: "free", price: "0", salePrice: "0" })}
                className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
                  form.type === "free"
                    ? "bg-white dark:bg-[#181215] border-emerald-500 text-stone-900 dark:text-stone-100 shadow-sm ring-1 ring-emerald-500/30"
                    : "bg-stone-50 dark:bg-[#0d0709] border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:border-emerald-500/50"
                }`}
              >
                <div>
                  <div className="font-bold text-sm flex items-center gap-1.5 text-stone-900 dark:text-stone-100">
                    <Sparkles size={16} className="text-emerald-500" />
                    <span>Free Order Product</span>
                  </div>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                    Free sample / ৳ 0 promotion item
                  </p>
                </div>
                {form.type === "free" && <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />}
              </button>
            </div>

            {/* Pre-Order Toggle Setting */}
            <div className="pt-3 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Clock size={14} className="text-amber-500" /> Enable Pre-Order / Backorder
                </span>
                <p className="text-[11px] text-stone-500 dark:text-stone-400">
                  Allow customers to order this product even when stock is 0
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.allowPreOrder}
                  onChange={(e) => setForm({ ...form, allowPreOrder: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-stone-200 peer-focus:outline-none rounded-full peer dark:bg-stone-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-stone-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              </label>
            </div>
          </div>

          {/* STEP 2: BASIC PRODUCT INFORMATION */}
          <div className="p-6 rounded-3xl border border-stone-200 dark:border-rose-900/30 bg-white dark:bg-[#160E12] space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 border-b border-stone-100 dark:border-rose-950/60 pb-3">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60">
                <Tag className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider">Product Identity & Details</h2>
            </div>

            <div className="space-y-4 text-xs">
              {/* Product Title English & Bangla */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">
                    Product Title (English) *
                  </label>
                  <Input
                    placeholder="e.g. Beauty of Joseon Relief Sun SPF50+"
                    value={form.name || ""}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="bg-stone-50/70 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 rounded-xl text-xs font-semibold"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">
                    প্রোডাক্ট নাম (Bangla Name - Optional) 🇧🇩
                  </label>
                  <Input
                    placeholder="যেমন: বিউটি অব জোশন রিলিফ সানস্ক্রিন..."
                    value={form.nameBn || ""}
                    onChange={(e) => setForm({ ...form, nameBn: e.target.value })}
                    className="bg-stone-50/70 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 rounded-xl text-xs font-medium"
                  />
                </div>
              </div>

              {/* Brand & Category Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">Brand</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g. Cherry Glow, COSRX..."
                      value={form.brand || ""}
                      onChange={(e) => setForm({ ...form, brand: e.target.value })}
                      className="bg-stone-50/70 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 rounded-xl text-xs"
                    />
                  </div>
                  {/* Popular Brands quick pick */}
                  <div className="flex flex-wrap gap-1 mt-1.5">
                    {POPULAR_BRANDS.slice(0, 5).map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setForm({ ...form, brand: b })}
                        className="text-[10px] font-semibold text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-md hover:bg-rose-100 transition"
                      >
                        + {b}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">
                    Category *
                  </label>
                  <select
                    value={form.category || ""}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full h-10 px-3 bg-stone-50/70 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 rounded-xl text-xs font-bold text-stone-900 dark:text-white outline-none focus:ring-1 focus:ring-rose-400"
                    required
                  >
                    <option value="">Select Category...</option>
                    {dbCategories.map((c: any) => (
                      <option key={c._id || c.name} value={c.name}>
                        {c.name} {c.nameBn ? `(${c.nameBn})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SKU, Barcode, Country Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">SKU Code</label>
                  <Input
                    placeholder="e.g. CG-BOJ-001"
                    value={form.sku || ""}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="bg-stone-50/70 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 rounded-xl font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">Country of Origin</label>
                  <Input
                    placeholder="e.g. South Korea, Japan..."
                    value={form.country || ""}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="bg-stone-50/70 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">Manufacturer / Supplier</label>
                  <Input
                    placeholder="e.g. Kolmar Korea Co."
                    value={form.manufacturer || ""}
                    onChange={(e) => setForm({ ...form, manufacturer: e.target.value })}
                    className="bg-stone-50/70 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: PRICING & INVENTORY */}
          <div className="p-6 rounded-3xl border border-stone-200 dark:border-rose-900/30 bg-white dark:bg-[#160E12] space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 border-b border-stone-100 dark:border-rose-950/60 pb-3">
              <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60">
                <DollarSign className="h-4 w-4 text-emerald-500" />
              </div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider">Pricing & Stock Inventory</h2>
            </div>

            {form.type === "combo" ? (
              <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 text-amber-800 dark:text-amber-200 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold">
                  <Info size={16} />
                  <span>Combo Auto-Pricing Active</span>
                </div>
                <p>
                  Prices and available stock for this combo are automatically calculated based on the selected items below. You can also override them manually:
                </p>
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div>
                    <span className="font-bold block">Regular Sum:</span> ৳{calculatedRegularPrice}
                  </div>
                  <div>
                    <span className="font-bold block">Suggested Bundle Sale:</span> ৳{calculatedSalePrice}
                  </div>
                  <div>
                    <span className="font-bold block">Max Build Stock:</span> {calculatedStock} units
                  </div>
                </div>
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">
                  Regular Price (৳ BDT) *
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 1500"
                  value={form.price || ""}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="bg-stone-50/70 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 rounded-xl font-bold text-sm text-stone-900 dark:text-white"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">
                  Sale Price (৳ Discounted)
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 1250"
                  value={form.salePrice || ""}
                  onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                  className="bg-stone-50/70 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 rounded-xl font-bold text-sm text-rose-600 dark:text-rose-400"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">
                  Stock Quantity (Units) *
                </label>
                <Input
                  type="number"
                  placeholder="e.g. 50"
                  value={form.stock || ""}
                  onChange={(e) => setForm({ ...form, stock: e.target.value })}
                  className="bg-stone-50/70 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 rounded-xl font-bold text-sm"
                />
              </div>
            </div>
          </div>

          {/* STEP 4: VARIANTS (Size, SPF, Options) */}
          {form.type === "single" && (
            <div className="p-6 rounded-3xl border border-stone-200 dark:border-rose-900/30 bg-white dark:bg-[#160E12] space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-rose-950/60 pb-3">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60">
                    <Sliders className="h-4 w-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold uppercase tracking-wider">Product Size / Options</h2>
                    <p className="text-[11px] text-stone-500 font-normal">Define sizes like 30ml, 50ml, 100ml with specific prices & stock.</p>
                  </div>
                </div>

                <Button
                  type="button"
                  onClick={addVariant}
                  variant="outline"
                  className="gap-1 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-300 border-rose-200 cursor-pointer"
                >
                  <Plus size={13} />
                  <span>+ Add Variant</span>
                </Button>
              </div>

              <div className="space-y-3">
                {variants.map((v, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-5 gap-3 items-center text-xs"
                  >
                    <div>
                      <label className="font-bold text-stone-600 dark:text-slate-400 block mb-1">Size / Volume</label>
                      <Input
                        placeholder="e.g. 50ml"
                        value={v.size || ""}
                        onChange={(e) => updateVariant(idx, "size", e.target.value)}
                        className="bg-white dark:bg-slate-950 text-xs h-9 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-600 dark:text-slate-400 block mb-1">Price (৳)</label>
                      <Input
                        type="number"
                        placeholder="Price"
                        value={v.price || ""}
                        onChange={(e) => updateVariant(idx, "price", e.target.value)}
                        className="bg-white dark:bg-slate-950 text-xs h-9 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-600 dark:text-slate-400 block mb-1">Stock</label>
                      <Input
                        type="number"
                        placeholder="Stock"
                        value={v.stock || ""}
                        onChange={(e) => updateVariant(idx, "stock", e.target.value)}
                        className="bg-white dark:bg-slate-950 text-xs h-9 rounded-xl"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-stone-600 dark:text-slate-400 block mb-1">SKU</label>
                      <Input
                        placeholder="SKU"
                        value={v.sku || ""}
                        onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                        className="bg-white dark:bg-slate-950 text-xs h-9 rounded-xl font-mono"
                      />
                    </div>
                    <div className="flex items-end justify-end pt-5 sm:pt-0">
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          className="p-2 text-stone-400 hover:text-red-500 transition"
                          title="Remove variant"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 5: COMBO PRODUCTS SELECTOR (If Combo Type) */}
          {form.type === "combo" && (
            <div className="p-6 rounded-3xl border border-pink-200 dark:border-pink-900/40 bg-white dark:bg-[#160E12] space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-rose-950/60 pb-3">
                <div className="flex items-center gap-2 text-pink-600 dark:text-pink-400">
                  <div className="p-2 rounded-xl bg-pink-50 dark:bg-pink-950/60">
                    <Gift className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-extrabold uppercase tracking-wider">Select Bundle Component Products</h2>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-64 overflow-y-auto p-1">
                  {allSingleProducts.map((p) => {
                    const isSelected = selectedComboProducts.some((item) => item._id === p._id);
                    return (
                      <div
                        key={p._id}
                        onClick={() => {
                          if (isSelected) {
                            setSelectedComboProducts(selectedComboProducts.filter((item) => item._id !== p._id));
                          } else {
                            setSelectedComboProducts([...selectedComboProducts, { ...p, quantity: 1 }]);
                          }
                        }}
                        className={`p-3 rounded-2xl border cursor-pointer transition flex items-center justify-between gap-3 ${
                          isSelected
                            ? "bg-rose-50/80 dark:bg-rose-950/60 border-rose-500 shadow-2xs"
                            : "bg-stone-50 dark:bg-slate-900/40 border-stone-200 dark:border-slate-800 hover:border-rose-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {p.thumbnail && (
                            <img src={p.thumbnail} alt={p.name} className="h-10 w-10 rounded-xl object-cover border border-stone-200" />
                          )}
                          <div className="min-w-0">
                            <h4 className="font-bold truncate text-stone-900 dark:text-white text-xs">{p.name}</h4>
                            <p className="text-[11px] font-semibold text-rose-600">৳{p.salePrice || p.price}</p>
                          </div>
                        </div>

                        {isSelected && <CheckCircle2 className="h-5 w-5 text-rose-500 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: PRODUCT MEDIA UPLOAD (Multi-Image Batch Cloudinary Upload) */}
          <div className="p-6 rounded-3xl border border-stone-200 dark:border-rose-900/30 bg-white dark:bg-[#160E12] space-y-4 shadow-xs">
            <MultiImageUploader
              value={images}
              onChange={(urls) => setImages(urls)}
              folder="cherry-glow/products"
              label="Product Images Gallery (Select Multiple Photos at Once)"
            />
          </div>

          {/* STEP 7: DESCRIPTIONS & HOW TO USE */}
          <div className="p-6 rounded-3xl border border-stone-200 dark:border-rose-900/30 bg-white dark:bg-[#160E12] space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 border-b border-stone-100 dark:border-rose-950/60 pb-3">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60">
                <FileText className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider">Product Description & Usage Guide</h2>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">Short Summary</label>
                <Input
                  placeholder="e.g. Lightweight hydrating sun serum that protects against UVA/UVB without white cast."
                  value={form.shortDescription || ""}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  className="bg-stone-50/70 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">Full Description</label>
                <textarea
                  placeholder="Detailed product features, benefits, formula details..."
                  value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={4}
                  className="w-full bg-stone-50/70 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 rounded-xl p-3 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-400 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">How To Use / Application Guide</label>
                <textarea
                  placeholder="e.g. Apply evenly onto face and neck 15 minutes before sun exposure as the last step of skincare."
                  value={form.howToUse || ""}
                  onChange={(e) => setForm({ ...form, howToUse: e.target.value })}
                  rows={3}
                  className="w-full bg-stone-50/70 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 rounded-xl p-3 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-400 text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">Key Ingredients (Comma Separated)</label>
                <Input
                  placeholder="e.g. Niacinamide, Centella Asiatica, Hyaluronic Acid, Rice Extract"
                  value={form.ingredientsText || ""}
                  onChange={(e) => setForm({ ...form, ingredientsText: e.target.value })}
                  className="bg-stone-50/70 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 rounded-xl"
                />
              </div>
            </div>
          </div>

        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: SIDEBAR (1 col on LG) */}
        {/* ========================================== */}
        <div className="space-y-6">

          {/* CARD 1: SKIN TYPE & CONCERNS BADGES */}
          <div className="p-6 rounded-3xl border border-stone-200 dark:border-rose-900/30 bg-white dark:bg-[#160E12] space-y-5 shadow-xs">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 border-b border-stone-100 dark:border-rose-950/60 pb-3">
              <Sparkles className="h-4 w-4" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider">Skin Type & Concerns Filter</h2>
            </div>

            {/* Target Skin Types */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block">Target Skin Type</label>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_SKIN_TYPES.map((st) => {
                  const isChecked = form.skinType.includes(st);
                  return (
                    <button
                      key={st}
                      type="button"
                      onClick={() => toggleSkinType(st)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 border ${
                        isChecked
                          ? "bg-rose-500 text-white border-rose-500 shadow-2xs"
                          : "bg-stone-50 dark:bg-slate-900 text-stone-700 dark:text-slate-300 border-stone-200 dark:border-slate-800 hover:border-rose-300"
                      }`}
                    >
                      {isChecked && <Check size={12} className="stroke-[3]" />}
                      <span>{st}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Concerns */}
            <div className="space-y-2 pt-2 border-t border-stone-100 dark:border-rose-950/60">
              <label className="text-xs font-bold text-stone-700 dark:text-slate-300 block">Skin Concerns / Solution</label>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_CONCERNS.map((c) => {
                  const isChecked = form.concerns.includes(c);
                  return (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleConcern(c)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1 border ${
                        isChecked
                          ? "bg-pink-500 text-white border-pink-500 shadow-2xs"
                          : "bg-stone-50 dark:bg-slate-900 text-stone-700 dark:text-slate-300 border-stone-200 dark:border-slate-800 hover:border-pink-300"
                      }`}
                    >
                      {isChecked && <Check size={12} className="stroke-[3]" />}
                      <span>{c}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* CARD 2: HOMEPAGE DISPLAY BADGES */}
          <div className="p-6 rounded-3xl border border-stone-200 dark:border-rose-900/30 bg-white dark:bg-[#160E12] space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-amber-500 border-b border-stone-100 dark:border-rose-950/60 pb-3">
              <Flame className="h-4 w-4" />
              <h2 className="text-sm font-extrabold uppercase tracking-wider">Store Badges & Status</h2>
            </div>

            <div className="space-y-3 text-xs">
              <label className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 cursor-pointer">
                <span className="font-bold text-stone-800 dark:text-white flex items-center gap-2">
                  <Sparkles size={15} className="text-amber-500" /> Feature on Homepage
                </span>
                <input
                  type="checkbox"
                  checked={form.isFeatured}
                  onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                  className="h-4 w-4 rounded text-rose-500 focus:ring-rose-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 cursor-pointer">
                <span className="font-bold text-stone-800 dark:text-white flex items-center gap-2">
                  <Flame size={15} className="text-rose-500" /> Mark as Best Seller
                </span>
                <input
                  type="checkbox"
                  checked={form.isBestSelling}
                  onChange={(e) => setForm({ ...form, isBestSelling: e.target.checked })}
                  className="h-4 w-4 rounded text-rose-500 focus:ring-rose-400 cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between p-3 rounded-2xl bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 cursor-pointer">
                <span className="font-bold text-stone-800 dark:text-white flex items-center gap-2">
                  <Sparkles size={15} className="text-emerald-500" /> Mark as New Arrival
                </span>
                <input
                  type="checkbox"
                  checked={form.isNewArrival}
                  onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })}
                  className="h-4 w-4 rounded text-rose-500 focus:ring-rose-400 cursor-pointer"
                />
              </label>

              <div className="pt-2">
                <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">Catalog Visibility Status</label>
                <select
                  value={form.status || "active"}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full h-10 px-3 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-xl text-xs font-bold text-stone-900 dark:text-white outline-none"
                >
                  <option value="active">Active (Visible in Store)</option>
                  <option value="inactive">Draft / Inactive (Hidden)</option>
                </select>
              </div>
            </div>
          </div>

          {/* CARD 3: PUBLISH ACTION CARD */}
          <div className="p-6 rounded-3xl border border-rose-200 dark:border-rose-900/40 bg-gradient-to-b from-rose-50/50 to-pink-50/30 dark:from-rose-950/40 dark:to-stone-900/40 space-y-3">
            <h3 className="font-extrabold text-sm text-stone-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-rose-500" /> Ready to Publish?
            </h3>
            <p className="text-xs text-stone-500 dark:text-slate-400">
              Double check your pricing, variants, and high-res images before publishing to your live catalog.
            </p>

            <Button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full gap-2 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white font-bold rounded-xl py-3 text-xs shadow-md hover:shadow-rose-500/30 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Publishing Product...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Publish Product Now</span>
                </>
              )}
            </Button>
          </div>

        </div>

      </form>
    </div>
  );
}
