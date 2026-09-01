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
  Layers,
  Sliders,
  Check,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ImageUploader from "@/components/ui/ImageUploader";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [attributes, setAttributes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("categories"); // "categories" | "attributes"

  // Category Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    nameBn: "",
    slug: "",
    image: "",
    icon: "sparkles",
    description: "",
    descriptionBn: "",
    isFeatured: false,
    sortOrder: 0,
    status: "active",
    attributes: [],
  });

  // Attribute Modal / Management state
  const [isAttrModalOpen, setIsAttrModalOpen] = useState(false);
  const [newAttrName, setNewAttrName] = useState("");
  const [newAttrNameBn, setNewAttrNameBn] = useState("");
  const [newAttrValues, setNewAttrValues] = useState("");
  const [creatingAttr, setCreatingAttr] = useState(false);

  // Add value to attribute state
  const [newValInputs, setNewValInputs] = useState<{ [key: string]: string }>({});
  const [addingValueAttrId, setAddingValueAttrId] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  const getToken = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Not authenticated");
    return token;
  };

  /* ---------------- Fetch Categories & Attributes ---------------- */
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const [catRes, attrRes] = await Promise.all([
        axios.get(`${API_BASE}/categories`),
        axios.get(`${API_BASE}/attributes`).catch(() => ({ data: [] })),
      ]);
      setCategories(catRes.data || []);
      setAttributes(attrRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories or attributes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /* ---------------- Category Modal Handlers ---------------- */
  const handleOpenAddModal = () => {
    setEditingCategory(null);
    setFormData({
      name: "",
      nameBn: "",
      slug: "",
      image: "",
      icon: "sparkles",
      description: "",
      descriptionBn: "",
      isFeatured: false,
      sortOrder: categories.length + 1,
      status: "active",
      attributes: [],
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: any) => {
    setEditingCategory(cat);
    const catAttrIds = (cat.attributes || []).map((a: any) => (typeof a === "object" ? a._id : a));
    setFormData({
      name: cat.name || "",
      nameBn: cat.nameBn || "",
      slug: cat.slug || "",
      image: cat.image || "",
      icon: cat.icon || "sparkles",
      description: cat.description || "",
      descriptionBn: cat.descriptionBn || "",
      isFeatured: !!cat.isFeatured,
      sortOrder: cat.sortOrder || 0,
      status: cat.status || "active",
      attributes: catAttrIds,
    });
    setIsModalOpen(true);
  };

  /* ---------------- Submit Category Form ---------------- */
  const handleSubmitCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error("Category English name is required.");
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
    } catch (err: any) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------------- Delete Category ---------------- */
  const handleDeleteCategory = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete category "${name}"?`)) return;

    try {
      const token = getToken();
      await axios.delete(`${API_BASE}/categories/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Category deleted");
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  /* ---------------- Attribute Management Handlers ---------------- */
  const handleCreateAttribute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAttrName.trim()) {
      toast.error("Attribute name is required.");
      return;
    }

    try {
      setCreatingAttr(true);
      const token = getToken();
      const valuesArray = newAttrValues
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean);

      await axios.post(
        `${API_BASE}/attributes`,
        {
          name: newAttrName.trim(),
          nameBn: newAttrNameBn.trim(),
          values: valuesArray,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Attribute created successfully!");
      setNewAttrName("");
      setNewAttrNameBn("");
      setNewAttrValues("");
      setIsAttrModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create attribute");
    } finally {
      setCreatingAttr(false);
    }
  };

  const handleAddValueToAttr = async (attrId: string) => {
    const valInput = newValInputs[attrId];
    if (!valInput || !valInput.trim()) return;

    try {
      setAddingValueAttrId(attrId);
      const token = getToken();
      await axios.post(
        `${API_BASE}/attributes/${attrId}/values`,
        { value: valInput.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success(`Added "${valInput.trim()}" value!`);
      setNewValInputs((prev) => ({ ...prev, [attrId]: "" }));
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add value");
    } finally {
      setAddingValueAttrId(null);
    }
  };

  const handleRemoveValueFromAttr = async (attrId: string, value: string) => {
    try {
      const token = getToken();
      await axios.delete(`${API_BASE}/attributes/${attrId}/values/${encodeURIComponent(value)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`Removed "${value}"`);
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to remove value");
    }
  };

  const handleDeleteAttribute = async (attrId: string, name: string) => {
    if (!confirm(`Are you sure you want to delete attribute "${name}"?`)) return;

    try {
      const token = getToken();
      await axios.delete(`${API_BASE}/attributes/${attrId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Attribute deleted");
      fetchCategories();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete attribute");
    }
  };

  const toggleCategoryAttrSelection = (attrId: string) => {
    setFormData((prev: any) => {
      const current = prev.attributes || [];
      if (current.includes(attrId)) {
        return { ...prev, attributes: current.filter((id: string) => id !== attrId) };
      } else {
        return { ...prev, attributes: [...current, attrId] };
      }
    });
  };

  const filteredCategories = categories.filter(
    (c: any) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.nameBn?.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-stone-200 dark:border-stone-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <span>Categories & Variant Attributes</span>
              <Tag className="h-5 w-5 text-rose-500" />
            </h1>
            <span className="rounded-full bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 px-3 py-1 text-xs font-semibold text-stone-700 dark:text-stone-300">
              {categories.length} Categories · {attributes.length} Attributes
            </span>
          </div>
          <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
            Manage Bilingual Categories (English & Bangla) and skincare product variant attributes (Size, SPF, Skin Type, etc.)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchCategories}
            className="p-2.5 rounded-xl bg-white dark:bg-[#161113] border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 shadow-xs cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4 text-stone-400 hover:text-rose-500" />
          </button>

          <Button
            onClick={() => setIsAttrModalOpen(true)}
            variant="outline"
            className="gap-1.5 border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 font-semibold rounded-xl px-3.5 py-2.5 text-xs shadow-xs cursor-pointer"
          >
            <Sliders className="h-4 w-4" />
            <span>+ Add Variant Attribute</span>
          </Button>

          <Button
            onClick={handleOpenAddModal}
            className="gap-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl px-4 py-2.5 shadow-md transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add New Category</span>
          </Button>
        </div>
      </div>

      {/* Tabs: Categories vs Variant Attributes */}
      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-stone-800/80 pb-1">
        <button
          onClick={() => setActiveTab("categories")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 ${
            activeTab === "categories"
              ? "border-rose-500 text-rose-500 bg-white dark:bg-[#161113]"
              : "border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
          }`}
        >
          <Layers size={15} />
          <span>Categories ({categories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("attributes")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-t-xl transition cursor-pointer border-b-2 ${
            activeTab === "attributes"
              ? "border-rose-500 text-rose-500 bg-white dark:bg-[#161113]"
              : "border-transparent text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200"
          }`}
        >
          <Sliders size={15} />
          <span>Variant Attributes ({attributes.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: CATEGORIES LIST ================= */}
      {activeTab === "categories" && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 dark:text-stone-500" />
            <Input
              placeholder="Search categories in English or Bangla..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 py-2 bg-white dark:bg-[#0d0709] border-stone-200 dark:border-stone-800 text-xs rounded-xl text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 shadow-xs"
            />
          </div>

          {/* Grid of Categories */}
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <RefreshCw className="h-8 w-8 animate-spin text-rose-500" />
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-[#161113] rounded-2xl border border-stone-200 dark:border-stone-800/80 p-8 space-y-2">
              <Tag className="h-10 w-10 text-stone-300 dark:text-stone-700" />
              <h3 className="text-sm font-bold text-stone-800 dark:text-stone-100">No Categories Found</h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">Click &quot;Add New Category&quot; to create your first category.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCategories.map((cat: any) => (
                <div
                  key={cat._id}
                  className="rounded-2xl border border-stone-200/80 dark:border-stone-800/80 bg-white dark:bg-[#161113] p-5 shadow-xs hover:border-stone-700 transition-all flex flex-col justify-between space-y-4 group"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Category Image */}
                    <div className="relative h-14 w-14 rounded-xl overflow-hidden border border-stone-200 dark:border-stone-800 bg-stone-100 dark:bg-stone-900 shrink-0 shadow-xs group-hover:scale-105 transition-transform duration-300">
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
                        <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100 truncate">
                          {cat.name}
                        </h3>
                        {cat.nameBn && (
                          <span className="text-xs font-semibold text-rose-500 bg-stone-100 dark:bg-[#0d0709] px-2 py-0.5 rounded-md border border-stone-200 dark:border-stone-800">
                            {cat.nameBn}
                          </span>
                        )}
                        {cat.isFeatured && (
                          <span className="inline-flex items-center gap-0.5 text-[9px] font-bold px-2 py-0.5 rounded-full bg-pink-100 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300">
                            <Sparkles className="h-2.5 w-2.5 text-pink-500" /> Featured
                          </span>
                        )}
                      </div>

                      <p className="text-[11px] font-mono text-stone-400 dark:text-stone-500 mt-0.5">
                        /{cat.slug}
                      </p>

                      {cat.description && (
                        <p className="text-xs text-stone-500 dark:text-stone-400 line-clamp-2 mt-1.5 leading-relaxed">
                          {cat.description}
                        </p>
                      )}

                      {/* Associated Attributes Badges */}
                      {cat.attributes && cat.attributes.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {cat.attributes.map((attr: any, idx: number) => {
                            const attrName = typeof attr === "object" ? attr.name : "Attribute";
                            return (
                              <span
                                key={idx}
                                className="text-[10px] font-medium text-stone-600 dark:text-stone-300 bg-stone-100 dark:bg-[#0d0709] px-2 py-0.5 rounded-full border border-stone-200 dark:border-stone-800"
                              >
                                🏷️ {attrName}
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-stone-800/60 text-xs">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        cat.status === "active"
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                          : "bg-stone-100 text-stone-500"
                      }`}
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {cat.status || "active"}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(cat)}
                        className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                        title="Edit Category"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => handleDeleteCategory(cat._id, cat.name)}
                        className="p-1.5 rounded-lg border border-stone-200 dark:border-stone-800 text-rose-500 hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
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
        </div>
      )}

      {/* ================= TAB 2: VARIANT ATTRIBUTES LIST ================= */}
      {activeTab === "attributes" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white dark:bg-[#161113] border border-stone-200 dark:border-stone-800/80 rounded-2xl p-4">
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Sliders className="h-4 w-4 text-rose-500" />
                <span>Skincare Product Variant Attributes</span>
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                Define variant options like Size (30ml, 50ml), SPF (30, 50), Skin Type, Concern, etc. to attach to categories and products.
              </p>
            </div>

            <Button
              onClick={() => setIsAttrModalOpen(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl px-4 py-2 shrink-0 cursor-pointer shadow-sm"
            >
              + Create Attribute
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {attributes.map((attr: any) => (
              <div
                key={attr._id}
                className="bg-white dark:bg-[#161113] border border-stone-200/80 dark:border-stone-800/80 rounded-2xl p-5 shadow-xs space-y-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-stone-800/60">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                          {attr.name}
                        </h4>
                        {attr.nameBn && (
                          <span className="text-xs font-semibold text-rose-500 bg-stone-100 dark:bg-[#0d0709] px-2 py-0.5 rounded-md border border-stone-200 dark:border-stone-800">
                            {attr.nameBn}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] font-mono text-stone-400 dark:text-stone-500 mt-0.5">/{attr.slug}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteAttribute(attr._id, attr.name)}
                      className="p-1.5 text-stone-400 hover:text-red-500 hover:bg-stone-100 dark:hover:bg-red-950/30 rounded-lg transition"
                      title="Delete attribute"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Values List Pills */}
                  <div className="pt-3">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 dark:text-stone-400 block mb-2">
                      Available Options ({attr.values?.length || 0})
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {attr.values?.map((val: string, idx: number) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1.5 bg-stone-100 dark:bg-[#0d0709] border border-stone-200 dark:border-stone-800 px-3 py-1 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-200 group"
                        >
                          <span>{val}</span>
                          <button
                            onClick={() => handleRemoveValueFromAttr(attr._id, val)}
                            className="text-stone-400 hover:text-red-500 transition cursor-pointer"
                            title="Remove value"
                          >
                            <X size={12} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Add New Option Value Input Form */}
                <div className="pt-3 border-t border-stone-100 dark:border-stone-800/60 flex items-center gap-2">
                  <Input
                    placeholder="Add option (e.g. 250ml or SPF 100)..."
                    value={newValInputs[attr._id] || ""}
                    onChange={(e) =>
                      setNewValInputs({ ...newValInputs, [attr._id]: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddValueToAttr(attr._id);
                      }
                    }}
                    className="h-9 text-xs bg-stone-50 dark:bg-[#0d0709] border-stone-200 dark:border-stone-800 rounded-xl"
                  />
                  <Button
                    onClick={() => handleAddValueToAttr(attr._id)}
                    disabled={addingValueAttrId === attr._id}
                    className="h-9 px-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl shrink-0 cursor-pointer shadow-xs"
                  >
                    {addingValueAttrId === attr._id ? <Loader2 size={13} className="animate-spin" /> : <Plus size={13} />}
                    <span>Add</span>
                  </Button>
                </div>
              </div>
            ))}
          </div>
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
            className="relative w-full max-w-xl rounded-3xl border border-stone-200 dark:border-stone-800/80 bg-white dark:bg-[#161113] text-stone-800 dark:text-stone-100 p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800/60 pb-3">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Tag className="h-4.5 w-4.5 text-rose-500" />
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-full p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitCategory} className="space-y-4 text-xs">
              
              {/* Category Name English & Bangla */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">
                    Category Name (English) *
                  </label>
                  <Input
                    placeholder="e.g. Cleanser, Toner, Sunscreen..."
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-stone-50 dark:bg-slate-900 border-stone-200 dark:border-slate-800 rounded-xl"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">
                    ক্যাটাগরি বাংলা নাম (Bangla Name) 🇧🇩
                  </label>
                  <Input
                    placeholder="যেমন: ক্লিনজার, টোনার, সানস্ক্রিন..."
                    value={formData.nameBn || ""}
                    onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                    className="bg-stone-50 dark:bg-slate-900 border-stone-200 dark:border-slate-800 rounded-xl font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">
                  Slug (URL)
                </label>
                <Input
                  placeholder="e.g. cleanser (auto-generated if empty)"
                  value={formData.slug || ""}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="bg-stone-50 dark:bg-slate-900 border-stone-200 dark:border-slate-800 rounded-xl font-mono text-[11px]"
                />
              </div>

              {/* Image Uploader */}
              <ImageUploader
                label="Category Banner Image (Upload to Cloudinary)"
                value={formData.image || ""}
                onChange={(url) => setFormData({ ...formData, image: url })}
                folder="cherry-glow/categories"
              />

              {/* Description English */}
              <div>
                <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">
                  Description
                </label>
                <textarea
                  placeholder="Brief description of products in this category..."
                  value={formData.description || ""}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="w-full bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-xl p-3 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-400"
                />
              </div>

              {/* Associate Variant Attributes */}
              {attributes.length > 0 && (
                <div className="space-y-2 p-3.5 rounded-2xl bg-stone-50 dark:bg-slate-900/60 border border-stone-200 dark:border-slate-800">
                  <label className="font-extrabold text-stone-700 dark:text-slate-200 flex items-center gap-1.5">
                    <Sliders size={14} className="text-rose-500" />
                    <span>Associate Skincare Variant Attributes</span>
                  </label>
                  <p className="text-[11px] text-stone-500 dark:text-slate-400">
                    Select attributes applicable to products in this category (e.g. Size, SPF, Skin Type).
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1">
                    {attributes.map((attr: any) => {
                      const isSelected = (formData.attributes || []).includes(attr._id);
                      return (
                        <button
                          key={attr._id}
                          type="button"
                          onClick={() => toggleCategoryAttrSelection(attr._id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 cursor-pointer ${
                            isSelected
                              ? "bg-rose-500 text-white border-rose-500 shadow-2xs"
                              : "bg-white dark:bg-slate-800 text-stone-600 dark:text-slate-300 border-stone-200 dark:border-slate-700 hover:border-rose-300"
                          }`}
                        >
                          {isSelected && <Check size={12} className="stroke-[3]" />}
                          <span>{attr.name}</span>
                          {attr.nameBn && <span className="opacity-80 font-normal">({attr.nameBn})</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

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

      {/* ========================================== */}
      {/* 🚀 CREATE ATTRIBUTE MODAL */}
      {/* ========================================== */}
      {isAttrModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setIsAttrModalOpen(false)}
        >
          <div
            className="relative w-full max-w-md rounded-3xl border border-stone-200 dark:border-rose-900/40 bg-white dark:bg-[#1C1014] text-stone-800 dark:text-rose-100 p-6 shadow-2xl space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-rose-950/60 pb-3">
              <h2 className="text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                <Sliders className="h-4.5 w-4.5 text-rose-500" />
                Create New Variant Attribute
              </h2>
              <button
                onClick={() => setIsAttrModalOpen(false)}
                className="rounded-full p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-rose-950"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAttribute} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">
                  Attribute Name (English) *
                </label>
                <Input
                  placeholder="e.g. Size / Volume, SPF, Skin Type, Fragrance..."
                  value={newAttrName}
                  onChange={(e) => setNewAttrName(e.target.value)}
                  className="bg-stone-50 dark:bg-slate-900 border-stone-200 dark:border-slate-800 rounded-xl"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">
                  Attribute Name (Bangla / বাংলা নাম)
                </label>
                <Input
                  placeholder="যেমন: সাইজ / ভলিউম, এসপিএফ, স্কিন টাইপ..."
                  value={newAttrNameBn}
                  onChange={(e) => setNewAttrNameBn(e.target.value)}
                  className="bg-stone-50 dark:bg-slate-900 border-stone-200 dark:border-slate-800 rounded-xl"
                />
              </div>

              <div>
                <label className="font-bold text-stone-700 dark:text-slate-300 mb-1 block">
                  Initial Options / Values (Comma Separated)
                </label>
                <textarea
                  placeholder="e.g. 30ml, 50ml, 100ml, 150ml, 200ml"
                  value={newAttrValues}
                  onChange={(e) => setNewAttrValues(e.target.value)}
                  rows={3}
                  className="w-full bg-stone-50 dark:bg-slate-900 border border-stone-200 dark:border-slate-800 rounded-xl p-3 text-stone-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-rose-400 text-xs"
                />
                <p className="text-[11px] text-stone-400 mt-1">Separate multiple option values with commas.</p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100 dark:border-rose-950/60">
                <button
                  type="button"
                  onClick={() => setIsAttrModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 dark:border-rose-900/50 text-xs font-semibold text-stone-700 dark:text-rose-200 hover:bg-stone-100"
                >
                  Cancel
                </button>
                <Button
                  type="submit"
                  disabled={creatingAttr}
                  className="bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl px-5 py-2 text-xs shadow-md cursor-pointer"
                >
                  {creatingAttr ? "Creating..." : "Save Attribute"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
