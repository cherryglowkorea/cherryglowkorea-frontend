"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Layers,
  Sparkles,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  DollarSign,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default function DashboardOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:5000/admin/dashboard/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch dashboard statistics");
      }

      const data = await res.json();
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.message || "Failed to load dashboard");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-rose-500" />
          <p className="text-sm font-medium text-slate-400">Loading Dashboard Analytics...</p>
        </div>
      </div>
    );
  }

  // Fallbacks
  const rev = stats?.revenue || { today: 0, thisMonth: 0, total: 0 };
  const ord = stats?.orders || { total: 0, pending: 0, processing: 0, shipped: 0, delivered: 0, cancelled: 0 };
  const prod = stats?.products || { total: 0, singleCount: 0, comboCount: 0, lowStockCount: 0 };
  const cust = stats?.customers || { totalUsers: 0, customerCount: 0, adminCount: 0 };
  const charts = stats?.charts || { salesOverview: [], orderDistribution: [], topProducts: [], revenueByType: [] };
  const recent = stats?.recentActivity || { recentOrders: [], recentUsers: [], lowStockAlerts: [] };

  return (
    <div className="space-y-8">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Dashboard Overview
            </h1>
            <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-400">
              Live Real-Time
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time revenue, sales analytics, inventory warnings & recent customer activity.
          </p>
        </div>

        <button
          onClick={fetchStats}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 px-4 py-2 text-xs font-medium text-slate-200 transition-colors shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className="h-3.5 w-3.5 text-rose-400" />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* 1. TOP SUMMARY STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <div className="relative overflow-hidden rounded-2xl border border-rose-900/40 bg-gradient-to-br from-slate-900 via-rose-950/40 to-slate-900 p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Total Revenue</span>
            <div className="rounded-xl bg-rose-500/20 p-2 text-rose-300">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-white">
            ৳{rev.total.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-rose-900/30 pt-2">
            <span>Today: <strong className="text-rose-200">৳{rev.today.toLocaleString()}</strong></span>
            <span>Month: <strong className="text-rose-200">৳{rev.thisMonth.toLocaleString()}</strong></span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Orders</span>
            <div className="rounded-xl bg-blue-500/20 p-2 text-blue-400">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-white">
            {ord.total.toLocaleString()}
          </p>
          <div className="mt-2 flex items-center gap-2 text-[11px]">
            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 text-amber-400 font-semibold border border-amber-500/20">
              Pending: {ord.pending}
            </span>
            <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-emerald-400 font-semibold border border-emerald-500/20">
              Delivered: {ord.delivered}
            </span>
          </div>
        </div>

        {/* Total Products */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Products</span>
            <div className="rounded-xl bg-purple-500/20 p-2 text-purple-400">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-white">
            {prod.total}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2">
            <span>Single: <strong className="text-slate-200">{prod.singleCount}</strong></span>
            <span>Combo Deals: <strong className="text-rose-400">{prod.comboCount}</strong></span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Customers</span>
            <div className="rounded-xl bg-emerald-500/20 p-2 text-emerald-400">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-white">
            {cust.totalUsers}
          </p>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800 pt-2">
            <span>Registered: <strong className="text-slate-200">{cust.customerCount}</strong></span>
            <span>Admins: <strong className="text-amber-400">{cust.adminCount}</strong></span>
          </div>
        </div>

        {/* Low Stock Warning Card */}
        <div className={`relative overflow-hidden rounded-2xl border p-5 shadow-xl ${
          prod.lowStockCount > 0
            ? "border-amber-500/40 bg-gradient-to-br from-slate-900 via-amber-950/30 to-slate-900"
            : "border-slate-800 bg-slate-900/90"
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Low Stock Alert</span>
            <div className="rounded-xl bg-amber-500/20 p-2 text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-2xl font-black tracking-tight text-white">
            {prod.lowStockCount} <span className="text-xs font-medium text-slate-400">items</span>
          </p>
          <div className="mt-2 text-[11px] text-amber-300/80 font-medium">
            {prod.lowStockCount > 0 ? "Requires restock action" : "Inventory stock optimal"}
          </div>
        </div>
      </div>

      {/* 2. CHARTS & GRAPH SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview Trend Bar Chart */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-rose-400" />
                Sales & Revenue Overview (7 Days)
              </h3>
              <p className="text-xs text-slate-400">Daily revenue totals and order counts</p>
            </div>
          </div>

          {/* Custom Responsive CSS Bar Chart */}
          <div className="h-64 pt-6 flex items-end justify-between gap-2 border-b border-slate-800 pb-2">
            {charts.salesOverview.map((item, idx) => {
              const maxRev = Math.max(...charts.salesOverview.map((s) => s.revenue), 1000);
              const heightPercent = Math.max(Math.round((item.revenue / maxRev) * 100), 8);

              return (
                <div key={idx} className="flex flex-1 flex-col items-center gap-2 group h-full justify-end">
                  {/* Tooltip on hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-[10px] text-rose-200 px-2 py-1 rounded-md font-mono border border-slate-700 shadow-md">
                    ৳{item.revenue} ({item.orders} orders)
                  </div>
                  {/* Bar */}
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-rose-700 to-rose-500 group-hover:from-rose-500 group-hover:to-rose-400 transition-all duration-300 shadow-lg shadow-rose-950"
                  />
                  <span className="text-[11px] font-medium text-slate-400">{item.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Status Distribution */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Order Status Distribution</h3>
            <p className="text-xs text-slate-400">Breakdown across order fulfillment states</p>
          </div>

          <div className="space-y-3 my-4">
            {charts.orderDistribution.map((st, idx) => {
              const pct = ord.total > 0 ? Math.round((st.value / ord.total) * 100) : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-slate-300">
                    <span>{st.name}</span>
                    <span className="font-mono text-slate-400">{st.value} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                    <div
                      style={{ width: `${pct}%`, backgroundColor: st.color }}
                      className="h-full rounded-full transition-all duration-500"
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-3 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>Fulfillment Rate</span>
            <span className="font-bold text-emerald-400">
              {ord.total > 0 ? Math.round((ord.delivered / ord.total) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>

      {/* 3. RECENT ACTIVITY & LOW STOCK ALERTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table (2 cols) */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-rose-400" />
              Recent Orders
            </h3>
            <Link
              href="/admin/orders"
              className="text-xs font-semibold text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              View All <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recent.recentOrders.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">No recent orders recorded.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3">Order #</th>
                    <th className="pb-3">Customer</th>
                    <th className="pb-3">Total</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recent.recentOrders.map((o) => (
                    <tr key={o._id} className="hover:bg-slate-800/40">
                      <td className="py-3 font-mono font-bold text-rose-300">{o.orderNumber}</td>
                      <td className="py-3 text-slate-200">{o.customer?.name || "Guest"}</td>
                      <td className="py-3 font-semibold text-white">৳{o.pricing?.total || 0}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            o.status === "delivered"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : o.status === "pending"
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          }`}
                        >
                          {o.status}
                        </span>
                      </td>
                      <td className="py-3 text-right text-slate-400">
                        {new Date(o.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Low Stock Warnings */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
              Low Stock Warnings
            </h3>
            <Link
              href="/admin/products"
              className="text-xs font-semibold text-rose-400 hover:text-rose-300"
            >
              Manage Stock
            </Link>
          </div>

          {recent.lowStockAlerts.length === 0 ? (
            <p className="text-xs text-slate-500 py-6 text-center">All inventory stock levels optimal.</p>
          ) : (
            <div className="space-y-3">
              {recent.lowStockAlerts.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-800"
                >
                  <div className="flex items-center gap-3">
                    {item.thumbnail && (
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        className="h-9 w-9 rounded-lg object-cover border border-slate-700"
                      />
                    )}
                    <div>
                      <p className="text-xs font-bold text-slate-200 line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-slate-400">৳{item.price}</p>
                    </div>
                  </div>

                  <span className="px-2.5 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 font-extrabold text-xs">
                    {item.stock} left
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
