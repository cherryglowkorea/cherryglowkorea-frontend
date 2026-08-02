"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
} from "lucide-react";
import Image from "next/image";
import { useGetCategoriesQuery } from "@/redux/api/ecommerceApi";

const DEFAULT_SKIN_TYPES = ["Dry", "Oily", "Sensitive", "Combination", "Normal", "All Skin Types"];
const DEFAULT_CONCERNS = ["Acne & Blemishes", "Dark Spots & Pigmentation", "Anti-Aging & Wrinkles", "Deep Hydration", "Pores & Texture", "Redness & Calming"];

export default function CreateProductPage() {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [uploadingIdx, setUploadingIdx] = useState(null); // Index of image field currently uploading
  const [images, setImages] = useState([""]); // Array of image URLs

  const { data: dbCategories } = useGetCategoriesQuery();

  const [form, setForm] = useState({
    name: "",
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
    skinType: [],
    concerns: [],
    tagsText: "",
    isFeatured: false,
    isBestSelling: false,
    isNewArrival: true,
    status: "active",
  });

  const [variants, setVariants] = useState([
    { size: "30ml", weight: "", price: "", stock: "", sku: "" },
  ]);

  // Combo specific states
  const [allSingleProducts, setAllSingleProducts] = useState([]);
  const [selectedComboProducts, setSelectedComboProducts] = useState([]);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    return token;
  };

  /* ---------------- Fetch Products list for Combo Selection ---------------- */
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const token = getToken();
        const res = await axios.get(`${API_BASE}/products/allProduct`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllSingleProducts((res.data || []).filter((p) => p.type !== "combo"));
      } catch (err) {
        console.error("Failed to load products for combo selection", err);
      }
    };
    fetchAllProducts();
  }, [API_BASE]);

  /* ---------------- Handle Local File Upload to Cloudinary ---------------- */
  const handleFileUpload = async (e, index) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingIdx(index);
      const token = getToken();

      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "cherry-glow/products");

      const res = await axios.post(`${API_BASE}/upload/image`, uploadData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.url) {
        const updated = [...images];
        updated[index] = res.data.url;
        setImages(updated);
        toast.success(`Image uploaded to Cloudinary!`);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingIdx(null);
    }
  };

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
        ? item.variants.reduce((sum, v) => sum + (v.stock || 0), 0)
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

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index, field, value) => {
    const updated = [...variants];
    updated[index][field] = value;
    setVariants(updated);
  };

  /* ---------------- Images Handlers ---------------- */
  const addImageField = () => setImages([...images, ""]);
  const removeImageField = (index) => setImages(images.filter((_, i) => i !== index));
  const updateImageField = (index, value) => {
    const updated = [...images];
    updated[index] = value;
    setImages(updated);
  };

  /* ---------------- Tag Checkboxes Handlers ---------------- */
  const toggleSkinType = (type) => {
    setForm((prev) => ({
      ...prev,
      skinType: prev.skinType.includes(type)
        ? prev.skinType.filter((t) => t !== type)
        : [...prev.skinType, type],
    }));
  };

  const toggleConcern = (concern) => {
    setForm((prev) => ({
      ...prev,
      concerns: prev.concerns.includes(concern)
        ? prev.concerns.filter((c) => c !== concern)
        : [...prev.concerns, concern],
    }));
  };

  /* ---------------- Form Submission ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim()) {
      toast.error("Please enter a product name.");
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

      const parsedVariants = variants.map((v) => ({
        size: v.size || "30ml",
        weight: v.weight,
        price: Number(v.price) || Number(form.price) || 0,
        stock: Number(v.stock) || Number(form.stock) || 0,
        sku: v.sku || form.sku,
      }));

      const payload = {
        name: form.name,
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

        price: Number(form.price) || (form.type === "combo" ? calculatedRegularPrice : 0),
        salePrice: Number(form.salePrice) || (form.type === "combo" ? calculatedSalePrice : 0),
        basePrice: Number(form.price) || (form.type === "combo" ? calculatedRegularPrice : 0),
        stock: Number(form.stock) || (form.type === "combo" ? calculatedStock : 0),

        variants: parsedVariants,

        comboProducts: form.type === "combo" ? selectedComboProducts.map((p) => ({
          productId: p._id,
          quantity: p.quantity,
          name: p.name,
          price: p.price,
        })) : [],

        isFeatured: form.isFeatured,
        isBestSelling: form.isBestSelling,
        isNewArrival: form.isNewArrival,
        status: form.status,
      };

      await axios.post(`${API_BASE}/products/create`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success("Product created successfully!");
      router.push("/admin/products");
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 dark:border-rose-900/30 pb-5">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2.5 rounded-xl bg-white dark:bg-rose-950/60 border border-stone-200 dark:border-rose-800/40 text-stone-700 dark:text-rose-200 hover:bg-stone-50 cursor-pointer shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white">
                Add New Product
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                Shopify Grade Form
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">
              Fill out product details, manage variants, upload high-res images, and publish to store.
            </p>
          </div>
        </div>

        {/* Action Header Buttons */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="rounded-xl px-4 py-2 font-semibold text-xs cursor-pointer"
          >
            Discard
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={submitting || uploadingIdx !== null}
            className="gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl px-6 py-2 text-xs shadow-md hover:shadow-rose-500/30 cursor-pointer"
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

      {/* Main Grid: 2-Columns (Left Main 65% / Right Sidebar 35%) */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ========================================== */}
        {/* LEFT COLUMN: MAIN CONTENT (2 cols on LG) */}
        {/* ========================================== */}
        <div className="lg:col-span-2 space-y-6">

          {/* CARD 1: PRODUCT IDENTITY */}
          <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-rose-900/40 bg-white dark:bg-[#160E12] shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60">
                <Tag className="h-4 w-4" />
              </div>
              <h2 className="text-sm font-extrabold uppercase tracking-wider">Product Identity</h2>
            </div>

            <div className="space-y-4 text-xs">
              {/* Title */}
              <div>
                <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">
                  Product Title *
                </label>
                <Input
                  placeholder="e.g. Beauty of Joseon Relief Sun : Rice + Probiotics SPF50+ PA++++"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="bg-stone-50/70 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 rounded-xl text-sm font-semibold"
                  required
                />
              </div>

              {/* SKU & Country Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">SKU Code</label>
                  <Input
                    placeholder="e.g. CG-BOJ-001"
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                    className="bg-stone-50/70 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 rounded-xl font-mono text-[11px]"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">Country of Origin</label>
                  <Input
                    placeholder="e.g. South Korea"
                    value={form.country}
                    onChange={(e) => setForm({ ...form, country: e.target.value })}
                    className="bg-stone-50/70 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CARD 2: MEDIA & GALLERY (Grid Visual Display) */}
          <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-rose-900/40 bg-white dark:bg-[#160E12] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60">
                  <ImageIcon className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider">Product Media & Gallery</h2>
              </div>
              <span className="text-[11px] font-semibold text-stone-400">Upload to Cloudinary</span>
            </div>

            {/* Visual Image Grid Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-2xl border border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-900/50 p-2.5 flex flex-col justify-between space-y-2 aspect-square overflow-hidden"
                >
                  {/* Image Preview or Placeholder */}
                  {img ? (
                    <div className="relative w-full h-full rounded-xl overflow-hidden bg-white">
                      <Image src={img} alt={`Media #${idx + 1}`} fill sizes="120px" className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImageField(idx)}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-rose-600 text-white p-1 rounded-full opacity-90 transition-opacity"
                        title="Remove"
                      >
                        <X className="h-3 w-3" />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-rose-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                          MAIN
                        </span>
                      )}
                    </div>
                  ) : (
                    <label className="w-full h-full rounded-xl border-2 border-dashed border-stone-300 dark:border-slate-700 hover:border-rose-400 dark:hover:border-rose-500 flex flex-col items-center justify-center p-2 text-center cursor-pointer transition-all bg-white/50 dark:bg-slate-900/40">
                      {uploadingIdx === idx ? (
                        <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
                      ) : (
                        <>
                          <Upload className="h-5 w-5 text-stone-400 dark:text-slate-500 mb-1" />
                          <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                            {idx === 0 ? "Upload Main" : "Upload Image"}
                          </span>
                        </>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, idx)}
                        disabled={uploadingIdx !== null}
                        className="hidden"
                      />
                    </label>
                  )}

                  {/* URL Input Box */}
                  <Input
                    placeholder="Or paste URL..."
                    value={img}
                    onChange={(e) => updateImageField(idx, e.target.value)}
                    className="bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-800 text-[10px] h-7 px-2 rounded-lg"
                  />
                </div>
              ))}

              {/* Add New Image Tile */}
              <button
                type="button"
                onClick={addImageField}
                className="rounded-2xl border-2 border-dashed border-stone-200 dark:border-slate-800 hover:border-rose-400 flex flex-col items-center justify-center aspect-square text-stone-400 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <Plus className="h-6 w-6" />
                <span className="text-[10px] font-bold mt-1">Add Image Field</span>
              </button>
            </div>
          </div>

          {/* CARD 3: VARIANTS OR COMBO DEALS */}
          {form.type === "single" ? (
            <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-rose-900/40 bg-white dark:bg-[#160E12] shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-100 dark:border-rose-950/60 pb-3">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60">
                    <Layers className="h-4 w-4" />
                  </div>
                  <h2 className="text-sm font-extrabold uppercase tracking-wider">Pricing & Size Variants</h2>
                </div>

                <button
                  type="button"
                  onClick={addVariant}
                  className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/40 px-3 py-1.5 rounded-xl cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Size Variant
                </button>
              </div>

              <div className="space-y-3">
                {variants.map((v, idx) => (
                  <div
                    key={idx}
                    className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-stone-50 dark:bg-slate-900/60 border border-stone-200/70 dark:border-slate-800 text-xs items-end"
                  >
                    <div>
                      <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">Size / Volume</label>
                      <Input
                        placeholder="e.g. 50ml, 100g"
                        value={v.size}
                        onChange={(e) => updateVariant(idx, "size", e.target.value)}
                        className="bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-800 rounded-xl"
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">Price (৳) *</label>
                      <Input
                        type="number"
                        placeholder="e.g. 1850"
                        value={v.price}
                        onChange={(e) => updateVariant(idx, "price", e.target.value)}
                        className="bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-800 rounded-xl font-mono font-bold"
                        required
                      />
                    </div>

                    <div>
                      <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">Inventory Stock *</label>
                      <Input
                        type="number"
                        placeholder="e.g. 50"
                        value={v.stock}
                        onChange={(e) => updateVariant(idx, "stock", e.target.value)}
                        className="bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-800 rounded-xl font-mono font-bold"
                        required
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="Variant SKU"
                        value={v.sku}
                        onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                        className="bg-white dark:bg-slate-900 border-stone-200 dark:border-slate-800 rounded-xl font-mono text-[11px]"
                      />
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* COMBO BUNDLE SELECTOR */
            <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-rose-900/40 bg-white dark:bg-[#160E12] shadow-xs space-y-4">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60">
                  <Gift className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider">Bundle Component Items</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                {allSingleProducts.map((p) => {
                  const isSelected = selectedComboProducts.some((item) => item._id === p._id);
                  const selectedItem = selectedComboProducts.find((item) => item._id === p._id);

                  return (
                    <div
                      key={p._id}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between text-xs ${
                        isSelected
                          ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/40"
                          : "border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-900/50"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedComboProducts([
                                ...selectedComboProducts,
                                { _id: p._id, name: p.name, price: p.price || p.minPrice, salePrice: p.salePrice || p.minPrice, quantity: 1 },
                              ]);
                            } else {
                              setSelectedComboProducts(selectedComboProducts.filter((item) => item._id !== p._id));
                            }
                          }}
                          className="rounded border-stone-300 text-rose-500 focus:ring-rose-400 h-4 w-4"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-stone-900 dark:text-white truncate">{p.name}</p>
                          <p className="text-[10px] text-stone-500 font-mono">৳{(p.price || p.minPrice || 0).toLocaleString()}</p>
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-rose-300 rounded-lg p-1">
                          <span className="text-[10px] font-bold text-stone-500 px-1">Qty:</span>
                          <input
                            type="number"
                            min={1}
                            value={selectedItem.quantity}
                            onChange={(e) => {
                              const val = Math.max(1, parseInt(e.target.value) || 1);
                              setSelectedComboProducts(
                                selectedComboProducts.map((item) =>
                                  item._id === p._id ? { ...item, quantity: val } : item
                                )
                              );
                            }}
                            className="w-10 text-center font-bold text-stone-900 dark:text-white bg-transparent focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Calculated Prices summary */}
              <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/40 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-stone-500 uppercase">Combined Regular</span>
                  <p className="font-mono font-bold text-stone-900 dark:text-white text-sm">৳{calculatedRegularPrice.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-rose-600 uppercase">Combo Deal Price</span>
                  <p className="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">৳{calculatedSalePrice.toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-600 uppercase">Max Combo Stock</span>
                  <p className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">{calculatedStock} sets</p>
                </div>
              </div>
            </div>
          )}

          {/* CARD 4: DESCRIPTIONS & INGREDIENTS */}
          <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-rose-900/40 bg-white dark:bg-[#160E12] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/60">
                  <FileText className="h-4 w-4" />
                </div>
                <h2 className="text-sm font-extrabold uppercase tracking-wider">Product Content & Usage</h2>
              </div>

              {/* Multilingual Support Badges */}
              <div className="flex items-center gap-1.5 text-[10px] font-bold">
                <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-slate-900 text-stone-700 dark:text-slate-300 border border-stone-200 dark:border-slate-800">
                  🇧🇩 বাংলা
                </span>
                <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-slate-900 text-stone-700 dark:text-slate-300 border border-stone-200 dark:border-slate-800">
                  🇰🇷 한국어
                </span>
                <span className="px-2 py-0.5 rounded-md bg-stone-100 dark:bg-slate-900 text-stone-700 dark:text-slate-300 border border-stone-200 dark:border-slate-800">
                  🇬🇧 English
                </span>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block flex items-center justify-between">
                  <span>Short Summary (সংক্ষিপ্ত বিবরণ)</span>
                  <span className="text-[10px] font-normal text-stone-400">Supports multiline text in Bangla, Korean & English</span>
                </label>
                <Textarea
                  placeholder="যেমন: এই সানস্ক্রিনটি ত্বককে ক্ষতিকারক রোদ থেকে রক্ষা করে এবং গভীর আর্দ্রতা যোগায়... / 이 자외선 차단제는 피부를 보호합니다..."
                  value={form.shortDescription}
                  onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
                  className="bg-stone-50/70 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 rounded-xl leading-relaxed"
                  rows={2}
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block flex items-center justify-between">
                  <span>Full Description (বিস্তারিত বিবরণ)</span>
                  <span className="text-[10px] font-normal text-stone-400">Full UTF-8 HTML & Multiline Support</span>
                </label>
                <Textarea
                  placeholder="বিস্তারিত প্রোডাক্ট বিবরণ, ব্যবহারবিধি এবং উপকারিতা বাংলায়, কোরিয়ানে বা ইংরেজিতে লিখুন..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="bg-stone-50/70 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 rounded-xl leading-relaxed font-sans"
                  rows={5}
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">Key Ingredients (মূল উপাদানসমূহ - Comma separated)</label>
                <Input
                  placeholder="e.g. Centella Asiatica 10%, Niacinamide 5%, রাইস এক্সট্রাক্ট, 병풀 추출물"
                  value={form.ingredientsText}
                  onChange={(e) => setForm({ ...form, ingredientsText: e.target.value })}
                  className="bg-stone-50/70 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">How to Use Instructions (ব্যবহারবিধি)</label>
                <Textarea
                  placeholder="যেমন: সকালে স্কিনকেয়ারের শেষ ধাপে উপযুক্ত পরিমাণে নিয়ে মুখে ভালোভাবে লাগিয়ে নিন..."
                  value={form.howToUse}
                  onChange={(e) => setForm({ ...form, howToUse: e.target.value })}
                  className="bg-stone-50/70 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 rounded-xl leading-relaxed"
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* RIGHT COLUMN: SIDEBAR CONTROLS (1 col on LG) */}
        {/* ========================================== */}
        <div className="space-y-6">

          {/* SIDEBAR CARD 1: TYPE SELECTOR */}
          <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-rose-900/40 bg-white dark:bg-[#160E12] shadow-xs space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Product Structure Type
            </h2>

            <div className="space-y-2 text-xs">
              <div
                onClick={() => setForm({ ...form, type: "single" })}
                className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                  form.type === "single"
                    ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 font-bold"
                    : "border-stone-200 dark:border-slate-800 hover:border-blue-300"
                }`}
              >
                <Package className="h-5 w-5 text-blue-500 shrink-0" />
                <div>
                  <h4 className="text-stone-900 dark:text-white">Single Item Product</h4>
                  <p className="text-[10px] text-stone-500 font-normal">Individual item with size options.</p>
                </div>
              </div>

              <div
                onClick={() => setForm({ ...form, type: "combo" })}
                className={`p-3 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-3 ${
                  form.type === "combo"
                    ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/40 font-bold"
                    : "border-stone-200 dark:border-slate-800 hover:border-rose-300"
                }`}
              >
                <Gift className="h-5 w-5 text-rose-500 shrink-0" />
                <div>
                  <h4 className="text-stone-900 dark:text-white">Combo Bundle Deal</h4>
                  <p className="text-[10px] text-stone-500 font-normal">Package of multiple products.</p>
                </div>
              </div>
            </div>
          </div>

          {/* SIDEBAR CARD 2: CATEGORY & BRAND */}
          <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-rose-900/40 bg-white dark:bg-[#160E12] shadow-xs space-y-4 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Product Organization
            </h2>

            {/* Category Select */}
            <div>
              <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">Category *</label>
              <select
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full py-2.5 px-3 bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-xl text-stone-900 dark:text-white font-medium focus:border-rose-400 cursor-pointer"
                required
              >
                <option value="">Select Category</option>
                {dbCategories && dbCategories.length > 0 ? (
                  dbCategories.map((c) => (
                    <option key={c._id} value={c.name}>
                      {c.name}
                    </option>
                  ))
                ) : (
                  <>
                    <option value="Cleanser">Cleanser</option>
                    <option value="Toner">Toner</option>
                    <option value="Serum">Serum</option>
                    <option value="Essence">Essence</option>
                    <option value="Moisturizer">Moisturizer</option>
                    <option value="Sunscreen">Sunscreen</option>
                    <option value="Eye Care">Eye Care</option>
                    <option value="Mask">Mask</option>
                    <option value="Combo Deals">Combo Deals</option>
                  </>
                )}
              </select>
            </div>

            {/* Brand */}
            <div>
              <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">Brand Name</label>
              <Input
                placeholder="e.g. Beauty of Joseon"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="bg-stone-50 dark:bg-slate-900 border-stone-200 dark:border-slate-800 rounded-xl"
              />
            </div>
          </div>

          {/* SIDEBAR CARD 3: TARGET SKIN TYPES & CONCERNS */}
          <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-rose-900/40 bg-white dark:bg-[#160E12] shadow-xs space-y-4 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5" /> Skin Filters
            </h2>

            {/* Skin Types */}
            <div>
              <label className="font-bold text-stone-700 dark:text-slate-300 mb-2 block">Target Skin Type</label>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_SKIN_TYPES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => toggleSkinType(st)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                      form.skinType.includes(st)
                        ? "bg-rose-500 text-white shadow-xs"
                        : "bg-stone-100 dark:bg-slate-900 text-stone-600 dark:text-slate-300 hover:bg-rose-100"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Skin Concerns */}
            <div>
              <label className="font-bold text-stone-700 dark:text-slate-300 mb-2 block">Skin Concerns Targeted</label>
              <div className="flex flex-wrap gap-1.5">
                {DEFAULT_CONCERNS.map((sc) => (
                  <button
                    key={sc}
                    type="button"
                    onClick={() => toggleConcern(sc)}
                    className={`px-2.5 py-1 rounded-xl text-[11px] font-semibold transition-all cursor-pointer ${
                      form.concerns.includes(sc)
                        ? "bg-purple-600 text-white shadow-xs"
                        : "bg-stone-100 dark:bg-slate-900 text-stone-600 dark:text-slate-300 hover:bg-purple-100"
                    }`}
                  >
                    {sc}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SIDEBAR CARD 4: PROMOTIONAL BADGES */}
          <div className="p-6 rounded-3xl border border-stone-200/80 dark:border-rose-900/40 bg-white dark:bg-[#160E12] shadow-xs space-y-3 text-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5" /> Badges & Visibility
            </h2>

            <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
                className="rounded border-stone-300 text-rose-500 focus:ring-rose-400 h-4 w-4"
              />
              <span>Feature on Homepage</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={form.isBestSelling}
                onChange={(e) => setForm({ ...form, isBestSelling: e.target.checked })}
                className="rounded border-stone-300 text-emerald-500 focus:ring-emerald-400 h-4 w-4"
              />
              <span>Mark as Best Seller</span>
            </label>

            <label className="flex items-center gap-2.5 p-3 rounded-2xl bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 font-bold cursor-pointer">
              <input
                type="checkbox"
                checked={form.isNewArrival}
                onChange={(e) => setForm({ ...form, isNewArrival: e.target.checked })}
                className="rounded border-stone-300 text-blue-500 focus:ring-blue-400 h-4 w-4"
              />
              <span>New Arrival Badge</span>
            </label>
          </div>

        </div>
      </form>
    </div>
  );
}
