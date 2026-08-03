"use client";

import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { Trash2, Power, PowerOff, Plus, Sparkles, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

export default function AdminBannerPage() {
  const [tab, setTab] = useState("hero"); // "hero" or "promo"

  // Hero Banner Form State
  const [heroTitle, setHeroTitle] = useState("");
  const [heroDesc, setHeroDesc] = useState("");
  const [heroImage, setHeroImage] = useState("");
  const [primaryBtnText, setPrimaryBtnText] = useState("Shop Now");
  const [primaryBtnLink, setPrimaryBtnLink] = useState("/products");
  const [secondaryBtnText, setSecondaryBtnText] = useState("Explore");
  const [secondaryBtnLink, setSecondaryBtnLink] = useState("/about");
  const [heroBanners, setHeroBanners] = useState([]);
  const [loadingHero, setLoadingHero] = useState(false);

  // Promo Banner Form State
  const [promoImage, setPromoImage] = useState("");
  const [promoTitle, setPromoTitle] = useState("");
  const [promoBanners, setPromoBanners] = useState([]);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Fetch Hero Banners
  const fetchHeroBanners = useCallback(async () => {
    setLoadingHero(true);
    try {
      const res = await axios.get(`${API_BASE}/banners/hero/admin`);
      setHeroBanners(res.data?.data || res.data || []);
    } catch (err) {
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
      toast.error("Please provide both Title and Image URL for the Hero banner");
      return;
    }

    try {
      const payload = {
        title: heroTitle.trim(),
        description: heroDesc.trim(),
        image: heroImage.trim(),
        primaryBtnText: primaryBtnText.trim() || "Shop Now",
        primaryBtnLink: primaryBtnLink.trim() || "/products",
        secondaryBtnText: secondaryBtnText.trim() || "Explore",
        secondaryBtnLink: secondaryBtnLink.trim() || "/about",
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
      toast.error("Failed to create hero banner");
    }
  };

  const handleToggleHeroBanner = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === "active" ? "inactive" : "active";
      const res = await axios.put(`${API_BASE}/banners/hero/${id}`, { status: newStatus });
      if (res.data?.success) {
        toast.success(`Banner slide status set to ${newStatus}`);
        fetchHeroBanners();
      }
    } catch (err) {
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
      toast.error("Failed to delete banner slide");
    }
  };

  /* ---------------- PROMO BANNER HANDLERS ---------------- */
  const handleAddPromo = async () => {
    if (!promoImage) return;

    try {
      const response = await axios.post(`${API_BASE}/banners/promo-banner`, {
        image: promoImage,
        title: promoTitle,
      });

      setPromoImage("");
      setPromoTitle("");
      fetchPromoBanners();
      if (response?.data?.insertedId) {
        toast.success("Promo Banner added successfully");
      }
    } catch (err) {
      toast.error("Failed to add promo banner");
    }
  };

  const togglePromoBanner = async (id, current) => {
    try {
      const response = await axios.patch(`${API_BASE}/banners/promo-banner/toggle/${id}`, {
        isActive: !current,
      });

      if (response?.data?.success) {
        toast.success(`Promo banner turned ${!current ? "ON" : "OFF"}`);
      }
      fetchPromoBanners();
    } catch (err) {
      toast.error("Failed to toggle banner");
    }
  };

  const deletePromoBanner = async (id) => {
    try {
      const response = await axios.delete(`${API_BASE}/banners/promo-banner/${id}`);
      if (response?.data?.success) {
        toast.success("Promo banner deleted");
      }
      fetchPromoBanners();
    } catch (err) {
      toast.error("Failed to delete banner");
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-[1400px] mx-auto">
      
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 dark:text-white flex items-center gap-2">
            <ImageIcon className="text-rose-500" /> Banner Management
          </h1>
          <p className="text-xs text-stone-500 dark:text-slate-400 mt-1">
            Manage homepage Hero slider banners and promotional popups
          </p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center bg-stone-100 dark:bg-slate-900 p-1 rounded-2xl border border-stone-200 dark:border-slate-800">
          <button
            onClick={() => setTab("hero")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              tab === "hero"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-stone-600 dark:text-slate-300 hover:text-stone-900"
            }`}
          >
            <Sparkles size={14} /> Hero Slider Banners ({heroBanners.length})
          </button>
          <button
            onClick={() => setTab("promo")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              tab === "promo"
                ? "bg-rose-500 text-white shadow-xs"
                : "text-stone-600 dark:text-slate-300 hover:text-stone-900"
            }`}
          >
            Promo Popups ({promoBanners.length})
          </button>
        </div>
      </div>

      {/* TAB 1: HERO SLIDER BANNERS */}
      {tab === "hero" && (
        <div className="space-y-8">
          
          {/* Add Hero Banner Form */}
          <div className="bg-white dark:bg-[#160E12] p-6 rounded-3xl border border-stone-200 dark:border-slate-800 shadow-xs space-y-5">
            <h2 className="font-bold text-base text-stone-900 dark:text-white flex items-center gap-2">
              <Plus className="text-rose-500" size={18} /> Add New Hero Slider Banner
            </h2>

            <form onSubmit={handleAddHeroBanner} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 mb-1">
                  Banner Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Glow Naturally"
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-900 text-xs text-stone-900 dark:text-white outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 mb-1">
                  Image URL (Cloudinary or Image Link) *
                </label>
                <input
                  type="text"
                  placeholder="https://res.cloudinary.com/..."
                  value={heroImage}
                  onChange={(e) => setHeroImage(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-900 text-xs text-stone-900 dark:text-white outline-none focus:border-rose-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 mb-1">
                  Description / Subtitle
                </label>
                <textarea
                  rows={2}
                  placeholder="Clean K-Beauty skincare crafted to enhance your natural glow..."
                  value={heroDesc}
                  onChange={(e) => setHeroDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-900 text-xs text-stone-900 dark:text-white outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 mb-1">
                  Primary Button Label & Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Shop Now"
                    value={primaryBtnText}
                    onChange={(e) => setPrimaryBtnText(e.target.value)}
                    className="w-1/2 px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-900 text-xs text-stone-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="/products"
                    value={primaryBtnLink}
                    onChange={(e) => setPrimaryBtnLink(e.target.value)}
                    className="w-1/2 px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-900 text-xs text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-slate-300 mb-1">
                  Secondary Button Label & Link
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Explore"
                    value={secondaryBtnText}
                    onChange={(e) => setSecondaryBtnText(e.target.value)}
                    className="w-1/2 px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-900 text-xs text-stone-900 dark:text-white"
                  />
                  <input
                    type="text"
                    placeholder="/about"
                    value={secondaryBtnLink}
                    onChange={(e) => setSecondaryBtnLink(e.target.value)}
                    className="w-1/2 px-3 py-2 rounded-xl border border-stone-200 dark:border-slate-800 bg-stone-50 dark:bg-slate-900 text-xs text-stone-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold text-xs rounded-xl shadow-xs transition cursor-pointer flex items-center gap-2"
                >
                  <Plus size={16} /> Add Hero Banner Slide
                </button>
              </div>
            </form>
          </div>

          {/* Hero Banners Grid / Table */}
          <div className="bg-white dark:bg-[#160E12] p-6 rounded-3xl border border-stone-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="font-bold text-base text-stone-900 dark:text-white">Active Hero Slides ({heroBanners.length})</h2>

            {loadingHero ? (
              <p className="text-xs text-stone-500 py-6 text-center">Loading banners...</p>
            ) : heroBanners.length === 0 ? (
              <div className="text-center py-8 text-xs text-stone-500 bg-stone-50 dark:bg-slate-900/40 rounded-2xl border">
                No hero banners configured yet. Default hero slides are currently displaying on homepage.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {heroBanners.map((slide) => (
                  <div
                    key={slide._id}
                    className="p-4 rounded-2xl border border-stone-200 dark:border-slate-800 bg-stone-50/50 dark:bg-slate-900/40 flex flex-col justify-between gap-4"
                  >
                    <div className="flex gap-4">
                      {/* Image Preview */}
                      <div className="relative w-32 h-20 rounded-xl overflow-hidden bg-stone-200 shrink-0 border">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={slide.image} alt={slide.title} className="w-full h-full object-cover" />
                      </div>

                      <div className="min-w-0 flex-1 space-y-1">
                        <h3 className="font-bold text-sm text-stone-900 dark:text-white truncate">{slide.title}</h3>
                        <p className="text-xs text-stone-500 dark:text-slate-400 line-clamp-2">{slide.description || "No description"}</p>
                        <div className="flex items-center gap-2 pt-1 text-[10px] text-stone-400">
                          <span className="bg-stone-200 dark:bg-slate-800 px-2 py-0.5 rounded font-mono font-bold text-stone-700 dark:text-stone-300">
                            {slide.primaryBtnText} → {slide.primaryBtnLink}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-stone-200 dark:border-slate-800">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                          slide.status === "active"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                            : "bg-stone-200 text-stone-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}
                      >
                        {slide.status === "active" ? "Active" : "Inactive"}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggleHeroBanner(slide._id, slide.status)}
                          className="p-2 rounded-xl bg-stone-200/80 dark:bg-slate-800 text-stone-700 dark:text-stone-300 hover:bg-rose-50 hover:text-rose-600 transition"
                          title="Toggle Status"
                        >
                          {slide.status === "active" ? <PowerOff size={16} /> : <Power size={16} />}
                        </button>

                        <button
                          onClick={() => handleDeleteHeroBanner(slide._id)}
                          className="p-2 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 hover:bg-red-200 transition"
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

      {/* TAB 2: PROMO POPUP BANNERS */}
      {tab === "promo" && (
        <div className="space-y-8">
          <div className="bg-white dark:bg-[#160E12] p-6 rounded-3xl border border-stone-200 dark:border-slate-800 shadow-xs space-y-4 max-w-xl">
            <h2 className="font-bold text-base text-stone-900 dark:text-white">Add New Promo Popup Banner</h2>

            <input
              type="text"
              placeholder="Offer Name"
              value={promoTitle}
              onChange={(e) => setPromoTitle(e.target.value)}
              className="border p-2.5 w-full rounded-xl text-xs bg-stone-50 dark:bg-slate-900 border-stone-200 dark:border-slate-800 text-stone-900 dark:text-white"
            />

            <input
              type="text"
              placeholder="Cloudinary Image URL"
              value={promoImage}
              onChange={(e) => setPromoImage(e.target.value)}
              className="border p-2.5 w-full rounded-xl text-xs bg-stone-50 dark:bg-slate-900 border-stone-200 dark:border-slate-800 text-stone-900 dark:text-white"
            />

            <button
              onClick={handleAddPromo}
              className="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold px-4 py-2.5 rounded-xl text-xs shadow-xs transition cursor-pointer"
            >
              <Plus size={16} /> Add Promo Banner
            </button>
          </div>

          <div className="bg-white dark:bg-[#160E12] p-6 rounded-3xl border border-stone-200 dark:border-slate-800 shadow-xs overflow-x-auto">
            <h2 className="font-bold text-base text-stone-900 dark:text-white mb-4">Existing Promo Banners</h2>

            <table className="w-full text-xs">
              <thead>
                <tr className="text-left border-b border-stone-200 dark:border-slate-800 text-stone-400">
                  <th className="p-3">Image</th>
                  <th className="p-3">Offer</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {promoBanners.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center py-6 text-stone-400">
                      No promo banners found
                    </td>
                  </tr>
                )}

                {promoBanners.map((banner) => (
                  <tr key={banner._id} className="border-b border-stone-100 dark:border-slate-800/60 hover:bg-stone-50/50 dark:hover:bg-slate-900/40">
                    <td className="p-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={banner.image} alt="banner" className="h-12 w-20 object-cover rounded-xl border" />
                    </td>

                    <td className="p-3 font-bold text-stone-900 dark:text-white">{banner.title || "—"}</td>

                    <td className="p-3">
                      {banner.isActive ? (
                        <span className="text-emerald-600 font-bold">Active</span>
                      ) : (
                        <span className="text-stone-400 font-medium">Off</span>
                      )}
                    </td>

                    <td className="p-3 flex justify-center gap-3">
                      <button
                        onClick={() => togglePromoBanner(banner._id, banner.isActive)}
                        className="p-2 rounded-xl bg-stone-100 dark:bg-slate-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300"
                      >
                        {banner.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                      </button>

                      <button
                        onClick={() => deletePromoBanner(banner._id)}
                        className="p-2 rounded-xl bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 hover:bg-red-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
