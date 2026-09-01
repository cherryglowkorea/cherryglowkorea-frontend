"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import {
  Trash2,
  Power,
  PowerOff,
  Plus,
  Sparkles,
  Image as ImageIcon,
  ExternalLink,
  Eye,
  RefreshCw,
  Tag,
  Layers,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import ImageUploader from "@/components/ui/ImageUploader";

export default function AdminBannerPage() {
  const [tab, setTab] = useState("hero"); // "hero" | "promo"

  // Hero Banner Form State
  const [heroTitle, setHeroTitle] = useState("");
  const [heroDesc, setHeroDesc] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [primaryBtnText, setPrimaryBtnText] = useState("Shop Now");
  const [primaryBtnLink, setPrimaryBtnLink] = useState("/products");
  const [secondaryBtnText, setSecondaryBtnText] = useState("Explore Combos");
  const [secondaryBtnLink, setSecondaryBtnLink] = useState("/combo");
  const [heroBanners, setHeroBanners] = useState([]);
  const [loadingHero, setLoadingHero] = useState(false);
  const [isSubmittingHero, setIsSubmittingHero] = useState(false);

  // Promo Banner Form State
  const [promoImage, setPromoImage] = useState("");
  const [promoTitle, setPromoTitle] = useState("");
  const [promoLink, setPromoLink] = useState("/products");
  const [promoBanners, setPromoBanners] = useState([]);
  const [isSubmittingPromo, setIsSubmittingPromo] = useState(false);

  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  // Fetch Hero Banners
  const fetchHeroBanners = useCallback(async () => {
    setLoadingHero(true);
    try {
      const res = await axios.get(`${API_BASE}/banners/hero/admin`);
      setHeroBanners(res.data?.data || res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch hero slider banners");
    } finally {
      setLoadingHero(false);
    }
  }, [API_BASE]);

  // Fetch Promo Banners
  const fetchPromoBanners = useCallback(async () => {
    try {
      const res = await axios.get(`${API_BASE}/banners/promo-banner`);
      setPromoBanners(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch promo banners");
    }
  }, [API_BASE]);

  useEffect(() => {
    fetchHeroBanners();
    fetchPromoBanners();
  }, [fetchHeroBanners, fetchPromoBanners]);

  /* ---------------- HERO BANNER HANDLERS ---------------- */
  const handleAddHeroBanner = async (e) => {
    e.preventDefault();
    if (!heroTitle.trim() || !heroImage.trim()) {
      toast.error("Please provide both Banner Title and Image URL");
      return;
    }

    try {
      setIsSubmittingHero(true);
      const payload = {
        title: heroTitle.trim(),
        description: heroDesc.trim(),
        image: heroImage.trim(),
        primaryBtnText: primaryBtnText.trim() || "Shop Now",
        primaryBtnLink: primaryBtnLink.trim() || "/products",
        secondaryBtnText: secondaryBtnText.trim() || "Explore",
        secondaryBtnLink: secondaryBtnLink.trim() || "/combo",
        status: "active",
      };

      const res = await axios.post(`${API_BASE}/banners/hero`, payload);
      if (res.data?.success) {
        toast.success("Hero Banner Slide added successfully!");
        setHeroTitle("");
        setHeroDesc("");
        setHeroImage("");
        fetchHeroBanners();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to create hero banner");
    } finally {
      setIsSubmittingHero(false);
    }
  };

  const handleToggleHeroBanner = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const res = await axios.put(`${API_BASE}/banners/hero/${id}`, {
        status: newStatus,
      });
      if (res.data?.success) {
        toast.success(`Hero slide set to "${newStatus.toUpperCase()}"`);
        fetchHeroBanners();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to update banner status");
    }
  };

  const handleDeleteHeroBanner = async (id) => {
    if (!confirm("Are you sure you want to delete this Hero Banner slide?")) return;
    try {
      const res = await axios.delete(`${API_BASE}/banners/hero/${id}`);
      if (res.data?.success) {
        toast.success("Hero Banner slide deleted");
        fetchHeroBanners();
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete banner slide");
    }
  };

  /* ---------------- PROMO BANNER HANDLERS ---------------- */
  const handleAddPromo = async (e) => {
    e.preventDefault();
    if (!promoImage.trim()) {
      toast.error("Please enter a valid Image URL for the promo banner");
      return;
    }

    try {
      setIsSubmittingPromo(true);
      const response = await axios.post(`${API_BASE}/banners/promo-banner`, {
        image: promoImage.trim(),
        title: promoTitle.trim() || "Special Promotional Deal",
        link: promoLink.trim() || "/products",
      });

      setPromoImage("");
      setPromoTitle("");
      fetchPromoBanners();
      if (response?.data?.insertedId || response?.data?.success) {
        toast.success("Promo Banner added successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to add promo banner");
    } finally {
      setIsSubmittingPromo(false);
    }
  };

  const togglePromoBanner = async (id, current) => {
    try {
      const response = await axios.patch(
        `${API_BASE}/banners/promo-banner/toggle/${id}`,
        { isActive: !current }
      );

      if (response?.data?.success) {
        toast.success(`Promo banner turned ${!current ? "ON (Active)" : "OFF (Inactive)"}`);
      }
      fetchPromoBanners();
    } catch (err) {
      console.error(err);
      toast.error("Failed to toggle promo banner status");
    }
  };

  const deletePromoBanner = async (id) => {
    if (!confirm("Are you sure you want to delete this Promo Banner?")) return;
    try {
      const response = await axios.delete(`${API_BASE}/banners/promo-banner/${id}`);
      if (response?.data?.success) {
        toast.success("Promo banner deleted");
      }
      fetchPromoBanners();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete banner");
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl border border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113]">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
              Banner & Hero Management
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-xs">
              {heroBanners.length + promoBanners.length} Total
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Manage homepage Hero slider carousels, promotional popups, and deal banners.
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-stone-100 dark:bg-[#0d0709] p-1.5 rounded-2xl border border-stone-200 dark:border-stone-800 self-start sm:self-auto">
          <button
            onClick={() => setTab("hero")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              tab === "hero"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <Sparkles size={14} /> Hero Slider ({heroBanners.length})
          </button>
          <button
            onClick={() => setTab("promo")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              tab === "promo"
                ? "bg-rose-600 text-white shadow-xs"
                : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200"
            }`}
          >
            <Tag size={14} /> Promo Popups ({promoBanners.length})
          </button>
        </div>
      </div>

      {/* 2. TAB 1: HERO SLIDER BANNERS */}
      {tab === "hero" && (
        <div className="space-y-8">
          {/* Add Hero Banner Form + Live Preview */}
          <div className="bg-white dark:bg-[#161113] p-6 rounded-3xl border border-stone-200 dark:border-stone-800/80 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800/60 pb-3">
              <h2 className="font-bold text-base text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Plus className="text-rose-500" size={18} /> Add New Hero Slider Banner
              </h2>
              <span className="text-xs text-stone-400 dark:text-stone-500 font-mono">
                Homepage Hero Carousel
              </span>
            </div>

            <form onSubmit={handleAddHeroBanner} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Inputs Column (7 Cols) */}
                <div className="lg:col-span-7 space-y-4">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                      Banner Title <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Clean K-Beauty Glow Naturally"
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 dark:text-rose-100 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                      required
                    />
                  </div>

                  {/* Image Uploader */}
                  <ImageUploader
                    label="Banner Image (PC / Mobile Upload to Cloudinary) *"
                    value={heroImage}
                    onChange={(url) => setHeroImage(url)}
                    folder="cherry-glow/banners"
                  />

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                      Description / Subtitle
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Authentic Korean skincare crafted to hydrate, nourish, and protect your skin."
                      value={heroDesc}
                      onChange={(e) => setHeroDesc(e.target.value)}
                      className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs sm:text-sm text-stone-900 dark:text-rose-100 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 resize-none"
                    />
                  </div>

                  {/* Buttons Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Primary Button */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                        Primary CTA Button
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Label (Shop Now)"
                          value={primaryBtnText}
                          onChange={(e) => setPrimaryBtnText(e.target.value)}
                          className="w-1/2 rounded-xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2 px-3 text-xs text-stone-900 dark:text-rose-100"
                        />
                        <input
                          type="text"
                          placeholder="Link (/products)"
                          value={primaryBtnLink}
                          onChange={(e) => setPrimaryBtnLink(e.target.value)}
                          className="w-1/2 rounded-xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2 px-3 text-xs text-stone-900 dark:text-rose-100 font-mono"
                        />
                      </div>
                    </div>

                    {/* Secondary Button */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                        Secondary CTA Button
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Label (Explore)"
                          value={secondaryBtnText}
                          onChange={(e) => setSecondaryBtnText(e.target.value)}
                          className="w-1/2 rounded-xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2 px-3 text-xs text-stone-900 dark:text-rose-100"
                        />
                        <input
                          type="text"
                          placeholder="Link (/combo)"
                          value={secondaryBtnLink}
                          onChange={(e) => setSecondaryBtnLink(e.target.value)}
                          className="w-1/2 rounded-xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2 px-3 text-xs text-stone-900 dark:text-rose-100 font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live Preview Box (5 Cols) */}
                <div className="lg:col-span-5 space-y-2">
                  <span className="text-xs font-semibold text-stone-500 dark:text-rose-300/70 flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5 text-rose-500" /> Live Banner Preview
                  </span>

                  <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-rose-900/50 bg-stone-900 text-white h-56 flex flex-col justify-end p-5 shadow-inner group">
                    {heroImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={heroImage}
                        alt="Hero preview"
                        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          (e.target as any).style.display = "none";
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-tr from-rose-900/80 to-purple-900/60 flex items-center justify-center text-xs text-rose-300/60">
                        Enter Image URL to preview slide
                      </div>
                    )}

                    <div className="relative z-10 space-y-1.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500 text-white uppercase tracking-wider">
                        Hero Slide Preview
                      </span>
                      <h4 className="font-extrabold text-base sm:text-lg leading-tight drop-shadow-md">
                        {heroTitle || "Banner Title Preview"}
                      </h4>
                      <p className="text-xs text-stone-200 line-clamp-2 drop-shadow-xs">
                        {heroDesc || "Subtitle description will appear here..."}
                      </p>
                      <div className="flex items-center gap-2 pt-1">
                        <span className="px-3 py-1 rounded-xl bg-rose-600 text-white font-bold text-[11px]">
                          {primaryBtnText || "Shop Now"}
                        </span>
                        <span className="px-3 py-1 rounded-xl bg-white/20 text-white font-bold text-[11px] backdrop-blur-xs">
                          {secondaryBtnText || "Explore"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 border-t border-stone-100 dark:border-rose-900/30 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmittingHero}
                  className="px-6 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-700 hover:to-pink-700 text-white font-extrabold text-xs rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <Plus size={16} /> Add Hero Banner Slide
                </button>
              </div>
            </form>
          </div>

          {/* Hero Banners Active Grid */}
          <div className="bg-white dark:bg-[#180f14] p-6 rounded-3xl border border-stone-200 dark:border-rose-900/40 shadow-xs space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-rose-900/30 pb-3">
              <h2 className="font-bold text-base text-stone-900 dark:text-rose-100">
                Active Hero Slides ({heroBanners.length})
              </h2>
              <span className="text-xs text-stone-400 dark:text-rose-300/60">
                Managed Carousel Slides
              </span>
            </div>

            {loadingHero ? (
              <div className="py-12 text-center text-stone-500 dark:text-rose-300/70 text-xs">
                <RefreshCw className="h-5 w-5 animate-spin mx-auto text-rose-500 mb-2" />
                Loading hero banners...
              </div>
            ) : heroBanners.length === 0 ? (
              <div className="text-center py-10 text-xs text-stone-500 dark:text-rose-300/60 bg-stone-50 dark:bg-rose-950/40 rounded-2xl border border-stone-200 dark:border-rose-900/40 p-6">
                No custom hero banners configured yet. Default hero slides are currently displaying on homepage.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {heroBanners.map((slide) => (
                  <div
                    key={slide._id}
                    className="p-4 rounded-2xl border border-stone-200 dark:border-rose-900/40 bg-stone-50/70 dark:bg-rose-950/20 flex flex-col justify-between gap-4 transition-all hover:border-rose-300"
                  >
                    <div className="flex gap-4 items-start">
                      {/* Image Thumbnail */}
                      <div className="relative w-36 h-24 rounded-xl overflow-hidden bg-stone-900 shrink-0 border border-stone-200 dark:border-rose-900/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={slide.image}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <h3 className="font-bold text-sm text-stone-900 dark:text-rose-100 truncate">
                          {slide.title}
                        </h3>
                        <p className="text-xs text-stone-500 dark:text-rose-300/70 line-clamp-2">
                          {slide.description || "No description provided"}
                        </p>

                        <div className="flex items-center gap-1.5 flex-wrap pt-1 text-[11px]">
                          <span className="bg-stone-200 dark:bg-rose-950 px-2 py-0.5 rounded-md font-mono font-semibold text-stone-700 dark:text-rose-200 border border-stone-300 dark:border-rose-900/40">
                            {slide.primaryBtnText} → {slide.primaryBtnLink}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-stone-200 dark:border-rose-900/30">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full capitalize ${
                          slide.status === "active"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                            : "bg-stone-200 text-stone-600 dark:bg-rose-950 dark:text-rose-300 border border-stone-300 dark:border-rose-900/40"
                        }`}
                      >
                        {slide.status === "active" ? "Active" : "Inactive"}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleHeroBanner(slide._id, slide.status)}
                          className="p-1.5 rounded-xl border border-stone-200 dark:border-rose-900/50 bg-white dark:bg-rose-950 text-stone-700 dark:text-rose-200 hover:bg-stone-100 transition cursor-pointer"
                          title="Toggle Active Status"
                        >
                          {slide.status === "active" ? (
                            <PowerOff size={16} className="text-amber-500" />
                          ) : (
                            <Power size={16} className="text-emerald-500" />
                          )}
                        </button>

                        <button
                          onClick={() => handleDeleteHeroBanner(slide._id)}
                          className="p-1.5 rounded-xl border border-stone-200 dark:border-rose-900/50 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 transition cursor-pointer"
                          title="Delete Slide"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. TAB 2: PROMO POPUP BANNERS */}
      {tab === "promo" && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Form (6 Cols) */}
            <div className="lg:col-span-6 bg-white dark:bg-[#180f14] p-6 rounded-3xl border border-stone-200 dark:border-rose-900/40 shadow-xs space-y-4">
              <h2 className="font-bold text-base text-stone-900 dark:text-rose-100 border-b border-stone-100 dark:border-rose-900/30 pb-3 flex items-center gap-2">
                <Tag className="text-rose-500" size={18} /> Add New Promo Banner
              </h2>

              <form onSubmit={handleAddPromo} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                    Offer Title
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Special Weekend Skincare Offer - 20% OFF"
                    value={promoTitle}
                    onChange={(e) => setPromoTitle(e.target.value)}
                    className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs text-stone-900 dark:text-rose-100 focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <ImageUploader
                  label="Promo Image (PC / Mobile Upload to Cloudinary) *"
                  value={promoImage}
                  onChange={(url) => setPromoImage(url)}
                  folder="cherry-glow/promo-banners"
                />

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-stone-700 dark:text-rose-200">
                    Target Destination Link
                  </label>
                  <input
                    type="text"
                    placeholder="/products"
                    value={promoLink}
                    onChange={(e) => setPromoLink(e.target.value)}
                    className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs text-stone-900 dark:text-rose-100 font-mono focus:border-rose-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingPromo}
                  className="flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold px-5 py-2.5 rounded-2xl text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                >
                  <Plus size={16} /> Add Promo Banner
                </button>
              </form>
            </div>

            {/* Live Preview (6 Cols) */}
            <div className="lg:col-span-6 space-y-2">
              <span className="text-xs font-semibold text-stone-500 dark:text-rose-300/70 flex items-center gap-1">
                <Eye className="h-3.5 w-3.5 text-rose-500" /> Promo Banner Preview
              </span>

              <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-rose-900/50 bg-stone-900 text-white h-60 flex flex-col justify-end p-5 shadow-inner">
                {promoImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={promoImage}
                    alt="Promo preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-80"
                    onError={(e) => {
                      (e.target as any).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-tr from-amber-900/60 to-rose-900/60 flex items-center justify-center text-xs text-rose-300/60">
                    Enter Image URL to preview promo banner
                  </div>
                )}

                <div className="relative z-10 bg-black/60 backdrop-blur-xs p-3 rounded-xl space-y-1">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500 text-white uppercase tracking-wider">
                    PROMO POPUP
                  </span>
                  <h4 className="font-extrabold text-sm text-white">
                    {promoTitle || "Special Promotional Offer"}
                  </h4>
                </div>
              </div>
            </div>
          </div>

          {/* Existing Promo Banners Table */}
          <div className="bg-white dark:bg-[#180f14] p-6 rounded-3xl border border-stone-200 dark:border-rose-900/40 shadow-xs space-y-4">
            <h2 className="font-bold text-base text-stone-900 dark:text-rose-100 border-b border-stone-100 dark:border-rose-900/30 pb-3">
              Existing Promo Banners ({promoBanners.length})
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left border-b border-stone-200 dark:border-rose-900/40 text-stone-600 dark:text-rose-200 font-bold uppercase">
                    <th className="py-3 px-4">Image</th>
                    <th className="py-3 px-4">Offer Title</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100 dark:divide-rose-900/30">
                  {promoBanners.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-8 text-stone-400 dark:text-rose-300/60">
                        No promo banners configured yet.
                      </td>
                    </tr>
                  ) : (
                    promoBanners.map((banner) => (
                      <tr
                        key={banner._id}
                        className="hover:bg-rose-500/5 dark:hover:bg-rose-900/20 transition-colors"
                      >
                        <td className="py-3 px-4">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={banner.image}
                            alt="banner"
                            className="h-12 w-24 object-cover rounded-xl border border-stone-200 dark:border-rose-900/40"
                          />
                        </td>

                        <td className="py-3 px-4 font-bold text-stone-900 dark:text-rose-100">
                          {banner.title || "Promotional Deal"}
                        </td>

                        <td className="py-3 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold capitalize ${
                              banner.isActive
                                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300"
                                : "bg-stone-200 text-stone-600 dark:bg-rose-950 dark:text-rose-300 border border-stone-300"
                            }`}
                          >
                            {banner.isActive ? "Active (ON)" : "Inactive (OFF)"}
                          </span>
                        </td>

                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => togglePromoBanner(banner._id, banner.isActive)}
                              className="p-1.5 rounded-xl border border-stone-200 dark:border-rose-900/50 bg-white dark:bg-rose-950 text-stone-700 dark:text-rose-200 hover:bg-stone-100 transition cursor-pointer"
                              title="Toggle Active Status"
                            >
                              {banner.isActive ? (
                                <PowerOff size={16} className="text-amber-500" />
                              ) : (
                                <Power size={16} className="text-emerald-500" />
                              )}
                            </button>

                            <button
                              onClick={() => deletePromoBanner(banner._id)}
                              className="p-1.5 rounded-xl border border-stone-200 dark:border-rose-900/50 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 transition cursor-pointer"
                              title="Delete Banner"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
