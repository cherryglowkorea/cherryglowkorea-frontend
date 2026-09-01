"use client";

import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Search,
  Plus,
  Minus,
  Trash2,
  User,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  Sparkles,
  CheckCircle2,
  DollarSign,
  Package,
  X,
  CreditCard,
  Truck,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import useDebounce from "@/lib/useDebounce";

export default function CreateOrderPage() {
  const router = useRouter();
  const API = `${process.env.NEXT_PUBLIC_API_URL}`;

  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Product Selection
  const [search, setSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [variant, setVariant] = useState(null);
  const [qty, setQty] = useState(1);

  // Order Cart Items
  const [items, setItems] = useState([]);

  // Customer Details
  const [customer, setCustomer] = useState({
    name: "",
    phone: "",
    address: "",
    email: "",
  });

  // Price Adjustments
  const [discount, setDiscount] = useState(0);
  const [shipping, setShipping] = useState(60); // Default Dhaka shipping
  const [storeSettings, setStoreSettings] = useState<any>(null);

  const debouncedSearch = useDebounce(search, 300);

  // Fetch store settings for dynamic shipping
  useEffect(() => {
    axios
      .get(`${API}/settings`)
      .then((res) => {
        if (res.data?.success && res.data?.data) {
          setStoreSettings(res.data.data);
          if (res.data.data.shipping?.insideDhaka) {
            setShipping(Number(res.data.data.shipping.insideDhaka));
          }
        }
      })
      .catch(() => {});
  }, [API]);

  // Fetch all products for admin
  useEffect(() => {
    setLoadingProducts(true);
    axios
      .get(`${API}/products/allProduct`)
      .then((res) => {
        setProducts(res.data || []);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        toast.error("Failed to load product catalog");
      })
      .finally(() => setLoadingProducts(false));
  }, [API]);

  // Filtered products list
  const filteredProducts = useMemo(() => {
    if (!debouncedSearch) return [];
    const q = debouncedSearch.toLowerCase().trim();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.brand && p.brand.toLowerCase().includes(q))
    );
  }, [debouncedSearch, products]);

  // Auto-select first variant when product selected
  const handleSelectProduct = (prod) => {
    setSelectedProduct(prod);
    setSearch(prod.name);
    if (prod.variants && prod.variants.length > 0) {
      setVariant(prod.variants[0]);
    } else {
      setVariant(null);
    }
    setQty(1);
  };

  // Add Item to Order Cart
  const addItem = () => {
    if (!selectedProduct) return toast.error("Please select a product first");
    if (selectedProduct.variants?.length > 0 && !variant) {
      return toast.error("Please select a product variant");
    }

    const itemPrice = Number(variant?.price) || Number(selectedProduct.price) || Number(selectedProduct.salePrice) || 0;

    const exists = items.find(
      (i) =>
        i.productId === selectedProduct._id &&
        (variant ? i.variant?.weight === variant.weight && i.variant?.unit === variant.unit : true)
    );

    if (exists) {
      setItems((prev) =>
        prev.map((i) =>
          i === exists ? { ...i, quantity: i.quantity + qty } : i
        )
      );
      toast.success(`Updated quantity for ${selectedProduct.name}`);
    } else {
      setItems((prev) => [
        ...prev,
        {
          productId: selectedProduct._id,
          name: selectedProduct.name,
          brand: selectedProduct.brand || "",
          image: selectedProduct.images?.[0]?.url || selectedProduct.thumbnail || "",
          variant: variant
            ? {
                weight: variant.weight || "",
                unit: variant.unit || "",
                size: variant.size || "",
              }
            : null,
          price: itemPrice,
          quantity: qty,
        },
      ]);
      toast.success(`Added ${selectedProduct.name} to order`);
    }

    // Reset selection input
    setSelectedProduct(null);
    setVariant(null);
    setQty(1);
    setSearch("");
  };

  // Remove Item from Cart
  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
    toast.info("Item removed");
  };

  // Update Item Quantity
  const updateItemQty = (index, delta) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i === index) {
          const newQty = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQty };
        }
        return item;
      })
    );
  };

  // Subtotal Calculation
  const subtotal = useMemo(() => {
    return items.reduce((sum, i) => sum + (i.price * i.quantity), 0);
  }, [items]);

  // Grand Total Calculation
  const grandTotal = useMemo(() => {
    const safeSub = Number(subtotal) || 0;
    const safeDisc = Number(discount) || 0;
    const safeShip = Number(shipping) || 0;
    return Math.max(0, safeSub - safeDisc + safeShip);
  }, [subtotal, discount, shipping]);

  // Create Order Handler
  const handleCreateOrder = async () => {
    if (!customer.name.trim()) return toast.error("Customer name is required");
    if (!customer.phone.trim()) return toast.error("Customer phone number is required");
    if (!customer.address.trim()) return toast.error("Shipping address is required");
    if (items.length === 0) return toast.error("Please add at least one product to the order");

    try {
      setIsSubmitting(true);
      const token = localStorage.getItem("token");

      const payload = {
        customer: {
          name: customer.name.trim(),
          phone: customer.phone.trim(),
          address: customer.address.trim(),
          email: customer.email.trim(),
        },
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          brand: item.brand,
          quantity: item.quantity,
          price: item.price,
          variant: item.variant,
        })),
        subtotal: Number(subtotal),
        discount: Number(discount),
        shipping: Number(shipping),
        total: Number(grandTotal),
        status: "pending",
        source: "admin",
      };

      const response = await axios.post(`${API}/orders/admin-create`, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 201 || response.data?.success) {
        toast.success("Order created successfully!");
        router.push("/admin/orders");
      }
    } catch (err) {
      console.error("Order creation error:", err);
      toast.error(err?.response?.data?.message || "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      {/* Page Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-stone-800/80 pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/orders"
            className="p-2 rounded-xl bg-stone-100 dark:bg-[#161113] border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
              Create Manual Order
            </h1>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Create custom orders for phone, POS, or Facebook/WhatsApp customers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 dark:text-stone-400">
          <span>Manual Entry Mode</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Customer Form & Product Catalog (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Details Card */}
          <div className="p-6 rounded-3xl border border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800/60 pb-3">
              <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-base">
                <User className="h-5 w-5 text-rose-500" /> Customer Information
              </div>
              <span className="text-xs text-stone-400 dark:text-stone-500 font-mono">
                Required for Delivery
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  Customer Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
                  <input
                    type="text"
                    placeholder="e.g. Farhan Rahman"
                    value={customer.name}
                    onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    className="w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] py-2.5 pl-9 pr-4 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:border-rose-500/80 focus:outline-none focus:ring-1 focus:ring-rose-500/20 transition-colors"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
                  <input
                    type="text"
                    placeholder="01700000000"
                    value={customer.phone}
                    onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    className="w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] py-2.5 pl-9 pr-4 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 font-mono focus:border-rose-500/80 focus:outline-none focus:ring-1 focus:ring-rose-500/20 transition-colors"
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                  Email Address (Optional)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
                  <input
                    type="email"
                    placeholder="customer@email.com"
                    value={customer.email}
                    onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                    className="w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] py-2.5 pl-9 pr-4 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:border-rose-500/80 focus:outline-none focus:ring-1 focus:ring-rose-500/20 transition-colors"
                  />
                </div>
              </div>

              {/* Address */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-stone-700 dark:text-stone-300 flex items-center gap-1">
                  Delivery Address <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-stone-400 dark:text-stone-500" />
                  <textarea
                    rows={2}
                    placeholder="House/Street, Thana, District"
                    value={customer.address}
                    onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                    className="w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] py-2.5 pl-9 pr-4 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:border-rose-500/80 focus:outline-none focus:ring-1 focus:ring-rose-500/20 resize-none transition-colors"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Product Search & Selector Card */}
          <div className="p-6 rounded-3xl border border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113] shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800/60 pb-3">
              <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-base">
                <Package className="h-5 w-5 text-rose-500" /> Select Products
              </div>
              <span className="text-xs text-stone-400 dark:text-stone-500 font-mono">
                {products.length} products available
              </span>
            </div>

            {/* Product Search Bar */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search catalog by product name or brand..."
                className="w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] py-3 pl-10 pr-10 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:border-rose-500/80 focus:outline-none focus:ring-1 focus:ring-rose-500/20 transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {/* Autocomplete Search Results Dropdown */}
              {search && filteredProducts.length > 0 && (
                <div className="absolute z-20 top-full left-0 right-0 mt-2 bg-white dark:bg-[#181215] border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xl max-h-60 overflow-y-auto divide-y divide-stone-100 dark:divide-stone-800/60">
                  {filteredProducts.map((p) => (
                    <div
                      key={p._id}
                      onClick={() => handleSelectProduct(p)}
                      className="p-3 hover:bg-stone-100 dark:hover:bg-white/5 cursor-pointer flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {(p.images?.[0]?.url || p.thumbnail) ? (
                          <img
                            src={p.images?.[0]?.url || p.thumbnail}
                            alt={p.name}
                            className="h-9 w-9 rounded-lg object-cover border border-stone-200 dark:border-stone-800"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-xs font-bold text-stone-400">
                            PROD
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400">
                            {p.brand ? `${p.brand} • ` : ""}
                            {p.variants?.length || 0} variants
                          </p>
                        </div>
                      </div>

                      <span className="font-bold text-xs text-rose-500 dark:text-rose-400 font-mono">
                        ৳ {p.price || p.variants?.[0]?.price || 0}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Product Configurator Card */}
            {selectedProduct ? (
              <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-[#0d0709] space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                      {selectedProduct.name}
                    </h4>
                    {selectedProduct.brand && (
                      <span className="text-xs text-stone-500 dark:text-stone-400">
                        Brand: {selectedProduct.brand}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProduct(null);
                      setVariant(null);
                      setSearch("");
                    }}
                    className="p-1 rounded text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Variant Chips Selector */}
                {selectedProduct.variants && selectedProduct.variants.length > 0 && (
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-stone-700 dark:text-stone-300">
                      Select Variant:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedProduct.variants.map((v, idx) => {
                        const isSelected =
                          variant?.weight === v.weight && variant?.unit === v.unit;
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setVariant(v)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all border ${
                              isSelected
                                ? "bg-rose-600 text-white border-rose-600 shadow-xs font-bold"
                                : "bg-white dark:bg-[#161113] border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:border-stone-400 dark:hover:border-stone-600"
                            }`}
                          >
                            {v.weight} {v.unit} (৳{v.price})
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity Selector & Add Button */}
                <div className="flex items-center justify-between gap-4 pt-3 border-t border-stone-200 dark:border-stone-800/60">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-stone-700 dark:text-stone-300">
                      Quantity:
                    </span>
                    <div className="flex items-center rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#161113] overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                        className="p-1.5 text-stone-500 hover:bg-stone-100 dark:hover:bg-white/5"
                      >
                        <Minus className="h-3.5 w-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold font-mono text-stone-900 dark:text-stone-100">
                        {qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => setQty((q) => q + 1)}
                        className="p-1.5 text-stone-500 hover:bg-stone-100 dark:hover:bg-white/5"
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={addItem}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    <Plus className="h-4 w-4" /> Add to Order
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-8 border-2 border-dashed border-stone-200 dark:border-stone-800 rounded-2xl text-center space-y-2">
                <Search className="h-8 w-8 mx-auto text-stone-300 dark:text-stone-700" />
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Type a product name in the search bar above to configure and add it to the order cart.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary & Placement (5 Cols Sticky) */}
        <div className="lg:col-span-5 space-y-6 sticky top-20">
          <div className="p-6 rounded-3xl border border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113] shadow-md space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800/60 pb-3">
              <div className="flex items-center gap-2 text-stone-900 dark:text-stone-100 font-bold text-base">
                <ShoppingBag className="h-5 w-5 text-rose-500" /> Order Receipt & Summary
              </div>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300">
                {items.length} {items.length === 1 ? "Item" : "Items"}
              </span>
            </div>

            {/* Selected Items Cart List */}
            {items.length === 0 ? (
              <div className="py-8 text-center text-stone-400 dark:text-stone-500 space-y-1">
                <ShoppingBag className="h-10 w-10 mx-auto text-stone-300 dark:text-stone-700" />
                <p className="text-xs font-medium">Order cart is empty</p>
                <p className="text-[11px]">Select items from the left catalog</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1 divide-y divide-stone-100 dark:divide-stone-800/60">
                {items.map((item, index) => (
                  <div
                    key={`${item.productId}-${item.variant?.weight}-${index}`}
                    className="pt-3 first:pt-0 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-11 w-11 rounded-xl object-cover border border-stone-200 dark:border-stone-800 shrink-0"
                        />
                      ) : (
                        <div className="h-11 w-11 rounded-xl bg-stone-100 dark:bg-stone-800 flex items-center justify-center text-[10px] font-bold text-stone-400 shrink-0">
                          IMG
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">
                          {item.name}
                        </p>
                        {item.variant ? (
                          <p className="text-[11px] text-stone-500 dark:text-stone-400">
                            {[item.variant.weight, item.variant.unit, item.variant.size].filter((val) => Boolean(val) && String(val) !== "NaN").join(" ")} • ৳{item.price}
                          </p>
                        ) : (
                          <p className="text-[11px] text-stone-500 dark:text-stone-400">
                            ৳{item.price}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Quantity Stepper & Remove */}
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center rounded-lg border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709]">
                        <button
                          onClick={() => updateItemQty(index, -1)}
                          className="p-1 text-stone-500 hover:bg-stone-200 dark:hover:bg-white/10"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="px-2 text-xs font-bold font-mono text-stone-900 dark:text-stone-100">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateItemQty(index, 1)}
                          className="p-1 text-stone-500 hover:bg-stone-200 dark:hover:bg-white/10"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(index)}
                        className="p-1 text-stone-400 hover:text-rose-500 rounded"
                        title="Remove item"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Financial Calculations */}
            <div className="space-y-3 pt-3 border-t border-stone-200 dark:border-stone-800/80 text-xs">
              {/* Subtotal */}
              <div className="flex justify-between text-stone-600 dark:text-stone-300">
                <span>Subtotal</span>
                <span className="font-mono font-bold text-stone-900 dark:text-stone-100">৳ {subtotal.toLocaleString()}</span>
              </div>

              {/* Discount Input */}
              <div className="flex items-center justify-between gap-2">
                <span className="text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-emerald-500" /> Discount (৳)
                </span>
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => setDiscount(Math.max(0, Number(e.target.value) || 0))}
                  className="w-28 text-right rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] py-1.5 px-3 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-500 font-mono focus:border-rose-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Shipping Cost Input & Quick Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
                    <Truck className="h-3.5 w-3.5 text-amber-500" /> Shipping Cost (৳)
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={shipping}
                    onChange={(e) => setShipping(Math.max(0, Number(e.target.value) || 0))}
                    className="w-28 text-right rounded-xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] py-1.5 px-3 text-xs text-stone-900 dark:text-stone-100 placeholder-stone-500 font-mono focus:border-rose-500 focus:outline-none transition-colors"
                  />
                </div>

                {/* Presets */}
                <div className="flex items-center gap-1.5 justify-end flex-wrap">
                  {[
                    {
                      label: `Inside Dhaka (৳${storeSettings?.shipping?.insideDhaka ?? 60})`,
                      val: Number(storeSettings?.shipping?.insideDhaka ?? 60),
                    },
                    {
                      label: `Outside Dhaka (৳${storeSettings?.shipping?.outsideDhaka ?? 120})`,
                      val: Number(storeSettings?.shipping?.outsideDhaka ?? 120),
                    },
                    { label: "Free (৳0)", val: 0 },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setShipping(preset.val)}
                      className={`text-[10px] px-2.5 py-1 rounded-lg font-medium transition-all border ${
                        shipping === preset.val
                          ? "bg-amber-500 text-white border-amber-500 font-bold"
                          : "bg-stone-100 dark:bg-[#0d0709] border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Total Payable Box */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-[#0d0709] border border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <div>
                  <span className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    Grand Total
                  </span>
                  <p className="text-[10px] text-stone-500 dark:text-stone-400">
                    Includes taxes & delivery fee
                  </p>
                </div>
                <div className="text-xl font-black text-rose-500 dark:text-rose-400 font-mono">
                  ৳ {grandTotal.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={handleCreateOrder}
              disabled={isSubmitting || items.length === 0}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-extrabold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <span>Creating Order...</span>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Confirm & Create Order</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
