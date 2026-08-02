"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  RefreshCw,
  X,
  Search,
  CheckCircle2,
  Upload,
  Loader2,
  Image as ImageIcon,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image: "",
    icon: "sparkles",
    description: "",
    isFeatured: false,
    sortOrder: 0,
    status: "active",
  });

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    return token;
  };

  /* ---------------- Fetch Categories ---------------- */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/categories`);
      setCategories(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ---------------- Handle Local File Upload to Cloudinary ---------------- */
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setUploadingImage(true);
      const token = getToken();

      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("folder", "cherry-glow/categories");

      const res = await axios.post(`${API_BASE}/upload/image`, uploadData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data?.url) {
        setFormData((prev) => ({ ...prev, image: res.data.url }));
        toast.success("Image uploaded to Cloudinary successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  /* ---------------- Open Form Modal ---------------- */
  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      slug: "",
      image: "",
      icon: "sparkles",
      description: "",
      isFeatured: false,
      sortOrder: categories.length + 1,
      status: "active",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name || "",
      slug: cat.slug || "",
      image: cat.image || "",
      icon: cat.icon || "sparkles",
      description: cat.description || "",
      isFeatured: !!cat.isFeatured,
      sortOrder: cat.sortOrder || 0,
      status: cat.status || "active",
    });
    setIsModalOpen(true);
  };

  /* ---------------- Submit Form ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Category name is required.");
      return;
    }

    try {
      setSubmitting(true);
      const token = getToken();
      const headers = { Authorization: `Bearer ${token}` };

      if (editingCategory) {
        await axios.put(`${API_BASE}/categories/${editingCategory._id}`, formData, { headers });
        toast.success("Category updated successfully!");
      } else {
        await axios.post(`${API_BASE}/categories`, formData, { headers });
        toast.success("Category created successfully!");
      }

      setIsModalOpen(false);
      fetchCategories();
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- Delete Category ---------------- */
  const handleDelete = async (id, name) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const token = getToken();
      await axios.delete(`${API_BASE}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Category deleted");
      fetchCategories();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name?.toLowerCase().includes(search.toLowerCase()) ||
    c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 dark:border-rose-900/30 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-white flex items-center gap-2">
              <span>Category Management</span>
              <Tag className="h-5 w-5 text-rose-500 dark:text-rose-400" />
            </h1>
            <span className="rounded-full bg-rose-500/10 border border-rose-500/20 px-3 py-1 text-xs font-bold text-rose-600 dark:text-rose-400">
              {categories.length} Categories
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-slate-400 mt-1">
            Add, edit, or delete categories for your store catalog with Cloudinary image upload.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchCategories}
            className="p-2.5 rounded-xl bg-white dark:bg-rose-950/60 border border-stone-200 dark:border-rose-800/40 text-stone-700 dark:text-rose-200 hover:bg-stone-50 shadow-xs cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4 text-rose-500 dark:text-rose-400" />
          </button>

          <Button
            onClick={handleOpenAddModal}
            className="gap-2 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl px-4 py-2.5 shadow-md hover:shadow-rose-500/30 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Category</span>
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-slate-400" />
        <Input
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 py-2 bg-white dark:bg-[#160E12] border-stone-200 dark:border-rose-900/30 text-xs rounded-xl text-stone-900 dark:text-white shadow-xs"
        />
      </div>

      {/* Grid of Categories */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <RefreshCw className="h-8 w-8 animate-spin text-rose-500" />
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-[#160E12] rounded-2xl border border-stone-200 dark:border-rose-900/30 p-8 space-y-2">
          <Tag className="h-10 w-10 text-stone-300 dark:text-rose-900/50" />
          <h3 className="text-sm font-bold text-stone-800 dark:text-rose-100">No Categories Found</h3>
          <p className="text-xs text-stone-500 dark:text-slate-400">Click &quot;Add New Category&quot; to create your first category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => (
            <div
              key={cat._id}
              className="rounded-2xl border border-stone-200/80 dark:border-rose-900/40 bg-white dark:bg-[#160E12] p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
            >
              <div className="flex items-start gap-3.5">
                {/* Category Image */}
                <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-stone-200 dark:border-slate-800 bg-stone-100 dark:bg-slate-900 shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-300">
                  {cat.image ? (
                    <Image
                      src={cat.image}
                      alt={cat.name}
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-rose-500 font-bold text-lg">
                      {cat.name[0]}
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-bold text-sm text-stone-900 dark:text-white truncate">
                      {cat.name}
                    </h3>
                    {cat.isFeatured && (
                      <span className="inline-flex items-center gap-0.5 text-[9px] font-extrabold px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/60 text-pink-700 dark:text-pink-300">
                        <Sparkles className="h-2.5 w-2.5 text-pink-500" /> Featured
                      </span>
                    )}
                  </div>

                  <p className="text-[11px] font-mono text-stone-400 dark:text-rose-300/70 mt-0.5">
                    /{cat.slug}
                  </p>

                  {cat.description && (
                    <p className="text-xs text-stone-500 dark:text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
                      {cat.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-rose-950/50 text-xs">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                    cat.status === "active"
                      ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200"
                      : "bg-stone-100 text-stone-500"
                  }`}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {cat.status || "active"}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(cat)}
                    className="p-1.5 rounded-lg border border-stone-200 dark:border-rose-900/50 text-stone-600 dark:text-rose-300 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                    title="Edit Category"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>

                  <button
                    onClick={() => handleDelete(cat._id, cat.name)}
                    className="p-1.5 rounded-lg border border-stone-200 dark:border-rose-900/50 text-rose-500 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                    title="Delete Category"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================== */}
      {/* 🚀 ADD / EDIT CATEGORY MODAL */}
      {/* ========================================== */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="relative w-full max-w-lg rounded-3xl border border-stone-200 dark:border-rose-900/40 bg-white dark:bg-[#1C1014] text-stone-800 dark:text-rose-100 p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-rose-950/60 pb-3">
              <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Tag className="h-4.5 w-4.5 text-rose-500" />
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-rose-950"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">
                  Category Name *
                </label>
                <Input
                  placeholder="e.g. Cleanser, Toner, Sunscreen..."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-stone-50 dark:bg-slate-900 border-stone-200 dark:border-slate-800 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">
                  Slug (URL)
                </label>
                <Input
                  placeholder="e.g. cleanser (auto-generated if empty)"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="bg-stone-50 dark:bg-slate-900 border-stone-200 dark:border-slate-800 rounded-xl font-mono text-[11px]"
                />
              </div>

              {/* Image Upload / URL Input */}
              <div className="space-y-2">
                <label className="font-bold text-stone-700 dark:text-slate-300 block">
                  Category Image
                </label>

                {/* Live Preview if image exists */}
                {formData.image && (
                  <div className="relative h-24 w-24 rounded-2xl overflow-hidden border border-rose-200 dark:border-rose-900/60 bg-stone-100 dark:bg-slate-900 shadow-xs mb-2 group">
                    <Image
                      src={formData.image}
                      alt="Category preview"
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: "" })}
                      className="absolute top-1 right-1 bg-black/70 text-white p-1 rounded-full hover:bg-rose-600 transition-colors"
                      title="Remove image"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Input
                    placeholder="Paste Image URL (https://...)"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    className="bg-stone-50 dark:bg-slate-900 border-stone-200 dark:border-slate-800 rounded-xl flex-1"
                  />

                  {/* Local Computer File Upload Button */}
                  <label className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 font-bold border border-rose-500/30 transition-all cursor-pointer shrink-0">
                    {uploadingImage ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-rose-500" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="h-4 w-4 text-rose-500" />
                        <span>Upload File</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-[10px] text-stone-400">You can paste a web URL or select an image file directly from your computer to upload to Cloudinary.</p>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">
                  Description
                </label>
                <textarea
                  placeholder="Brief description of products in this category..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-xl p-3 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-400"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center gap-2 font-bold cursor-pointer text-stone-700 dark:text-slate-300">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="rounded border-stone-300 text-rose-500 focus:ring-rose-400"
                  />
                  <span>Feature on Homepage</span>
                </label>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-stone-700 dark:text-slate-300">Status:</span>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-lg p-1 font-bold text-stone-800 dark:text-slate-200"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-100 dark:border-rose-950/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 dark:border-rose-900/50 text-xs font-semibold text-stone-700 dark:text-rose-200 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={submitting || uploadingImage}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl px-5 py-2 text-xs shadow-md cursor-pointer"
                >
                  {submitting ? "Saving..." : editingCategory ? "Update Category" : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
