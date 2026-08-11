"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import axios from "axios";
import {
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  MapPin,
  Bell,
  Package,
  ShieldCheck,
  Camera,
  Upload,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  ArrowRight,
  Sparkles,
} from "lucide-react";

const BD_DIVISIONS = [
  "Dhaka",
  "Chattogram",
  "Rajshahi",
  "Khulna",
  "Barishal",
  "Sylhet",
  "Rangpur",
  "Mymensingh",
];

export default function UserProfilePage() {
  const { user, token, setUser, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const fileInputRef = useRef(null);

  const initialTab = searchParams.get("tab") || "profile";
  const [activeTab, setActiveTab] = useState(initialTab);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // Tab 1: Profile Info state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [avatar, setAvatar] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: "", text: "" });

  // Tab 2: Address state
  const [address, setAddress] = useState({
    division: "Dhaka",
    district: "",
    upazila: "",
    streetAddress: "",
    postalCode: "",
    recipientPhone: "",
  });
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressMsg, setAddressMsg] = useState({ type: "", text: "" });

  // Tab 3: Security & Password state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: "", text: "" });

  // Tab 4: Notification preferences state
  const [notifications, setNotifications] = useState({
    orderUpdatesEmail: true,
    orderUpdatesSMS: true,
    promotions: false,
  });
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [notifMsg, setNotifMsg] = useState({ type: "", text: "" });

  // Tab 5: User Orders state
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Populate state when user loads
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setAvatar(user.photoURL || user.avatar || "");

      if (user.savedAddresses && user.savedAddresses.length > 0) {
        setAddress(user.savedAddresses[0]);
      }
      if (user.notificationPreferences) {
        setNotifications(user.notificationPreferences);
      }
    }
  }, [user]);

  // Sync tab with URL search params
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // Fetch User Orders when Orders tab is active
  useEffect(() => {
    if (activeTab === "orders" && token) {
      const fetchOrders = async () => {
        setLoadingOrders(true);
        try {
          let res;
          try {
            res = await axios.get(`${API_URL}/api/orders/my-orders`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          } catch (e) {
            res = await axios.get(`${API_URL}/orders/my-orders`, {
              headers: { Authorization: `Bearer ${token}` },
            });
          }
          const data = res.data?.orders || res.data?.data || res.data || [];
          setOrders(Array.isArray(data) ? data : []);
        } catch (err) {
          console.error("Fetch orders error:", err);
          setOrders([]);
        } finally {
          setLoadingOrders(false);
        }
      };
      fetchOrders();
    }
  }, [activeTab, token, API_URL]);

  if (authLoading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-stone-50 dark:bg-[#120A0D]">
        <div className="flex flex-col items-center gap-3 text-rose-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm font-semibold text-stone-600 dark:text-stone-300">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-stone-50 dark:bg-[#120A0D] p-4">
        <div className="max-w-md w-full text-center bg-white dark:bg-[#1C1417] p-8 rounded-3xl shadow-xl border border-stone-200 dark:border-white/10 space-y-5">
          <div className="h-16 w-16 bg-rose-50 dark:bg-rose-950/50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
            <Lock className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-extrabold text-stone-900 dark:text-white">
            Please Sign In First
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400">
            You need to be logged in to view and manage your profile settings.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 w-full py-3 px-6 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm transition shadow-md"
          >
            <span>Sign In Now</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    );
  }

  // Handle Photo Upload from PC/Computer directly to Cloudinary
  const handleDirectPhotoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setProfileMsg({
        type: "error",
        text: "Please select a valid image file (JPEG, PNG, WebP).",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setProfileMsg({
        type: "error",
        text: "Image file size must be under 10MB.",
      });
      return;
    }

    setUploadingPhoto(true);
    setProfileMsg({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", "cherry-glow/avatars");

      let uploadRes;
      try {
        uploadRes = await axios.post(`${API_URL}/upload/image`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } catch (err) {
        uploadRes = await axios.post(`${API_URL}/api/upload/image`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      const imageUrl = uploadRes.data?.url || uploadRes.data?.secure_url;
      if (imageUrl) {
        setAvatar(imageUrl);

        // Auto-save updated profile avatar in DB
        const profileRes = await axios.put(
          `${API_URL}/api/auth/profile`,
          { avatar: imageUrl },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (profileRes.data?.user) {
          setUser(profileRes.data.user);
        }

        setProfileMsg({
          type: "success",
          text: "Profile picture uploaded and saved successfully!",
        });
      }
    } catch (error) {
      console.error("Photo upload error:", error);
      setProfileMsg({
        type: "error",
        text:
          error.response?.data?.message ||
          "Failed to upload profile picture.",
      });
    } finally {
      setUploadingPhoto(false);
      if (e.target) e.target.value = "";
    }
  };

  // 1. Save Profile Info Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileMsg({ type: "", text: "" });

    try {
      const res = await axios.put(
        `${API_URL}/api/auth/profile`,
        { name, email, phone, avatar },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.user) {
        setUser(res.data.user);
        setProfileMsg({
          type: "success",
          text: "Profile information updated successfully!",
        });
      }
    } catch (err) {
      setProfileMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile",
      });
    } finally {
      setSavingProfile(false);
    }
  };

  // 2. Save Address Handler
  const handleSaveAddress = async (e) => {
    e.preventDefault();
    setSavingAddress(true);
    setAddressMsg({ type: "", text: "" });

    try {
      const res = await axios.put(
        `${API_URL}/api/auth/profile`,
        { savedAddresses: [address] },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.user) {
        setUser(res.data.user);
        setAddressMsg({
          type: "success",
          text: "Default shipping address saved successfully!",
        });
      }
    } catch (err) {
      setAddressMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to save address",
      });
    } finally {
      setSavingAddress(false);
    }
  };

  // 3. Change Password Handler
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: "", text: "" });

    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "New passwords do not match!" });
      return;
    }

    if (newPassword.length < 6) {
      setPasswordMsg({
        type: "error",
        text: "New password must be at least 6 characters long.",
      });
      return;
    }

    setUpdatingPassword(true);
    try {
      const res = await axios.post(
        `${API_URL}/api/auth/change-password`,
        { currentPassword, newPassword },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.success) {
        setPasswordMsg({
          type: "success",
          text: "Password updated successfully!",
        });
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setPasswordMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to update password",
      });
    } finally {
      setUpdatingPassword(false);
    }
  };

  // 4. Save Notifications Handler
  const handleSaveNotifications = async (e) => {
    e.preventDefault();
    setSavingNotifs(true);
    setNotifMsg({ type: "", text: "" });

    try {
      const res = await axios.put(
        `${API_URL}/api/auth/profile`,
        { notificationPreferences: notifications },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data?.user) {
        setUser(res.data.user);
        setNotifMsg({
          type: "success",
          text: "Notification preferences saved!",
        });
      }
    } catch (err) {
      setNotifMsg({
        type: "error",
        text: err.response?.data?.message || "Failed to save preferences",
      });
    } finally {
      setSavingNotifs(false);
    }
  };

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "Recently Joined";

  return (
    <div className="min-h-screen bg-stone-50/70 dark:bg-[#120A0D] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Hidden File Input for Direct PC Photo Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleDirectPhotoUpload}
        className="hidden"
      />

      <div className="mx-auto max-w-[1280px] space-y-8">
        
        {/* Profile Banner & Header Card */}
        <div className="relative rounded-3xl bg-white dark:bg-[#1C1417] border border-stone-200/80 dark:border-white/10 p-6 sm:p-8 shadow-sm overflow-hidden">
          {/* Subtle Banner Graphic Background */}
          <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-rose-500/20 via-pink-500/15 to-purple-500/20 dark:from-rose-950/60 dark:via-rose-900/40 dark:to-purple-950/60" />

          <div className="relative pt-8 flex flex-col sm:flex-row items-center sm:items-end justify-between gap-6">
            
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-5 text-center sm:text-left">
              {/* User Avatar with Cloudinary Upload Overlay Button */}
              <div className="relative group">
                <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-full border-4 border-white dark:border-[#1C1417] shadow-md bg-stone-100 dark:bg-stone-800 overflow-hidden flex items-center justify-center text-rose-500">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={user.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-3xl font-extrabold">
                      {user.name?.charAt(0)?.toUpperCase()}
                    </span>
                  )}
                </div>

                {/* Upload Camera Overlay Icon */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingPhoto}
                  title="Upload photo from PC"
                  className="absolute bottom-0 right-0 p-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg border-2 border-white dark:border-[#1C1417] transition cursor-pointer"
                >
                  {uploadingPhoto ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Camera size={16} />
                  )}
                </button>
              </div>

              {/* User Info */}
              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">
                    {user.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 text-xs font-bold capitalize">
                    {user.role === "user" ? "Verified Customer" : user.role}
                  </span>
                </div>
                <p className="text-sm text-stone-500 dark:text-stone-400 font-medium">
                  {user.email || user.phone}
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-4 text-xs text-stone-400 dark:text-stone-400 pt-1">
                  <span>Member since {formattedDate}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <ShieldCheck size={14} /> Active Account
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Header Actions */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/products"
                className="px-4 py-2 rounded-full border border-stone-200 dark:border-white/10 text-stone-700 dark:text-stone-200 text-xs font-bold hover:bg-stone-100 dark:hover:bg-white/5 transition flex items-center gap-1.5"
              >
                <Sparkles size={15} className="text-rose-500" />
                <span>Shop Now</span>
              </Link>

              <button
                onClick={() => {
                  logout();
                  router.push("/login");
                }}
                className="px-4 py-2 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border border-red-200/60 dark:border-red-900/40 text-xs font-bold hover:bg-red-100 dark:hover:bg-red-900/50 transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut size={15} />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>

        {/* Layout Grid: Sidebar Tabs + Content Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Navigation Sidebar / Tabs */}
          <div className="lg:col-span-1 space-y-2">
            <div className="bg-white dark:bg-[#1C1417] border border-stone-200/80 dark:border-white/10 rounded-3xl p-3 shadow-sm space-y-1.5 sticky top-28">
              
              <button
                onClick={() => setActiveTab("profile")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "profile"
                    ? "bg-rose-500 text-white shadow-md"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5"
                }`}
              >
                <UserIcon size={17} />
                <span>Personal Info</span>
              </button>

              <button
                onClick={() => setActiveTab("address")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "address"
                    ? "bg-rose-500 text-white shadow-md"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5"
                }`}
              >
                <MapPin size={17} />
                <span>Shipping Address</span>
              </button>

              <button
                onClick={() => setActiveTab("password")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "password"
                    ? "bg-rose-500 text-white shadow-md"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5"
                }`}
              >
                <Lock size={17} />
                <span>Security & Password</span>
              </button>

              <button
                onClick={() => setActiveTab("notifications")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "notifications"
                    ? "bg-rose-500 text-white shadow-md"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5"
                }`}
              >
                <Bell size={17} />
                <span>Notifications</span>
              </button>

              <button
                onClick={() => setActiveTab("orders")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  activeTab === "orders"
                    ? "bg-rose-500 text-white shadow-md"
                    : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/5"
                }`}
              >
                <Package size={17} />
                <span>My Orders</span>
              </button>

            </div>
          </div>

          {/* Tab Content Box */}
          <div className="lg:col-span-3">
            <div className="bg-white dark:bg-[#1C1417] border border-stone-200/80 dark:border-white/10 rounded-3xl p-6 sm:p-8 shadow-sm">
              
              {/* ================= TAB 1: PROFILE INFO ================= */}
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                      <UserIcon className="text-rose-500" size={22} />
                      <span>Personal Information</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                      Update your account details and profile photo.
                    </p>
                  </div>

                  {profileMsg.text && (
                    <div
                      className={`p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold ${
                        profileMsg.type === "success"
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                          : "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-900"
                      }`}
                    >
                      {profileMsg.type === "success" ? (
                        <CheckCircle2 size={18} className="shrink-0" />
                      ) : (
                        <AlertCircle size={18} className="shrink-0" />
                      )}
                      <span>{profileMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveProfile} className="space-y-5">
                    
                    {/* Direct Cloudinary File Upload Button & URL input */}
                    <div className="space-y-3 p-4 rounded-2xl border border-stone-200 dark:border-white/10 bg-stone-50/60 dark:bg-[#120A0D]">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                        <Camera size={15} className="text-rose-500" />
                        <span>Profile Picture</span>
                      </label>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingPhoto}
                          className="px-5 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition flex items-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                        >
                          {uploadingPhoto ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <Upload size={16} />
                          )}
                          <span>Upload Profile Photo</span>
                        </button>
                        <span className="text-xs text-stone-400 font-medium">OR paste URL below</span>
                      </div>

                      <input
                        type="url"
                        placeholder="https://example.com/my-photo.jpg"
                        value={avatar}
                        onChange={(e) => setAvatar(e.target.value)}
                        className="w-full px-4 py-3 rounded-2xl border border-stone-200 dark:border-white/10 bg-white dark:bg-[#1C1417] text-stone-900 dark:text-white text-xs sm:text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      
                      {/* Name */}
                      <div className="space-y-2">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                          Full Name *
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#120A0D] text-stone-900 dark:text-white text-xs sm:text-sm font-semibold outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
                          />
                          <UserIcon
                            size={16}
                            className="absolute left-3.5 top-3.5 text-stone-400"
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                          Email Address
                        </label>
                        <div className="relative">
                          <input
                            type="email"
                            placeholder="user@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#120A0D] text-stone-900 dark:text-white text-xs sm:text-sm font-medium outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
                          />
                          <Mail
                            size={16}
                            className="absolute left-3.5 top-3.5 text-stone-400"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                          Phone Number
                        </label>
                        <div className="relative">
                          <input
                            type="tel"
                            placeholder="017XXXXXXXX"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#120A0D] text-stone-900 dark:text-white text-xs sm:text-sm font-medium outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
                          />
                          <Phone
                            size={16}
                            className="absolute left-3.5 top-3.5 text-stone-400"
                          />
                        </div>
                      </div>

                    </div>

                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={savingProfile}
                        className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                      >
                        {savingProfile && <Loader2 className="animate-spin h-4 w-4" />}
                        <span>Save Profile Changes</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ================= TAB 2: SHIPPING ADDRESS ================= */}
              {activeTab === "address" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                      <MapPin className="text-rose-500" size={22} />
                      <span>Default Shipping Address</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                      Save your primary delivery address for 1-click fast checkout.
                    </p>
                  </div>

                  {addressMsg.text && (
                    <div
                      className={`p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold ${
                        addressMsg.type === "success"
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                          : "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-900"
                      }`}
                    >
                      {addressMsg.type === "success" ? (
                        <CheckCircle2 size={18} className="shrink-0" />
                      ) : (
                        <AlertCircle size={18} className="shrink-0" />
                      )}
                      <span>{addressMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveAddress} className="space-y-5">
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      
                      {/* Division */}
                      <div className="space-y-2">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                          Division *
                        </label>
                        <select
                          value={address.division}
                          onChange={(e) =>
                            setAddress({ ...address, division: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-2xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#120A0D] text-stone-900 dark:text-white text-xs sm:text-sm font-semibold outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition cursor-pointer"
                        >
                          {BD_DIVISIONS.map((div) => (
                            <option key={div} value={div}>
                              {div}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* District */}
                      <div className="space-y-2">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                          District / City *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dhaka"
                          value={address.district}
                          onChange={(e) =>
                            setAddress({ ...address, district: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-2xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#120A0D] text-stone-900 dark:text-white text-xs sm:text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
                        />
                      </div>

                      {/* Upazila/Thana */}
                      <div className="space-y-2">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                          Upazila / Area / Thana *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Dhanmondi / Mirpur"
                          value={address.upazila}
                          onChange={(e) =>
                            setAddress({ ...address, upazila: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-2xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#120A0D] text-stone-900 dark:text-white text-xs sm:text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
                        />
                      </div>

                      {/* Postal Code */}
                      <div className="space-y-2">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                          Postal Code
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 1205"
                          value={address.postalCode}
                          onChange={(e) =>
                            setAddress({ ...address, postalCode: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-2xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#120A0D] text-stone-900 dark:text-white text-xs sm:text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
                        />
                      </div>

                      {/* Street Address */}
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                          Full Street Address / House & Road *
                        </label>
                        <textarea
                          rows={2}
                          required
                          placeholder="e.g. House #12, Road #4, Block B, Dhanmondi"
                          value={address.streetAddress}
                          onChange={(e) =>
                            setAddress({ ...address, streetAddress: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-2xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#120A0D] text-stone-900 dark:text-white text-xs sm:text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
                        />
                      </div>

                      {/* Recipient Contact Phone */}
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                          Delivery Phone Number
                        </label>
                        <input
                          type="tel"
                          placeholder="017XXXXXXXX"
                          value={address.recipientPhone || phone}
                          onChange={(e) =>
                            setAddress({ ...address, recipientPhone: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-2xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#120A0D] text-stone-900 dark:text-white text-xs sm:text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
                        />
                      </div>

                    </div>

                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={savingAddress}
                        className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                      >
                        {savingAddress && <Loader2 className="animate-spin h-4 w-4" />}
                        <span>Save Address</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ================= TAB 3: SECURITY & PASSWORD ================= */}
              {activeTab === "password" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                      <Lock className="text-rose-500" size={22} />
                      <span>Security & Change Password</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                      Ensure your account remains safe with a strong, updated password.
                    </p>
                  </div>

                  {passwordMsg.text && (
                    <div
                      className={`p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold ${
                        passwordMsg.type === "success"
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                          : "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-900"
                      }`}
                    >
                      {passwordMsg.type === "success" ? (
                        <CheckCircle2 size={18} className="shrink-0" />
                      ) : (
                        <AlertCircle size={18} className="shrink-0" />
                      )}
                      <span>{passwordMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleUpdatePassword} className="space-y-5">
                    
                    {/* Current Password */}
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                        Current Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showCurrentPw ? "text" : "password"}
                          required
                          placeholder="Enter your current password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-3 rounded-2xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#120A0D] text-stone-900 dark:text-white text-xs sm:text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
                        />
                        <Lock
                          size={16}
                          className="absolute left-3.5 top-3.5 text-stone-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPw(!showCurrentPw)}
                          className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                        >
                          {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* New Password */}
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                        New Password *
                      </label>
                      <div className="relative">
                        <input
                          type={showNewPw ? "text" : "password"}
                          required
                          placeholder="At least 6 characters with letters & numbers"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          className="w-full pl-10 pr-10 py-3 rounded-2xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#120A0D] text-stone-900 dark:text-white text-xs sm:text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
                        />
                        <Lock
                          size={16}
                          className="absolute left-3.5 top-3.5 text-stone-400"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPw(!showNewPw)}
                          className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                        >
                          {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm New Password */}
                    <div className="space-y-2">
                      <label className="text-xs font-extrabold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                        Confirm New Password *
                      </label>
                      <div className="relative">
                        <input
                          type="password"
                          required
                          placeholder="Re-type new password"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-[#120A0D] text-stone-900 dark:text-white text-xs sm:text-sm outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 transition"
                        />
                        <Lock
                          size={16}
                          className="absolute left-3.5 top-3.5 text-stone-400"
                        />
                      </div>
                    </div>

                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={updatingPassword}
                        className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                      >
                        {updatingPassword && <Loader2 className="animate-spin h-4 w-4" />}
                        <span>Update Password</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ================= TAB 4: NOTIFICATIONS ================= */}
              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                      <Bell className="text-rose-500" size={22} />
                      <span>Notification Preferences</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                      Control how Cherry Glow Korea sends you updates and alerts.
                    </p>
                  </div>

                  {notifMsg.text && (
                    <div
                      className={`p-4 rounded-2xl flex items-center gap-3 text-xs sm:text-sm font-semibold ${
                        notifMsg.type === "success"
                          ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                          : "bg-red-50 text-red-800 dark:bg-red-950/50 dark:text-red-300 border border-red-200 dark:border-red-900"
                      }`}
                    >
                      {notifMsg.type === "success" ? (
                        <CheckCircle2 size={18} className="shrink-0" />
                      ) : (
                        <AlertCircle size={18} className="shrink-0" />
                      )}
                      <span>{notifMsg.text}</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveNotifications} className="space-y-5">
                    
                    {/* Email Updates */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 dark:border-white/10 bg-stone-50/60 dark:bg-[#120A0D]">
                      <div>
                        <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                          Order Updates via Email
                        </h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          Receive order receipts, shipping confirmations, and tracking links.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.orderUpdatesEmail}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            orderUpdatesEmail: e.target.checked,
                          })
                        }
                        className="h-5 w-5 rounded-md accent-rose-600 cursor-pointer"
                      />
                    </div>

                    {/* SMS Updates */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 dark:border-white/10 bg-stone-50/60 dark:bg-[#120A0D]">
                      <div>
                        <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                          SMS Delivery Alerts
                        </h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          Get SMS text notifications when your package is out for delivery.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.orderUpdatesSMS}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            orderUpdatesSMS: e.target.checked,
                          })
                        }
                        className="h-5 w-5 rounded-md accent-rose-600 cursor-pointer"
                      />
                    </div>

                    {/* Promotions */}
                    <div className="flex items-center justify-between p-4 rounded-2xl border border-stone-200 dark:border-white/10 bg-stone-50/60 dark:bg-[#120A0D]">
                      <div>
                        <h4 className="text-sm font-bold text-stone-900 dark:text-white">
                          Special Deals & Promotions
                        </h4>
                        <p className="text-xs text-stone-500 dark:text-stone-400">
                          Be the first to hear about K-Beauty flash sales and new arrivals.
                        </p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notifications.promotions}
                        onChange={(e) =>
                          setNotifications({
                            ...notifications,
                            promotions: e.target.checked,
                          })
                        }
                        className="h-5 w-5 rounded-md accent-rose-600 cursor-pointer"
                      />
                    </div>

                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={savingNotifs}
                        className="px-6 py-3 rounded-full bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
                      >
                        {savingNotifs && <Loader2 className="animate-spin h-4 w-4" />}
                        <span>Save Preferences</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ================= TAB 5: MY ORDERS ================= */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-extrabold text-stone-900 dark:text-white flex items-center gap-2">
                      <Package className="text-rose-500" size={22} />
                      <span>My Order History</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                      Track and view status of all your placed orders.
                    </p>
                  </div>

                  {loadingOrders ? (
                    <div className="py-12 text-center text-rose-500">
                      <Loader2 className="h-7 w-7 animate-spin mx-auto" />
                      <p className="text-xs text-stone-500 dark:text-stone-400 mt-2 font-semibold">
                        Fetching your orders...
                      </p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="py-12 text-center space-y-4">
                      <div className="h-16 w-16 bg-rose-50 dark:bg-rose-950/40 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                        <Package size={28} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-stone-900 dark:text-white">
                          No Orders Yet
                        </h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 max-w-sm mx-auto">
                          You haven't placed any orders with Cherry Glow Korea yet.
                        </p>
                      </div>
                      <Link
                        href="/products"
                        className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm"
                      >
                        <span>Explore Skincare Collection</span>
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((ord) => (
                        <div
                          key={ord._id || ord.id}
                          className="p-5 rounded-2xl border border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-[#120A0D] space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-200 dark:border-white/5 pb-3">
                            <div>
                              <span className="text-xs text-stone-400 font-mono">
                                Order #{ord._id ? ord._id.slice(-8).toUpperCase() : ord.id}
                              </span>
                              <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                                {new Date(ord.createdAt || Date.now()).toLocaleDateString("en-US", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })}
                              </p>
                            </div>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                ord.status === "delivered"
                                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                                  : ord.status === "cancelled"
                                  ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                                  : "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300"
                              }`}
                            >
                              {ord.status || "Pending"}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center justify-between gap-4 pt-1">
                            <div className="text-xs text-stone-600 dark:text-stone-300">
                              <span className="font-semibold">Items: </span>
                              <span>
                                {ord.items
                                  ? ord.items.map((i) => i.name).join(", ")
                                  : "Skincare Products"}
                              </span>
                            </div>
                            <div className="text-sm font-extrabold text-rose-600 dark:text-rose-400">
                              ৳{ord.totalAmount || ord.total || 0}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
