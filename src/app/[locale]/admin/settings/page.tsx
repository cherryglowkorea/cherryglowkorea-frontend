"use client";

import { useEffect, useState } from "react";
import {
  Store,
  Truck,
  CreditCard,
  Share2,
  Save,
  RefreshCw,
  Sparkles,
  CheckCircle2,
  Globe,
  Lock,
  Phone,
  Mail,
  MapPin,
  DollarSign,
  Tag,
  Search,
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";
import ImageUploader from "@/components/ui/ImageUploader";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const [formData, setFormData] = useState({
    storeName: "Cherry Glow",
    storeTagline: "Premium K-Beauty Skincare & Cosmetic Products",
    storeEmail: "support@cherryglowkorea.com",
    storePhone: "+880 1700-000000",
    storeAddress: "Dhaka, Bangladesh",
    logoUrl: "",
    currencySymbol: "৳",
    shipping: {
      insideDhaka: 60,
      outsideDhaka: 120,
      subDhaka: 100,
      freeShippingThreshold: 3000,
      estimatedDhakaDays: "1-2 Days",
      estimatedOutsideDays: "3-5 Days",
    },
    payments: {
      enableCOD: true,
      enableOnlinePayment: true,
      bkashNumber: "+8801700000000",
      paymentInstructions: "Pay via bKash Merchant or Cash on Delivery at your doorstep.",
    },
    social: {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
      whatsapp: "+8801700000000",
      tiktok: "https://tiktok.com",
      youtube: "https://youtube.com",
    },
    seo: {
      metaTitle: "Cherry Glow - Authentic Korean Beauty & Skincare in Bangladesh",
      metaDescription: "Shop authentic Korean skincare, serums, moisturizers & sunscreens in Bangladesh with fast nationwide delivery.",
      keywords: "K-Beauty, Korean Skincare Bangladesh, Cherry Glow, Dokdo Cleanser, Sunscreen",
      pixelId: "",
    },
  });

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    return token;
  };

  /* ---------------- Fetch Store Settings ---------------- */
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/settings`);
      if (res.data.success && res.data.data) {
        setFormData((prev) => ({
          ...prev,
          ...res.data.data,
          shipping: { ...prev.shipping, ...(res.data.data.shipping || {}) },
          payments: { ...prev.payments, ...(res.data.data.payments || {}) },
          social: { ...prev.social, ...(res.data.data.social || {}) },
          seo: { ...prev.seo, ...(res.data.data.seo || {}) },
        }));
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load store settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleChange = (path, value) => {
    const keys = path.split(".");
    setFormData((prev) => {
      const copy = JSON.parse(JSON.stringify(prev));
      let curr = copy;
      for (let i = 0; i < keys.length - 1; i++) {
        if (!curr[keys[i]]) curr[keys[i]] = {};
        curr = curr[keys[i]];
      }
      curr[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  const handleSubmit = async (e: any) => {
    if (e) e.preventDefault();
    try {
      setSaving(true);
      const { _id, ...cleanPayload } = formData as any;
      const authToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;

      const res = await axios.put(`${API_BASE}/admin/settings`, cleanPayload, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (res.data.success) {
        toast.success("Store settings saved successfully!");
        if (res.data.data) {
          setFormData((prev) => ({ ...prev, ...res.data.data }));
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General Profile", icon: Store },
    { id: "shipping", label: "Shipping & Rates", icon: Truck },
    { id: "payments", label: "Payment Options", icon: CreditCard },
    { id: "social", label: "Social & Links", icon: Share2 },
    { id: "seo", label: "SEO & Meta", icon: Globe },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-rose-500" />
          <p className="text-sm font-medium text-stone-600 dark:text-rose-200">
            Loading Store Settings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent p-6 rounded-3xl border border-stone-200 dark:border-rose-900/40 bg-white/70 dark:bg-[#160E12]/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-rose-50 flex items-center gap-2">
              Store & System Settings
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" /> Live Config
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-rose-300/70 mt-1">
            Configure store branding, shipping rates, payment gateways, and SEO metadata.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all disabled:opacity-50 self-start sm:self-auto cursor-pointer"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
        </button>
      </div>

      {/* 2. Navigation Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar border-b border-stone-200 dark:border-rose-900/40">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? "bg-rose-600 text-white shadow-xs"
                  : "bg-white dark:bg-rose-950/60 text-stone-700 dark:text-rose-200 border border-stone-200 dark:border-rose-900/40 hover:bg-stone-100 dark:hover:bg-rose-900/40"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 3. Form Content Body */}
      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-stone-200 dark:border-rose-900/40 bg-white dark:bg-[#180f14] p-6 shadow-xs space-y-6"
      >
        {/* TAB 1: GENERAL PROFILE */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 dark:border-rose-900/30 pb-3">
              <h2 className="text-base font-bold text-stone-900 dark:text-rose-100 flex items-center gap-2">
                <Store className="h-4.5 w-4.5 text-rose-500" /> Store Branding & Contact
              </h2>
              <p className="text-xs text-stone-500 dark:text-rose-300/70 mt-0.5">
                Main business information displayed on invoices, footer, and emails.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Store Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  Store Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.storeName || ""}
                  onChange={(e) => handleChange("storeName", e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 dark:text-rose-100 focus:border-rose-500 focus:outline-none"
                  required
                />
              </div>

              {/* Currency Symbol */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  Currency Symbol <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.currencySymbol || "৳"}
                  onChange={(e) => handleChange("currencySymbol", e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 dark:text-rose-100 font-bold focus:border-rose-500 focus:outline-none"
                  required
                />
              </div>

              {/* Support Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  Support Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.storeEmail || ""}
                  onChange={(e) => handleChange("storeEmail", e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 dark:text-rose-100 focus:border-rose-500 focus:outline-none"
                  required
                />
              </div>

              {/* Support Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  Support Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.storePhone || ""}
                  onChange={(e) => handleChange("storePhone", e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 dark:text-rose-100 font-mono focus:border-rose-500 focus:outline-none"
                  required
                />
              </div>

              {/* Tagline */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  Store Tagline / Slogan
                </label>
                <input
                  type="text"
                  value={formData.storeTagline || ""}
                  onChange={(e) => handleChange("storeTagline", e.target.value)}
                  placeholder="Premium K-Beauty Skincare & Cosmetic Products"
                  className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 dark:text-rose-100 focus:border-rose-500 focus:outline-none"
                />
              </div>

              {/* Store Address */}
              <div className="md:col-span-2 space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  Store Physical Address
                </label>
                <textarea
                  rows={2}
                  value={formData.storeAddress || ""}
                  onChange={(e) => handleChange("storeAddress", e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 dark:text-rose-100 focus:border-rose-500 focus:outline-none resize-none"
                />
              </div>

              {/* Store Logo Uploader */}
              <div className="md:col-span-2">
                <ImageUploader
                  label="Store Logo Image (PC / Mobile Upload to Cloudinary)"
                  value={formData.logoUrl || ""}
                  onChange={(url) => handleChange("logoUrl", url)}
                  folder="cherry-glow/branding"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SHIPPING & LOGISTICS */}
        {activeTab === "shipping" && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 dark:border-rose-900/30 pb-3">
              <h2 className="text-base font-bold text-stone-900 dark:text-rose-100 flex items-center gap-2">
                <Truck className="h-4.5 w-4.5 text-amber-500" /> Logistics & Shipping Rates
              </h2>
              <p className="text-xs text-stone-500 dark:text-rose-300/70 mt-0.5">
                Set shipping fees, free shipping order thresholds, and estimated delivery times.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Inside Dhaka */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  Inside Dhaka Shipping (৳) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.shipping?.insideDhaka ?? 60}
                  onChange={(e) => handleChange("shipping.insideDhaka", Number(e.target.value))}
                  className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 dark:text-rose-100 font-mono font-bold focus:border-rose-500 focus:outline-none"
                  required
                />
              </div>

              {/* Outside Dhaka */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  Outside Dhaka Shipping (৳) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.shipping?.outsideDhaka ?? 120}
                  onChange={(e) => handleChange("shipping.outsideDhaka", Number(e.target.value))}
                  className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 dark:text-rose-100 font-mono font-bold focus:border-rose-500 focus:outline-none"
                  required
                />
              </div>

              {/* Free Shipping Threshold */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  Free Shipping Order Minimum (৳)
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.shipping?.freeShippingThreshold ?? 3000}
                  onChange={(e) =>
                    handleChange("shipping.freeShippingThreshold", Number(e.target.value))
                  }
                  className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 dark:text-rose-100 font-mono font-bold focus:border-rose-500 focus:outline-none"
                />
              </div>

              {/* Delivery Days Estimate Inside */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  Estimated Delivery Days (Inside Dhaka)
                </label>
                <input
                  type="text"
                  placeholder="1-2 Days"
                  value={formData.shipping?.estimatedDhakaDays || "1-2 Days"}
                  onChange={(e) => handleChange("shipping.estimatedDhakaDays", e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs text-stone-900 dark:text-rose-100 focus:border-rose-500 focus:outline-none"
                />
              </div>

              {/* Delivery Days Estimate Outside */}
              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  Estimated Delivery Days (Outside Dhaka)
                </label>
                <input
                  type="text"
                  placeholder="3-5 Days"
                  value={formData.shipping?.estimatedOutsideDays || "3-5 Days"}
                  onChange={(e) => handleChange("shipping.estimatedOutsideDays", e.target.value)}
                  className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs text-stone-900 dark:text-rose-100 focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: PAYMENTS */}
        {activeTab === "payments" && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 dark:border-rose-900/30 pb-3">
              <h2 className="text-base font-bold text-stone-900 dark:text-rose-100 flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-rose-500" /> Payment Methods & Toggles
              </h2>
              <p className="text-xs text-stone-500 dark:text-rose-300/70 mt-0.5">
                Enable or disable specific payment options shown during checkout.
              </p>
            </div>

            <div className="space-y-4">
              {/* COD Toggle Card */}
              <label className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 dark:border-rose-900/40 bg-stone-50/70 dark:bg-rose-950/20 cursor-pointer hover:border-rose-400 transition-all">
                <div>
                  <p className="text-sm font-bold text-stone-900 dark:text-rose-100">
                    Cash On Delivery (COD)
                  </p>
                  <p className="text-xs text-stone-500 dark:text-rose-300/70">
                    Allow customers to pay in cash upon delivery at their door.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.payments?.enableCOD ?? true}
                  onChange={(e) => handleChange("payments.enableCOD", e.target.checked)}
                  className="h-5 w-5 rounded border-stone-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
              </label>

              {/* Online Payment Toggle Card */}
              <label className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 dark:border-rose-900/40 bg-stone-50/70 dark:bg-rose-950/20 cursor-pointer hover:border-rose-400 transition-all">
                <div>
                  <p className="text-sm font-bold text-stone-900 dark:text-rose-100">
                    Online Digital Payment (bKash / Nagad / Cards / SSLCommerz)
                  </p>
                  <p className="text-xs text-stone-500 dark:text-rose-300/70">
                    Enable digital card, mobile banking, and gateway payments.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.payments?.enableOnlinePayment ?? true}
                  onChange={(e) => handleChange("payments.enableOnlinePayment", e.target.checked)}
                  className="h-5 w-5 rounded border-stone-300 text-rose-600 focus:ring-rose-500 cursor-pointer"
                />
              </label>

              {/* bKash Merchant Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                    bKash / Nagad Merchant Number
                  </label>
                  <input
                    type="text"
                    value={formData.payments?.bkashNumber || ""}
                    onChange={(e) => handleChange("payments.bkashNumber", e.target.value)}
                    placeholder="+8801700000000"
                    className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs text-stone-900 dark:text-rose-100 font-mono focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                    Payment Note / Instructions
                  </label>
                  <input
                    type="text"
                    value={formData.payments?.paymentInstructions || ""}
                    onChange={(e) => handleChange("payments.paymentInstructions", e.target.value)}
                    placeholder="Pay via bKash Merchant or Cash on Delivery"
                    className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs text-stone-900 dark:text-rose-100 focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: SOCIAL LINKS */}
        {activeTab === "social" && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 dark:border-rose-900/30 pb-3">
              <h2 className="text-base font-bold text-stone-900 dark:text-rose-100 flex items-center gap-2">
                <Share2 className="h-4.5 w-4.5 text-rose-500" /> Social & Communication Links
              </h2>
              <p className="text-xs text-stone-500 dark:text-rose-300/70 mt-0.5">
                Links displayed in the site footer, contact page, and floating chat button.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Facebook */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  Facebook Page URL
                </label>
                <input
                  type="text"
                  value={formData.social?.facebook || ""}
                  onChange={(e) => handleChange("social.facebook", e.target.value)}
                  placeholder="https://facebook.com/cherryglow"
                  className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs text-stone-900 dark:text-rose-100 focus:border-rose-500 focus:outline-none"
                />
              </div>

              {/* Instagram */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  Instagram Profile URL
                </label>
                <input
                  type="text"
                  value={formData.social?.instagram || ""}
                  onChange={(e) => handleChange("social.instagram", e.target.value)}
                  placeholder="https://instagram.com/cherryglow"
                  className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs text-stone-900 dark:text-rose-100 focus:border-rose-500 focus:outline-none"
                />
              </div>

              {/* WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  WhatsApp Support Number
                </label>
                <input
                  type="text"
                  value={formData.social?.whatsapp || ""}
                  onChange={(e) => handleChange("social.whatsapp", e.target.value)}
                  placeholder="+8801700000000"
                  className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs text-stone-900 dark:text-rose-100 font-mono focus:border-rose-500 focus:outline-none"
                />
              </div>

              {/* TikTok */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  TikTok Channel URL
                </label>
                <input
                  type="text"
                  value={formData.social?.tiktok || ""}
                  onChange={(e) => handleChange("social.tiktok", e.target.value)}
                  placeholder="https://tiktok.com/@cherryglow"
                  className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs text-stone-900 dark:text-rose-100 focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: SEO & META */}
        {activeTab === "seo" && (
          <div className="space-y-6">
            <div className="border-b border-stone-100 dark:border-rose-900/30 pb-3">
              <h2 className="text-base font-bold text-stone-900 dark:text-rose-100 flex items-center gap-2">
                <Globe className="h-4.5 w-4.5 text-blue-500" /> SEO & Search Engine Metadata
              </h2>
              <p className="text-xs text-stone-500 dark:text-rose-300/70 mt-0.5">
                Search engine optimization tags for Google search results and Meta Pixel tracking.
              </p>
            </div>

            <div className="space-y-4">
              {/* Meta Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  Global Meta Title
                </label>
                <input
                  type="text"
                  value={formData.seo?.metaTitle || ""}
                  onChange={(e) => handleChange("seo.metaTitle", e.target.value)}
                  placeholder="Cherry Glow - Authentic Korean Beauty & Skincare in Bangladesh"
                  className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs text-stone-900 dark:text-rose-100 focus:border-rose-500 focus:outline-none"
                />
              </div>

              {/* Meta Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  Global Meta Description
                </label>
                <textarea
                  rows={3}
                  value={formData.seo?.metaDescription || ""}
                  onChange={(e) => handleChange("seo.metaDescription", e.target.value)}
                  placeholder="Shop authentic Korean skincare, serums, moisturizers & sunscreens in Bangladesh with fast nationwide delivery."
                  className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs text-stone-900 dark:text-rose-100 focus:border-rose-500 focus:outline-none resize-none"
                />
              </div>

              {/* Keywords */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                  Meta Keywords (Comma separated)
                </label>
                <input
                  type="text"
                  value={formData.seo?.keywords || ""}
                  onChange={(e) => handleChange("seo.keywords", e.target.value)}
                  placeholder="K-Beauty, Korean Skincare Bangladesh, Cherry Glow, Sunscreen"
                  className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs text-stone-900 dark:text-rose-100 focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Form Submit Footer */}
        <div className="pt-4 border-t border-stone-100 dark:border-rose-900/30 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold text-xs shadow-md hover:shadow-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            {saving ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            <span>{saving ? "Saving Changes..." : "Save All Store Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
