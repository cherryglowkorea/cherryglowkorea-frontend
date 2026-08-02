"use client";

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import {
  Plus,
  Search,
  Package,
  Layers,
  Gift,
  AlertTriangle,
  RefreshCw,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Pencil,
  Copy,
  ExternalLink,
  Flame,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ProductTable from "@/components/products/ProductTable";
import ProductMobileCard from "@/components/products/ProductMobileCard";
import { useGetCategoriesQuery } from "@/redux/api/ecommerceApi";

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null); // For Quick View Modal

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Filter states
  const searchParams = useSearchParams();
  const initialType = searchParams.get("type") || "all";
  const [typeFilter, setTypeFilter] = useState(initialType);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const { data: dbCategories } = useGetCategoriesQuery();

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");
    return token;
  };

  /* ---------------- Debounce Search Query ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  /* ---------------- Reset Page when filters change ---------------- */
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, typeFilter, selectedCategory, limit]);

  /* ---------------- Helpers ---------------- */

  const getMinPrice = (variants = []) => {
    if (!variants || !variants.length) return 0;
    const prices = variants.map((v) => Number(v.price) || 0).filter((p) => p > 0);
    return prices.length ? Math.min(...prices) : 0;
  };

  const getThumbnail = (p) => {
    return p.thumbnail || p.images?.[0]?.url || p.image || "/placeholder.png";
  };

  // 🔥 normalize data
  const normalizedProducts = useMemo(() => {
    return products.map((p) => ({
      ...p,
      id: p._id?.$oid || p._id,
      minPrice: getMinPrice(p.variants),
      thumbnail: getThumbnail(p),
    }));
  }, [products]);

  /* ---------------- Server Paginated Fetch ---------------- */

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(limit),
        search: debouncedSearch,
        category: selectedCategory === "all" ? "All" : selectedCategory,
        type: typeFilter,
      });

      const res = await axios.get(`${API_BASE}/products/allProduct/public?${params.toString()}`);

      if (res.data && typeof res.data === "object" && Array.isArray(res.data.products)) {
        setProducts(res.data.products);
        setTotalPages(res.data.totalPages || 1);
        setTotalProducts(res.data.totalProducts || 0);
      } else if (Array.isArray(res.data)) {
        setProducts(res.data);
        setTotalProducts(res.data.length);
        setTotalPages(1);
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to load paginated products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, limit, debouncedSearch, typeFilter, selectedCategory]);

  /* ---------------- Summary Counts ---------------- */
  const counts = useMemo(() => {
    const total = totalProducts;
    const combo = normalizedProducts.filter((p) => p.type === "combo").length;
    const single = normalizedProducts.filter((p) => p.type !== "combo").length;
    const lowStock = normalizedProducts.filter((p) => {
      const stock = typeof p.stock === "number"
        ? p.stock
        : (p.variants || []).reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
      return stock <= 5;
    }).length;

    return { total, combo, single, lowStock };
  }, [totalProducts, normalizedProducts]);

  /* ---------------- Page Numbers Generator ---------------- */
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPages];
    }
    if (currentPage >= totalPages - 3) {
      return [1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    }
    return [1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages];
  }, [currentPage, totalPages]);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
  };

  /* ---------------- Actions ---------------- */

  const deleteProduct = async (id) => {
    try {
      const token = await getToken();

      await axios.delete(`${API_BASE}/products/deleteProduct/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Product deleted successfully");
      if (selectedProduct && (selectedProduct.id === id || selectedProduct._id === id)) {
        setSelectedProduct(null);
      }
      fetchProducts();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const duplicateCombo = async (id) => {
    try {
      const token = await getToken();
      await axios.post(`${API_BASE}/combos/duplicate/${id}`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("Combo product duplicated successfully");
      fetchProducts();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Duplication failed");
    }
  };

  const startItem = totalProducts === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalProducts);

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 dark:border-rose-900/30 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white flex items-center gap-2">
              <span>Product Catalog</span>
              <Sparkles className="h-5 w-5 text-rose-500 dark:text-rose-400" />
            </h1>
            <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
              {totalProducts} Total Items
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 mt-1">
            Manage your store inventory, pricing, variants, and combo deals with server pagination.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchProducts}
            className="p-2.5 rounded-xl bg-white dark:bg-rose-950/60 border border-stone-200 dark:border-rose-800/40 text-stone-700 dark:text-rose-200 hover:bg-stone-50 dark:hover:bg-rose-900/60 shadow-xs cursor-pointer"
            title="Refresh Products"
          >
            <RefreshCw className="h-4 w-4 text-rose-500 dark:text-rose-400" />
          </button>

          <Button
            onClick={() => router.push("/admin/create")}
            className="gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl px-4 py-2.5 shadow-md hover:shadow-rose-500/30 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Product</span>
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Total Products */}
        <div
          onClick={() => { setTypeFilter("all"); setSelectedCategory("all"); }}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            typeFilter === "all" && selectedCategory === "all"
              ? "bg-white dark:bg-[#160E12] border-rose-400 dark:border-rose-500/50 shadow-md ring-2 ring-rose-500/20"
              : "bg-white dark:bg-[#160E12]/80 border-stone-200/80 dark:border-rose-900/30 hover:border-rose-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-slate-400 font-medium">
            <span>Total Catalog</span>
            <Package className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-xl font-black text-stone-900 dark:text-white mt-2">
            {counts.total} <span className="text-xs font-normal text-stone-500">items</span>
          </p>
        </div>

        {/* Single Items */}
        <div
          onClick={() => setTypeFilter("single")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            typeFilter === "single"
              ? "bg-white dark:bg-[#160E12] border-blue-400 dark:border-blue-500/50 shadow-md ring-2 ring-blue-500/20"
              : "bg-white dark:bg-[#160E12]/80 border-stone-200/80 dark:border-rose-900/30 hover:border-blue-300"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-slate-400 font-medium">
            <span>Single Products</span>
            <Layers className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-xl font-black text-stone-900 dark:text-white mt-2">
            {counts.single} <span className="text-xs font-normal text-stone-500">on page</span>
          </p>
        </div>

        {/* Combo Deals */}
        <div
          onClick={() => setTypeFilter("combo")}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            typeFilter === "combo"
              ? "bg-white dark:bg-[#160E12] border-rose-500 dark:border-rose-500/50 shadow-md ring-2 ring-rose-500/20"
              : "bg-white dark:bg-[#160E12]/80 border-stone-200/80 dark:border-rose-900/30 hover:border-rose-400"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-slate-400 font-medium">
            <span>Combo Deals</span>
            <Gift className="h-4 w-4 text-rose-500" />
          </div>
          <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {counts.combo} <span className="text-xs font-normal text-stone-500">on page</span>
          </p>
        </div>

        {/* Low Stock Warning */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            counts.lowStock > 0
              ? "bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-500/40"
              : "bg-white dark:bg-[#160E12]/80 border-stone-200/80 dark:border-rose-900/30"
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-700 dark:text-amber-400 font-medium">
            <span>Low Stock Alert</span>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </div>
          <p className="text-xl font-black text-stone-900 dark:text-white mt-2">
            {counts.lowStock} <span className="text-xs font-normal text-stone-500">on page</span>
          </p>
        </div>
      </div>

      {/* Filter & Search Bar Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 p-4 rounded-2xl border border-stone-200/80 dark:border-rose-900/30 bg-white dark:bg-[#160E12] shadow-xs">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-slate-400" />
          <Input
            placeholder="Search products by name, SKU or brand..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 pr-8 py-2 bg-stone-50 dark:bg-slate-900/60 border-stone-200 dark:border-slate-800 text-xs rounded-xl focus:border-rose-400 text-stone-900 dark:text-white"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Filter Pills & Select */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-slate-900/80 rounded-xl border border-stone-200/70 dark:border-slate-800">
            <button
              onClick={() => setTypeFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typeFilter === "all"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-stone-600 dark:text-slate-300 hover:text-stone-900"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setTypeFilter("single")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typeFilter === "single"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-stone-600 dark:text-slate-300 hover:text-stone-900"
              }`}
            >
              Single
            </button>
            <button
              onClick={() => setTypeFilter("combo")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                typeFilter === "combo"
                  ? "bg-rose-500 text-white shadow-xs"
                  : "text-stone-600 dark:text-slate-300 hover:text-stone-900"
              }`}
            >
              Combos
            </button>
          </div>

          {/* Category Dropdown Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="py-2 px-3 text-xs rounded-xl bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800 text-stone-800 dark:text-slate-200 focus:border-rose-400 cursor-pointer font-medium"
          >
            <option value="all">All Categories</option>
            {dbCategories && dbCategories.length > 0 ? (
              dbCategories.map((c) => (
                <option key={c._id} value={c.name}>
                  {c.name}
                </option>
              ))
            ) : (
              <>
                <option value="Cleanser">Cleanser</option>
                <option value="Toner">Toner</option>
                <option value="Serum">Serum</option>
                <option value="Moisturizer">Moisturizer</option>
                <option value="Sunscreen">Sunscreen</option>
                <option value="Combo Deals">Combo Deals</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Mobile Card Layout */}
      <ProductMobileCard
        products={normalizedProducts}
        loading={loading}
        onEdit={(p) => router.push(`/admin/edit/${p.id || p._id}`)}
        onDelete={(id) => deleteProduct(id)}
        onDuplicate={(id) => duplicateCombo(id)}
        onViewDetails={(p) => setSelectedProduct(p)}
      />

      {/* Desktop Table Layout */}
      <ProductTable
        products={normalizedProducts}
        loading={loading}
        onEdit={(p) => router.push(`/admin/edit/${p.id || p._id}`)}
        onDelete={(id) => deleteProduct(id)}
        onDuplicate={(id) => duplicateCombo(id)}
        onViewDetails={(p) => setSelectedProduct(p)}
      />

      {/* ========================================== */}
      {/* 📄 SERVER-SIDE PAGINATION CONTROLS BAR */}
      {/* ========================================== */}
      {totalProducts > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-stone-200/80 dark:border-rose-900/30 bg-white dark:bg-[#160E12] shadow-xs text-xs text-stone-600 dark:text-slate-300">
          {/* Left Info & Per Page Limit Select */}
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-stone-900 dark:text-white font-mono">{startItem}</strong> to{" "}
              <strong className="text-stone-900 dark:text-white font-mono">{endItem}</strong> of{" "}
              <strong className="text-rose-600 dark:text-rose-400 font-mono">{totalProducts}</strong> products
            </span>

            <div className="flex items-center gap-1.5 border-l border-stone-200 dark:border-slate-800 pl-3">
              <span className="text-[11px] text-stone-500">Per page:</span>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="py-1 px-2 text-xs rounded-lg bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 text-stone-900 dark:text-white font-bold cursor-pointer"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          {/* Right Page Navigation Controls */}
          <div className="flex items-center gap-1.5">
            {/* First Page */}
            <button
              onClick={() => handlePageChange(1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-stone-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-50 dark:hover:bg-rose-950 text-stone-700 dark:text-slate-300 transition-colors"
              title="First Page"
            >
              <ChevronsLeft className="h-4 w-4" />
            </button>

            {/* Previous Page */}
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-stone-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-50 dark:hover:bg-rose-950 text-stone-700 dark:text-slate-300 transition-colors"
              title="Previous Page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 px-1">
              {pageNumbers.map((num, idx) => {
                if (num === "...") {
                  return (
                    <span key={idx} className="px-2 text-stone-400 font-mono">
                      ...
                    </span>
                  );
                }
                const isCurrent = num === currentPage;
                return (
                  <button
                    key={idx}
                    onClick={() => handlePageChange(num)}
                    className={`h-8 min-w-[32px] px-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isCurrent
                        ? "bg-rose-500 text-white shadow-xs scale-105"
                        : "border border-stone-200 dark:border-slate-800 hover:bg-stone-100 dark:hover:bg-slate-900 text-stone-700 dark:text-slate-300"
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>

            {/* Next Page */}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-stone-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-50 dark:hover:bg-rose-950 text-stone-700 dark:text-slate-300 transition-colors"
              title="Next Page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            {/* Last Page */}
            <button
              onClick={() => handlePageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-stone-200 dark:border-slate-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-rose-50 dark:hover:bg-rose-950 text-stone-700 dark:text-slate-300 transition-colors"
              title="Last Page"
            >
              <ChevronsRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* 🚀 PRODUCT DETAILS INTERACTIVE QUICK VIEW MODAL */}
      {/* ========================================== */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-stone-200 dark:border-rose-900/40 bg-white dark:bg-[#1C1014] text-stone-800 dark:text-rose-100 p-6 shadow-2xl space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-100 dark:border-rose-950/60 pb-4">
              <div className="flex items-start gap-4">
                {/* Product Image */}
                <div className="relative h-20 w-20 rounded-2xl overflow-hidden border border-stone-200 dark:border-slate-800 bg-stone-100 dark:bg-slate-900 shrink-0 shadow-sm">
                  <Image
                    src={getThumbnail(selectedProduct)}
                    alt={selectedProduct.name}
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>

                {/* Basic Info */}
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedProduct.type === "combo" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 border border-rose-300 dark:border-rose-800/60">
                        <Gift className="h-3 w-3" /> Combo Deal
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                        <Package className="h-3 w-3" /> Single Product
                      </span>
                    )}

                    {selectedProduct.isFeatured && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300">
                        <Sparkles className="h-3 w-3 text-pink-500" /> Featured
                      </span>
                    )}

                    {selectedProduct.isBestSelling && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                        <Flame className="h-3 w-3 text-emerald-500" /> Best Seller
                      </span>
                    )}
                  </div>

                  <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white leading-snug">
                    {selectedProduct.name}
                  </h2>

                  <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-slate-400">
                    {selectedProduct.brand && <span>Brand: <strong className="text-stone-800 dark:text-slate-200">{selectedProduct.brand}</strong></span>}
                    {selectedProduct.category && <span>Category: <strong className="text-rose-600 dark:text-rose-400">{selectedProduct.category}</strong></span>}
                    {selectedProduct.sku && <span className="font-mono">SKU: {selectedProduct.sku}</span>}
                  </div>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setSelectedProduct(null)}
                className="rounded-full p-2 text-stone-400 hover:text-stone-600 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-rose-950 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Price & Stock Overview Box */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 rounded-2xl bg-stone-50 dark:bg-slate-900/70 border border-stone-200/70 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400">Regular / Base Price</span>
                <p className="text-base font-mono font-extrabold text-stone-900 dark:text-white mt-0.5">
                  ৳ {(selectedProduct.price || selectedProduct.basePrice || selectedProduct.minPrice || 0).toLocaleString()}
                </p>
              </div>

              {selectedProduct.salePrice ? (
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Special Sale Price</span>
                  <p className="text-base font-mono font-extrabold text-rose-600 dark:text-rose-400 mt-0.5">
                    ৳ {Number(selectedProduct.salePrice).toLocaleString()}
                  </p>
                </div>
              ) : null}

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 dark:text-slate-400">Inventory Stock</span>
                <p className="text-base font-mono font-extrabold text-emerald-600 dark:text-emerald-400 mt-0.5 flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4" />
                  {typeof selectedProduct.stock === "number"
                    ? selectedProduct.stock
                    : (selectedProduct.variants || []).reduce((sum, v) => sum + (Number(v.stock) || 0), 0)} items
                </p>
              </div>
            </div>

            {/* Variants Table (If single product with variants) */}
            {selectedProduct.variants && selectedProduct.variants.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5" /> Product Size & Pricing Variants ({selectedProduct.variants.length})
                </h3>
                <div className="rounded-xl border border-stone-200/80 dark:border-slate-800 overflow-hidden text-xs">
                  <div className="grid grid-cols-3 bg-stone-100 dark:bg-slate-900 p-2.5 font-bold text-stone-600 dark:text-slate-300">
                    <span>Variant Size</span>
                    <span>Price</span>
                    <span>Stock Level</span>
                  </div>
                  <div className="divide-y divide-stone-100 dark:divide-slate-800/80 bg-white dark:bg-[#160E12]">
                    {selectedProduct.variants.map((v, i) => (
                      <div key={i} className="grid grid-cols-3 p-2.5 text-stone-800 dark:text-slate-200">
                        <span className="font-semibold">{v.size || v.weight || `Variant #${i + 1}`}</span>
                        <span className="font-mono font-bold">৳ {Number(v.price).toLocaleString()}</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{v.stock || 0} left</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Descriptions & Ingredients */}
            <div className="space-y-3 text-xs">
              {selectedProduct.shortDescription && (
                <div>
                  <h4 className="font-bold text-stone-700 dark:text-slate-300 mb-1">Short Summary</h4>
                  <p className="text-stone-600 dark:text-slate-400 leading-relaxed bg-stone-50 dark:bg-slate-900/50 p-3 rounded-xl border border-stone-100 dark:border-slate-800">
                    {selectedProduct.shortDescription}
                  </p>
                </div>
              )}

              {selectedProduct.description && (
                <div>
                  <h4 className="font-bold text-stone-700 dark:text-slate-300 mb-1">Full Description</h4>
                  <p className="text-stone-600 dark:text-slate-400 leading-relaxed max-h-32 overflow-y-auto bg-stone-50 dark:bg-slate-900/50 p-3 rounded-xl border border-stone-100 dark:border-slate-800">
                    {selectedProduct.description}
                  </p>
                </div>
              )}

              {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
                <div>
                  <h4 className="font-bold text-stone-700 dark:text-slate-300 mb-1.5">Key Ingredients</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProduct.ingredients.map((ing, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-full bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 text-[10px] font-medium">
                        {ing}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-stone-100 dark:border-rose-950/60 gap-3">
              <a
                href={`/products/${selectedProduct.id || selectedProduct._id}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 dark:text-rose-300 hover:text-stone-900 dark:hover:text-white transition-colors"
              >
                <span>View Live Store Page</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </a>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="px-4 py-2 rounded-xl border border-stone-200 dark:border-rose-900/50 text-xs font-semibold text-stone-700 dark:text-rose-200 hover:bg-stone-100 dark:hover:bg-rose-950 cursor-pointer"
                >
                  Close
                </button>

                <Button
                  onClick={() => {
                    const id = selectedProduct.id || selectedProduct._id;
                    setSelectedProduct(null);
                    router.push(`/admin/edit/${id}`);
                  }}
                  className="gap-1.5 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl px-4 py-2 text-xs shadow-md cursor-pointer"
                >
                  <Pencil className="h-3.5 w-3.5" />
                  <span>Edit Product</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
