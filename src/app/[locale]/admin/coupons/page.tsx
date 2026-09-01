"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Tag,
  Plus,
  Trash2,
  Calendar,
  Percent,
  DollarSign,
  Search,
  Sparkles,
  CheckCircle2,
  XCircle,
  Clock,
  Check,
  X,
  RefreshCw,
  Gift,
} from "lucide-react";

export default function AdminCouponsPage() {
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State for New Coupon
  const [code, setCode] = useState("");
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [discountAmount, setDiscountAmount] = useState<number | "">(20);
  const [minPurchase, setMinPurchase] = useState<number | "">(0);
  const [maxDiscount, setMaxDiscount] = useState<number | "">("");
  const [usageLimit, setUsageLimit] = useState<number | "">(100);
  const [expiryDate, setExpiryDate] = useState<string>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [submitting, setSubmitting] = useState(false);

  // Fetch Coupons
  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_BASE}/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(res.data || []);
    } catch (err: any) {
      console.error("Failed to fetch coupons:", err);
      toast.error(err?.response?.data?.message || "Failed to load coupons");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // Create New Coupon Handler
  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return toast.error("Coupon code is required");
    if (!discountAmount || Number(discountAmount) <= 0) return toast.error("Enter a valid discount amount");

    try {
      setSubmitting(true);
      const token = localStorage.getItem("token");
      const payload = {
        code: code.trim().toUpperCase(),
        discountType,
        discountAmount: Number(discountAmount),
        minPurchase: Number(minPurchase) || 0,
        maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
        usageLimit: Number(usageLimit) || 100,
        expiryDate: new Date(expiryDate),
      };

      await axios.post(`${API_BASE}/coupons`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      toast.success(`Coupon ${payload.code} created successfully!`);
      setIsModalOpen(false);
      resetForm();
      fetchCoupons();
    } catch (err: any) {
      console.error("Create coupon error:", err);
      toast.error(err?.response?.data?.message || "Failed to create coupon");
    } finally {
      setSubmitting(false);
    }
  };

  // Toggle Coupon Status
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      await axios.put(
        `${API_BASE}/coupons/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success(`Coupon status updated to ${newStatus}`);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update status");
    }
  };

  // Delete Coupon
  const handleDeleteCoupon = async (id: string, couponCode: string) => {
    if (!confirm(`Are you sure you want to delete coupon ${couponCode}?`)) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_BASE}/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Coupon ${couponCode} deleted successfully`);
      fetchCoupons();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete coupon");
    }
  };

  const resetForm = () => {
    setCode("");
    setDiscountType("percentage");
    setDiscountAmount(20);
    setMinPurchase(0);
    setMaxDiscount("");
    setUsageLimit(100);
    setExpiryDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]);
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code?.toLowerCase().includes(search.toLowerCase().trim()) ||
      c.discountType?.toLowerCase().includes(search.toLowerCase().trim())
  );

  return (
    <div className="w-full space-y-8 pb-12">
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113]">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
            Coupons & Discounts Management
            <Tag className="h-6 w-6 text-rose-500" />
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Create custom percentage or fixed-amount discount coupons for checkout, custom combo bundles, and promotional campaigns.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all cursor-pointer shrink-0"
        >
          <Plus className="h-4 w-4" /> Create New Coupon
        </button>
      </div>

      {/* 2. Top Stats Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-[#161113] border border-stone-200 dark:border-stone-800/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center border border-rose-500/20 shrink-0">
            <Tag className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">Total Active Coupons</p>
            <h3 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 font-mono">
              {coupons.filter((c) => c.status === "active").length}
            </h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#161113] border border-stone-200 dark:border-stone-800/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center border border-pink-500/20 shrink-0">
            <Gift className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">Percentage Coupons</p>
            <h3 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 font-mono">
              {coupons.filter((c) => c.discountType === "percentage").length}
            </h3>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-[#161113] border border-stone-200 dark:border-stone-800/80 shadow-xs flex items-center gap-4">
          <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center border border-emerald-500/20 shrink-0">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">Fixed Amount Coupons</p>
            <h3 className="text-xl font-extrabold text-stone-900 dark:text-stone-100 font-mono">
              {coupons.filter((c) => c.discountType === "fixed").length}
            </h3>
          </div>
        </div>
      </div>

      {/* 3. Search & Coupons List Card */}
      <div className="p-6 rounded-3xl border border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-800/60 pb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
            <input
              type="text"
              placeholder="Search coupon code or discount type..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] py-2.5 pl-10 pr-4 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:border-rose-500 focus:outline-none"
            />
          </div>

          <button
            onClick={fetchCoupons}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition border border-stone-200 dark:border-stone-800 w-fit cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5 text-stone-400" /> Refresh List
          </button>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-12 text-center text-stone-400 dark:text-stone-500 text-xs">
            Loading coupons...
          </div>
        ) : filteredCoupons.length === 0 ? (
          <div className="py-12 text-center space-y-2">
            <Tag className="h-10 w-10 mx-auto text-stone-300 dark:text-stone-700" />
            <p className="text-xs font-semibold text-stone-500 dark:text-stone-400">No coupons found</p>
            <p className="text-[11px] text-stone-400 dark:text-stone-500">Click "Create New Coupon" to add custom coupons for your customers.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-700 dark:text-stone-200">
              <thead className="bg-stone-50 dark:bg-[#0d0709] text-[11px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider border-b border-stone-200 dark:border-stone-800">
                <tr>
                  <th className="p-3.5 rounded-l-xl">Coupon Code</th>
                  <th className="p-3.5">Discount</th>
                  <th className="p-3.5">Min Purchase</th>
                  <th className="p-3.5">Usage / Limit</th>
                  <th className="p-3.5">Expiry Date</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {filteredCoupons.map((c) => {
                  const isExpired = new Date(c.expiryDate) < new Date();
                  return (
                    <tr key={c._id} className="hover:bg-stone-50/80 dark:hover:bg-white/5 transition-colors">
                      <td className="p-3.5 font-bold font-mono text-rose-500 text-sm">
                        {c.code}
                      </td>

                      <td className="p-3.5 font-semibold">
                        {c.discountType === "percentage" ? (
                          <span className="px-2 py-0.5 rounded-md bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 font-bold">
                            {c.discountAmount}% OFF {c.maxDiscount ? `(Max ৳${c.maxDiscount})` : ""}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md bg-rose-100 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 font-bold">
                            ৳{c.discountAmount} OFF
                          </span>
                        )}
                      </td>

                      <td className="p-3.5 font-mono">
                        {c.minPurchase > 0 ? `৳${c.minPurchase.toLocaleString()}` : "No Minimum"}
                      </td>

                      <td className="p-3.5 font-mono">
                        {c.usedCount ?? 0} / {c.usageLimit ?? "∞"}
                      </td>

                      <td className="p-3.5">
                        <span className={`flex items-center gap-1 ${isExpired ? "text-red-500 font-bold" : "text-stone-600 dark:text-stone-300"}`}>
                          <Clock className="h-3 w-3" />
                          {new Date(c.expiryDate).toLocaleDateString()}
                          {isExpired && " (Expired)"}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <button
                          onClick={() => handleToggleStatus(c._id, c.status)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border cursor-pointer ${
                            c.status === "active" && !isExpired
                              ? "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                              : "bg-stone-100 dark:bg-stone-800 text-stone-500 dark:text-stone-400 border-stone-200 dark:border-stone-700"
                          }`}
                        >
                          {c.status === "active" && !isExpired ? "Active" : "Inactive"}
                        </button>
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteCoupon(c._id, c.code)}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50 transition cursor-pointer"
                          title="Delete coupon"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 4. Create Coupon Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#161113] border border-stone-200 dark:border-stone-800/80 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800/60 pb-3">
              <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Tag className="h-5 w-5 text-rose-500" /> Create Custom Admin Coupon
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
              {/* Code */}
              <div className="space-y-1">
                <label className="font-bold text-stone-700 dark:text-rose-200">
                  Coupon Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. COMBO20, FLASH500, SUMMER15"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full uppercase font-mono px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 text-stone-900 dark:text-white font-bold focus:border-rose-500 focus:outline-none"
                  required
                />
              </div>

              {/* Type & Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-rose-200">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 text-stone-900 dark:text-white font-semibold focus:border-rose-500 focus:outline-none"
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="fixed">Fixed Amount (৳ OFF)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-rose-200">
                    Discount Amount ({discountType === "percentage" ? "%" : "৳"}) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder={discountType === "percentage" ? "20" : "500"}
                    value={discountAmount}
                    onChange={(e) => setDiscountAmount(e.target.value ? Number(e.target.value) : "")}
                    className="w-full font-mono px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 text-stone-900 dark:text-white font-bold focus:border-rose-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Min Purchase & Max Discount */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-rose-200">Min Purchase (৳)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={minPurchase}
                    onChange={(e) => setMinPurchase(e.target.value ? Number(e.target.value) : "")}
                    className="w-full font-mono px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 text-stone-900 dark:text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-rose-200">Max Discount (৳)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Optional limit"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value ? Number(e.target.value) : "")}
                    className="w-full font-mono px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 text-stone-900 dark:text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Usage Limit & Expiry Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-rose-200">Usage Limit</label>
                  <input
                    type="number"
                    min="1"
                    value={usageLimit}
                    onChange={(e) => setUsageLimit(e.target.value ? Number(e.target.value) : "")}
                    className="w-full font-mono px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 text-stone-900 dark:text-white focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-stone-700 dark:text-rose-200">Expiry Date</label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 text-stone-900 dark:text-white focus:border-rose-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-rose-900/40 text-stone-600 dark:text-rose-200 hover:bg-stone-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold shadow-md disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Create Coupon"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
