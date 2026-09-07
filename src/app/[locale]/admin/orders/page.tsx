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
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  Archive,
  RotateCcw,
  ShieldAlert,
  AlertTriangle,
  X,
  Filter,
} from "lucide-react";

import OrdersMobile from "@/components/admin/OrdersMobile";
import OrdersTable from "@/components/admin/OrdersTable";
import CancelOrderModal from "@/components/admin/CancelOrderModal";
import FlagCustomerModal from "@/components/admin/FlagCustomerModal";
import { normalizePhone } from "@/lib/phoneUtils";

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Risk Intelligence & Phone Aggregation Maps from Backend
  const [phoneStatsMap, setPhoneStatsMap] = useState<Record<string, any>>({});
  const [flaggedCustomersMap, setFlaggedCustomersMap] = useState<Record<string, any>>({});

  // Modals State
  const [orderToCancel, setOrderToCancel] = useState<any>(null);
  const [orderForFlagModal, setOrderForFlagModal] = useState<any>(null);

  // Filters, Sub-filters & Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [cancelReasonFilter, setCancelReasonFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [showArchived, setShowArchived] = useState(false);

  const API = `${process.env.NEXT_PUBLIC_API_URL}/orders`;
  const STATUS = ["pending", "processing", "shipped", "delivered", "cancelled"];

  const statusStyles: Record<string, string> = {
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

  /* ---------------- Fetch All Data (Orders + Backend Aggregation) ---------------- */
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      // Parallel fetch: allOrders, backend phone aggregation stats, and flagged customers
      const [ordersRes, statsRes, flaggedRes] = await Promise.allSettled([
        axios.get(`${API}/allOrders`, { headers }),
        axios.get(`${API}/phone-stats`, { headers }),
        axios.get(`${API}/flagged-customers`, { headers }),
      ]);

      if (ordersRes.status === "fulfilled") {
        setOrders(ordersRes.value.data || []);
      } else {
        toast.error("Failed to load orders");
      }

      if (statsRes.status === "fulfilled" && statsRes.value.data?.phoneStats) {
        setPhoneStatsMap(statsRes.value.data.phoneStats);
      }

      if (flaggedRes.status === "fulfilled" && flaggedRes.value.data?.flaggedCustomers) {
        const flagList = flaggedRes.value.data.flaggedCustomers || [];
        const dict: Record<string, any> = {};
        for (const f of flagList) {
          if (f.normalizedPhone) {
            dict[f.normalizedPhone] = f;
          }
        }
        setFlaggedCustomersMap(dict);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load orders data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  /* ---------------- Update Status (Standard) ---------------- */
  const updateStatus = async (id: string, newStatus: string) => {
    if (newStatus === "cancelled") {
      const targetOrder = orders.find((o) => o._id === id);
      if (targetOrder) {
        setOrderToCancel(targetOrder);
        return;
      }
    }

    try {
      const token = getToken();

      await axios.patch(
        `${API}/updateStatus/${id}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(`Order status updated to ${newStatus}`);

      // Optimistic update
      setOrders((prev) =>
        prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error(err);
      toast.error("Status update failed");
    }
  };

  /* ---------------- Toggle Soft Delete / Archive ---------------- */
  const toggleArchive = async (order: any) => {
    try {
      const token = getToken();
      const newArchived = !order.isArchived;

      await axios.patch(
        `${API}/updateStatus/${order._id}`,
        { isArchived: newArchived },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success(
        newArchived
          ? `Order #${order.orderNumber || order._id} archived (hidden from main list)`
          : `Order #${order.orderNumber || order._id} restored to main list`
      );

      setOrders((prev) =>
        prev.map((o) =>
          o._id === order._id ? { ...o, isArchived: newArchived } : o
        )
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to archive/unarchive order");
    }
  };

  /* ---------------- Summary Metrics Calculations ---------------- */
  const metrics = useMemo(() => {
    const totalCount = orders.length;
    const pendingCount = orders.filter((o) => o.status === "pending").length;
    const processingCount = orders.filter((o) => o.status === "processing").length;
    const shippedCount = orders.filter((o) => o.status === "shipped").length;
    const deliveredCount = orders.filter((o) => o.status === "delivered").length;
    const cancelledOrders = orders.filter((o) => o.status === "cancelled");
    const cancelledCount = cancelledOrders.length;
    const archivedCount = orders.filter((o) => o.isArchived).length;

    // Calculate cancellation rate
    const cancellationRate =
      totalCount > 0 ? Math.round((cancelledCount / totalCount) * 100) : 0;

    // Count fake orders specifically
    const fakeOrdersCount = cancelledOrders.filter((o) =>
      /fake|prank/i.test(o.cancellationReason || "")
    ).length;

    const notReachableCount = cancelledOrders.filter((o) =>
      /not reachable|phone|switch/i.test(o.cancellationReason || "")
    ).length;

    const changedMindCount = cancelledOrders.filter((o) =>
      /changed mind/i.test(o.cancellationReason || "")
    ).length;

    const outOfStockCount = cancelledOrders.filter((o) =>
      /out of stock|stock/i.test(o.cancellationReason || "")
    ).length;

    // Total Revenue safely excludes cancelled orders
    const totalRevenue = orders
      .filter((o) => o.status !== "cancelled")
      .reduce((sum, o) => sum + (Number(o?.pricing?.total) || 0), 0);

    const preOrderCount = orders.filter(
      (o) =>
        o.orderType === "pre-order" ||
        o.fulfillmentStatus === "awaiting-stock" ||
        (o.items || o.products || []).some((i: any) => i.isPreOrder)
    ).length;

    return {
      totalCount,
      pendingCount,
      processingCount,
      shippedCount,
      deliveredCount,
      cancelledCount,
      archivedCount,
      cancellationRate,
      fakeOrdersCount,
      notReachableCount,
      changedMindCount,
      outOfStockCount,
      preOrderCount,
      totalRevenue,
    };
  }, [orders]);

  /* ---------------- Filter & Sort Orders ---------------- */
  const filteredOrders = useMemo(() => {
    return orders
      .filter((o) => {
        // Soft delete filter: hide archived orders unless showArchived is checked
        if (!showArchived && o.isArchived) {
          return false;
        }

        // Status / Tab Filter
        if (activeTab === "pre-order") {
          const isPreOrder =
            o.orderType === "pre-order" ||
            o.fulfillmentStatus === "awaiting-stock" ||
            (o.items || o.products || []).some((i: any) => i.isPreOrder);
          if (!isPreOrder) return false;
        } else if (activeTab !== "all" && o.status !== activeTab) {
          return false;
        }

        // Cancellation Reason Sub-filter (active only inside "cancelled" tab)
        if (activeTab === "cancelled" && cancelReasonFilter !== "all") {
          const reason = (o.cancellationReason || "").toLowerCase();
          if (cancelReasonFilter === "fake") {
            if (!/fake|prank/.test(reason)) return false;
          } else if (cancelReasonFilter === "not_reachable") {
            if (!/not reachable|phone|switch/.test(reason)) return false;
          } else if (cancelReasonFilter === "changed_mind") {
            if (!/changed mind/.test(reason)) return false;
          } else if (cancelReasonFilter === "out_of_stock") {
            if (!/out of stock|stock/.test(reason)) return false;
          } else if (cancelReasonFilter === "other") {
            if (
              /fake|prank|not reachable|phone|switch|changed mind|out of stock|stock/.test(
                reason
              )
            ) {
              return false;
            }
          }
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
            .map((i: any) => i.name || "")
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
        const effectiveSort =
          activeTab === "pre-order" && sortBy === "newest" ? "oldest" : sortBy;
        if (effectiveSort === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (effectiveSort === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (effectiveSort === "highest") {
          return (b.pricing?.total || 0) - (a.pricing?.total || 0);
        }
        if (effectiveSort === "lowest") {
          return (a.pricing?.total || 0) - (b.pricing?.total || 0);
        }
        return 0;
      });
  }, [
    orders,
    activeTab,
    cancelReasonFilter,
    paymentFilter,
    searchQuery,
    sortBy,
    showArchived,
  ]);

  const clearFilters = () => {
    setSearchQuery("");
    setActiveTab("all");
    setCancelReasonFilter("all");
    setPaymentFilter("all");
    setSortBy("newest");
    setShowArchived(false);
  };

  const isFiltered =
    searchQuery !== "" ||
    activeTab !== "all" ||
    cancelReasonFilter !== "all" ||
    paymentFilter !== "all" ||
    sortBy !== "newest" ||
    showArchived;

  return (
    <div className="w-full space-y-8">
      {/* 1. Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100">
              Orders Management
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs">
              {orders.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Track, filter, prevent fraud, record cancellation reasons, and preserve sales audit history.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={fetchOrders}
            disabled={loading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0d0709] text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all shadow-2xs cursor-pointer"
            title="Refresh orders and risk intelligence"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 text-stone-400 ${
                loading ? "animate-spin text-rose-500" : ""
              }`}
            />
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

      {/* 2. Metrics & Analytics Bar (5 Core Business Metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {/* Metric 1: Total Orders */}
        <div
          onClick={() => setActiveTab("all")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "all"
              ? "border-rose-500 ring-1 ring-rose-500/20 bg-white dark:bg-[#161113]"
              : "border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113] hover:border-stone-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              Total Orders
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <ShoppingBag className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-2">
            {metrics.totalCount}
          </div>
          <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
            Complete order history
          </div>
        </div>

        {/* Metric 2: Revenue */}
        <div className="p-4 rounded-2xl border border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              Total Revenue
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            ৳ {metrics.totalRevenue.toLocaleString()}
          </div>
          <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
            Non-cancelled sales
          </div>
        </div>

        {/* Metric 3: Pending Orders */}
        <div
          onClick={() => setActiveTab("pending")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "pending"
              ? "border-amber-500 ring-1 ring-amber-500/20 bg-white dark:bg-[#161113]"
              : "border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113] hover:border-amber-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Pending Orders
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
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
              ? "border-emerald-500 ring-1 ring-emerald-500/20 bg-white dark:bg-[#161113]"
              : "border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113] hover:border-emerald-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Delivered
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
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

        {/* Metric 5: Cancelled Orders & Rate (Analytics Protected) */}
        <div
          onClick={() => setActiveTab("cancelled")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            activeTab === "cancelled"
              ? "border-rose-500 ring-1 ring-rose-500/20 bg-white dark:bg-[#161113]"
              : "border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113] hover:border-rose-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-400">
              Cancelled Orders
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
              {metrics.cancelledCount}
            </span>
            <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
              {metrics.cancellationRate}% Rate
            </span>
          </div>
          <div className="text-[10px] text-rose-500/80 dark:text-rose-400/60 mt-1 truncate">
            {metrics.fakeOrdersCount > 0 ? `${metrics.fakeOrdersCount} fake • ` : ""}
            Preserved for audit
          </div>
        </div>
      </div>

      {/* 3. Search & Filter Bar */}
      <div className="space-y-4 bg-white dark:bg-[#161113] p-4 sm:p-5 rounded-2xl border border-stone-200 dark:border-stone-800/80 shadow-xs">
        {/* Top Controls: Search, Payment Filter, Sort & Archive Toggle */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by order #, customer name, phone, item..."
              className="w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] py-2.5 pl-10 pr-10 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] px-3 py-2.5 text-xs text-stone-800 dark:text-stone-200 focus:border-rose-500 focus:outline-none"
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
              className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] px-3 py-2.5 text-xs text-stone-800 dark:text-stone-200 focus:border-rose-500 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="highest">Highest Amount</option>
              <option value="lowest">Lowest Amount</option>
            </select>

            {/* Soft Delete / Archive Filter Toggle */}
            <button
              type="button"
              onClick={() => setShowArchived(!showArchived)}
              className={`flex items-center gap-1.5 px-3 py-2.5 rounded-2xl border text-xs font-semibold transition-all cursor-pointer ${
                showArchived
                  ? "bg-amber-500 text-white border-amber-600 shadow-xs"
                  : "border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] text-stone-600 dark:text-stone-400 hover:bg-stone-100"
              }`}
              title="Soft-delete archive view"
            >
              <Archive className="h-3.5 w-3.5" />
              <span>{showArchived ? "Archived Orders Visible" : `Archived (${metrics.archivedCount})`}</span>
            </button>
          </div>
        </div>

        {/* Status Filter Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-stone-100 dark:border-stone-800/60">
          {[
            { key: "all", label: "All Orders", count: metrics.totalCount },
            { key: "pre-order", label: "⏳ Pre-Orders", count: metrics.preOrderCount },
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
                onClick={() => {
                  setActiveTab(tab.key);
                  if (tab.key !== "cancelled") setCancelReasonFilter("all");
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-stone-100 dark:bg-[#0d0709] text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 border border-transparent dark:border-stone-800"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-stone-200 dark:bg-stone-800 text-stone-700 dark:text-stone-300"
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
              className="ml-auto text-xs font-semibold text-rose-500 hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <X className="h-3 w-3" /> Clear Filters
            </button>
          )}
        </div>

        {/* Cancelled Tab Sub-filter by Reason (Auditing & Fraud Analysis) */}
        {activeTab === "cancelled" && (
          <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-dashed border-rose-200 dark:border-rose-900/40 text-xs">
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider shrink-0 flex items-center gap-1">
              <Filter className="h-3 w-3" /> Reason:
            </span>
            {[
              { id: "all", label: "All Cancelled", count: metrics.cancelledCount },
              { id: "fake", label: "🚫 Fake / Prank", count: metrics.fakeOrdersCount },
              { id: "not_reachable", label: "📵 Phone Off / Unreachable", count: metrics.notReachableCount },
              { id: "changed_mind", label: "👤 Changed Mind", count: metrics.changedMindCount },
              { id: "out_of_stock", label: "📦 Out of Stock", count: metrics.outOfStockCount },
              { id: "other", label: "💬 Other Reasons", count: null },
            ].map((sub) => {
              const isSubActive = cancelReasonFilter === sub.id;
              return (
                <button
                  key={sub.id}
                  onClick={() => setCancelReasonFilter(sub.id)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all whitespace-nowrap cursor-pointer ${
                    isSubActive
                      ? "bg-rose-600 text-white shadow-2xs font-bold"
                      : "bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 hover:bg-rose-100"
                  }`}
                >
                  {sub.label} {sub.count !== null ? `(${sub.count})` : ""}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Filter Results Summary */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
        <span>
          Showing <strong className="text-stone-900 dark:text-stone-100 font-mono">{filteredOrders.length}</strong> of {orders.length} orders
          {showArchived && " (including archived)"}
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
          phoneStatsMap={phoneStatsMap}
          flaggedCustomersMap={flaggedCustomersMap}
          onOpenCancelModal={(ord) => setOrderToCancel(ord)}
          onOpenFlagModal={(ord) => setOrderForFlagModal(ord)}
          onToggleArchive={toggleArchive}
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
          phoneStatsMap={phoneStatsMap}
          flaggedCustomersMap={flaggedCustomersMap}
          onOpenCancelModal={(ord) => setOrderToCancel(ord)}
          onOpenFlagModal={(ord) => setOrderForFlagModal(ord)}
          onToggleArchive={toggleArchive}
        />
      </div>

      {/* Cancel Order Modal (Records audit reason & prevents hard delete) */}
      {orderToCancel && (
        <CancelOrderModal
          order={orderToCancel}
          isOpen={Boolean(orderToCancel)}
          onClose={() => setOrderToCancel(null)}
          onSuccess={(orderId, finalReason, note, flagStatus) => {
            setOrders((prev) =>
              prev.map((o) =>
                o._id === orderId
                  ? {
                      ...o,
                      status: "cancelled",
                      cancellationReason: finalReason,
                      cancellationNote: note,
                      cancelledAt: new Date().toISOString(),
                    }
                  : o
              )
            );
            // Refresh stats & flags in background
            fetchOrders();
          }}
        />
      )}

      {/* Flag / Blacklist Customer Modal */}
      {orderForFlagModal && (
        <FlagCustomerModal
          isOpen={Boolean(orderForFlagModal)}
          onClose={() => setOrderForFlagModal(null)}
          customerName={orderForFlagModal.customer?.name}
          phone={orderForFlagModal.customer?.phone}
          riskInfo={
            orderForFlagModal.customer?.phone
              ? {
                  ...phoneStatsMap[normalizePhone(orderForFlagModal.customer.phone)],
                  isBlacklisted:
                    flaggedCustomersMap[normalizePhone(orderForFlagModal.customer.phone)]?.status ===
                    "blacklisted",
                  isFlagged:
                    flaggedCustomersMap[normalizePhone(orderForFlagModal.customer.phone)]?.status ===
                    "flagged",
                  flagReason:
                    flaggedCustomersMap[normalizePhone(orderForFlagModal.customer.phone)]?.reason,
                  flagNotes:
                    flaggedCustomersMap[normalizePhone(orderForFlagModal.customer.phone)]?.notes,
                }
              : undefined
          }
          onStatusChanged={() => {
            fetchOrders();
          }}
        />
      )}
    </div>
  );
}
