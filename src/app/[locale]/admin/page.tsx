"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  DollarSign,
  RefreshCw,
  Gift,
  Layers,
  ArrowDownRight,
  ShieldAlert,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  FileText,
  Printer,
  Filter,
} from "lucide-react";
import Link from "next/link";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Custom Tooltip Component for Recharts (Adapts to Light & Dark Theme)
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-stone-200 dark:border-rose-500/20 bg-white/95 dark:bg-[#1A0F13]/95 p-3 shadow-xl backdrop-blur-md text-xs">
        <p className="font-bold text-stone-900 dark:text-rose-300 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={`item-${index}`} className="flex items-center justify-between gap-4 py-0.5">
            <span className="flex items-center gap-1.5 text-stone-600 dark:text-slate-300">
              <span
                className="h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color || entry.fill }}
              />
              {entry.name}:
            </span>
            <span className="font-mono font-bold text-stone-900 dark:text-white">
              {entry.name.toLowerCase().includes("revenue") || entry.name.toLowerCase().includes("sales")
                ? `৳${Number(entry.value).toLocaleString()}`
                : entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [isMounted, setIsMounted] = useState(false);

  const [dateRange, setDateRange] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchStats = async (rangeOverride?: string, startOverride?: string, endOverride?: string) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const activeRange = rangeOverride !== undefined ? rangeOverride : dateRange;
      const activeStart = startOverride !== undefined ? startOverride : startDate;
      const activeEnd = endOverride !== undefined ? endOverride : endDate;

      const queryParams = new URLSearchParams({
        range: activeRange,
        ...(activeStart ? { startDate: activeStart } : {}),
        ...(activeEnd ? { endDate: activeEnd } : {}),
      });

      const primaryUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL;
      const fallbackUrl = "http://localhost:5000";

      let res: Response | null = null;
      const targetBase = primaryUrl || fallbackUrl;

      try {
        res = await fetch(`${targetBase}/admin/dashboard/stats?${queryParams.toString()}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (primaryErr) {
        if (targetBase !== fallbackUrl) {
          try {
            res = await fetch(`${fallbackUrl}/admin/dashboard/stats?${queryParams.toString()}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (fallbackErr) {
            throw new Error("Backend server is unreachable. Please verify backend service on localhost:5000 or Render.");
          }
        } else {
          throw new Error("Backend server is unreachable on http://localhost:5000. Please start your backend server.");
        }
      }

      if (!res || !res.ok) {
        throw new Error("Failed to fetch dashboard statistics");
      }

      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.message || "Failed to load dashboard");
      }
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err?.message || "Failed to fetch dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleRangeChange = (newRange) => {
    setDateRange(newRange);
    if (newRange !== "custom") {
      fetchStats(newRange, "", "");
    }
  };

  const handleCustomDateSubmit = (e) => {
    e.preventDefault();
    fetchStats("custom", startDate, endDate);
  };

  const handleExportPDF = () => {
    window.print();
  };

  if (loading && !stats) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-rose-500" />
          <p className="text-sm font-medium text-stone-600 dark:text-rose-200/80">Loading Super Admin Analytics...</p>
        </div>
      </div>
    );
  }

  // Fallbacks
  const rev = stats?.revenue || { today: 0, thisMonth: 0, total: 0, rangeFiltered: 0 };
  const ord = stats?.orders || { total: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0, aov: 0, fulfillmentRate: 0 };
  const prod = stats?.products || { total: 0, singleCount: 0, comboCount: 0, lowStockCount: 0 };
  const cust = stats?.customers || { totalUsers: 0, customerCount: 0, adminCount: 0 };
  const charts = stats?.charts || { salesOverview: [], orderDistribution: [], topProducts: [], revenueByType: [] };
  const recent = stats?.recentActivity || { recentOrders: [], recentUsers: [], lowStockAlerts: [] };

  // Colors for Order Distribution
  const ORDER_STATUS_COLORS = {
    Pending: "#F59E0B",
    Processing: "#3B82F6",
    Shipped: "#8B5CF6",
    Delivered: "#10B981",
    Cancelled: "#EF4444",
  };

  const formattedOrderDistribution = (charts.orderDistribution || []).map((item) => ({
    ...item,
    color: ORDER_STATUS_COLORS[item.name] || "#94A3B8",
  }));

  const productTypeData = [
    { name: "Single Items", count: prod.singleCount || 0, fill: "#F43F5E" },
    { name: "Combo Deals", count: prod.comboCount || 0, fill: "#8B5CF6" },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-stone-200 dark:border-rose-900/30 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white flex items-center gap-2">
              <span>Dashboard Overview</span>
              <Sparkles className="h-5 w-5 text-rose-500 dark:text-rose-400 animate-pulse" />
            </h1>
            <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 mt-1">
            Filter revenue, order statistics, inventory alerts & print executive PDF reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export PDF Button */}
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white px-4 py-2 text-xs font-bold transition-all shadow-md hover:shadow-lg cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Export PDF Report</span>
          </button>

          {/* Refresh Data Button */}
          <button
            onClick={() => fetchStats()}
            className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-rose-950/60 hover:bg-stone-50 dark:hover:bg-rose-900/60 border border-stone-200 dark:border-rose-800/40 px-4 py-2 text-xs font-semibold text-stone-700 dark:text-rose-200 transition-all shadow-xs hover:shadow-md cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-rose-500 dark:text-rose-400 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 🗓️ DATE RANGE FILTER BAR */}
      <div className="rounded-2xl border border-stone-200/80 dark:border-rose-900/40 bg-white/80 dark:bg-[#180E13]/90 p-4 shadow-sm backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-rose-200">
            <Filter className="h-4 w-4 text-rose-500" />
            <span>Filter Analytics Period:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: "all", label: "All Time" },
              { id: "today", label: "Today" },
              { id: "7days", label: "Last 7 Days" },
              { id: "30days", label: "Last 30 Days" },
              { id: "thisMonth", label: "This Month" },
              { id: "custom", label: "Custom Range" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleRangeChange(tab.id)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                  dateRange === tab.id
                    ? "bg-rose-600 text-white shadow-md shadow-rose-500/20"
                    : "bg-stone-100 dark:bg-rose-950/50 text-stone-600 dark:text-rose-300 hover:bg-stone-200 dark:hover:bg-rose-900/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Selector inputs */}
        {dateRange === "custom" && (
          <form onSubmit={handleCustomDateSubmit} className="mt-3 pt-3 border-t border-stone-200 dark:border-rose-900/30 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-stone-600 dark:text-slate-400">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-xl border border-stone-300 dark:border-rose-800/60 bg-stone-50 dark:bg-[#251219] px-3 py-1.5 text-xs font-mono text-stone-900 dark:text-white outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-stone-600 dark:text-slate-400">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-xl border border-stone-300 dark:border-rose-800/60 bg-stone-50 dark:bg-[#251219] px-3 py-1.5 text-xs font-mono text-stone-900 dark:text-white outline-none focus:border-rose-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-stone-900 dark:bg-rose-900 hover:bg-stone-800 dark:hover:bg-rose-800 text-white px-4 py-1.5 text-xs font-bold transition-all cursor-pointer"
            >
              Apply Filter
            </button>
          </form>
        )}
      </div>

      {/* 1. TOP SUMMARY STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <div className="relative overflow-hidden rounded-2xl border border-rose-200 dark:border-rose-500/30 bg-gradient-to-br from-rose-500/5 via-rose-500/10 to-rose-500/5 dark:from-[#1C1014] dark:via-[#2A121A] dark:to-[#1C1014] p-5 shadow-xs transition-all duration-300 hover:border-rose-400 dark:hover:border-rose-500/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">Total Revenue</span>
            <div className="rounded-xl bg-rose-500/15 p-2.5 text-rose-600 dark:text-rose-300 border border-rose-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-stone-900 dark:text-white">
            ৳{rev.total.toLocaleString()}
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-stone-600 dark:text-slate-400 border-t border-rose-200/60 dark:border-rose-900/40 pt-2">
            <span>Today: <strong className="text-rose-600 dark:text-rose-300">৳{rev.today.toLocaleString()}</strong></span>
            <span>Month: <strong className="text-rose-600 dark:text-rose-300">৳{rev.thisMonth.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="relative overflow-hidden rounded-2xl border border-stone-200/80 dark:border-slate-800 bg-white dark:bg-[#160E12]/90 p-5 shadow-xs transition-all duration-300 hover:border-blue-400 dark:hover:border-blue-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400">Total Orders</span>
            <div className="rounded-xl bg-blue-500/15 p-2.5 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-stone-900 dark:text-white">
            {ord.total.toLocaleString()}
          </p>
          <div className="mt-3 flex items-center gap-2 text-[11px] border-t border-stone-100 dark:border-slate-800/80 pt-2">
            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-amber-700 dark:text-amber-400 font-bold border border-amber-500/20">
              Pending: {ord.pending}
            </span>
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-500/20">
              Delivered: {ord.delivered}
            </span>
          </div>
        </div>

        {/* Total Products */}
        <div className="relative overflow-hidden rounded-2xl border border-stone-200/80 dark:border-slate-800 bg-white dark:bg-[#160E12]/90 p-5 shadow-xs transition-all duration-300 hover:border-purple-400 dark:hover:border-purple-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400">Total Products</span>
            <div className="rounded-xl bg-purple-500/15 p-2.5 text-purple-600 dark:text-purple-400 border border-purple-500/20">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-stone-900 dark:text-white">
            {prod.total}
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500 dark:text-slate-400 border-t border-stone-100 dark:border-slate-800/80 pt-2">
            <span>Single: <strong className="text-stone-800 dark:text-slate-200">{prod.singleCount}</strong></span>
            <span>Combo Deals: <strong className="text-rose-600 dark:text-rose-400">{prod.comboCount}</strong></span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="relative overflow-hidden rounded-2xl border border-stone-200/80 dark:border-slate-800 bg-white dark:bg-[#160E12]/90 p-5 shadow-xs transition-all duration-300 hover:border-emerald-400 dark:hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400">Total Users</span>
            <div className="rounded-xl bg-emerald-500/15 p-2.5 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-stone-900 dark:text-white">
            {cust.totalUsers}
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500 dark:text-slate-400 border-t border-stone-100 dark:border-slate-800/80 pt-2">
            <span>Customers: <strong className="text-stone-800 dark:text-slate-200">{cust.customerCount}</strong></span>
            <span>Admins: <strong className="text-amber-600 dark:text-amber-400">{cust.adminCount}</strong></span>
          </div>
        </div>

        {/* Low Stock Warning Card */}
        <div className={`relative overflow-hidden rounded-2xl border p-5 shadow-xs transition-all duration-300 ${
          prod.lowStockCount > 0
            ? "border-amber-400/60 dark:border-amber-500/50 bg-amber-50/50 dark:bg-gradient-to-br dark:from-[#1E1510] dark:via-amber-950/30 dark:to-[#160E12]"
            : "border-stone-200/80 dark:border-slate-800 bg-white dark:bg-[#160E12]/90"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Low Stock Alert</span>
            <div className="rounded-xl bg-amber-500/15 p-2.5 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-stone-900 dark:text-white">
            {prod.lowStockCount} <span className="text-xs font-medium text-stone-500 dark:text-slate-400">items</span>
          </p>
          <div className="mt-3 text-[11px] text-amber-700 dark:text-amber-300/80 font-bold border-t border-amber-200/60 dark:border-amber-950/60 pt-2">
            {prod.lowStockCount > 0 ? "Requires restock action" : "Inventory stock optimal"}
          </div>
        </div>
      </div>

      {/* 2. RECHARTS ANALYTICS CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Revenue Trend Area Chart (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-stone-200/80 dark:border-rose-900/30 bg-white dark:bg-[#170E12] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-rose-950/60 pb-3">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-rose-500 dark:text-rose-400" />
                Sales & Revenue Analytics (7 Days)
              </h3>
              <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">Daily revenue trend (৳) and total orders placed</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 font-semibold">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Revenue (৳)
              </span>
              <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Orders
              </span>
            </div>
          </div>

          {/* Recharts Area Chart Container */}
          <div className="h-[280px] w-full pt-2">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={charts.salesOverview}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F43F5E" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" strokeOpacity={0.4} vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#64748B"
                    tick={{ fill: "#64748B", fontSize: 11 }}
                    axisLine={{ stroke: "#E2E8F0" }}
                  />
                  <YAxis
                    stroke="#64748B"
                    tick={{ fill: "#64748B", fontSize: 11 }}
                    axisLine={{ stroke: "#E2E8F0" }}
                    tickFormatter={(val) => `৳${val}`}
                  />
                  <Tooltip content={(props: any) => <CustomTooltip {...props} />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    name="Revenue"
                    stroke="#F43F5E"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    name="Orders"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorOrders)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Order Status Distribution Donut Chart */}
        <div className="rounded-2xl border border-stone-200/80 dark:border-rose-900/30 bg-white dark:bg-[#170E12] p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="border-b border-stone-100 dark:border-rose-950/60 pb-3">
            <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <PieChartIcon className="h-4.5 w-4.5 text-rose-500 dark:text-rose-400" />
              Order Fulfillment Breakdown
            </h3>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">Live distribution by order status</p>
          </div>

          {/* Donut Chart */}
          <div className="h-[200px] w-full relative flex items-center justify-center">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={formattedOrderDistribution.length > 0 ? formattedOrderDistribution : [{ name: "No Orders", value: 1, color: "#94A3B8" }]}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {formattedOrderDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={(props: any) => <CustomTooltip {...props} />} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {/* Center Summary */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-stone-900 dark:text-white">{ord.total}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-slate-400">Total Orders</span>
            </div>
          </div>

          {/* Status Pills */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 dark:border-rose-950/60">
            {formattedOrderDistribution.map((st, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-stone-50 dark:bg-slate-900/60 border border-stone-200/60 dark:border-slate-800">
                <span className="flex items-center gap-1.5 text-stone-700 dark:text-slate-300 font-medium text-[11px]">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: st.color }} />
                  {st.name}
                </span>
                <span className="font-mono font-bold text-stone-900 dark:text-white text-[11px]">{st.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. PRODUCT TYPE BREAKDOWN & TOP REVENUE PRODUCTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Type Breakdown (Single vs Combo Deals) */}
        <div className="rounded-2xl border border-stone-200/80 dark:border-rose-900/30 bg-white dark:bg-[#170E12] p-6 shadow-xs space-y-4">
          <div className="border-b border-stone-100 dark:border-rose-950/60 pb-3">
            <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Gift className="h-4.5 w-4.5 text-rose-500 dark:text-rose-400" />
              Catalog Composition
            </h3>
            <p className="text-xs text-stone-500 dark:text-slate-400 mt-0.5">Single items vs Combo Deals in inventory</p>
          </div>

          <div className="h-[200px] w-full">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productTypeData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#CBD5E1" strokeOpacity={0.4} vertical={false} />
                  <XAxis dataKey="name" stroke="#64748B" tick={{ fill: "#64748B", fontSize: 11 }} />
                  <YAxis stroke="#64748B" tick={{ fill: "#64748B", fontSize: 11 }} />
                  <Tooltip content={(props: any) => <CustomTooltip {...props} />} />
                  <Bar dataKey="count" name="Products Count" radius={[8, 8, 0, 0]}>
                    {productTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Recent Orders Table (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-stone-200/80 dark:border-rose-900/30 bg-white dark:bg-[#170E12] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-rose-950/60 pb-3">
            <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-rose-500 dark:text-rose-400" />
              Recent Customer Orders
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-500 dark:hover:text-rose-300 flex items-center gap-1 transition-colors"
            >
              View All Orders <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recent.recentOrders.length === 0 ? (
            <p className="text-xs text-stone-400 dark:text-slate-500 py-8 text-center">No recent orders recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-rose-950/80 text-stone-500 dark:text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Order #</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-rose-950/40">
                  {recent.recentOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-stone-50 dark:hover:bg-rose-950/20 transition-colors">
                      <td className="py-3 font-mono font-bold text-rose-600 dark:text-rose-400">{o.orderNumber}</td>
                      <td className="py-3 text-stone-800 dark:text-slate-200 font-medium">{o.customer?.name || "Guest User"}</td>
                      <td className="py-3 font-bold text-stone-900 dark:text-white">৳{(o.pricing?.total || 0).toLocaleString()}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            o.status === "delivered"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20"
                              : o.status === "pending"
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20"
                              : "bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-stone-500 dark:text-slate-400 font-mono">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* 4. LOW STOCK INVENTORY WARNINGS */}
      <div className="rounded-2xl border border-stone-200/80 dark:border-rose-900/30 bg-white dark:bg-[#170E12] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-rose-950/60 pb-3">
          <h3 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-500 dark:text-amber-400" />
            Low Stock Inventory Alerts
          </h3>
          <Link
            href="/admin/products"
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:text-rose-500 dark:hover:text-rose-300 flex items-center gap-1 transition-colors"
          >
            Manage Product Stock <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recent.lowStockAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <p className="text-xs font-medium text-stone-500 dark:text-slate-400">All inventory stock levels are optimal!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recent.lowStockAlerts.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 dark:bg-slate-900/70 border border-stone-200/70 dark:border-amber-500/20 hover:border-amber-400 dark:hover:border-amber-500/40 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="h-10 w-10 rounded-lg object-cover border border-stone-200 dark:border-slate-800 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-800 dark:text-slate-200 truncate">{item.name}</p>
                    <p className="text-[11px] font-mono text-rose-600 dark:text-rose-300">৳{item.price?.toLocaleString()}</p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-800 dark:text-amber-300 font-extrabold text-xs shrink-0">
                  {item.stock} left
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 📄 PDF PRINT REPORT CONTAINER (Visible during window.print()) */}
        <div id="printable-pdf-report" className="mt-8 border-t border-stone-200 dark:border-rose-900/30 pt-6 space-y-6">
          <div className="flex items-center justify-between border-b-2 border-rose-600 pb-3">
            <div>
              <h2 className="text-xl font-black text-rose-600 uppercase tracking-wide">CHERRY GLOW K-BEAUTY STORE</h2>
              <p className="text-xs text-stone-500">Executive Admin Analytics & Sales Performance PDF Summary</p>
            </div>
            <div className="text-right text-xs text-stone-500">
              <p className="font-bold text-stone-900 dark:text-white">Period: <span className="uppercase text-rose-600 font-extrabold">{dateRange}</span></p>
              <p className="font-mono">Generated: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-rose-950/30 border border-stone-200 dark:border-rose-900/30">
              <p className="text-stone-500 uppercase font-bold text-[10px]">Total Store Revenue</p>
              <p className="text-lg font-black text-stone-900 dark:text-white mt-0.5">{"৳"}{rev.total.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800/40">
              <p className="text-rose-600 uppercase font-bold text-[10px]">Period Filtered Sales</p>
              <p className="text-lg font-black text-rose-700 dark:text-rose-300 mt-0.5">{"৳"}{(rev.rangeFiltered || rev.total).toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-rose-950/30 border border-stone-200 dark:border-rose-900/30">
              <p className="text-stone-500 uppercase font-bold text-[10px]">Total Orders</p>
              <p className="text-lg font-black text-stone-900 dark:text-white mt-0.5">{ord.total.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-xl bg-stone-50 dark:bg-rose-950/30 border border-stone-200 dark:border-rose-900/30">
              <p className="text-stone-500 uppercase font-bold text-[10px]">Average Order Value (AOV)</p>
              <p className="text-lg font-black text-stone-900 dark:text-white mt-0.5">{"৳"}{ord.aov?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }
