"use client";

import { Link } from "@/i18n/navigation";
import ProductCard from "@/components/products/ProductCard";
import SkeletonCard from "@/components/products/SkeletonCard";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  X,
  Search,
  SlidersHorizontal,
  ChevronDown,
  Loader2,
  CheckCircle2,
  RotateCcw,
  Tag,
  DollarSign,
  Layers,
  LayoutGrid,
  List,
  Sparkles,
  Gift,
  Droplets,
  Clock,
} from "lucide-react";
import axios from "axios";
import { useGetCategoriesQuery, useGetBrandsQuery } from "@/redux/api/ecommerceApi";
import { useLocale, useTranslations } from "next-intl";
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

export default function ProductsClient({
  initialData,
  initialSearchParams,
}: {
  initialData?: any;
  initialSearchParams?: any;
}) {
  const tF = useTranslations("productFilters");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { addToCart } = useCart();

  const productsSectionRef = useRef(null);

  // View Mode: 'grid' or 'list'
  const [viewMode, setViewMode] = useState("grid");

  const [limit, setLimit] = useState<number>(() => {
    const rawLimit = Number(searchParams.get("limit"));
    return rawLimit > 0 ? rawLimit : 12;
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

  const initialList = useMemo(() => {
    if (!initialData) return [];
    if (Array.isArray(initialData)) return initialData;
    if (Array.isArray(initialData.products)) return initialData.products;
    return [];
  }, [initialData]);

  // Data fetching states - initialized from ISR pre-rendered data
  const [products, setProducts] = useState<any[]>(initialList);
  const [loading, setLoading] = useState(initialList.length === 0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialData?.totalPages || 1);
  const [totalProducts, setTotalProducts] = useState(initialData?.totalProducts || initialData?.total || initialList.length);

  const { data: dbCategories } = useGetCategoriesQuery();
  const { data: dbBrands } = useGetBrandsQuery();

  const locale = useLocale();

  const categoriesList = useMemo(() => {
    if (dbCategories && dbCategories.length > 0) {
      return [
        { name: "All", displayName: locale === "bn" ? "সবগুলো" : "All" },
        ...dbCategories.map((cat: any) => ({
          name: cat.name,
          displayName: locale === "bn" && cat.nameBn ? cat.nameBn : cat.name,
        })),
      ];
    }
    return defaultCategories.map((catName) => ({
      name: catName,
      displayName: catName,
    }));
  }, [dbCategories, locale]);

  const brands = useMemo(() => {
    if (dbBrands && dbBrands.length > 0) {
      return ["All", ...dbBrands.map((b: any) => b.name)];
    }
    return ["All", "COSRX", "Beauty of Joseon", "SKIN1004", "Laneige", "Some By Mi", "Anua", "Torriden"];
  }, [dbBrands]);

  /* ---------------- Debounce Search Input ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  /* ---------------- Synchronize URL Params ---------------- */
  const updateUrlParams = useCallback(() => {
    const params = new URLSearchParams();

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
  }, [limit, debouncedSearch, category, brand, sortOption, typeFilter, minPrice, maxPrice, pathname]);

  const isFirstMount = useRef(true);

  /* ---------------- CLIENT-SIDE INITIAL & FILTER FETCH ---------------- */
  useEffect(() => {
    let isCancelled = false;

    // Check if initialData from server already matches the active filters
    if (isFirstMount.current) {
      isFirstMount.current = false;
      const initialType = initialSearchParams?.type || "all";
      const initialCat = initialSearchParams?.category || "All";
      const initialBrand = initialSearchParams?.brand || "All";
      const initialSort = initialSearchParams?.sort || "default";

      const matchesInitialServerData =
        typeFilter === initialType &&
        category === initialCat &&
        brand === initialBrand &&
        sortOption === initialSort &&
        debouncedSearch.trim() === "" &&
        minPrice === "" &&
        maxPrice === "" &&
        limit === 12;

      // When the server pre-rendered data matches current filter state, reuse without duplicate fetch
      if (matchesInitialServerData && initialList.length > 0) {
        return;
      }
    }

    const fetchInitialProducts = async () => {
      try {
        setLoading(true);
        setCurrentPage(1);

        const params = new URLSearchParams({
          page: "1",
          limit: String(limit),
          search: debouncedSearch,
          category: category,
          brand: brand,
          type: typeFilter,
          sort: sortOption,
        });

        if (minPrice) params.set("minPrice", minPrice);
        if (maxPrice) params.set("maxPrice", maxPrice);

        // Target dynamic route handlers based on tab selection
        let endpoint = "/api/products";
        if (typeFilter === "pre-order") {
          endpoint = "/api/products/pre-orders";
        } else if (typeFilter === "free") {
          endpoint = "/api/products/free-orders";
        }

        // Cache-busting parameter and header to guarantee instant fresh stock/inventory
        const res = await axios.get(`${endpoint}?${params.toString()}`, {
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
          params: {
            _t: Date.now(),
          },
        });

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

    fetchInitialProducts();
    updateUrlParams();

    return () => {
      isCancelled = true;
    };
  }, [limit, debouncedSearch, category, brand, sortOption, typeFilter, minPrice, maxPrice, updateUrlParams]);

  /* ---------------- Handle Load More Products ---------------- */
  const handleLoadMore = async () => {
    if (loadingMore || currentPage >= totalPages) return;

    const nextPage = currentPage + 1;
    setLoadingMore(true);

    try {
      const params = new URLSearchParams({
        page: String(nextPage),
        limit: String(limit),
        search: debouncedSearch,
        category: category,
        brand: brand,
        type: typeFilter,
        sort: sortOption,
      });

      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);

      let endpoint = "/api/products";
      if (typeFilter === "pre-order") {
        endpoint = "/api/products/pre-orders";
      } else if (typeFilter === "free") {
        endpoint = "/api/products/free-orders";
      }

      const res = await axios.get(`${endpoint}?${params.toString()}`, {
        headers: {
          "Cache-Control": "no-cache",
          Pragma: "no-cache",
        },
        params: {
          _t: Date.now(),
        },
      });

      if (res.data && typeof res.data === "object" && Array.isArray(res.data.products)) {
        setProducts((prev) => {
          const existingIds = new Set(prev.map((p: any) => p._id));
          const uniqueNew = res.data.products.filter((p: any) => !existingIds.has(p._id));
          return [...prev, ...uniqueNew];
        });
        setCurrentPage(nextPage);
        setTotalPages(res.data.totalPages || 1);
        setTotalProducts(res.data.totalProducts || 0);
      } else if (Array.isArray(res.data)) {
        setProducts((prev) => [...prev, ...res.data]);
        setCurrentPage(nextPage);
        setTotalPages(1);
        setTotalProducts(res.data.length);
      }
    } catch (err) {
      console.error("Load more products error:", err);
    } finally {
      setLoadingMore(false);
    }
  };

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
    setLimit(12);
  };

  const hasActiveFilters =
    category !== "All" ||
    brand !== "All" ||
    search !== "" ||
    sortOption !== "default" ||
    typeFilter !== "all" ||
    minPrice !== "" ||
    maxPrice !== "" ||
    limit !== 12;

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

          {/* Quick Filter Pills (Horizontally Scrollable on Mobile) */}
          <div className="flex items-center gap-2 pt-4 overflow-x-auto whitespace-nowrap scrollbar-none pb-1">
            <button
              onClick={() => setTypeFilter("all")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer shrink-0 ${
                typeFilter === "all"
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-sm"
                  : "bg-white dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-600 dark:text-rose-100/70 hover:border-rose-300 hover:text-rose-600"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" /> {tF("allProducts")}
            </button>
            <button
              onClick={() => setTypeFilter("combo")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer shrink-0 ${
                typeFilter === "combo"
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-sm"
                  : "bg-white dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-600 dark:text-rose-100/70 hover:border-rose-300 hover:text-rose-600"
              }`}
            >
              <Gift className="w-3.5 h-3.5" /> {tF("comboDeals")}
            </button>
            <button
              onClick={() => setTypeFilter("single")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer shrink-0 ${
                typeFilter === "single"
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-sm"
                  : "bg-white dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-600 dark:text-rose-100/70 hover:border-rose-300 hover:text-rose-600"
              }`}
            >
              <Droplets className="w-3.5 h-3.5" /> {tF("singleItems")}
            </button>
            <button
              onClick={() => setTypeFilter("pre-order")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer shrink-0 ${
                typeFilter === "pre-order"
                  ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white border-transparent shadow-sm"
                  : "bg-white dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-600 dark:text-rose-100/70 hover:border-amber-300 hover:text-amber-600"
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> {tF("preOrders")}
            </button>
            <button
              onClick={() => setTypeFilter("free")}
              className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold border transition-all duration-200 cursor-pointer shrink-0 ${
                typeFilter === "free"
                  ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white border-transparent shadow-sm"
                  : "bg-white dark:bg-white/5 border-stone-200 dark:border-white/10 text-stone-600 dark:text-rose-100/70 hover:border-rose-300 hover:text-rose-600"
              }`}
            >
              <Gift className="w-3.5 h-3.5" /> {tF("freeOrder")}
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
                    <Search className="w-3.5 h-3.5" /> {tF("searchProducts")}
                  </h3>
                  <div className="relative">
                    <Input
                      placeholder={tF("searchPlaceholder")}
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

                {/* Categories */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-rose-100 mb-3 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-rose-500" /> {tF("category")}
                  </h3>
                  <div className="space-y-1 max-h-52 overflow-y-auto pr-1 scrollbar-thin">
                    {categoriesList.map((cat) => (
                      <button
                        key={cat.name}
                        onClick={() => setCategory(cat.name)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                          category === cat.name
                            ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 font-bold"
                            : "text-stone-600 dark:text-rose-100/70 hover:bg-stone-50 dark:hover:bg-white/5"
                        }`}
                      >
                        <span>{cat.displayName}</span>
                        {category === cat.name && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-rose-100 mb-3 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-rose-500" /> {tF("brand")}
                  </h3>
                  <div className="space-y-1 max-h-44 overflow-y-auto pr-1 scrollbar-thin">
                    {brands.map((b) => (
                      <button
                        key={b}
                        onClick={() => setBrand(b)}
                        className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center justify-between cursor-pointer ${
                          brand === b
                            ? "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-300 font-bold"
                            : "text-stone-600 dark:text-rose-100/70 hover:bg-stone-50 dark:hover:bg-white/5"
                        }`}
                      >
                        <span>{b === "All" ? (locale === "bn" ? "সব ব্র্যান্ড" : "All Brands") : b}</span>
                        {brand === b && <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Filter */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-rose-100 mb-3 flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5 text-rose-500" /> {tF("priceRange")}
                  </h3>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={minPrice}
                      onChange={(e) => setMinPrice(e.target.value)}
                      className="w-full text-xs py-1.5 px-3 bg-stone-50 dark:bg-white/5 border-stone-200 dark:border-white/10 rounded-xl focus:border-rose-400"
                    />
                    <span className="text-stone-400 text-xs">-</span>
                    <Input
                      type="number"
                      placeholder="Max"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(e.target.value)}
                      className="w-full text-xs py-1.5 px-3 bg-stone-50 dark:bg-white/5 border-stone-200 dark:border-white/10 rounded-xl focus:border-rose-400"
                    />
                  </div>
                </div>

                {/* Reset Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={handleResetFilters}
                    className="w-full py-2 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 rounded-xl text-xs font-bold hover:bg-rose-100 dark:hover:bg-rose-900/60 transition flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Reset Filters
                  </button>
                )}
              </div>
            </aside>

            {/* 2. RIGHT MAIN PRODUCTS LISTING */}
            <main className="w-full lg:w-3/4 space-y-6">
              {/* Top Controls Bar */}
              <div className="bg-white dark:bg-[#1e1215] p-4 rounded-2xl border border-stone-200/60 dark:border-white/10 shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex flex-wrap items-center justify-between gap-4">
                {/* Result Counts Summary */}
                <div className="text-xs text-stone-600 dark:text-rose-100/70">
                  {tF("showingLoaded", { count: products.length, total: totalProducts })}
                </div>

                {/* View Mode Toggle & Sort Dropdown */}
                <div className="flex items-center gap-3 ml-auto">
                  {/* Grid / List View Toggle Buttons */}
                  <div className="flex items-center bg-stone-100 dark:bg-white/5 p-1 rounded-xl border border-stone-200/80 dark:border-white/10">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        viewMode === "grid"
                          ? "bg-white dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 shadow-2xs"
                          : "text-stone-400 hover:text-stone-600 dark:hover:text-rose-200"
                      }`}
                      title="Grid View"
                    >
                      <LayoutGrid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        viewMode === "list"
                          ? "bg-white dark:bg-rose-950/80 text-rose-600 dark:text-rose-300 shadow-2xs"
                          : "text-stone-400 hover:text-stone-600 dark:hover:text-rose-200"
                      }`}
                      title="List View"
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Limit per page selector */}
                  <div className="flex items-center gap-1.5 text-xs text-stone-500">
                    <span>{tF("show")}</span>
                    <Select value={String(limit)} onValueChange={(val) => setLimit(Number(val))}>
                      <SelectTrigger className="w-16 h-8 text-xs bg-stone-50 dark:bg-white/5 border-stone-200 dark:border-white/10 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="12">12</SelectItem>
                        <SelectItem value="24">24</SelectItem>
                        <SelectItem value="48">48</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sort selector */}
                  <Select value={sortOption} onValueChange={(val) => setSortOption(val)}>
                    <SelectTrigger className="w-40 h-8 text-xs bg-stone-50 dark:bg-white/5 border-stone-200 dark:border-white/10 rounded-xl font-medium">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">{tF("sortDefault")}</SelectItem>
                      <SelectItem value="price-asc">{tF("sortPriceLow")}</SelectItem>
                      <SelectItem value="price-desc">{tF("sortPriceHigh")}</SelectItem>
                      <SelectItem value="name-asc">{tF("sortNameAsc")}</SelectItem>
                      <SelectItem value="name-desc">{tF("sortNameDesc")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Products Display Grid */}
              {loading ? (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                      : "flex flex-col gap-4"
                  }
                >
                  {Array.from({ length: limit }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-[#1e1215] rounded-2xl border border-stone-200/60 dark:border-white/10 p-8 space-y-4">
                  <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/50 rounded-full flex items-center justify-center mx-auto text-rose-500">
                    <Search className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-serif font-bold text-stone-800 dark:text-white">
                    {tF("noProductsFound")}
                  </h3>
                  <p className="text-stone-500 text-xs max-w-sm mx-auto">
                    We couldn't find any products matching your active filters. Try resetting search or filter criteria.
                  </p>
                  <button
                    onClick={handleResetFilters}
                    className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition shadow-sm cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div
                  className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"
                      : "flex flex-col gap-4"
                  }
                >
                  {products.map((product: any) => (
                    <ProductCard
                      key={product._id}
                      product={product}
                      layout={viewMode === "list" ? "list" : "grid"}
                      onAddToCart={(p: any) => addToCart(p)}
                    />
                  ))}
                </div>
              )}

              {/* Load More Section */}
              {!loading && products.length > 0 && (
                <div className="pt-8 pb-4 flex flex-col items-center justify-center gap-4 border-t border-stone-200/60 dark:border-white/10">
                  {/* Progress Indicator */}
                  <div className="w-full max-w-xs space-y-2 text-center">
                    <p className="text-xs text-stone-500 dark:text-rose-100/60 font-medium">
                      {tF("showingLoaded", { count: products.length, total: totalProducts })}
                    </p>
                    <div className="w-full h-1.5 bg-stone-200/80 dark:bg-white/10 rounded-full overflow-hidden p-[1px]">
                      <div
                        className="h-full bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 rounded-full transition-all duration-500 ease-out"
                        style={{
                          width: `${Math.min(100, Math.max(5, (products.length / (totalProducts || 1)) * 100))}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Skeletons while loading more */}
                  {loadingMore && (
                    <div
                      className={
                        viewMode === "grid"
                          ? "w-full grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pt-2"
                          : "w-full flex flex-col gap-4 pt-2"
                      }
                    >
                      {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonCard key={`load-more-skel-${i}`} />
                      ))}
                    </div>
                  )}

                  {/* Load More Button OR End of Collection Badge */}
                  {currentPage < totalPages ? (
                    <button
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 active:scale-[0.98] text-white font-bold text-sm shadow-md shadow-rose-600/20 hover:shadow-lg hover:shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loadingMore ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-white" />
                          <span>{tF("loadingMore")}</span>
                        </>
                      ) : (
                        <>
                          <span>{tF("loadMore")}</span>
                          <ChevronDown className="w-4 h-4 transition-transform duration-200 group-hover:translate-y-0.5" />
                        </>
                      )}
                    </button>
                  ) : (
                    <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 text-xs font-semibold text-rose-700 dark:text-rose-300 shadow-2xs">
                      <CheckCircle2 className="w-4 h-4 text-rose-500" />
                      <span>{tF("allProductsLoaded")}</span>
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
