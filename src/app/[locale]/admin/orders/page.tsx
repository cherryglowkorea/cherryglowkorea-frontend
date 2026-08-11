"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import Link from "next/link";
import { toast } from "sonner";
import {
  ShoppingBag,
  Search,
  RefreshCw,
  Plus,
  Filter,
  DollarSign,
  Clock,
  CheckCircle2,
  Package,
  XCircle,
  Truck,
  ArrowUpDown,
  X,
} from "lucide-react";

import OrdersMobile from "@/components/admin/OrdersMobile";
import OrdersTable from "@/components/admin/OrdersTable";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const API = `${process.env.NEXT_PUBLIC_API_URL}/orders`;
  const STATUS = ["pending", "processing", "shipped", "delivered", "cancelled"];

  const statusStyles = {
    pending:
      "bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
    processing:
      "bg-sky-100 text-sky-800 dark:bg-sky-950/80 dark:text-sky-300 border border-sky-200 dark:border-sky-800",
    shipped:
      "bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800",
    delivered:
      "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
    cancelled:
      "bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-200 dark:border-rose-800",
  };

  /* ---------------- Get Auth Token ---------------- */
  const getToken = () => {
    return localStorage.getItem("token");
  };

  /* ---------------- Fetch Orders ---------------- */
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = getToken();

      const res = await axios.get(`${API}/allOrders`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setOrders(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ---------------- Update Status ---------------- */
  const updateStatus = async (id, status) => {
    try {
      const token = getToken();

      await axios.patch(
        `${API}/updateStatus/${id}`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(`Order status updated to ${status}`);

      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status } : o))
      );
    } catch (err) {
      console.error(err);
      toast.error("Status update failed");
    }
  };

  /* ---------------- Summary Metrics Calculations ---------------- */
  const metrics = useMemo(() => {
    const totalCount = orders.length;
    const pendingCount = orders.filter((o) => o.status === "pending").length;
    const processingCount = orders.filter((o) => o.status === "processing").length;
    const shippedCount = orders.filter((o) => o.status === "shipped").length;
    const deliveredCount = orders.filter((o) => o.status === "delivered").length;
    const cancelledCount = orders.filter((o) => o.status === "cancelled").length;

    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (Number(o?.pricing?.total) || 0), 0);

    return {
      totalCount,
      pendingCount,
      processingCount,
      shippedCount,
      deliveredCount,
      cancelledCount,
      totalRevenue,
    };
  }, [orders]);

  /* ---------------- Filter & Sort Orders ---------------- */
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        // Status Filter
        if (activeTab !== "all" && o.status !== activeTab) {
          return false;
        }

        // Payment Filter
        if (paymentFilter !== "all") {
          const method = o.payment?.method?.toLowerCase() || "";
          if (!method.includes(paymentFilter.toLowerCase())) {
            return false;
          }
        }

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim();
          const orderNo = (
            o.orderNumber ||
            `#ORD-${(o._id || "").toString().slice(-6)}`
          ).toLowerCase();
          const name = (o.customer?.name || "").toLowerCase();
          const phone = (o.customer?.phone || "").toLowerCase();
          const address = (o.customer?.address || "").toLowerCase();
          const items = (o.items || o.products || [])
            .map((i) => i.name || "")
            .join(" ")
            .toLowerCase();

          return (
            orderNo.includes(q) ||
            name.includes(q) ||
            phone.includes(q) ||
            address.includes(q) ||
            items.includes(q)
          );
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === "highest") {
          return (b.pricing?.total || 0) - (a.pricing?.total || 0);
        }
        if (sortBy === "lowest") {
          return (a.pricing?.total || 0) - (b.pricing?.total || 0);
        }
        return 0;
      });
  }, [orders, activeTab, paymentFilter, searchQuery, sortBy]);

  const clearFilters = () => {
    setSearchQuery("");
    setActiveTab("all");
    setPaymentFilter("all");
    setSortBy("newest");
  };

  const isFiltered =
    searchQuery !== "" ||
    activeTab !== "all" ||
    paymentFilter !== "all" ||
    sortBy !== "newest";

  return (
    <div className="w-full space-y-8">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-rose-500/10 via-amber-500/5 to-transparent p-6 rounded-3xl border border-stone-200 dark:border-rose-900/40 bg-white/70 dark:bg-[#160E12]/80 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-rose-50">
              Orders Management
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500 text-white shadow-xs">
              {orders.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-rose-300/70 mt-1">
            Track, filter, update status, and manage all customer orders in real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-stone-200 dark:border-rose-800/60 bg-white dark:bg-rose-950/60 text-xs font-semibold text-stone-700 dark:text-rose-200 hover:bg-stone-100 dark:hover:bg-rose-900/50 transition-all shadow-2xs"
            title="Refresh orders"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin text-rose-500" : ""}`} />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          <Link
            href="/admin/orders/create"
            className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            <Plus className="h-4 w-4" />
            Create Order
          </Link>
        </div>
      </div>

      {/* 2. Metrics & Analytics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1: Total Orders */}
        <div
          onClick={() => setActiveTab("all")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "all"
              ? "border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/50 dark:bg-rose-950/40"
              : "border-stone-200 dark:border-rose-900/40 bg-white dark:bg-[#180f14] hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-rose-300/70">
              Total Orders
            </span>
            <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-rose-100 mt-2">
            {metrics.totalCount}
          </div>
          <div className="text-[11px] text-stone-400 dark:text-rose-300/50 mt-1">
            All recorded orders
          </div>
        </div>

        {/* Metric 2: Revenue */}
        <div className="p-4 rounded-2xl border border-stone-200 dark:border-rose-900/40 bg-white dark:bg-[#180f14]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-rose-300/70">
              Total Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            ৳ {metrics.totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-400 dark:text-rose-300/50 mt-1">
            Non-cancelled sales
          </div>
        </div>

        {/* Metric 3: Pending Orders */}
        <div
          onClick={() => setActiveTab("pending")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "pending"
              ? "border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/50 dark:bg-amber-950/40"
              : "border-stone-200 dark:border-rose-900/40 bg-white dark:bg-[#180f14] hover:border-amber-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Pending Orders
            </span>
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {metrics.pendingCount}
          </div>
          <div className="text-[11px] text-amber-600/70 dark:text-amber-400/60 mt-1">
            Requires action
          </div>
        </div>

        {/* Metric 4: Delivered */}
        <div
          onClick={() => setActiveTab("delivered")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "delivered"
              ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/40"
              : "border-stone-200 dark:border-rose-900/40 bg-white dark:bg-[#180f14] hover:border-emerald-300"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Delivered
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {metrics.deliveredCount}
          </div>
          <div className="text-[11px] text-emerald-600/70 dark:text-emerald-400/60 mt-1">
            Successfully completed
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="space-y-4 bg-white dark:bg-[#180f14] p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-rose-900/40 shadow-xs">
        {/* Top Controls: Search, Payment Filter & Sort */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-rose-300/50" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, customer name, phone, item..."
              className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 pl-10 pr-10 text-xs sm:text-sm text-stone-900 dark:text-rose-100 placeholder-stone-400 dark:placeholder-rose-300/40 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-rose-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="flex items-center gap-2">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 px-3 py-2.5 text-xs text-stone-800 dark:text-rose-200 focus:border-rose-500 focus:outline-none"
            >
              <option value="all">All Payment Methods</option>
              <option value="cash">Cash On Delivery</option>
              <option value="bkash">bKash</option>
              <option value="nagad">Nagad</option>
              <option value="sslcommerz">SSLCommerz</option>
            </select>

            {/* Sort By Selector */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 px-3 py-2.5 text-xs text-stone-800 dark:text-rose-200 focus:border-rose-500 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>
          </div>
        </div>

        {/* Status Filter Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-stone-100 dark:border-rose-900/30">
          {[
            { key: "all", label: "All Orders", count: metrics.totalCount },
            { key: "pending", label: "Pending", count: metrics.pendingCount },
            { key: "processing", label: "Processing", count: metrics.processingCount },
            { key: "shipped", label: "Shipped", count: metrics.shippedCount },
            { key: "delivered", label: "Delivered", count: metrics.deliveredCount },
            { key: "cancelled", label: "Cancelled", count: metrics.cancelledCount },
          ].map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-stone-100 dark:bg-rose-950/60 text-stone-600 dark:text-rose-300 hover:bg-stone-200 dark:hover:bg-rose-900/40"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-stone-200 dark:bg-rose-900/60 text-stone-700 dark:text-rose-200"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}

          {isFiltered && (
            <button
              onClick={clearFilters}
              className="ml-auto text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 shrink-0"
            >
              <X className="h-3 w-3" /> Clear Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Filter Results Summary */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-rose-300/70">
        <span>
          Showing <strong>{filteredOrders.length}</strong> of {orders.length} orders
        </span>
      </div>

      {/* 5. Mobile View */}
      <div className="block md:hidden">
        <OrdersMobile
          orders={filteredOrders}
          loading={loading}
          onUpdateStatus={updateStatus}
          status={STATUS}
          statusStyles={statusStyles}
        />
      </div>

      {/* 6. Desktop Table View */}
      <div className="hidden md:block">
        <OrdersTable
          orders={filteredOrders}
          loading={loading}
          onUpdateStatus={updateStatus}
          status={STATUS}
          statusStyles={statusStyles}
        />
      </div>
    </div>
  );
}
