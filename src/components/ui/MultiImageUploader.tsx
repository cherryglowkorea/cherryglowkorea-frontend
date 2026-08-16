"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { Upload, Image as ImageIcon, X, Loader2, CheckCircle2, Star, Plus } from "lucide-react";
import { toast } from "sonner";

interface MultiImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
  label?: string;
  className?: string;
}

export default function MultiImageUploader({
  value = [],
  onChange,
  folder = "cherry-glow/products",
  label = "Product Images Gallery",
  className = "",
}: MultiImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Handle Batch File Upload (Multi-Select from PC / Mobile Gallery)
  const handleBatchFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);

    // Filter valid image types & size
    const validFiles = fileList.filter((file) => {
      if (!file.type.startsWith("image/") && !file.name.match(/\.(heic|heif)$/i)) {
        toast.error(`"${file.name}" is not a valid image file.`);
        return false;
      }
      if (file.size > 12 * 1024 * 1024) {
        toast.error(`"${file.name}" exceeds 12MB limit.`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    try {
      setUploading(true);
      setUploadProgress(10);

      const formData = new FormData();
      validFiles.forEach((file) => formData.append("files", file));
      formData.append("folder", folder);

      const token = localStorage.getItem("token");

      const res = await axios.post(`${API_BASE}/upload/images`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || 1;
          const current = progressEvent.loaded;
          const percent = Math.round((current / total) * 90);
          setUploadProgress(percent);
        },
      });

      if (res.data?.success && Array.isArray(res.data.images)) {
        const newUrls = res.data.images.map((img: any) => img.url || img);
        const combined = [...value.filter(Boolean), ...newUrls];
        onChange(combined);
        toast.success(`🎉 ${newUrls.length} images uploaded to Cloudinary successfully!`);
      } else if (res.data?.urls) {
        const combined = [...value.filter(Boolean), ...res.data.urls];
        onChange(combined);
        toast.success(`🎉 ${res.data.urls.length} images uploaded!`);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      console.error("Batch upload error:", err);
      toast.error(err.response?.data?.message || "Failed to upload images. Please try again.");
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const removeImage = (index: number) => {
    const updated = value.filter((_, i) => i !== index);
    onChange(updated);
  };

  const setAsCover = (index: number) => {
    if (index === 0) return;
    const item = value[index];
    const rest = value.filter((_, i) => i !== index);
    onChange([item, ...rest]);
    toast.success("Main cover image updated!");
  };

  const validUrls = (value || []).filter((url) => typeof url === "string" && url.trim() !== "");

  return (
    <div className={`space-y-3 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-rose-200 flex items-center gap-1.5">
            <ImageIcon size={14} className="text-rose-500" />
            <span>{label}</span>
            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded-full">
              {validUrls.length} Selected
            </span>
          </label>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus size={13} />
            <span>Add More Photos</span>
          </button>
        </div>
      )}

      {/* Hidden File Input with Multiple Selection Enabled */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleBatchFileChange}
        accept="image/*,.heic,.heif"
        multiple
        className="hidden"
      />

      {/* Batch Dropzone & Thumbnail Grid */}
      <div className="space-y-3">
        {/* Upload Dropzone Box */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="border-2 border-dashed border-rose-300 dark:border-rose-900/60 hover:border-rose-500 bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/80 rounded-2xl p-5 text-center cursor-pointer transition-all space-y-2 group"
        >
          {uploading ? (
            <div className="flex flex-col items-center justify-center py-3 space-y-2">
              <Loader2 className="h-7 w-7 animate-spin text-rose-500" />
              <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                Uploading images to Cloudinary... ({uploadProgress}%)
              </p>
              <div className="w-48 bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <>
              <div className="h-10 w-10 mx-auto rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-stone-800 dark:text-rose-100">
                  Click or tap to select MULTIPLE images at once from Mobile Gallery or PC
                </p>
                <p className="text-[11px] text-stone-500 dark:text-rose-300/60 mt-0.5">
                  Hold Ctrl / Shift or tap multiple photos in phone gallery (PNG, JPG, WEBP, HEIC)
                </p>
              </div>
            </>
          )}
        </div>

        {/* Thumbnail Preview Gallery */}
        {validUrls.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 pt-1">
            {validUrls.map((url, idx) => {
              const isMainCover = idx === 0;
              return (
                <div
                  key={idx}
                  className={`relative group rounded-2xl overflow-hidden border bg-stone-100 dark:bg-stone-900 aspect-square shadow-xs transition-all ${
                    isMainCover
                      ? "border-2 border-rose-500 ring-2 ring-rose-500/20"
                      : "border-stone-200 dark:border-rose-900/40 hover:border-rose-400"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`Product photo ${idx + 1}`} className="w-full h-full object-cover" />

                  {/* Main Cover Badge */}
                  {isMainCover ? (
                    <span className="absolute top-1.5 left-1.5 bg-rose-500 text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs flex items-center gap-0.5">
                      <Star size={10} className="fill-white" /> Main Cover
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAsCover(idx)}
                      className="absolute top-1.5 left-1.5 bg-black/60 hover:bg-rose-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
                    >
                      Make Cover
                    </button>
                  )}

                  {/* Remove Button */}
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-red-600 text-white p-1 rounded-full transition cursor-pointer"
                    title="Remove image"
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
