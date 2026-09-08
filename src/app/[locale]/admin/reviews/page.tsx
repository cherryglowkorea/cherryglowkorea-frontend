"use client";

import { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";
import Image from "next/image";
import {
  Star,
  Check,
  X,
  Trash2,
  MessageSquare,
  Sparkles,
  Search,
  RefreshCw,
  User,
  LayoutGrid,
  List,
  CheckCircle2,
  Clock,
  XCircle,
  ShoppingBag,
  ThumbsUp,
} from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Filters & Views
  const [statusFilter, setStatusFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid"); // 'grid' | 'table'

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  /* ---------------- Fetch All Admin Reviews ---------------- */
  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/reviews/admin/all`);
      setReviews(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load customer reviews");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  /* ---------------- Approve / Reject Handler ---------------- */
  const handleStatusChange = async (id, status) => {
    setUpdatingId(id);
    try {
      await axios.patch(`${API_BASE}/reviews/admin/${id}/status`, { status });
      toast.success(`Review status set to "${status.toUpperCase()}"`);
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update review status");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ---------------- Delete Handler ---------------- */
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to permanently delete this customer review?")) return;
    setUpdatingId(id);
    try {
      await axios.delete(`${API_BASE}/reviews/admin/${id}`);
      toast.success("Review deleted successfully!");
      setReviews((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete review");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ---------------- Analytics & Metrics ---------------- */
  const metrics = useMemo(() => {
    const total = reviews.length;
    const pending = reviews.filter((r) => r.status === "pending").length;
    const approved = reviews.filter((r) => r.status === "approved").length;
    const rejected = reviews.filter((r) => r.status === "rejected").length;

    const totalStars = reviews.reduce((sum, r) => sum + (Number(r.rating) || 5), 0);
    const avgRating = total > 0 ? (totalStars / total).toFixed(1) : "5.0";

    const starCounts = {
      5: reviews.filter((r) => Math.round(r.rating) === 5).length,
      4: reviews.filter((r) => Math.round(r.rating) === 4).length,
      3: reviews.filter((r) => Math.round(r.rating) === 3).length,
      2: reviews.filter((r) => Math.round(r.rating) === 2).length,
      1: reviews.filter((r) => Math.round(r.rating) === 1).length,
    };

    return { total, pending, approved, rejected, avgRating, starCounts };
  }, [reviews]);

  /* ---------------- Filter Reviews ---------------- */
  const filteredReviews = useMemo(() => {
    return reviews.filter((r) => {
      // Status Filter
      if (statusFilter !== "all" && r.status !== statusFilter) {
        return false;
      }

      // Rating Filter
      if (ratingFilter !== "all" && Math.round(r.rating) !== Number(ratingFilter)) {
        return false;
      }

      // Search Query
      if (search.trim()) {
        const q = search.toLowerCase().trim();
        const user = (r.userName || "").toLowerCase();
        const comment = (r.comment || "").toLowerCase();
        const product = (r.productName || "").toLowerCase();
        return user.includes(q) || comment.includes(q) || product.includes(q);
      }

      return true;
    });
  }, [reviews, statusFilter, ratingFilter, search]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setRatingFilter("all");
  };

  const isFiltered = search !== "" || statusFilter !== "all" || ratingFilter !== "all";

  const getInitial = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="w-full space-y-8 pb-12">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
              Customer Reviews & Feedback
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs">
              {reviews.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Approve, reject, or manage customer testimonials shown on storefront and product details pages.
          </p>
        </div>

        <button
          onClick={fetchReviews}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#0d0709] text-xs font-semibold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-all shadow-2xs self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 text-stone-400 ${loading ? "animate-spin text-rose-500" : ""}`} />
          <span>Refresh Reviews</span>
        </button>
      </div>

      {/* 2. Metrics & Average Rating Analytics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {/* Rating Analytics Card */}
        <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl border border-amber-500/30 dark:border-stone-800/80 bg-white dark:bg-[#161113] flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Avg Rating
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Star className="h-4 w-4 fill-amber-400" />
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-amber-500 font-mono">
              {metrics.avgRating}
            </span>
            <span className="text-xs text-stone-500 dark:text-stone-400 font-medium">
              out of 5.0
            </span>
          </div>

          <div className="flex items-center gap-1 mt-1 text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3.5 w-3.5 ${
                  i < Math.round(Number(metrics.avgRating))
                    ? "fill-amber-400 text-amber-400"
                    : "text-stone-300 dark:text-stone-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Total Reviews */}
        <div
          onClick={() => setStatusFilter("all")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "all"
              ? "border-rose-500 ring-1 ring-rose-500/20 bg-white dark:bg-[#161113]"
              : "border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113] hover:border-stone-700"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">
              Total Reviews
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-stone-900 dark:text-stone-100 mt-2">
            {metrics.total}
          </div>
          <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1">
            Submitted feedback
          </div>
        </div>

        {/* Pending Approval */}
        <div
          onClick={() => setStatusFilter("pending")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "pending"
              ? "border-amber-500 ring-1 ring-amber-500/20 bg-white dark:bg-[#161113]"
              : "border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113] hover:border-amber-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
              Pending Approval
            </span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-2">
            {metrics.pending}
          </div>
          <div className="text-[11px] text-amber-600/70 dark:text-amber-400/60 mt-1">
            Requires moderation
          </div>
        </div>

        {/* Approved (Live) */}
        <div
          onClick={() => setStatusFilter("approved")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "approved"
              ? "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/40"
              : "border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113] hover:border-emerald-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              Approved (Live)
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            {metrics.approved}
          </div>
          <div className="text-[11px] text-emerald-600/70 dark:text-emerald-400/60 mt-1">
            Visible on store
          </div>
        </div>

        {/* Rejected */}
        <div
          onClick={() => setStatusFilter("rejected")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "rejected"
              ? "border-rose-600 ring-2 ring-rose-600/20 bg-rose-100/50 dark:bg-rose-950/40"
              : "border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113] hover:border-rose-500/50"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-rose-700 dark:text-rose-300">
              Rejected
            </span>
            <div className="p-2 rounded-xl bg-rose-200 dark:bg-rose-900 text-rose-700 dark:text-rose-300">
              <XCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-2">
            {metrics.rejected}
          </div>
          <div className="text-[11px] text-rose-600/80 dark:text-rose-400/80 mt-1">
            Hidden from store
          </div>
        </div>
      </div>

      {/* 3. Search, Filters & View Toggle Bar */}
      <div className="space-y-4 bg-white dark:bg-[#161113] p-4 sm:p-5 rounded-3xl border border-stone-200 dark:border-stone-800/80 shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by customer name, product name, or review comment..."
              className="w-full rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] py-2.5 pl-10 pr-10 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Rating Dropdown Filter */}
          <div className="flex items-center gap-2">
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] px-3 py-2.5 text-xs text-stone-800 dark:text-stone-200 focus:border-rose-500 focus:outline-none"
            >
              <option value="all">All Ratings (1-5 Stars)</option>
              <option value="5">5 Stars Only ★★★★★</option>
              <option value="4">4 Stars Only ★★★★</option>
              <option value="3">3 Stars Only ★★★</option>
              <option value="2">2 Stars Only ★★</option>
              <option value="1">1 Star Only ★</option>
            </select>

            {/* Layout View Mode Toggle */}
            <div className="flex items-center rounded-2xl border border-stone-200 dark:border-stone-800 bg-stone-50 dark:bg-[#0d0709] p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === "grid"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                }`}
                title="Grid View"
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`p-1.5 rounded-xl transition-all ${
                  viewMode === "table"
                    ? "bg-rose-600 text-white shadow-xs"
                    : "text-stone-500 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                }`}
                title="Table View"
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {isFiltered && (
              <button
                onClick={clearFilters}
                className="p-2 rounded-2xl border border-stone-200 dark:border-stone-800 text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 text-xs font-semibold shrink-0"
                title="Clear Filters"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Status Filter Pill Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar border-t border-stone-100 dark:border-stone-800/60">
          {[
            { key: "all", label: "All Reviews", count: metrics.total },
            { key: "pending", label: "Pending", count: metrics.pending },
            { key: "approved", label: "Approved (Live)", count: metrics.approved },
            { key: "rejected", label: "Rejected", count: metrics.rejected },
          ].map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-rose-600 text-white shadow-xs"
                    : "bg-stone-100 dark:bg-stone-800/80 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-800"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-200"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Results Info Bar */}
      <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
        <span>
          Showing <strong>{filteredReviews.length}</strong> of {reviews.length} customer reviews
        </span>
      </div>

      {/* 5. Main Content: Grid View or Table View */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-rose-500" />
          <p className="text-xs text-stone-500 dark:text-stone-400">Loading customer reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#161113] rounded-3xl border border-stone-200 dark:border-stone-800/80 space-y-2">
          <MessageSquare className="h-10 w-10 text-stone-300 dark:text-stone-700 mx-auto" />
          <p className="text-sm font-bold text-stone-900 dark:text-stone-100">No customer reviews found</p>
          <p className="text-xs text-stone-500 dark:text-stone-400">Try adjusting your search query or status filter.</p>
        </div>
      ) : viewMode === "grid" ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredReviews.map((rev) => {
            const isPending = rev.status === "pending";
            const isApproved = rev.status === "approved";
            const isRejected = rev.status === "rejected";

            return (
              <div
                key={rev._id}
                className="p-5 rounded-3xl bg-white dark:bg-[#161113] border border-stone-200 dark:border-stone-800/80 shadow-xs hover:shadow-md space-y-4 flex flex-col justify-between transition-all relative overflow-hidden group"
              >
                <div className="space-y-3">
                  {/* Top Row: User Avatar, Name & Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
                        {getInitial(rev.userName)}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                          {rev.userName || "Customer"}
                        </h4>
                        <p className="text-[11px] text-stone-400 dark:text-stone-400">
                          {rev.createdAt
                            ? new Date(rev.createdAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })
                            : "Recent Review"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider capitalize ${
                        isApproved
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                          : isRejected
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                      }`}
                    >
                      {rev.status}
                    </span>
                  </div>

                  {/* Rating Stars Bar */}
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < (rev.rating || 5)
                              ? "fill-amber-400 text-amber-400"
                              : "text-stone-200 dark:text-stone-800"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400 font-mono">
                      {rev.rating || 5}.0
                    </span>
                  </div>

                  {/* Attached Product Card (If any) */}
                  {rev.productName && (
                    <div className="p-2.5 rounded-2xl bg-stone-50 dark:bg-[#0d0709] border border-stone-100 dark:border-stone-800/60 flex items-center gap-2.5 text-xs">
                      <ShoppingBag className="h-4 w-4 text-rose-500 shrink-0" />
                      <span className="font-semibold text-stone-800 dark:text-stone-100 truncate">
                        {rev.productName}
                      </span>
                    </div>
                  )}

                  {/* Review Comment Quote */}
                  <div className="p-3.5 rounded-2xl bg-stone-50/70 dark:bg-[#0d0709]/60 border border-stone-100 dark:border-stone-800/60">
                    <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed italic">
                      “{rev.comment}”
                    </p>
                  </div>
                </div>

                {/* Balanced Actions Row */}
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {!isApproved && (
                      <button
                        onClick={() => handleStatusChange(rev._id, "approved")}
                        disabled={updatingId === rev._id}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all flex items-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                    )}

                    {!isRejected && (
                      <button
                        onClick={() => handleStatusChange(rev._id, "rejected")}
                        disabled={updatingId === rev._id}
                        className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-800/50 text-stone-700 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold text-xs transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        <X className="h-3.5 w-3.5 text-stone-400" /> Reject
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(rev._id)}
                    disabled={updatingId === rev._id}
                    className="p-1.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-all cursor-pointer"
                    title="Delete Review"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="overflow-hidden rounded-3xl border border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113] shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 dark:bg-[#0d0709] border-b border-stone-200 dark:border-stone-800">
                <tr className="text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Product</th>
                  <th className="py-3.5 px-4 text-center">Rating</th>
                  <th className="py-3.5 px-4">Review Comment</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 dark:divide-stone-800/60">
                {filteredReviews.map((rev) => {
                  const isApproved = rev.status === "approved";
                  const isRejected = rev.status === "rejected";

                  return (
                    <tr key={rev._id} className="hover:bg-stone-50/80 dark:hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-rose-500 to-pink-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                            {getInitial(rev.userName)}
                          </div>
                          <div>
                            <p className="font-bold text-stone-900 dark:text-stone-100">{rev.userName}</p>
                            <p className="text-[10px] text-stone-400 dark:text-stone-400">
                              {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : "Recent"}
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-stone-800 dark:text-stone-200 font-medium">
                        {rev.productName || "General Store Review"}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-1 font-bold text-amber-500 font-mono">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          {rev.rating || 5}.0
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-stone-700 dark:text-stone-300 max-w-xs truncate">
                        “{rev.comment}”
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider capitalize ${
                            isApproved
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                              : isRejected
                              ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800"
                          }`}
                        >
                          {rev.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isApproved && (
                            <button
                              onClick={() => handleStatusChange(rev._id, "approved")}
                              className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition"
                              title="Approve Review"
                            >
                              <Check className="h-3.5 w-3.5" />
                            </button>
                          )}
                          {!isRejected && (
                            <button
                              onClick={() => handleStatusChange(rev._id, "rejected")}
                              className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition"
                              title="Reject Review"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(rev._id)}
                            className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                            title="Delete Review"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
