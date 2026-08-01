"use client";

import { Link } from "@/i18n/navigation";
import ProductCard from "@/components/products/ProductCard";
import SkeletonCard from "@/components/products/SkeletonCard";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/CartContext";
import { useEffect, useState, useMemo } from "react";
import { X, Search, SlidersHorizontal, ArrowUpDown } from "lucide-react";
import axios from "axios";
import { useGetCategoriesQuery } from "@/redux/api/ecommerceApi";

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

export default function ProductsPage() {
  const { addToCart } = useCart();

  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortOption, setSortOption] = useState("default"); // default, price-asc, price-desc
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const { data: dbCategories } = useGetCategoriesQuery();

  const categories = useMemo(() => {
    return dbCategories && dbCategories.length > 0 
      ? ["All", ...dbCategories.map(cat => cat.name)]
      : defaultCategories;
  }, [dbCategories]);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  /* ---------------- Get category from URL (SAFE) ---------------- */
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const cat = params.get("category");
      if (cat) setCategory(cat);
    }
  }, []);

  /* ---------------- Debounce Search ---------------- */
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  /* ---------------- Fetch All Products once for Client-side Filter & Category Count ---------------- */
  useEffect(() => {
    const fetchAllProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/products/allProduct/public`);
        setAllProducts(res.data || []);
      } catch (err) {
        console.error("Fetch products error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAllProducts();
  }, [API_BASE]);

  /* ---------------- Dynamic Category Product Count Calculation ---------------- */
  const categoryCounts = useMemo(() => {
    const counts = { All: allProducts.length };
    
    // Initialize other categories to 0
    categories.forEach(cat => {
      if (cat !== "All") counts[cat] = 0;
    });

    // Populate counts based on products
    allProducts.forEach(product => {
      const cat = product.category;
      if (cat) {
        counts[cat] = (counts[cat] || 0) + 1;
      }
    });

    return counts;
  }, [allProducts, categories]);

  /* ---------------- Calculate Final Price of a Product ---------------- */
  const getProductPrice = (product) => {
    const variant = product.variants?.[0];
    if (!variant) return 0;
    const base = variant.price || 0;
    const type = product.discountType;
    const val = product.discountValue || 0;

    if (type === "percentage") {
      return Math.round(base - (base * val) / 100);
    }
    if (type === "flat") {
      return Math.max(base - val, 0);
    }
    return base;
  };

  /* ---------------- Client-side Filter & Sort logic ---------------- */
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...allProducts];

    // Category Filter
    if (category !== "All") {
      result = result.filter(p => p.category === category);
    }

    // Search Filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase().trim();
      result = result.filter(p => 
        (p.name && p.name.toLowerCase().includes(query)) ||
        (p.brand && p.brand.toLowerCase().includes(query)) ||
        (p.category && p.category.toLowerCase().includes(query))
      );
    }

    // Sorting
    if (sortOption === "price-asc") {
      result.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    } else if (sortOption === "price-desc") {
      result.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    }

    return result;
  }, [allProducts, category, debouncedSearch, sortOption]);

  return (
    <div className="bg-[#FFFBFA] dark:bg-[#1C1417] min-h-screen font-sans text-stone-800 dark:text-rose-50 transition-colors">
      {/* Sleek Page Header */}
      <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <div className="flex flex-col gap-1 border-b border-rose-100/60 dark:border-white/5 pb-4">
          <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-rose-100/50">
            <Link href="/" className="hover:text-rose-500 transition-colors">Home</Link>
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
      </section>

      {/* Main Grid: Sidebar + Products List */}
      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* 1. LEFT SIDEBAR (Desktop) / Collapsible on Mobile */}
          <aside className="w-full lg:w-1/4 shrink-0 lg:sticky lg:top-24 h-fit">
            
            {/* Mobile Filters Header */}
            <div className="flex lg:hidden justify-between items-center bg-white dark:bg-[#23181C] p-4 rounded-2xl border border-rose-100/80 dark:border-white/5 shadow-sm mb-4">
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="flex items-center gap-2 font-medium text-stone-800 dark:text-rose-100"
              >
                <SlidersHorizontal className="w-4 h-4 text-rose-500" />
                Filters & Sorting
              </button>
              {category !== "All" || search || sortOption !== "default" ? (
                <span className="text-xs bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-300 px-2.5 py-1 rounded-full font-semibold">
                  Active
                </span>
              ) : null}
            </div>

            {/* Filters Container */}
            <div className={`
              ${mobileFiltersOpen ? "block" : "hidden"} 
              lg:block space-y-6 bg-white dark:bg-[#23181C] p-6 rounded-2xl border border-rose-100/80 dark:border-white/5 shadow-sm
            `}>
              
              {/* Search Block */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-rose-500 mb-3">
                  Search
                </h3>
                <div className="relative">
                  <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-8 py-2 bg-stone-50 dark:bg-white/5 border-stone-200 dark:border-white/10 rounded-xl focus:border-rose-400 focus:ring-rose-200 text-stone-800 dark:text-white"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  {search && (
                    <X
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer w-4 h-4 text-rose-400 hover:text-rose-600"
                    />
                  )}
                </div>
              </div>

              {/* Sorting Block */}
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-rose-500 mb-3">
                  Sort By Price
                </h3>
                <div className="relative">
                  <select
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="w-full bg-stone-50 dark:bg-white/5 border border-stone-200 dark:border-white/10 rounded-xl px-3 py-2 text-sm text-stone-800 dark:text-white focus:outline-none focus:border-rose-400"
                  >
                    <option value="default" className="dark:bg-[#23181C]">Default (Newest)</option>
                    <option value="price-asc" className="dark:bg-[#23181C]">Price: Lowest to Highest</option>
                    <option value="price-desc" className="dark:bg-[#23181C]">Price: Highest to Lowest</option>
                  </select>
                </div>
              </div>

              {/* Categories Block with Counts */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-rose-500">
                    Categories
                  </h3>
                  {category !== "All" && (
                    <button
                      onClick={() => setCategory("All")}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="space-y-1.5 max-h-[350px] overflow-y-auto pr-1">
                  {categories.map((cat) => {
                    const isActive = category === cat;
                    const count = categoryCounts[cat] || 0;
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setCategory(cat);
                          setMobileFiltersOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all cursor-pointer ${
                          isActive
                            ? "bg-rose-500 text-white font-medium"
                            : "hover:bg-rose-50 dark:hover:bg-white/5 text-stone-600 dark:text-rose-100/80"
                        }`}
                      >
                        <span className="truncate">{cat}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-stone-100 dark:bg-white/10 text-stone-500 dark:text-rose-300"
                        }`}>
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>
          </aside>

          {/* 2. RIGHT CONTENT: Products List */}
          <main className="flex-1">
            
            {/* Header info */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-serif font-bold text-stone-900 dark:text-white">
                  {category === "All" ? "All Products" : category}
                </h2>
                <p className="text-xs text-stone-500 dark:text-rose-100/50 mt-0.5">
                  Showing {filteredAndSortedProducts.length} of {allProducts.length} items
                </p>
              </div>

              {/* Desktop quick sort buttons */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-xs text-stone-400 dark:text-rose-100/40">Sort:</span>
                <button
                  onClick={() => setSortOption("price-asc")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    sortOption === "price-asc"
                      ? "bg-rose-500 text-white border-rose-500"
                      : "bg-white dark:bg-white/5 text-stone-600 dark:text-rose-100/80 border-stone-200 dark:border-white/10 hover:bg-stone-50"
                  }`}
                >
                  Lowest Price
                </button>
                <button
                  onClick={() => setSortOption("price-desc")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                    sortOption === "price-desc"
                      ? "bg-rose-500 text-white border-rose-500"
                      : "bg-white dark:bg-white/5 text-stone-600 dark:text-rose-100/80 border-stone-200 dark:border-white/10 hover:bg-stone-50"
                  }`}
                >
                  Highest Price
                </button>
              </div>
            </div>

            {/* Grid */}
            {loading ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredAndSortedProducts.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-[#23181C] rounded-2xl border border-rose-100/80 dark:border-white/5 shadow-sm">
                <p className="text-stone-500 dark:text-rose-100/60 font-medium">No products found</p>
                <p className="text-xs text-stone-400 mt-1">Try another category or clear filters.</p>
                <button
                  onClick={() => {
                    setCategory("All");
                    setSearch("");
                    setSortOption("default");
                  }}
                  className="mt-4 px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full text-xs font-medium transition"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                {filteredAndSortedProducts.map((product, index) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    index={index}
                    onAddToCart={addToCart}
                  />
                ))}
              </div>
            )}
          </main>

        </div>
      </div>
    </div>
  );
}
