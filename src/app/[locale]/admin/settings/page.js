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
} from "lucide-react";
import axios from "axios";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const [formData, setFormData] = useState({
    storeName: "Cherry Glow",
    storeEmail: "support@cherryglowkorea.com",
    storePhone: "+880 1700-000000",
    storeAddress: "Dhaka, Bangladesh",
    currencySymbol: "৳",
    shipping: {
      insideDhaka: 60,
      outsideDhaka: 120,
      freeShippingThreshold: 3000,
    },
    payments: {
      enableCOD: true,
      enableOnlinePayment: true,
    },
    social: {
      facebook: "https://facebook.com",
      instagram: "https://instagram.com",
      whatsapp: "+8801700000000",
    },
  });

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    return token;
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await axios.get("http://localhost:5000/settings");
      if (res.data.success && res.data.data) {
        setFormData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load settings");
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
        curr = curr[keys[i]];
      }
      curr[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const token = getToken();

      const res = await axios.put("http://localhost:5000/admin/settings", formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.data.success) {
        toast.success("Store settings updated successfully!");
        if (res.data.data) setFormData(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: "general", label: "General Info", icon: Store },
    { id: "shipping", label: "Shipping & Delivery", icon: Truck },
    { id: "payments", label: "Payment Options", icon: CreditCard },
    { id: "social", label: "Social Links", icon: Share2 },
  ];

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-rose-500" />
          <p className="text-sm font-medium text-slate-400">Loading Store Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Store & System Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure store metadata, shipping costs, payment gateways, and social media handles.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-400 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-950 transition-all disabled:opacity-50"
        >
          {saving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{saving ? "Saving Changes..." : "Save Settings"}</span>
        </button>
      </div>

      {/* Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all
                ${
                  isActive
                    ? "bg-rose-600 text-white shadow-md shadow-rose-950 border border-rose-500"
                    : "bg-slate-900/80 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-800"
                }
              `}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-6">
        {/* 1. GENERAL TAB */}
        {activeTab === "general" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">General Store Profile</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Store Name</label>
                <input
                  type="text"
                  value={formData.storeName || ""}
                  onChange={(e) => handleChange("storeName", e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Currency Symbol</label>
                <input
                  type="text"
                  value={formData.currencySymbol || "৳"}
                  onChange={(e) => handleChange("currencySymbol", e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Support Email</label>
                <input
                  type="email"
                  value={formData.storeEmail || ""}
                  onChange={(e) => handleChange("storeEmail", e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Support Phone</label>
                <input
                  type="text"
                  value={formData.storePhone || ""}
                  onChange={(e) => handleChange("storePhone", e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">Store Physical Address</label>
                <textarea
                  rows={3}
                  value={formData.storeAddress || ""}
                  onChange={(e) => handleChange("storeAddress", e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* 2. SHIPPING TAB */}
        {activeTab === "shipping" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">Logistics & Shipping Rates</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Inside Dhaka Shipping (৳)</label>
                <input
                  type="number"
                  value={formData.shipping?.insideDhaka ?? 60}
                  onChange={(e) => handleChange("shipping.insideDhaka", Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Outside Dhaka Shipping (৳)</label>
                <input
                  type="number"
                  value={formData.shipping?.outsideDhaka ?? 120}
                  onChange={(e) => handleChange("shipping.outsideDhaka", Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Free Shipping Order Min (৳)</label>
                <input
                  type="number"
                  value={formData.shipping?.freeShippingThreshold ?? 3000}
                  onChange={(e) => handleChange("shipping.freeShippingThreshold", Number(e.target.value))}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* 3. PAYMENTS TAB */}
        {activeTab === "payments" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">Payment Methods & Gateways</h2>
            <div className="space-y-3">
              <label className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-white">Cash On Delivery (COD)</p>
                  <p className="text-[11px] text-slate-400">Allow customers to pay cash when product is delivered</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.payments?.enableCOD ?? true}
                  onChange={(e) => handleChange("payments.enableCOD", e.target.checked)}
                  className="h-5 w-5 rounded border-slate-700 text-rose-600 focus:ring-rose-500"
                />
              </label>

              <label className="flex items-center justify-between p-4 rounded-xl border border-slate-800 bg-slate-950 cursor-pointer">
                <div>
                  <p className="text-xs font-bold text-white">Online Payment (SSLCommerz / bKash / Stripe)</p>
                  <p className="text-[11px] text-slate-400">Enable digital card & mobile banking payment gateways</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.payments?.enableOnlinePayment ?? true}
                  onChange={(e) => handleChange("payments.enableOnlinePayment", e.target.checked)}
                  className="h-5 w-5 rounded border-slate-700 text-rose-600 focus:ring-rose-500"
                />
              </label>
            </div>
          </div>
        )}

        {/* 4. SOCIAL TAB */}
        {activeTab === "social" && (
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">Social & Communication Links</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Facebook Page URL</label>
                <input
                  type="text"
                  value={formData.social?.facebook || ""}
                  onChange={(e) => handleChange("social.facebook", e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Instagram URL</label>
                <input
                  type="text"
                  value={formData.social?.instagram || ""}
                  onChange={(e) => handleChange("social.instagram", e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp Support Number</label>
                <input
                  type="text"
                  value={formData.social?.whatsapp || ""}
                  onChange={(e) => handleChange("social.whatsapp", e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 px-3.5 text-xs text-white focus:border-rose-500 focus:outline-none"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Footer */}
        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-950 transition-all disabled:opacity-50"
          >
            {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span>{saving ? "Saving Changes..." : "Save All Settings"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
