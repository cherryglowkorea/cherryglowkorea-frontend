"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, Plus } from "lucide-react";

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

export default function CreateProductPage() {
  const router = useRouter();

  const [submitting, setSubmitting] = useState(false);
  const [imageFields, setImageFields] = useState([{ file: null }]);
  
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
    price: "", // Custom override for combo regular price
    salePrice: "", // Custom override for combo sale price
  });

  const [variants, setVariants] = useState([
    { weight: "", unit: "ml", price: "", stock: "" },
  ]);

  // Combo specific states
  const [allSingleProducts, setAllSingleProducts] = useState([]);
  const [selectedComboProducts, setSelectedComboProducts] = useState([]);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    return token;
  };

  /* ---------------- Fetch Products list for Combo Components ---------------- */
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        const token = getToken();
        const res = await axios.get(`${API_BASE}/products/allProduct`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAllSingleProducts((res.data || []).filter(p => p.type !== "combo"));
      } catch (err) {
        console.error("Failed to load products list for combo selection", err);
      }
    };
    fetchAllProducts();
  }, [API_BASE]);

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
  const addVariant = () => {
    setVariants([
      ...variants,
      { weight: "", unit: "ml", price: "", stock: "" },
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

  /* ---------------- Images ---------------- */
  const updateImage = (index, file) => {
    const updated = [...imageFields];
    updated[index].file = file;
    setImageFields(updated);
  };

  const addImageField = () => {
    setImageFields([...imageFields, { file: null }]);
  };

  const removeImageField = (index) => {
    setImageFields(imageFields.filter((_, i) => i !== index));
  };

  const canAddMoreImages =
    imageFields.length > 0 && imageFields[imageFields.length - 1].file !== null;

  /* ---------------- Validation ---------------- */
  const validate = () => {
    if (!form.name.trim()) return toast.error("Name required");
    if (!form.category) return toast.error("Category required");

    if (form.type === "combo") {
      if (selectedComboProducts.length < 2) {
        return toast.error("A combo must contain at least 2 products");
      }
    } else {
      for (let v of variants) {
        if (!v.price || Number(v.price) <= 0)
          return toast.error("Invalid variant price");
      }
    }

    if (
      form.discountType !== "none" &&
      (!form.discountValue || Number(form.discountValue) <= 0)
    ) {
      return toast.error("Invalid discount value");
    }

    return true;
  };

  /* ---------------- Submit ---------------- */
  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitting(true);
      const token = await getToken();
      const formData = new FormData();

      // Basic fields
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null) {
          formData.append(k, String(v));
        }
      });

      // Images
      imageFields.forEach((imgObj) => {
        if (imgObj.file) {
          formData.append("images", imgObj.file);
        }
      });

      let endpointUrl = "";

      if (form.type === "combo") {
        // Prepare comboProducts stringified payload
        formData.append(
          "comboProducts",
          JSON.stringify(
            selectedComboProducts.map((p) => ({
              productId: p.productId,
              quantity: p.quantity,
            }))
          )
        );

        // Price overrides if not customized
        const finalPrice = form.price ? Number(form.price) : calculatedRegularPrice;
        const finalSalePrice = form.salePrice ? Number(form.salePrice) : calculatedSalePrice;
        
        formData.set("price", String(finalPrice));
        formData.set("salePrice", String(finalSalePrice));

        endpointUrl = `${API_BASE}/combos`;
      } else {
        // Single Product payload
        formData.append("variants", JSON.stringify(variants));
        endpointUrl = `${API_BASE}/products/addProduct`;
      }

      await axios.post(endpointUrl, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Product created successfully");

      setTimeout(() => {
        router.replace("/admin/products");
      }, 1000);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Creation failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-2xl font-bold">Create Product</h1>

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
        placeholder="Product Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />

      <Input
        placeholder="Brand"
        value={form.brand}
        onChange={(e) => setForm({ ...form, brand: e.target.value })}
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
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
      />

      <Textarea
        placeholder="Use Case"
        value={form.useCase}
        onChange={(e) => setForm({ ...form, useCase: e.target.value })}
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

      {/* Single Product: Variants Section */}
      {form.type !== "combo" && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-lg">Variants</h2>
            <Button
              className="bg-pink-500 text-white hover:bg-pink-600 cursor-pointer"
              onClick={addVariant}
            >
              Add Variant
            </Button>
          </div>

          <motion.div layout className="space-y-3">
            <AnimatePresence>
              {variants.map((v, i) => (
                <motion.div
                  key={i}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex gap-2 bg-stone-50 p-2 rounded-lg border"
                >
                  <Input
                    placeholder="Weight"
                    value={v.weight}
                    onChange={(e) => updateVariant(i, "weight", e.target.value)}
                  />

                  <Select
                    value={v.unit}
                    onValueChange={(val) => updateVariant(i, "unit", val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {UNITS.map((u) => (
                        <SelectItem key={u} value={u}>
                          {u}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    type="number"
                    placeholder="Price"
                    value={v.price}
                    onChange={(e) => updateVariant(i, "price", e.target.value)}
                  />

                  <Input
                    type="number"
                    placeholder="Stock"
                    value={v.stock}
                    onChange={(e) => updateVariant(i, "stock", e.target.value)}
                  />

                  {variants.length > 1 && (
                    <Button
                      variant="destructive"
                      onClick={() => removeVariant(i)}
                      className="cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>
      )}

      {/* Discount */}
      <div className="grid grid-cols-2 gap-3">
        <Select
          value={form.discountType}
          onValueChange={(v) => setForm({ ...form, discountType: v })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Discount Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Discount</SelectItem>
            <SelectItem value="percentage">Percentage</SelectItem>
            <SelectItem value="fixed">Fixed</SelectItem>
          </SelectContent>
        </Select>

        <Input
          type="number"
          placeholder="Discount Value"
          value={form.discountValue}
          onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
        />
      </div>

      {/* Toggles */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isFeatured}
            onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })}
          />
          Featured
        </label>

        <label className="flex items-center gap-2 text-stone-700 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isBestSelling}
            onChange={(e) => setForm({ ...form, isBestSelling: e.target.checked })}
          />
          Best Selling
        </label>
      </div>

      {/* Images */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-lg">Images</h2>
          <Button
            type="button"
            onClick={addImageField}
            disabled={!canAddMoreImages}
            className="bg-pink-500 text-white hover:bg-pink-600 cursor-pointer"
          >
            Add Another Image
          </Button>
        </div>

        <motion.div layout className="space-y-2">
          <AnimatePresence>
            {imageFields.map((img, i) => (
              <motion.div
                key={i}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex items-center gap-3 bg-stone-50 p-2 rounded-lg border"
              >
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => updateImage(i, e.target.files?.[0] || null)}
                  className="flex-1"
                />

                {img.file && (
                  <motion.img
                    src={URL.createObjectURL(img.file)}
                    className="flex-shrink-0 w-32 h-32 object-cover rounded"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                  />
                )}

                {imageFields.length > 1 && (
                  <Button
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={() => removeImageField(i)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Submit */}
      <div className="flex justify-center mt-4">
        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-pink-500 hover:bg-pink-600 text-white px-8 cursor-pointer"
        >
          {submitting ? "Creating..." : "Create Product"}
        </Button>
      </div>
    </div>
  );
}
