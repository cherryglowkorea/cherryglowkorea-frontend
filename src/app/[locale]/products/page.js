"use client";

import { Link } from "@/i18n/navigation";
import ProductCard from "@/components/products/ProductCard";
import SkeletonCard from "@/components/products/SkeletonCard";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useEffect, useState, useMemo, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  X,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  Tag,
  DollarSign,
  Layers,
  LayoutGrid,
  List,
  Sparkles,
  Gift,
  Droplets,
} from "lucide-react";
import axios from "axios";
import { useGetCategoriesQuery, useGetBrandsQuery } from "@/redux/api/ecommerceApi";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const defaultCategories = [
  "All",
  "Cleanser",
  "Toner",
  "Serum",
  "Essence",
  "Moisturizer",
  "Sunscreen",
  "Eye Care",
  "Mask",
  "Lip Care",
  "Acne Care",
  "Body Care",
  "Hair Care",
];

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

function ProductsPageInner() {
  const { addToCart } = useCart();
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const productsSectionRef = useRef(null);

  // View Mode: 'grid' or 'list'
  const [viewMode, setViewMode] = useState("grid");

  // Initialize state from URL params
  const [currentPage, setCurrentPage] = useState(() => {
    const p = searchParams.get("page");
    return p ? Math.max(1, parseInt(p, 10)) : 1;
  });

  const [limit, setLimit] = useState(() => {
    const l = searchParams.get("limit");
    return l ? parseInt(l, 10) : 12;
  });

  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get("search") || "");
  const [category, setCategory] = useState(() => searchParams.get("category") || "All");
  const [brand, setBrand] = useState(() => searchParams.get("brand") || "All");
  const [sortOption, setSortOption] = useState(() => searchParams.get("sort") || "default");
  const [typeFilter, setTypeFilter] = useState(() => searchParams.get("type") || "all");
  const [minPrice, setMinPrice] = useState(() => searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(() => searchParams.get("maxPrice") || "");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Data fetching states
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  const { data: dbCategories } = useGetCategoriesQuery();
  const { data: dbBrands } = useGetBrandsQuery();

  const categories = useMemo(() => {
    return dbCategories && dbCategories.length > 0
      ? ["All", ...dbCategories.map((cat) => cat.name)]
      : defaultCategories;
  }, [dbCategories]);

  const brands = useMemo(() => {
    return dbBrands && dbBrands.length > 0
      ? ["All", ...dbBrands.map((b) => b.name)]
      : [];
  }, [dbBrands]);

  /* ---------------- Debounce Search Query ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  /* ---------------- Reset Page when filters change ---------------- */
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setCurrentPage(1);
  }, [category, brand, debouncedSearch, sortOption, typeFilter, limit, minPrice, maxPrice]);

  /* ---------------- Synchronize URL Params ---------------- */
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();

    if (currentPage > 1) params.set("page", String(currentPage));
    if (limit !== 12) params.set("limit", String(limit));
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (category !== "All") params.set("category", category);
    if (brand !== "All") params.set("brand", brand);
    if (sortOption !== "default") params.set("sort", sortOption);
    if (typeFilter !== "all") params.set("type", typeFilter);
    if (minPrice) params.set("minPrice", minPrice);
    if (maxPrice) params.set("maxPrice", maxPrice);

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;

    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", newUrl);
    }
  }, [currentPage, limit, debouncedSearch, category, brand, sortOption, typeFilter, minPrice, maxPrice, pathname]);

  /* ---------------- SERVER-SIDE PAGINATED API FETCH ---------------- */
  useEffect(() => {
    let isCancelled = false;

    const fetchPaginatedProducts = async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          page: String(currentPage),
          limit: String(limit),
          search: debouncedSearch,
          category: category,
          brand: brand,
          type: typeFilter,
          sort: sortOption,
        });

        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);

        const res = await axios.get(`${API_BASE}/products/allProduct/public?${params.toString()}`);

        if (isCancelled) return;

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
        console.error("Fetch products error:", err);
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchPaginatedProducts();
    updateUrlParams();

    return () => {
      isCancelled = true;
    };
  }, [currentPage, limit, debouncedSearch, category, brand, sortOption, typeFilter, minPrice, maxPrice]);

  /* ---------------- Handle Reset Filters ---------------- */
  const handleResetFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setCategory("All");
    setBrand("All");
    setSortOption("default");
    setTypeFilter("all");
    setMinPrice("");
    setMaxPrice("");
    setCurrentPage(1);
    setLimit(12);
  };

  /* ---------------- Handle Page Navigation ---------------- */
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages || newPage === currentPage) return;
    setCurrentPage(newPage);
    if (productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  /* ---------------- Smart Page Numbers Generator ---------------- */
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

  const hasActiveFilters =
    category !== "All" ||
    brand !== "All" ||
    search !== "" ||
    sortOption !== "default" ||
    typeFilter !== "all" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    limit !== 12;

  // Items count range text
  const startItem = totalProducts === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, totalProducts);

  return (
    <div className="min-h-screen bg-stone-50/60 dark:bg-[#120a0d] text-stone-800 dark:text-rose-50 transition-colors relative overflow-hidden">
      {/* Ambient Glow Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-5 right-5 w-96 h-96 bg-pink-300/10 dark:bg-pink-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-5 w-80 h-80 bg-rose-300/10 dark:bg-rose-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Sleek Page Header */}
        <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <div className="flex flex-col gap-1 border-b border-rose-100/60 dark:border-white/5 pb-4">
            <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-rose-100/50">
              <Link href="/" className="hover:text-rose-500 transition-colors">
                Home
              </Link>
              <span>/</span>
              <span className="text-rose-500 font-medium">Products</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-stone-900 dark:text-white mt-1">
              Our Skincare Collection
            </h1>
            <p className="text-stone-600 dark:text-rose-100/70 text-xs md:text-sm">
              Discover authentic premium Korean skincare curated to enhance your natural glow.
            </p>
          </div>

          {/* Quick Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 pt-4">
            <button
              onClick={() => setTypeFilter("all")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer ${
                typeFilter === "all"
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-sm"
                  : "bg-white dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-600 dark:text-rose-100/70 hover:border-rose-300 hover:text-rose-600"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> All Products
            </button>
            <button
              onClick={() => setTypeFilter("combo")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer ${
                typeFilter === "combo"
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-sm"
                  : "bg-white dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-600 dark:text-rose-100/70 hover:border-rose-300 hover:text-rose-600"
              }`}
            >
              <Gift className="w-3.5 h-3.5" /> Combo Deals
            </button>
            <button
              onClick={() => setTypeFilter("single")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer ${
                typeFilter === "single"
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-sm"
                  : "bg-white dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-600 dark:text-rose-100/70 hover:border-rose-300 hover:text-rose-600"
              }`}
            >
              <Droplets className="w-3.5 h-3.5" /> Single Items
            </button>
          </div>
        </section>

        {/* Main Grid: Sidebar + Products List */}
        <div ref={productsSectionRef} className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col lg:flex-row gap-8">
            
            {/* 1. LEFT SIDEBAR (Clean & Essential Amazon-style filters) */}
            <aside className="w-full lg:w-1/4 shrink-0 lg:sticky lg:top-24 h-fit">
              {/* Mobile Filters Toggle Header */}
              <div className="flex lg:hidden justify-between items-center bg-white dark:bg-[#1e1215] p-4 rounded-2xl border border-stone-200/50 dark:border-white/10 shadow-xs mb-4">
                <button
                  onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                  className="flex items-center gap-2 font-medium text-stone-800 dark:text-rose-100 text-sm"
                >
                  <SlidersHorizontal className="w-4 h-4 text-rose-500" />
                  Filters
                </button>
                {hasActiveFilters && (
                  <span className="text-xs bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 px-2.5 py-1 rounded-full font-semibold">
                    Active Filters
                  </span>
                )}
              </div>

              {/* Filters Container */}
              <div
                className={`
                ${mobileFiltersOpen ? "block" : "hidden"} 
                lg:block space-y-6 bg-white dark:bg-[#1e1215] p-6 rounded-2xl border border-stone-200/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.07)] transition-all duration-300
              `}
              >
                {/* Search Block */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-3 flex items-center gap-1.5">
                    <Search className="w-3.5 h-3.5" /> Search Products
                  </h3>
                  <div className="relative">
                    <Input
                      placeholder="Search skincare..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-9 pr-8 py-2 bg-stone-50 dark:bg-white/5 border-stone-200 dark:border-white/10 rounded-xl focus:border-rose-400 focus:ring-rose-200 text-stone-800 dark:text-white text-xs"
                    />
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-3" />
                    {search && (
                      <button
                        onClick={() => setSearch("")}
                        className="absolute right-3 top-3 text-stone-400 hover:text-stone-600 dark:hover:text-white transition"
                        title="Clear Search"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Categories Block */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5" /> Categories
                    </h3>
                    {category !== "All" && (
                      <button
                        onClick={() => setCategory("All")}
                        className="text-[11px] text-stone-400 hover:text-rose-500 transition-colors font-medium"
                      >
                        Reset
                      </button>
                    )}
                  </div>

                  <div className="space-y-1 max-h-64 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-rose-200 dark:[&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {categories.map((cat) => {
                      const active = category === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all duration-200 text-left ${
                            active
                              ? "bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold shadow-xs"
                              : "text-stone-600 dark:text-rose-100/70 hover:bg-rose-50 dark:hover:bg-white/5 hover:text-rose-600"
                          }`}
                        >
                          <span>{cat}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Product Type Filter */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-3 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" /> Product Type
                  </h3>
                  <Select value={typeFilter} onValueChange={(val) => setTypeFilter(val)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select Product Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Products</SelectItem>
                      <SelectItem value="single">Single Items Only</SelectItem>
                      <SelectItem value="combo">Combo Bundles Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Filter */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-3 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" /> Price Range (৳)
                  </h3>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-1/2 px-3 py-2 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-xl text-xs text-stone-800 dark:text-white outline-none focus:border-rose-400"
                    />
                    <span className="text-stone-400 text-xs">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-1/2 px-3 py-2 bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-xl text-xs text-stone-800 dark:text-white outline-none focus:border-rose-400"
                    />
                  </div>
                </div>

                {/* Brands Block (If available) */}
                {brands.length > 1 && (
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-rose-500 mb-3">
                      Brand
                    </h3>
                    <Select value={brand} onValueChange={(val) => setBrand(val)}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((b) => (
                          <SelectItem key={b} value={b}>
                            {b}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Clear All Filters Button */}
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="w-full py-2.5 text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-50 dark:bg-rose-950/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/30 rounded-xl transition duration-200 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset All Filters
                  </button>
                )}
              </div>
            </aside>

            {/* 2. RIGHT MAIN CONTENT: Product Grid & Top Sort Bar */}
            <main className="flex-1 min-w-0">
              
              {/* Top Bar: Title, Count, Items Per Page & Amazon-Style Sort Dropdown */}
              <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-3 border-b border-rose-100/60 dark:border-white/5">
                <div>
                  <h2 className="text-lg font-serif font-bold text-stone-900 dark:text-white">
                    {category === "All" ? "All Products" : category}
                  </h2>
                  <p className="text-xs text-stone-500 dark:text-rose-100/60 mt-0.5 font-medium">
                    {loading
                      ? "Fetching products..."
                      : `Showing ${startItem}–${endItem} of ${totalProducts} products`}
                  </p>
                </div>

                {/* Controls: Items Per Page, Sort Dropdown & View Mode Toggle (Last Position) */}
                <div className="flex items-center gap-3.5 flex-wrap">
                  {/* 1. Items per page selector */}
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-rose-100/60">
                    <span className="hidden sm:inline font-medium">Show:</span>
                    <Select value={String(limit)} onValueChange={(val) => setLimit(Number(val))}>
                      <SelectTrigger className="w-20 bg-stone-100 dark:bg-white/5 border-stone-200/60 dark:border-white/10 font-semibold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12</SelectItem>
                        <SelectItem value="24">24</SelectItem>
                        <SelectItem value="36">36</SelectItem>
                        <SelectItem value="48">48</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 2. Amazon-style Single Unified Sort Dropdown */}
                  <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-rose-100/60">
                    <span className="hidden sm:inline font-medium">Sort by:</span>
                    <Select value={sortOption} onValueChange={(val) => setSortOption(val)}>
                      <SelectTrigger className="w-48 bg-stone-100 dark:bg-white/5 border-stone-200/60 dark:border-white/10 font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Featured (Newest First)</SelectItem>
                        <SelectItem value="price-asc">Price: Low to High</SelectItem>
                        <SelectItem value="price-desc">Price: High to Low</SelectItem>
                        <SelectItem value="name-asc">Name: A to Z</SelectItem>
                        <SelectItem value="name-desc">Name: Z to A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 3. Grid / List View Toggle Switch Pill (Last Position on Far Right) */}
                  <div className="flex items-center bg-white dark:bg-[#1e1215] border border-stone-200 dark:border-white/10 p-0.5 rounded-2xl shadow-xs">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`px-2 py-1.5 rounded-xl transition cursor-pointer flex items-center justify-center ${
                        viewMode === "grid"
                          ? "bg-rose-500 text-white shadow-xs"
                          : "text-stone-400 hover:text-stone-600 dark:hover:text-rose-100"
                      }`}
                      title="Grid View"
                    >
                      <LayoutGrid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`px-2 py-1.5 rounded-xl transition cursor-pointer flex items-center justify-center ${
                        viewMode === "list"
                          ? "bg-rose-500 text-white shadow-xs"
                          : "text-stone-400 hover:text-stone-600 dark:hover:text-rose-100"
                      }`}
                      title="List View"
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Product List / Skeleton Grid */}
              {loading ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch"
                      : "space-y-4"
                  }
                >
                  {[...Array(limit > 12 ? 12 : limit)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white dark:bg-[#1e1215] border border-stone-200/50 dark:border-white/10 rounded-3xl p-12 text-center space-y-4 shadow-xs">
                  <div className="w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-bold text-stone-800 dark:text-white">
                    No products found
                  </h3>
                  <p className="text-xs text-stone-500 dark:text-rose-100/60 max-w-md mx-auto">
                    We couldn't find any products matching your current search or filter criteria.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-xs transition"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="space-y-10">
                  {/* Product Cards Container (Grid or List view) */}
                  <div
                    className={
                      viewMode === "grid"
                        ? "grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch"
                        : "space-y-4"
                    }
                  >
                    {products.map((product, index) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        index={index}
                        viewMode={viewMode}
                        onAddToCart={addToCart}
                      />
                    ))}
                  </div>

                  {/* 🌟 STYLISH SERVER-SIDE PAGINATION CONTROLS */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-rose-100/60 dark:border-white/5">
                      <p className="text-xs text-stone-500 dark:text-rose-100/50 font-medium">
                        Page <span className="font-bold text-stone-800 dark:text-rose-100">{currentPage}</span> of{" "}
                        <span className="font-bold text-stone-800 dark:text-rose-100">{totalPages}</span> ({totalProducts}{" "}
                        total items)
                      </p>

                      <div className="flex items-center gap-1.5 flex-wrap justify-center">
                        {/* Jump to First */}
                        <button
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(1)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold bg-white dark:bg-[#1e1215] border border-stone-200/80 dark:border-white/10 text-stone-700 dark:text-rose-100 hover:border-pink-400 hover:text-pink-500 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
                          title="First Page"
                        >
                          <ChevronsLeft size={16} />
                        </button>

                        {/* Previous Button */}
                        <button
                          disabled={currentPage === 1}
                          onClick={() => handlePageChange(currentPage - 1)}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#1e1215] border border-stone-200/80 dark:border-white/10 text-stone-700 dark:text-rose-100 hover:border-pink-400 hover:text-pink-500 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
                        >
                          <ChevronLeft size={15} /> Prev
                        </button>

                        {/* Numeric Page Buttons */}
                        {pageNumbers.map((pNum, i) =>
                          pNum === "..." ? (
                            <span
                              key={`ellipsis-${i}`}
                              className="w-8 text-center text-xs text-stone-400 dark:text-rose-100/40 select-none font-bold"
                            >
                              ...
                            </span>
                          ) : (
                            <button
                              key={`page-${pNum}`}
                              onClick={() => handlePageChange(pNum)}
                              className={`w-9 h-9 rounded-xl text-xs font-bold transition cursor-pointer flex items-center justify-center ${
                                currentPage === pNum
                                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm scale-105"
                                  : "bg-white dark:bg-[#1e1215] border border-stone-200/80 dark:border-white/10 text-stone-700 dark:text-rose-100 hover:border-pink-300 hover:text-pink-500"
                              }`}
                            >
                              {pNum}
                            </button>
                          )
                        )}

                        {/* Next Button */}
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(currentPage + 1)}
                          className="flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-bold bg-white dark:bg-[#1e1215] border border-stone-200/80 dark:border-white/10 text-stone-700 dark:text-rose-100 hover:border-pink-400 hover:text-pink-500 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
                        >
                          Next <ChevronRight size={15} />
                        </button>

                        {/* Jump to Last */}
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() => handlePageChange(totalPages)}
                          className="w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold bg-white dark:bg-[#1e1215] border border-stone-200/80 dark:border-white/10 text-stone-700 dark:text-rose-100 hover:border-pink-400 hover:text-pink-500 disabled:opacity-30 disabled:cursor-not-allowed transition cursor-pointer shadow-2xs"
                          title="Last Page"
                        >
                          <ChevronsRight size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-stone-50/60 dark:bg-[#120a0d] flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-4 border-rose-200 border-t-rose-500 animate-spin" />
      </div>
    }>
      <ProductsPageInner />
    </Suspense>
  );
}
