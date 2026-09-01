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
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      
      if (!token) {
        throw new Error("Authentication token not found. Please log in to access the admin dashboard.");
      }

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

      if (!res) {
        throw new Error("No response received from backend server.");
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        if (res.status === 401) {
          throw new Error(errorData?.message || "Session expired or invalid token. Please log in as Admin again.");
        }
        if (res.status === 403) {
          throw new Error(errorData?.message || "Access denied. Admin, Super Admin, or Manager privileges required.");
        }
        throw new Error(errorData?.message || `Server error (${res.status}). Failed to fetch dashboard statistics.`);
      }

      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.message || "Failed to load dashboard statistics.");
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
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 border-b border-stone-200 dark:border-stone-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>Dashboard Overview</span>
              <Sparkles className="h-5 w-5 text-rose-500 animate-pulse" />
            </h1>
            <span className="rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-1 text-xs font-semibold text-stone-700 dark:text-stone-300">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Filter revenue, order statistics, inventory alerts & print executive PDF reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Export PDF Button */}
          <button
            onClick={handleExportPDF}
            className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold transition-all shadow-md cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Export PDF Report</span>
          </button>

          {/* Refresh Data Button */}
          <button
            onClick={() => fetchStats()}
            className="inline-flex items-center gap-2 rounded-xl bg-white dark:bg-[#161113] hover:bg-stone-50 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 px-4 py-2 text-xs font-medium text-stone-700 dark:text-stone-300 transition-all shadow-xs cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 text-stone-400 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* 🗓️ DATE RANGE FILTER BAR */}
      <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-[#161113] p-4 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-bold text-stone-700 dark:text-stone-300">
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
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-stone-100 dark:bg-[#0d0709] text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-800 border border-transparent dark:border-stone-800"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Selector inputs */}
        {dateRange === "custom" && (
          <form onSubmit={handleCustomDateSubmit} className="mt-3 pt-3 border-t border-stone-200 dark:border-stone-800/60 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-stone-600 dark:text-stone-400">From:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] px-3 py-1.5 text-xs font-mono text-stone-900 dark:text-stone-100 outline-none focus:border-rose-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-stone-600 dark:text-stone-400">To:</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded-xl border border-stone-300 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] px-3 py-1.5 text-xs font-mono text-stone-900 dark:text-stone-100 outline-none focus:border-rose-500"
              />
            </div>
            <button
              type="submit"
              className="rounded-xl bg-stone-900 dark:bg-stone-800 hover:bg-stone-800 dark:hover:bg-stone-700 text-white px-4 py-1.5 text-xs font-bold transition-all cursor-pointer"
            >
              Apply Filter
            </button>
          </form>
        )}
      </div>

      {/* 1. TOP SUMMARY STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <div className="relative overflow-hidden rounded-2xl border border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113] p-5 shadow-xs transition-all duration-300 hover:border-stone-700">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-500">Total Revenue</span>
            <div className="rounded-xl bg-rose-500/10 p-2.5 text-rose-500 border border-rose-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">
            ৳{rev.total.toLocaleString()}
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-stone-600 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800/60 pt-2">
            <span>Today: <strong className="text-rose-500">৳{rev.today.toLocaleString()}</strong></span>
            <span>Month: <strong className="text-rose-500">৳{rev.thisMonth.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="relative overflow-hidden rounded-2xl border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-[#161113] p-5 shadow-xs transition-all duration-300 hover:border-blue-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Total Orders</span>
            <div className="rounded-xl bg-blue-500/10 p-2.5 text-blue-500 border border-blue-500/20">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">
            {ord.total.toLocaleString()}
          </p>
          <div className="mt-3 flex items-center gap-2 text-[11px] border-t border-stone-100 dark:border-stone-800/60 pt-2">
            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-amber-700 dark:text-amber-300 font-bold border border-amber-500/20">
              Pending: {ord.pending}
            </span>
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/20">
              Delivered: {ord.delivered}
            </span>
          </div>
        </div>

        {/* Total Products */}
        <div className="relative overflow-hidden rounded-2xl border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-[#161113] p-5 shadow-xs transition-all duration-300 hover:border-purple-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Total Products</span>
            <div className="rounded-xl bg-purple-500/10 p-2.5 text-purple-500 border border-purple-500/20">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">
            {prod.total}
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800/60 pt-2">
            <span>Single: <strong className="text-stone-800 dark:text-stone-200">{prod.singleCount}</strong></span>
            <span>Combo Deals: <strong className="text-rose-500">{prod.comboCount}</strong></span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="relative overflow-hidden rounded-2xl border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-[#161113] p-5 shadow-xs transition-all duration-300 hover:border-emerald-500/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400">Total Users</span>
            <div className="rounded-xl bg-emerald-500/10 p-2.5 text-emerald-500 border border-emerald-500/20">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">
            {cust.totalUsers}
          </p>
          <div className="mt-3 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800/60 pt-2">
            <span>Customers: <strong className="text-stone-800 dark:text-stone-200">{cust.customerCount}</strong></span>
            <span>Admins: <strong className="text-amber-500">{cust.adminCount}</strong></span>
          </div>
        </div>

        {/* Low Stock Warning Card */}
        <div className={`relative overflow-hidden rounded-2xl border p-5 shadow-xs transition-all duration-300 ${
          prod.lowStockCount > 0
            ? "border-amber-400/60 dark:border-amber-800/60 bg-amber-50/50 dark:bg-amber-950/30"
            : "border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-[#161113]"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">Low Stock Alert</span>
            <div className="rounded-xl bg-amber-500/15 p-2.5 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-stone-900 dark:text-stone-100">
            {prod.lowStockCount} <span className="text-xs font-medium text-stone-500 dark:text-stone-400">items</span>
          </p>
          <div className="mt-3 text-[11px] text-amber-700 dark:text-amber-300/80 font-bold border-t border-amber-200/60 dark:border-amber-950/60 pt-2">
            {prod.lowStockCount > 0 ? "Requires restock action" : "Inventory stock optimal"}
          </div>
        </div>
      </div>

      {/* 2. RECHARTS ANALYTICS CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Revenue Trend Area Chart (2 Cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-[#161113] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800/60 pb-3">
            <div>
              <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <TrendingUp className="h-4.5 w-4.5 text-rose-500" />
                Sales & Revenue Analytics (7 Days)
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Daily revenue trend (৳) and total orders placed</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 text-rose-500 font-semibold">
                <span className="h-2.5 w-2.5 rounded-full bg-rose-500" /> Revenue (৳)
              </span>
              <span className="flex items-center gap-1.5 text-blue-500 font-semibold">
                <span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Orders
              </span>
            </div>
          </div>

          {/* Recharts Area Chart Container */}
          <div className="h-[280px] w-full pt-2 [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none [&_*]:outline-none focus:outline-none">
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
                  <CartesianGrid strokeDasharray="3 3" stroke="#332A2E" strokeOpacity={0.5} vertical={false} />
                  <XAxis
                    dataKey="day"
                    stroke="#78716C"
                    tick={{ fill: "#A8A29E", fontSize: 11 }}
                    axisLine={{ stroke: "#292524" }}
                  />
                  <YAxis
                    stroke="#78716C"
                    tick={{ fill: "#A8A29E", fontSize: 11 }}
                    axisLine={{ stroke: "#292524" }}
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
        <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-[#161113] p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="border-b border-stone-100 dark:border-stone-800/60 pb-3">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <PieChartIcon className="h-4.5 w-4.5 text-rose-500" />
              Order Fulfillment Breakdown
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Live distribution by order status</p>
          </div>

          {/* Donut Chart */}
          <div className="h-[200px] w-full relative flex items-center justify-center [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none [&_*]:outline-none focus:outline-none">
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
                      <Cell key={`cell-${index}`} fill={entry.color} stroke="#161113" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={(props: any) => <CustomTooltip {...props} />} />
                </PieChart>
              </ResponsiveContainer>
            )}
            {/* Center Summary */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-stone-900 dark:text-stone-100">{ord.total}</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-500 dark:text-stone-400">Total Orders</span>
            </div>
          </div>

          {/* Status Pills */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-100 dark:border-stone-800/60">
            {formattedOrderDistribution.map((st, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs px-2.5 py-1.5 rounded-lg bg-stone-50 dark:bg-[#0d0709] border border-stone-200/60 dark:border-stone-800">
                <span className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 font-medium text-[11px]">
                  <span className="h-2 w-2 rounded-full" style={{ backgroundColor: st.color }} />
                  {st.name}
                </span>
                <span className="font-mono font-bold text-stone-900 dark:text-stone-100 text-[11px]">{st.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. PRODUCT TYPE BREAKDOWN & TOP REVENUE PRODUCTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product Type Breakdown (Single vs Combo Deals) */}
        <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-[#161113] p-6 shadow-xs space-y-4">
          <div className="border-b border-stone-100 dark:border-stone-800/60 pb-3">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Gift className="h-4.5 w-4.5 text-rose-500" />
              Catalog Composition
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">Single items vs Combo Deals in inventory</p>
          </div>

          <div className="h-[200px] w-full [&_.recharts-surface]:outline-none [&_.recharts-wrapper]:outline-none [&_*]:outline-none focus:outline-none">
            {isMounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={productTypeData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#332A2E" strokeOpacity={0.5} vertical={false} />
                  <XAxis dataKey="name" stroke="#78716C" tick={{ fill: "#A8A29E", fontSize: 11 }} />
                  <YAxis stroke="#78716C" tick={{ fill: "#A8A29E", fontSize: 11 }} />
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
        <div className="lg:col-span-2 rounded-2xl border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-[#161113] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800/60 pb-3">
            <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Clock className="h-4.5 w-4.5 text-rose-500" />
              Recent Customer Orders
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs font-bold text-rose-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
            >
              View All Orders <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recent.recentOrders.length === 0 ? (
            <p className="text-xs text-stone-400 dark:text-stone-500 py-8 text-center">No recent orders recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-stone-200 dark:border-stone-800 text-stone-500 dark:text-stone-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="pb-3">Order #</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                  {recent.recentOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-stone-50 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3 font-mono font-bold text-rose-500">{o.orderNumber}</td>
                      <td className="py-3 text-stone-800 dark:text-stone-200 font-medium">{o.customer?.name || "Guest User"}</td>
                      <td className="py-3 font-bold text-stone-900 dark:text-stone-100">৳{(o.pricing?.total || 0).toLocaleString()}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            o.status === "delivered"
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20"
                              : o.status === "pending"
                              ? "bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20"
                              : "bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-stone-500 dark:text-stone-400 font-mono">
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
      <div className="rounded-2xl border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-[#161113] p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800/60 pb-3">
          <h3 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
            <AlertTriangle className="h-4.5 w-4.5 text-amber-500" />
            Low Stock Inventory Alerts
          </h3>
          <Link
            href="/admin/products"
            className="text-xs font-bold text-rose-500 hover:text-rose-400 flex items-center gap-1 transition-colors"
          >
            Manage Product Stock <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recent.lowStockAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-2">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            <p className="text-xs font-medium text-stone-500 dark:text-stone-400">All inventory stock levels are optimal!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {recent.lowStockAlerts.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-stone-50 dark:bg-[#0d0709] border border-stone-200/70 dark:border-stone-800 hover:border-amber-500/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {item.thumbnail && (
                    <img
                      src={item.thumbnail}
                      alt={item.name}
                      className="h-10 w-10 rounded-lg object-cover border border-stone-200 dark:border-stone-800 shrink-0"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate">{item.name}</p>
                    <p className="text-[11px] font-mono text-rose-500">৳{item.price?.toLocaleString()}</p>
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
      <div id="printable-pdf-report" className="mt-8 border-t border-stone-200 dark:border-stone-800/80 pt-6 space-y-6">
        <div className="flex items-center justify-between border-b-2 border-rose-600 pb-3">
          <div>
            <h2 className="text-xl font-black text-rose-600 uppercase tracking-wide">CHERRY GLOW K-BEAUTY STORE</h2>
            <p className="text-xs text-stone-500">Executive Admin Analytics & Sales Performance PDF Summary</p>
          </div>
          <div className="text-right text-xs text-stone-500">
            <p className="font-bold text-stone-900 dark:text-stone-100">Period: <span className="uppercase text-rose-600 font-extrabold">{dateRange}</span></p>
            <p className="font-mono">Generated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#0d0709] border border-stone-200 dark:border-stone-800">
            <p className="text-stone-500 uppercase font-bold text-[10px]">Total Store Revenue</p>
            <p className="text-lg font-black text-stone-900 dark:text-stone-100 mt-0.5">{"৳"}{rev.total.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#0d0709] border border-stone-200 dark:border-stone-800">
            <p className="text-rose-600 uppercase font-bold text-[10px]">Period Filtered Sales</p>
            <p className="text-lg font-black text-rose-500 mt-0.5">{"৳"}{(rev.rangeFiltered || rev.total).toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#0d0709] border border-stone-200 dark:border-stone-800">
            <p className="text-stone-500 uppercase font-bold text-[10px]">Total Orders</p>
            <p className="text-lg font-black text-stone-900 dark:text-stone-100 mt-0.5">{ord.total.toLocaleString()}</p>
          </div>
          <div className="p-3 rounded-xl bg-stone-50 dark:bg-[#0d0709] border border-stone-200 dark:border-stone-800">
            <p className="text-stone-500 uppercase font-bold text-[10px]">Average Order Value (AOV)</p>
            <p className="text-lg font-black text-stone-900 dark:text-stone-100 mt-0.5">{"৳"}{ord.aov?.toLocaleString() || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
