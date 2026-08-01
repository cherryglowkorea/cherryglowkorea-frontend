"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";

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
import { Trash2 } from "lucide-react";

const CATEGORIES = [
  "CLEANSER",
  "TONER",
  "SERUM",
  "EYE CARE",
  "MOISTURIZER",
  "SUNSCREEN",
  "MASK",
  "OIL",
  "COMBO DEALS"
];

const UNITS = ["ml", "g"];

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id;

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

  const [variants, setVariants] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([{ file: null }]);

  // Combo specific states
  const [allSingleProducts, setAllSingleProducts] = useState([]);
  const [selectedComboProducts, setSelectedComboProducts] = useState([]);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    return token;
  };

  /* ---------------- Fetch Product & Components ---------------- */
  useEffect(() => {
    const fetchAllAndProduct = async () => {
      try {
        setLoading(true);
        const token = getToken();

        // 1. Fetch single products list
        const productsRes = await axios.get(`${API_BASE}/products/allProduct`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const singles = (productsRes.data || []).filter(p => p.type !== "combo");
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
          const mapped = p.comboProducts.map(item => {
            const originalProduct = singles.find(x => x._id === String(item.productId));
            return {
              productId: String(item.productId),
              quantity: item.quantity,
              name: originalProduct?.name || "Unknown Product",
              brand: originalProduct?.brand || "",
              price: originalProduct?.price || originalProduct?.variants?.[0]?.price || 0,
              salePrice: originalProduct?.salePrice || originalProduct?.variants?.[0]?.price || 0,
              variants: originalProduct?.variants || []
            };
          });
          setSelectedComboProducts(mapped);
        }
      } catch (err) {
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

    selectedComboProducts.forEach(item => {
      const qty = item.quantity;
      reg += (item.price || 0) * qty;
      sale += (item.salePrice || 0) * qty;

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
      calculatedStock: stock === Infinity ? 0 : stock
    };
  }, [selectedComboProducts]);

  /* ---------------- Variants ---------------- */
  const updateVariant = (i, field, value) => {
    const updated = [...variants];
    updated[i][field] = value;
    setVariants(updated);
  };

  const addVariant = () => {
    setVariants([
      ...variants,
      { weight: "", unit: "ml", price: "", stock: "" },
    ]);
  };

  const removeVariant = (i) => {
    setVariants(variants.filter((_, idx) => idx !== i));
  };

  /* ---------------- Images ---------------- */
  const removeExistingImage = (i) => {
    setExistingImages(existingImages.filter((_, idx) => idx !== i));
  };

  const updateNewImage = (i, file) => {
    const updated = [...newImages];
    updated[i].file = file;
    setNewImages(updated);
  };

  const addNewImageField = () => {
    setNewImages([...newImages, { file: null }]);
  };

  const canAddImage =
    newImages.length > 0 && newImages[newImages.length - 1].file !== null;

  /* ---------------- Submit ---------------- */
  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const token = await getToken();

      const formData = new FormData();

      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          formData.append(k, String(v));
        }
      });

      // keep existing images
      formData.append("existingImages", JSON.stringify(existingImages));

      // new images
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
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Product updated successfully");

      setTimeout(() => {
        router.replace("/admin/products");
      }, 800);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="p-6">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Edit Product</h1>

      {/* Product Type Select */}
      <div className="space-y-2">
        <label className="text-sm font-semibold text-stone-700">Product Type</label>
        <Select
          value={form.type}
          onValueChange={(v) => setForm({ ...form, type: v, category: v === "combo" ? "COMBO DEALS" : form.category })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="single">Single Product</SelectItem>
            <SelectItem value="combo">Combo Product (Bundle)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Basic */}
      <Input
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        placeholder="Name"
      />

      <Input
        value={form.brand}
        onChange={(e) => setForm({ ...form, brand: e.target.value })}
        placeholder="Brand"
      />

      <Select
        value={form.category}
        onValueChange={(v) => setForm({ ...form, category: v })}
      >
        <SelectTrigger>
          <SelectValue placeholder="Category" />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((c) => (
            <SelectItem key={c} value={c}>
              {c}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Textarea
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Description"
      />

      <Textarea
        value={form.useCase}
        onChange={(e) => setForm({ ...form, useCase: e.target.value })}
        placeholder="Use Case"
      />

      {/* COMBO COMPONENT SELECTOR SECTION */}
      {form.type === "combo" && (
        <div className="space-y-4 border border-rose-100 p-5 rounded-2xl bg-rose-50/5">
          <h2 className="font-semibold text-stone-800 text-base">Included Combo Products</h2>
          <div className="flex gap-2">
            <select
              className="flex-1 bg-stone-50 border rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-pink-500"
              onChange={(e) => {
                const prodId = e.target.value;
                if (prodId) {
                  const alreadyAdded = selectedComboProducts.some((p) => p.productId === prodId);
                  if (alreadyAdded) {
                    toast.error("Product already added to combo");
                    return;
                  }
                  const originalProduct = allSingleProducts.find((p) => p._id === prodId);
                  if (originalProduct) {
                    setSelectedComboProducts([
                      ...selectedComboProducts,
                      {
                        productId: prodId,
                        quantity: 1,
                        name: originalProduct.name,
                        brand: originalProduct.brand,
                        price: originalProduct.price || originalProduct.variants?.[0]?.price || 0,
                        salePrice: originalProduct.salePrice || originalProduct.variants?.[0]?.price || 0,
                        variants: originalProduct.variants || [],
                      },
                    ]);
                  }
                }
              }}
            >
              <option value="">-- Add Product to Combo --</option>
              {allSingleProducts.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.brand} - {p.name} (৳{p.salePrice || p.variants?.[0]?.price})
                </option>
              ))}
            </select>
          </div>

          {/* Selected Products List */}
          <div className="space-y-2.5">
            {selectedComboProducts.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200 shadow-sm">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-stone-800 text-sm truncate">{item.name}</p>
                  <p className="text-xs text-stone-500">{item.brand} | Base Sale Price: ৳{item.salePrice}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-stone-500">Qty:</span>
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
                    className="w-14 border rounded p-1 text-center text-sm focus:outline-none focus:border-pink-500"
                  />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedComboProducts(selectedComboProducts.filter((_, i) => i !== idx))}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Dynamic Summary Info */}
          {selectedComboProducts.length > 0 && (
            <div className="bg-stone-50 p-4 rounded-xl text-xs space-y-1.5 border">
              <p><strong>Auto-calculated Combo Regular Price:</strong> ৳{calculatedRegularPrice}</p>
              <p><strong>Auto-calculated Combo Sale Price:</strong> ৳{calculatedSalePrice}</p>
              <p><strong>Limit Stock (from component inventory):</strong> {calculatedStock}</p>
            </div>
          )}

          {/* Custom Overrides Input */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Combo Regular Price (Override)</label>
              <Input
                type="number"
                placeholder={`Default: ৳${calculatedRegularPrice}`}
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Combo Sale Price (Override)</label>
              <Input
                type="number"
                placeholder={`Default: ৳${calculatedSalePrice}`}
                value={form.salePrice}
                onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {/* Variants (Only for Single products) */}
      {form.type !== "combo" && (
        <div className="space-y-4">
          <div className="flex justify-between">
            <h2 className="font-semibold text-lg">Variants</h2>
            <Button
              className="bg-pink-500 text-white hover:bg-pink-600 cursor-pointer"
              onClick={addVariant}
            >
              Add Variant
            </Button>
          </div>

          {variants.map((v, i) => (
            <div key={i} className="grid grid-cols-5 gap-2 bg-stone-50 p-2 rounded-lg border">
              <Input
                placeholder="Weight"
                value={v.weight}
                onChange={(e) => updateVariant(i, "weight", e.target.value)}
              />
              <Input
                placeholder="Unit"
                value={v.unit}
                onChange={(e) => updateVariant(i, "unit", e.target.value)}
              />
              <Input
                placeholder="Price"
                value={v.price}
                onChange={(e) => updateVariant(i, "price", e.target.value)}
              />
              <Input
                placeholder="Stock"
                value={v.stock}
                onChange={(e) => updateVariant(i, "stock", e.target.value)}
              />

              <Button
                className="cursor-pointer"
                variant="destructive"
                onClick={() => removeVariant(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Existing Images */}
      <div>
        <h2 className="font-semibold text-lg my-2">
          Existing Images
        </h2>
        <div className="flex flex-wrap gap-2">
          {existingImages.map((img, i) => (
            <div key={i} className="relative">
              <img
                src={img.url}
                className="w-40 h-40 object-cover border border-pink-300 rounded"
              />
              <button
                onClick={() => removeExistingImage(i)}
                className="absolute top-0 right-0 bg-red-500 text-white p-1 rounded-full cursor-pointer hover:bg-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* New Images */}
      <div>
        <h2 className="font-semibold text-lg my-2">
          Add New Images
        </h2>

        <div className="space-y-3">
          {newImages.map((img, i) => (
            <div key={i} className="flex items-center gap-3 bg-stone-50 p-2 rounded-lg border">
              <Input
                type="file"
                onChange={(e) => updateNewImage(i, e.target.files[0])}
                className="flex-1"
              />
              {img.file && (
                <img
                  src={URL.createObjectURL(img.file)}
                  className="flex-shrink-0 w-32 h-32 object-cover rounded"
                />
              )}
              <Button
                className="bg-pink-500 text-white hover:bg-pink-600 cursor-pointer"
                onClick={addNewImageField}
                disabled={!canAddImage}
              >
                Add Another
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-center mt-4">
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-pink-500 hover:bg-pink-600 text-white px-8 cursor-pointer"
        >
          {submitting ? "Updating..." : "Update Product"}
        </Button>
      </div>
    </div>
  );
}
