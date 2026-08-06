"use client";

import { useState, useRef } from "react";
import axios from "axios";
import { Upload, Image as ImageIcon, X, Loader2, CheckCircle2, Link as LinkIcon } from "lucide-react";
import { toast } from "sonner";

export default function ImageUploader({
  value = "",
  onChange,
  folder = "cherry-glow/uploads",
  label = "Image",
  placeholder = "https://res.cloudinary.com/...",
  className = "",
}) {
  const [uploading, setUploading] = useState(false);
  const [isUrlMode, setIsUrlMode] = useState(false);
  const fileInputRef = useRef(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Handle direct file upload from PC / Mobile
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file (PNG, JPG, WEBP)");
      return;
    }

    // Validate file size (e.g. 10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      const token = localStorage.getItem("token");

      const res = await axios.post(`${API_BASE}/upload/image`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.data?.url) {
        onChange(res.data.url);
        toast.success("Image uploaded to Cloudinary successfully!");
      } else {
        throw new Error("No URL returned from server");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      toast.error(err.response?.data?.message || "Failed to upload image. Try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        {label && (
          <label className="text-xs font-semibold text-stone-700 dark:text-rose-200 flex items-center gap-1">
            {label}
          </label>
        )}
        <button
          type="button"
          onClick={() => setIsUrlMode(!isUrlMode)}
          className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
        >
          {isUrlMode ? (
            <>
              <Upload className="h-3 w-3" /> Upload from Device
            </>
          ) : (
            <>
              <LinkIcon className="h-3 w-3" /> Paste Image URL
            </>
          )}
        </button>
      </div>

      {isUrlMode ? (
        // URL Mode: Manual input field
        <div className="relative">
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full rounded-2xl border border-stone-200 dark:border-rose-900/50 bg-stone-50 dark:bg-rose-950/40 py-2.5 px-3.5 text-xs text-stone-900 dark:text-rose-100 font-mono focus:border-rose-500 focus:outline-none"
          />
          {value && (
            <button
              type="button"
              onClick={() => onChange("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      ) : (
        // File Upload Mode: PC / Mobile Picker or Preview
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {value ? (
            // Preview Thumbnail
            <div className="relative rounded-2xl overflow-hidden border border-stone-200 dark:border-rose-900/50 bg-stone-100 dark:bg-rose-950/40 p-2 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="Uploaded preview"
                className="h-16 w-16 rounded-xl object-cover border border-stone-200 dark:border-rose-900/40 shrink-0"
              />
              <div className="min-w-0 flex-1 space-y-1">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Image Ready
                </p>
                <p className="text-[11px] text-stone-500 dark:text-rose-300/60 truncate font-mono">
                  {value}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-white dark:bg-rose-900 text-stone-700 dark:text-rose-100 border border-stone-200 dark:border-rose-800 hover:bg-stone-50 transition"
                >
                  Change
                </button>
                <button
                  type="button"
                  onClick={() => onChange("")}
                  className="p-1.5 rounded-xl text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 transition"
                  title="Remove Image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            // File Dropzone Box
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-stone-300 dark:border-rose-900/60 hover:border-rose-500 dark:hover:border-rose-500 bg-stone-50/70 dark:bg-rose-950/20 hover:bg-rose-50/30 dark:hover:bg-rose-950/40 rounded-2xl p-4 text-center cursor-pointer transition-all space-y-1.5"
            >
              {uploading ? (
                <div className="flex flex-col items-center justify-center py-2 space-y-1">
                  <Loader2 className="h-6 w-6 animate-spin text-rose-500" />
                  <p className="text-xs font-bold text-rose-600 dark:text-rose-400">
                    Uploading image to Cloudinary...
                  </p>
                </div>
              ) : (
                <>
                  <div className="h-9 w-9 mx-auto rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                    <Upload className="h-4 w-4" />
                  </div>
                  <p className="text-xs font-bold text-stone-800 dark:text-rose-100">
                    Click or tap to upload from PC / Mobile device
                  </p>
                  <p className="text-[11px] text-stone-400 dark:text-rose-300/50">
                    Supports PNG, JPG, WEBP up to 10MB (Cloudinary Storage)
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
