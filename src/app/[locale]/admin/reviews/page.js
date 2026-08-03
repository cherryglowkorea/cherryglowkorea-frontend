"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import Image from "next/image";
import {
  Star,
  CheckCircle2,
  XCircle,
  Trash2,
  MessageSquare,
  Sparkles,
  Search,
  Filter,
  Check,
  X,
  Loader2,
  User,
} from "lucide-react";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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
      toast.success(`Review set to "${status.toUpperCase()}"!`);
      // Update local state instantly
      setReviews((prev) =>
        prev.map((r) => (r._id === id ? { ...r, status } : r))
      );
    } catch (err) {
      console.error(err);
      toast.error("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  /* ---------------- Delete Handler ---------------- */
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this customer review?")) return;
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

  /* ---------------- Filtering ---------------- */
  const filteredReviews = reviews.filter((r) => {
    const matchesStatus = statusFilter === "all" || r.status === statusFilter;
    const matchesSearch =
      r.userName?.toLowerCase().includes(search.toLowerCase()) ||
      r.comment?.toLowerCase().includes(search.toLowerCase()) ||
      r.productName?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const totalCount = reviews.length;
  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const approvedCount = reviews.filter((r) => r.status === "approved").length;
  const rejectedCount = reviews.filter((r) => r.status === "rejected").length;

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-[1600px] mx-auto text-stone-800 dark:text-stone-100">
      
      {/* Top Header & Metrics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-200 dark:border-rose-950/60 pb-5">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider text-rose-600 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/40 shadow-2xs">
            <Sparkles className="h-3.5 w-3.5" /> Customer Feedback & Approval
          </span>
          <h1 className="text-2xl md:text-3xl font-extrabold font-serif text-stone-900 dark:text-white mt-1">
            Customer Reviews Management
          </h1>
          <p className="text-xs text-stone-500 dark:text-slate-400">
            Approve or reject reviews to control which testimonials show on Swiper landing page & product details page
          </p>
        </div>

        <button
          onClick={fetchReviews}
          className="px-4 py-2 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 dark:hover:bg-slate-700 text-stone-700 dark:text-slate-200 text-xs font-bold transition cursor-pointer"
        >
          🔄 Refresh Reviews
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div
          onClick={() => setStatusFilter("all")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "all"
              ? "bg-rose-500 text-white border-rose-500 shadow-md"
              : "bg-white dark:bg-[#160E12] border-stone-200 dark:border-slate-800 hover:border-stone-300"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Total Reviews</p>
          <p className="text-2xl font-black font-mono mt-1">{totalCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter("pending")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "pending"
              ? "bg-amber-500 text-white border-amber-500 shadow-md"
              : "bg-white dark:bg-[#160E12] border-stone-200 dark:border-slate-800 hover:border-amber-400"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Pending Approval</p>
          <p className="text-2xl font-black font-mono mt-1">{pendingCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter("approved")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "approved"
              ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
              : "bg-white dark:bg-[#160E12] border-stone-200 dark:border-slate-800 hover:border-emerald-400"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Approved (Live)</p>
          <p className="text-2xl font-black font-mono mt-1">{approvedCount}</p>
        </div>

        <div
          onClick={() => setStatusFilter("rejected")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === "rejected"
              ? "bg-rose-700 text-white border-rose-700 shadow-md"
              : "bg-white dark:bg-[#160E12] border-stone-200 dark:border-slate-800 hover:border-rose-400"
          }`}
        >
          <p className="text-[11px] font-bold uppercase tracking-wider opacity-80">Rejected</p>
          <p className="text-2xl font-black font-mono mt-1">{rejectedCount}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#160E12] p-4 rounded-2xl border border-stone-200 dark:border-slate-800">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search by customer name or text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2">
          {["all", "pending", "approved", "rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition cursor-pointer ${
                statusFilter === st
                  ? "bg-rose-500 text-white"
                  : "bg-stone-100 dark:bg-slate-900 text-stone-600 dark:text-slate-300 hover:bg-stone-200"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews Table Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-rose-500" />
          <p className="text-xs text-stone-500">Loading customer reviews...</p>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-[#160E12] rounded-3xl border border-stone-200 dark:border-slate-800 space-y-2">
          <MessageSquare className="h-10 w-10 text-stone-300 mx-auto" />
          <p className="text-sm font-bold text-stone-700 dark:text-white">No reviews found</p>
          <p className="text-xs text-stone-500">Try changing the search query or status filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredReviews.map((rev) => {
            const dateStr = rev.createdAt
              ? new Date(rev.createdAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })
              : "";

            const isPending = rev.status === "pending";
            const isApproved = rev.status === "approved";
            const isRejected = rev.status === "rejected";

            return (
              <div
                key={rev._id}
                className="p-5 rounded-3xl bg-white dark:bg-[#160E12] border border-stone-200 dark:border-slate-800 space-y-4 flex flex-col justify-between transition-all hover:border-stone-300"
              >
                <div className="space-y-3">
                  
                  {/* Top Customer Info & Status Badge */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 rounded-full overflow-hidden border border-stone-200 dark:border-slate-800 bg-stone-100 dark:bg-slate-900 shrink-0">
                        {rev.userAvatar ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={rev.userAvatar} alt={rev.userName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-stone-400 bg-rose-50 dark:bg-rose-950">
                            <User className="h-5 w-5 text-rose-500" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-stone-900 dark:text-white text-xs">{rev.userName}</h4>
                        <p className="text-[10px] text-stone-400">{dateStr || "Recent Review"}</p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        isApproved
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300"
                          : isRejected
                          ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border border-rose-300"
                          : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-300"
                      }`}
                    >
                      {rev.status}
                    </span>
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={
                          i < (rev.rating || 5)
                            ? "fill-amber-400 text-amber-400"
                            : "text-stone-200 dark:text-slate-800"
                        }
                      />
                    ))}
                    <span className="text-[11px] font-bold text-stone-500 ml-1 font-mono">{rev.rating}/5</span>
                  </div>

                  {/* Product Attached (if any) */}
                  {rev.productName && (
                    <div className="p-2 rounded-xl bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 flex items-center gap-2 text-[11px]">
                      {rev.productImage && (
                        <div className="relative h-7 w-7 rounded-md overflow-hidden bg-white border shrink-0">
                          <Image src={rev.productImage} alt={rev.productName} fill className="object-cover" />
                        </div>
                      )}
                      <span className="font-semibold text-stone-700 dark:text-slate-300 truncate">{rev.productName}</span>
                    </div>
                  )}

                  {/* Comment */}
                  <p className="text-xs text-stone-700 dark:text-slate-300 leading-relaxed font-sans bg-stone-50/50 dark:bg-slate-900/40 p-3 rounded-2xl border border-stone-100 dark:border-slate-800">
                    “{rev.comment}”
                  </p>
                </div>

                {/* Actions Row */}
                <div className="pt-3 border-t border-stone-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1">
                    {!isApproved && (
                      <button
                        onClick={() => handleStatusChange(rev._id, "approved")}
                        disabled={updatingId === rev._id}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <Check className="h-3.5 w-3.5" /> Approve
                      </button>
                    )}

                    {!isRejected && (
                      <button
                        onClick={() => handleStatusChange(rev._id, "rejected")}
                        disabled={updatingId === rev._id}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-700 dark:bg-rose-950 dark:text-rose-300 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-1 disabled:opacity-50"
                      >
                        <X className="h-3.5 w-3.5" /> Reject
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleDelete(rev._id)}
                    disabled={updatingId === rev._id}
                    className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950 transition cursor-pointer shrink-0"
                    title="Delete Review"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
