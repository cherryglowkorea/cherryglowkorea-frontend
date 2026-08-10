"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import {
  ShoppingBag,
  Truck,
  MapPin,
  User,
  Phone,
  Mail,
  FileText,
  ShieldCheck,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Tag,
  CreditCard,
  Banknote,
  Sparkles,
  Package,
  Search,
  ChevronDown,
  Check,
  Edit3,
  Building,
  MessageSquare,
  X
} from "lucide-react";

const FALLBACK_IMAGE = "/placeholder.jpg";

// All 64 Bangladesh Districts (Alphabetical with English and Bangla)
const BANGLADESH_DISTRICTS = [
  "Dhaka (ঢাকা)", "Chattogram (চট্টগ্রাম)", "Gazipur (গাজীপুর)", "Narayanganj (নারায়ণগঞ্জ)",
  "Sylhet (সিলেট)", "Rajshahi (রাজশাহী)", "Khulna (খুলনা)", "Barishal (বরিশাল)",
  "Rangpur (রংপুর)", "Mymensingh (ময়মনসিংহ)", "Cumilla (কুমিল্লা)", "Bogura (বগুড়া)",
  "Bagerhat (বাগেরহাট)", "Bandarban (বান্দরবান)", "Barguna (বরগুনা)", "Bhola (ভোলা)",
  "Brahmanbaria (ব্রাহ্মণবাড়িয়া)", "Chandpur (চাঁদপুর)", "Chuadanga (চুয়াডাঙ্গা)", "Cox's Bazar (কক্সবাজার)",
  "Dinajpur (দিনাজপুর)", "Faridpur (ফরিদপুর)", "Feni (ফেনী)", "Gaibandha (গাইবান্ধা)",
  "Gopalganj (গোপালগঞ্জ)", "Habiganj (হবিগঞ্জ)", "Jamalpur (জামালপুর)", "Jessore (যশোর)",
  "Jhalokati (ঝালকাঠি)", "Jhenaidah (ঝিনাইদহ)", "Joypurhat (জয়পুরহাট)", "Khagrachhari (খাগড়াছড়ি)",
  "Kishorganj (কিশোরগঞ্জ)", "Kurigram (কুড়িগ্রাম)", "Kushtia (কুষ্টিয়া)", "Lakshmipur (লক্ষ্মীপুর)",
  "Lalmonirhat (লালমনিরহাট)", "Madaripur (মাদারীপুর)", "Magura (মাগুরা)", "Manikganj (মানিকগঞ্জ)",
  "Meherpur (মেহেরপুর)", "Moulvibazar (মৌলভীবাজার)", "Munshiganj (মুন্সীগঞ্জ)", "Naogaon (নওগাঁ)",
  "Narail (নড়াইল)", "Narsingdi (নরসিংদী)", "Natore (নাটোর)", "Nawabganj (নবাবগঞ্জ)",
  "Netrokona (নেত্রকোণা)", "Nilphamari (নীলফামারী)", "Noakhali (নোয়াখালী)", "Pabna (পাবনা)",
  "Panchagarh (পঞ্চগড়)", "Patuakhali (পটুয়াখালী)", "Pirojpur (পিরোজপুর)", "Rajbari (রাজবাড়ী)",
  "Rangamati (রাঙ্গামাটি)", "Satkhira (সাতক্ষীরা)", "Shariatpur (শরীয়তপুর)", "Sherpur (শেরপুর)",
  "Sirajganj (সিরাজগঞ্জ)", "Sunamganj (সুনামগঞ্জ)", "Tangail (টাঙ্গাইল)", "Thakurgaon (ঠাকুরগাঁও)",
  "OTHER"
];

export default function CheckoutPage() {
  const { cart, clearCart, coupon: contextCoupon } = useCart();
  const { setAuthData } = useAuth();
  const router = useRouter();
  const t = useTranslations("checkout");

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // Shipping Form State
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [altPhone, setAltPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [setPasswordLoading, setSetPasswordLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [deliveryArea, setDeliveryArea] = useState("outside"); // "dhaka" | "outside"
  const [district, setDistrict] = useState("Dhaka (ঢাকা)");
  const [isCustomDistrict, setIsCustomDistrict] = useState(false);
  const [customDistrictInput, setCustomDistrictInput] = useState("");
  const [thana, setThana] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");

  // Payment Method State ("cod" | "bkash")
  const [paymentMethod, setPaymentMethod] = useState("cod");

  // Coupon State
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);
      const storedUserStr = localStorage.getItem("user");
      if (storedUserStr) {
        try {
          const storedUser = JSON.parse(storedUserStr);
          if (storedUser.name) setName(storedUser.name);
          if (storedUser.phone) setPhone(storedUser.phone);
          if (storedUser.email) setEmail(storedUser.email);
        } catch (e) {}
      }
    }
  }, []);

  // Sync context coupon if available
  useEffect(() => {
    if (contextCoupon && !appliedCoupon) {
      setAppliedCoupon({
        code: "AUTO10",
        discountType: contextCoupon.type,
        discountAmount: contextCoupon.value,
      });
    }
  }, [contextCoupon, appliedCoupon]);

  // Delivery Charge computation
  const deliveryCharge = deliveryArea === "dhaka" ? 70 : 120;

  // Subtotal computation
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = item.selectedVariant?.price || item.price || 0;
      return sum + price * item.quantity;
    }, 0);
  }, [cart]);

  // Discount computation
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === "percentage") {
      return (subtotal * appliedCoupon.discountAmount) / 100;
    }
    return appliedCoupon.discountAmount || 0;
  }, [appliedCoupon, subtotal]);

  // Grand Total
  const total = Math.max(0, subtotal - discount + deliveryCharge);

  // Apply Coupon API Call
  const handleApplyCoupon = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code");
      return;
    }

    setCouponLoading(true);
    try {
      const apiHost = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiHost}/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode, amount: subtotal }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon({
          code: data.code,
          discountType: data.discountType,
          discountAmount: data.discountAmount,
          discount: data.discount,
        });
        toast.success(`Coupon "${data.code}" applied! Saved ৳${data.discount}`);
        setCouponCode("");
      } else {
        toast.error(data.message || "Invalid coupon code");
      }
    } catch {
      // Fallback demo validation
      if (couponCode.toUpperCase() === "CHERRY10") {
        setAppliedCoupon({ code: "CHERRY10", discountType: "percentage", discountAmount: 10 });
        toast.success("Coupon CHERRY10 applied! (10% OFF)");
        setCouponCode("");
      } else {
        toast.error("Unable to validate coupon. Please try again.");
      }
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    toast.info("Coupon removed");
  };

  // Submit Order
  const handleSubmitOrder = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your full name");
      return;
    }
    if (!phone.trim()) {
      toast.error("Please enter your phone number");
      return;
    }
    if (phone.trim().length < 11) {
      toast.error("Please enter a valid 11-digit phone number");
      return;
    }
    if (!address.trim()) {
      toast.error("Please enter your detailed delivery address");
      return;
    }
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    // Check if any product needs size/variant selection
    const missingVariant = cart.find(
      (item) => item.type !== "combo" && !item.selectedVariant
    );
    if (missingVariant) {
      toast.error(`Please select a size for "${missingVariant.name}"`);
      return;
    }

    setLoading(true);

    const finalDistrict =
      isCustomDistrict || district === "OTHER"
        ? customDistrictInput.trim() || "Dhaka (ঢাকা)"
        : district;

    const payload = {
      name,
      phone: altPhone.trim() ? `${phone} (Alt: ${altPhone})` : phone,
      email,
      password: password || undefined,
      shippingAddress: {
        recipientName: name,
        recipientPhone: phone,
        district: finalDistrict,
        thana,
        addressLine: address,
        address,
      },
      orderItems: cart,
      cart,
      district: finalDistrict,
      thana,
      address,
      note,
      paymentMethod: paymentMethod === "cod" ? "Cash On Delivery" : "bKash/Nagad",
      shippingCost: deliveryCharge,
      discount,
      couponCode: appliedCoupon?.code || "",
    };

    try {
      const apiHost = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const targetEndpoint = !isLoggedIn ? `${apiHost}/api/auth/guest-checkout` : `${apiHost}/orders/order`;
      
      const res = await fetch(targetEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        if (data.user) {
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        if (data.token) {
          localStorage.setItem("token", data.token);
          setIsLoggedIn(true);
          toast.success("🎉 Account created and logged in automatically!");
        }
        if (setAuthData && data.user) {
          setAuthData(data.user, data.token || null);
        }

        setOrderSuccess({
          orderNumber: data.orderNumber || data.orderId || (data.order && data.order.orderNumber) || `CG-${Date.now()}`,
          customerName: name,
          phone,
          address: `${address}, ${thana ? thana + ", " : ""}${finalDistrict}`,
          total,
          deliveryCharge,
          items: cart,
          paymentMethod: paymentMethod === "cod" ? t("cod") : "Digital Payment",
        });
        clearCart();
        toast.success("🎉 Order placed successfully!");
      } else {
        toast.error(data.message || "Failed to place order. Please try again.");
      }
    } catch (error) {
      toast.error("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSetPasswordOnSuccess = async (e) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    setSetPasswordLoading(true);
    try {
      const apiHost = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiHost}/api/auth/set-guest-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: orderSuccess.phone,
          password,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token && data.user) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("user", JSON.stringify(data.user));
          setIsLoggedIn(true);
          if (setAuthData) {
            setAuthData(data.user, data.token);
          }
          toast.success("🎉 Account password saved! You are now logged in.");
        }
      } else {
        toast.error(data.message || "Failed to set password.");
      }
    } catch (err) {
      toast.error("Network error setting password.");
    } finally {
      setSetPasswordLoading(false);
    }
  };

  if (!mounted) return null;

  // -------------------------------------------------------------
  // SUCCESS SCREEN
  // -------------------------------------------------------------
  if (orderSuccess) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-[#120a0d] py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-[#1e1215] border border-rose-100 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-xl text-center space-y-6">
            
            {/* Animated Check Icon */}
            <div className="w-16 sm:w-20 h-16 sm:h-20 bg-gradient-to-tr from-emerald-400 to-teal-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-teal-500/20 animate-bounce">
              <CheckCircle2 size={40} className="text-white" />
            </div>

            <div>
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40 mb-3">
                <Sparkles size={12} /> {t("orderConfirmed")}
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-rose-50">
                {t("thankYou")}, {orderSuccess.customerName}!
              </h1>
              <p className="text-stone-500 dark:text-rose-100/60 text-xs sm:text-sm mt-1">
                {t("orderConfirmedDesc")}
              </p>
            </div>

            {/* Order Info Card */}
            <div className="bg-stone-50 dark:bg-black/30 border border-stone-100 dark:border-white/5 rounded-2xl p-4 sm:p-5 text-left space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-stone-200 dark:border-white/10 text-xs sm:text-sm">
                <span className="text-stone-400 dark:text-rose-100/40 font-medium">{t("orderId")}:</span>
                <span className="font-mono font-bold text-pink-600 dark:text-pink-400 text-sm sm:text-base">
                  #{orderSuccess.orderNumber}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-stone-400 dark:text-rose-100/40 font-medium">{t("payment")}:</span>
                <span className="font-semibold text-stone-800 dark:text-rose-100">
                  {orderSuccess.paymentMethod}
                </span>
              </div>

              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-stone-400 dark:text-rose-100/40 font-medium">{t("address")}:</span>
                <span className="font-medium text-stone-700 dark:text-rose-100/80 max-w-[220px] sm:max-w-[260px] text-right truncate">
                  {orderSuccess.address}
                </span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-dashed border-stone-200 dark:border-white/10 text-sm sm:text-base font-bold">
                <span className="text-stone-800 dark:text-rose-50">{t("totalAmount")}:</span>
                <span className="text-pink-600 dark:text-pink-400 text-base sm:text-lg font-black">
                  ৳{orderSuccess.total}
                </span>
              </div>
            </div>

            {/* Optional Account Creation Card for Guest Users */}
            {!isLoggedIn && (
              <div className="bg-gradient-to-br from-pink-50/80 to-rose-50/50 dark:from-pink-950/20 dark:to-rose-950/10 border border-pink-200/80 dark:border-pink-900/30 rounded-2xl p-5 text-left space-y-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-pink-500 shrink-0" size={20} />
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                      Create Account & Track Orders / পাসওয়ার্ড সেট করুন (ঐচ্ছিক)
                    </h3>
                    <p className="text-[11px] sm:text-xs text-stone-500 dark:text-rose-100/60 mt-0.5">
                      Set a password to create an account so you can log in & track future orders anytime!
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSetPasswordOnSuccess} className="flex flex-col sm:flex-row gap-2.5 pt-1">
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Set a password (min 6 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 h-10 px-3.5 text-xs sm:text-sm rounded-xl border border-pink-300 dark:border-pink-900/50 bg-white dark:bg-stone-900 text-stone-800 dark:text-rose-50 placeholder-stone-400 outline-none focus:ring-1 focus:ring-pink-500"
                  />
                  <button
                    type="submit"
                    disabled={setPasswordLoading}
                    className="h-10 px-5 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer shrink-0 disabled:opacity-50 flex items-center justify-center gap-1.5"
                  >
                    {setPasswordLoading ? "Saving..." : "Save Password & Log In"}
                  </button>
                </form>
              </div>
            )}

            {/* Delivery Timeline Notice */}
            <div className="bg-pink-50/70 dark:bg-pink-950/20 border border-pink-100 dark:border-pink-900/30 rounded-2xl p-4 flex items-center gap-3.5 text-left">
              <Truck size={22} className="text-pink-500 shrink-0" />
              <div className="text-xs sm:text-sm">
                <p className="font-bold text-stone-800 dark:text-rose-100">{t("estDeliveryTime")}</p>
                <p className="text-stone-500 dark:text-rose-100/60 mt-0.5">
                  {t("deliveryTimesDetail")}
                </p>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => router.push("/products")}
                className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-bold px-8 py-3.5 rounded-2xl text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer flex items-center justify-center gap-2"
              >
                <ShoppingBag size={15} /> {t("continueShopping")}
              </button>
              <button
                onClick={() => router.push("/")}
                className="bg-stone-100 dark:bg-white/5 hover:bg-stone-200 dark:hover:bg-white/10 text-stone-700 dark:text-rose-100 font-bold px-6 py-3.5 rounded-2xl text-xs uppercase tracking-wider transition cursor-pointer"
              >
                {t("backHome")}
              </button>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // EMPTY CART SCREEN
  // -------------------------------------------------------------
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-stone-50 dark:bg-[#120a0d] flex items-center justify-center px-4 py-16">
        <div className="max-w-md mx-auto text-center space-y-6">
          <div className="w-22 h-22 bg-gradient-to-br from-pink-50 to-rose-100 dark:from-pink-950/30 dark:to-rose-950/20 border border-rose-100/60 dark:border-white/5 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
            <ShoppingBag size={36} className="text-pink-400 dark:text-pink-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-800 dark:text-rose-50">{t("cartEmpty")}</h2>
            <p className="text-xs text-stone-400 dark:text-rose-100/40 mt-1">
              {t("cartEmptyDesc")}
            </p>
          </div>
          <button
            onClick={() => router.push("/products")}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white px-8 py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <ChevronRight size={14} className="rotate-180" /> {t("shopProducts")}
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // CHECKOUT PAGE MAIN VIEW (MULTI-LANGUAGE I18N SUPPORTED)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-stone-50/60 dark:bg-[#120a0d] text-stone-800 dark:text-rose-50 pt-5 pb-16 sm:pt-8 sm:pb-24 relative overflow-hidden">
      
      {/* Glow Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-5 right-5 w-96 h-96 bg-pink-300/10 dark:bg-pink-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-5 w-80 h-80 bg-rose-300/10 dark:bg-rose-900/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-3.5 sm:px-6 lg:px-8">
        
        {/* Streamlined Distraction-Free Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-3 sm:mb-8 sm:pb-4 border-b border-stone-200/80 dark:border-white/10">
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap sm:flex-nowrap">
            {/* Brand Logo */}
            <Link href="/" className="flex items-center gap-2 group shrink-0">
              <Image
                src="/logo.png"
                alt="Cherry Glow Korea"
                width={32}
                height={32}
                className="transition-transform group-hover:scale-105 shrink-0"
              />
              <div className="flex items-baseline gap-1">
                <span className="font-serif text-lg sm:text-xl font-bold tracking-tight text-stone-900 dark:text-white">
                  Cherry Glow
                </span>
                <span className="font-serif text-lg sm:text-xl italic font-semibold text-rose-500 dark:text-rose-400 hidden sm:inline">
                  Korea
                </span>
              </div>
            </Link>

            <span className="hidden sm:inline-block text-stone-300 dark:text-white/20 font-light">|</span>

            {/* Back Button & Title */}
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => router.push("/cart")}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-white dark:bg-white/5 border border-stone-200 dark:border-white/10 flex items-center justify-center text-stone-600 dark:text-rose-100 hover:text-pink-500 hover:border-pink-300 transition cursor-pointer shrink-0 shadow-xs"
                title="Return to Cart"
              >
                <ArrowLeft size={16} />
              </button>
              <div>
                <h1 className="text-base sm:text-xl font-black text-stone-900 dark:text-white leading-tight flex items-center gap-2">
                  {t("title")}
                </h1>
                <p className="text-[11px] sm:text-xs text-stone-500 dark:text-rose-100/50 mt-0.5">
                  {t("subtitle")}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Stepper indicator */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold mr-1">
              <span className="text-stone-400 dark:text-rose-100/40">1. {t("stepCart")}</span>
              <ChevronRight size={13} className="text-stone-300" />
              <span className="font-bold text-pink-500 dark:text-pink-400 bg-pink-50 dark:bg-pink-950/40 px-3 py-1 rounded-xl border border-pink-200 dark:border-pink-900/30">
                2. {t("stepCheckout")}
              </span>
              <ChevronRight size={13} className="text-stone-300" />
              <span className="text-stone-400 dark:text-rose-100/40">3. {t("stepConfirmation")}</span>
            </div>

            {/* Language & Theme Controls */}
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>

        {/* Main Grid: Form Left (7 cols) & Summary Right (5 cols) */}
        <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-start">
          
          {/* LEFT COLUMN: Shipping & Customer Details */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-5 sm:space-y-6 font-medium">
            
            {/* 1. CUSTOMER INFORMATION CARD */}
            <div className="bg-white dark:bg-[#1e1215] border border-stone-200/50 dark:border-white/10 rounded-2xl p-4.5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(244,63,94,0.08)] transition-all duration-300 space-y-4 sm:space-y-5">
              <div className="flex items-center gap-2.5 pb-2.5 sm:pb-3 border-b border-stone-100 dark:border-white/5">
                <User className="text-pink-500" size={17} />
                <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-800 dark:text-rose-100">
                  {t("customerDetails")}
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4.5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-rose-100/80 flex items-center gap-1.5">
                    <User size={13} className="text-pink-500" /> {t("fullName")} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3.5 top-3.5 text-stone-400 pointer-events-none" />
                    <input
                      required
                      type="text"
                      placeholder={t("fullNamePlaceholder")}
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-10 pr-4 h-11 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-stone-900/60 text-stone-800 dark:text-rose-50 placeholder-stone-400 dark:placeholder-rose-100/30 outline-none focus:border-pink-500 focus:bg-white dark:focus:bg-stone-900 focus:ring-1 focus:ring-pink-200 transition font-medium"
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-rose-100/80 flex items-center gap-1.5">
                    <Phone size={13} className="text-pink-500" /> {t("phone")} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-3.5 text-stone-400 pointer-events-none" />
                    <input
                      required
                      type="tel"
                      placeholder={t("phonePlaceholder")}
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-4 h-11 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-stone-900/60 text-stone-800 dark:text-rose-50 placeholder-stone-400 dark:placeholder-rose-100/30 outline-none focus:border-pink-500 focus:bg-white dark:focus:bg-stone-900 focus:ring-1 focus:ring-pink-200 transition font-medium"
                    />
                  </div>
                </div>

                {/* Alternative Phone (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-600 dark:text-rose-100/60 flex items-center gap-1.5">
                    <Phone size={13} className="text-stone-400" /> {t("altPhone")} <span className="text-stone-400 text-[10px] font-normal">{t("optional")}</span>
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3.5 top-3.5 text-stone-400 pointer-events-none" />
                    <input
                      type="tel"
                      placeholder={t("altPhonePlaceholder")}
                      value={altPhone}
                      onChange={(e) => setAltPhone(e.target.value)}
                      className="w-full pl-10 pr-4 h-11 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-stone-900/60 text-stone-800 dark:text-rose-50 placeholder-stone-400 dark:placeholder-rose-100/30 outline-none focus:border-pink-500 focus:bg-white dark:focus:bg-stone-900 focus:ring-1 focus:ring-pink-200 transition font-medium"
                    />
                  </div>
                </div>

                {/* Email Address (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-600 dark:text-rose-100/60 flex items-center gap-1.5">
                    <Mail size={13} className="text-stone-400" /> {t("email")} <span className="text-stone-400 text-[10px] font-normal">{t("optional")}</span>
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3.5 top-3.5 text-stone-400 pointer-events-none" />
                    <input
                      type="email"
                      placeholder={t("emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 h-11 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-stone-900/60 text-stone-800 dark:text-rose-50 placeholder-stone-400 dark:placeholder-rose-100/30 outline-none focus:border-pink-500 focus:bg-white dark:focus:bg-stone-900 focus:ring-1 focus:ring-pink-200 transition font-medium"
                    />
                  </div>
                </div>


              </div>
            </div>

            {/* 2. SHIPPING & DELIVERY LOCATION */}
            <div className="bg-white dark:bg-[#1e1215] border border-stone-200/50 dark:border-white/10 rounded-2xl p-4.5 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(244,63,94,0.08)] transition-all duration-300 space-y-4 sm:space-y-5 relative">
              <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-stone-100 dark:border-white/5">
                <div className="flex items-center gap-2.5">
                  <Truck className="text-pink-500" size={18} />
                  <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-800 dark:text-rose-100">
                    {t("shippingAddress")}
                  </h2>
                </div>
              </div>

              {/* Delivery Area Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-stone-700 dark:text-rose-100/80 block">
                  {t("deliveryArea")} <span className="text-red-500">*</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5">
                  {[
                    { id: "dhaka", label: t("insideDhaka"), price: 70, timeKey: "deliveryTime12", chargeKey: "charge70" },
                    { id: "outside", label: t("outsideDhaka"), price: 120, timeKey: "deliveryTime24", chargeKey: "charge120" },
                  ].map((area) => (
                    <button
                      key={area.id}
                      type="button"
                      onClick={() => setDeliveryArea(area.id)}
                      className={`relative p-3.5 sm:p-4 rounded-xl border-2 text-left transition duration-200 cursor-pointer ${
                        deliveryArea === area.id
                          ? "border-pink-500 bg-pink-50/40 dark:bg-pink-950/20 shadow-xs"
                          : "border-stone-200 dark:border-white/10 bg-stone-50/40 dark:bg-white/5 hover:border-stone-300"
                      }`}
                    >
                      {deliveryArea === area.id && (
                        <div className="absolute top-3 right-3 w-4 h-4 bg-pink-500 rounded-full flex items-center justify-center text-white text-[10px]">
                          ✓
                        </div>
                      )}
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin size={15} className={deliveryArea === area.id ? "text-pink-500" : "text-stone-400"} />
                        <span className={`text-xs font-bold ${deliveryArea === area.id ? "text-pink-600 dark:text-pink-300" : "text-stone-700 dark:text-rose-100/70"}`}>
                          {area.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-400 dark:text-rose-100/40">{t(area.timeKey)}</p>
                      <p className="text-xs font-extrabold text-pink-500 mt-1">{t(area.chargeKey)}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* District & Thana Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4.5">
                
                {/* Custom Searchable District Dropdown */}
                <DistrictSelector
                  district={district}
                  setDistrict={setDistrict}
                  isCustomDistrict={isCustomDistrict}
                  setIsCustomDistrict={setIsCustomDistrict}
                  customDistrictInput={customDistrictInput}
                  setCustomDistrictInput={setCustomDistrictInput}
                  districtsList={BANGLADESH_DISTRICTS}
                  t={t}
                />

                {/* Thana / Upazila */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-rose-100/80 flex items-center gap-1.5">
                    <Building size={13} className="text-pink-500" /> {t("thana")}
                  </label>
                  <div className="relative">
                    <Building size={16} className="absolute left-3.5 top-3.5 text-stone-400 pointer-events-none" />
                    <input
                      type="text"
                      placeholder={t("thanaPlaceholder")}
                      value={thana}
                      onChange={(e) => setThana(e.target.value)}
                      className="w-full pl-10 pr-4 h-11 text-xs sm:text-sm rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-stone-900/60 text-stone-800 dark:text-rose-50 placeholder-stone-400 dark:placeholder-rose-100/30 outline-none focus:border-pink-500 focus:bg-white dark:focus:bg-stone-900 focus:ring-1 focus:ring-pink-200 transition font-medium"
                    />
                  </div>
                </div>

              </div>

              {/* Detailed Street Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 dark:text-rose-100/80 flex items-center gap-1.5">
                  <MapPin size={13} className="text-pink-500" /> {t("fullAddress")} <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-3.5 text-stone-400 pointer-events-none" />
                  <textarea
                    required
                    rows={2.5}
                    placeholder={t("fullAddressPlaceholder")}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-stone-900/60 text-stone-800 dark:text-rose-50 placeholder-stone-400 dark:placeholder-rose-100/30 text-xs sm:text-sm outline-none focus:border-pink-500 focus:bg-white dark:focus:bg-stone-900 focus:ring-1 focus:ring-pink-200 transition resize-none break-words whitespace-pre-wrap leading-relaxed font-medium"
                  />
                </div>
              </div>

              {/* Order Notes (Optional) */}
              <div className="space-y-1.5 pb-1">
                <label className="text-xs font-bold text-stone-600 dark:text-rose-100/60 flex items-center gap-1.5">
                  <MessageSquare size={13} className="text-stone-400" /> {t("orderNote")}
                </label>
                <div className="relative">
                  <MessageSquare size={16} className="absolute left-3.5 top-3.5 text-stone-400 pointer-events-none" />
                  <textarea
                    rows={2}
                    placeholder={t("orderNotePlaceholder")}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50/50 dark:bg-stone-900/60 text-stone-800 dark:text-rose-50 placeholder-stone-400 dark:placeholder-rose-100/30 text-xs sm:text-sm outline-none focus:border-pink-500 focus:bg-white dark:focus:bg-stone-900 focus:ring-1 focus:ring-pink-200 transition resize-none break-words whitespace-pre-wrap leading-relaxed font-medium"
                  />
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Order Summary & Payment Method & Confirm Button */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-5 sm:space-y-6 lg:sticky lg:top-24">
            
            {/* ORDER SUMMARY CARD */}
            <div className="bg-white dark:bg-[#1e1215] border border-stone-200/50 dark:border-white/10 rounded-2xl p-4.5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(244,63,94,0.08)] transition-all duration-300 space-y-4 sm:space-y-5">
              <div className="flex items-center justify-between pb-2.5 sm:pb-3 border-b border-stone-100 dark:border-white/5">
                <div className="flex items-center gap-2">
                  <Package size={17} className="text-pink-500" />
                  <h2 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-rose-100">
                    {t("orderSummary")} ({cart.reduce((sum, item) => sum + item.quantity, 0)} {t("items")})
                  </h2>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1 scrollbar-thin">
                {cart.map((item, idx) => {
                  const itemPrice = item.selectedVariant?.price || item.price || 0;
                  return (
                    <div key={`${item.productId}-${idx}`} className="flex items-center gap-3 py-1">
                      <div className="relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200/60 dark:border-white/5 overflow-hidden shrink-0">
                        <Image
                          src={item.image || FALLBACK_IMAGE}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-contain p-1"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-xs font-semibold text-stone-800 dark:text-rose-100 truncate">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-stone-400 dark:text-rose-100/40 mt-0.5">
                          {item.selectedVariant ? `${item.selectedVariant.weight || ''}${item.selectedVariant.unit || ''}` : "Standard"} × {item.quantity}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-xs font-bold text-stone-800 dark:text-rose-50">
                          ৳{(itemPrice * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Coupon Accordion / Field */}
              <div className="border-t border-stone-100 dark:border-white/5 pt-3.5 sm:pt-4">
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Tag size={13} className="absolute left-3 top-3 text-stone-400" />
                      <input
                        type="text"
                        placeholder={t("couponPlaceholder")}
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleApplyCoupon(e);
                          }
                        }}
                        className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-stone-200 dark:border-white/10 bg-stone-50 dark:bg-stone-900/60 text-stone-800 dark:text-rose-100 outline-none uppercase font-mono"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={couponLoading}
                      className="px-4 py-2 bg-stone-800 dark:bg-white/10 hover:bg-stone-900 text-white rounded-xl text-xs font-bold transition cursor-pointer shrink-0"
                    >
                      {couponLoading ? "..." : t("apply")}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 p-2.5 rounded-xl">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs">
                      <Tag size={12} />
                      <span className="font-bold font-mono uppercase">{appliedCoupon.code}</span>
                      <span>(-৳{discount})</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[10px] font-bold text-red-500 hover:underline cursor-pointer"
                    >
                      {t("remove")}
                    </button>
                  </div>
                )}
              </div>

              {/* PAYMENT METHOD SELECTION */}
              <div className="border-t border-stone-100 dark:border-white/5 pt-3.5 sm:pt-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Banknote className="text-pink-500" size={16} />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-stone-800 dark:text-rose-100">
                    {t("paymentMethod")}
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {/* Cash on Delivery Option */}
                  <div
                    onClick={() => setPaymentMethod("cod")}
                    className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-start gap-3 ${
                      paymentMethod === "cod"
                        ? "border-pink-500 bg-pink-50/40 dark:bg-pink-950/30 shadow-2xs"
                        : "border-stone-200 dark:border-white/10 hover:border-stone-300"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-pink-500 flex items-center justify-center shrink-0 mt-0.5">
                      {paymentMethod === "cod" && <div className="w-2 h-2 bg-pink-500 rounded-full" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-800 dark:text-rose-50 flex items-center gap-1.5">
                          <Banknote size={13} className="text-pink-500" /> {t("cod")}
                        </span>
                        <span className="text-[9px] font-bold uppercase bg-emerald-100 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded">
                          {t("recommended")}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500 dark:text-rose-100/50 mt-0.5 leading-tight">
                        {t("codDesc")}
                      </p>
                    </div>
                  </div>

                  {/* Online Payment / Digital Wallet Option */}
                  <div
                    onClick={() => setPaymentMethod("bkash")}
                    className={`p-3 rounded-xl border-2 transition cursor-pointer flex items-start gap-3 ${
                      paymentMethod === "bkash"
                        ? "border-pink-500 bg-pink-50/40 dark:bg-pink-950/30 shadow-2xs"
                        : "border-stone-200 dark:border-white/10 hover:border-stone-300 opacity-80"
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full border-2 border-stone-300 dark:border-white/20 flex items-center justify-center shrink-0 mt-0.5">
                      {paymentMethod === "bkash" && <div className="w-2 h-2 bg-pink-500 rounded-full" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-stone-800 dark:text-rose-50 flex items-center gap-1.5">
                          <CreditCard size={13} className="text-pink-500" /> {t("bkash")}
                        </span>
                        <span className="text-[9px] font-bold text-stone-400">
                          {t("digitalWallet")}
                        </span>
                      </div>
                      <p className="text-[10px] text-stone-500 dark:text-rose-100/50 mt-0.5 leading-tight">
                        {t("bkashDesc")}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Cost Calculations */}
              <div className="space-y-2.5 text-xs border-t border-stone-100 dark:border-white/5 pt-3.5 sm:pt-4">
                <div className="flex justify-between text-stone-600 dark:text-rose-100/60">
                  <span>{t("subtotal")}</span>
                  <span className="font-semibold text-stone-800 dark:text-rose-100">৳{subtotal.toLocaleString()}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>{t("discount")}</span>
                    <span>-৳{discount.toLocaleString()}</span>
                  </div>
                )}

                <div className="flex justify-between text-stone-600 dark:text-rose-100/60">
                  <span>{t("deliveryFee")}</span>
                  <span className="font-semibold text-stone-800 dark:text-rose-100">৳{deliveryCharge}</span>
                </div>

                <div className="border-t border-dashed border-stone-200 dark:border-white/10 my-2" />

                <div className="flex justify-between items-center text-sm sm:text-base">
                  <span className="font-extrabold text-stone-900 dark:text-white">{t("totalPayable")}</span>
                  <span className="font-black text-xl text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">
                    ৳{total.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-extrabold rounded-xl text-xs uppercase tracking-widest shadow-md hover:shadow-lg transition duration-300 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    {t("processing")}
                  </span>
                ) : (
                  <>
                    <CheckCircle2 size={17} />
                    {t("confirmOrder")}
                  </>
                )}
              </button>

              {/* Trust Badges */}
              <div className="pt-2 grid grid-cols-2 gap-2 text-[10px] text-stone-400 dark:text-rose-100/40">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={12} className="text-pink-500 shrink-0" />
                  <span>{t("originalProduct")}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Truck size={12} className="text-pink-500 shrink-0" />
                  <span>{t("codTag")}</span>
                </div>
              </div>

            </div>

          </div>

        </form>
      </div>

    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* 🌟 CUSTOM SEARCHABLE DISTRICT SELECTOR WITH LUCIDE ICONS                     */
/* -------------------------------------------------------------------------- */
function DistrictSelector({
  district,
  setDistrict,
  isCustomDistrict,
  setIsCustomDistrict,
  customDistrictInput,
  setCustomDistrictInput,
  districtsList,
  t
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCustomSuggestions, setShowCustomSuggestions] = useState(true);

  const filteredDistricts = useMemo(() => {
    if (!searchTerm.trim()) return districtsList.filter((d) => d !== "OTHER");
    const q = searchTerm.toLowerCase();
    return districtsList.filter((d) => d !== "OTHER" && d.toLowerCase().includes(q));
  }, [searchTerm, districtsList]);

  // Live suggestions when typing in custom input field
  const customSuggestions = useMemo(() => {
    if (!customDistrictInput || !customDistrictInput.trim()) return [];
    const q = customDistrictInput.trim().toLowerCase();
    return districtsList.filter(
      (d) => d !== "OTHER" && d.toLowerCase().includes(q)
    );
  }, [customDistrictInput, districtsList]);

  // Handle outside click to close popovers
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (!e.target.closest(".district-selector-container")) {
        setIsOpen(false);
        setShowCustomSuggestions(false);
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <div className="space-y-1.5 district-selector-container relative">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-stone-700 dark:text-rose-100/80 flex items-center gap-1.5">
          <MapPin size={13} className="text-pink-500" />
          {t("district")} <span className="text-red-500">*</span>
        </label>
        <button
          type="button"
          onClick={() => {
            const next = !isCustomDistrict;
            setIsCustomDistrict(next);
            if (next) {
              setDistrict("OTHER");
            } else {
              setDistrict("Dhaka (ঢাকা)");
            }
          }}
          className="text-[11px] text-pink-600 dark:text-pink-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
        >
          {isCustomDistrict || district === "OTHER" ? (
            <>
              <Building size={12} />
              <span>{t("districtList64")}</span>
            </>
          ) : (
            <>
              <Edit3 size={12} />
              <span>{t("typeCustomDistrict")}</span>
            </>
          )}
        </button>
      </div>

      {isCustomDistrict || district === "OTHER" ? (
        <div className="relative">
          <Edit3 size={16} className="absolute left-3.5 top-3.5 text-pink-500 pointer-events-none" />
          <textarea
            rows={2}
            required
            placeholder={t("customDistrictPlaceholder")}
            value={customDistrictInput}
            onChange={(e) => {
              setCustomDistrictInput(e.target.value);
              setShowCustomSuggestions(true);
            }}
            onFocus={() => setShowCustomSuggestions(true)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-pink-400 dark:border-pink-800 bg-stone-50/50 dark:bg-stone-900/60 text-stone-800 dark:text-rose-50 placeholder-stone-400 dark:placeholder-rose-100/30 text-xs sm:text-sm outline-none focus:ring-1 focus:ring-pink-200 transition font-medium resize-none break-words whitespace-pre-wrap leading-relaxed"
          />

          {/* Live Auto-Complete Suggestions Popover */}
          {showCustomSuggestions && customSuggestions.length > 0 && (
            <div className="absolute z-[100] top-full left-0 right-0 mt-2 bg-white dark:bg-[#1e1215] border border-rose-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-3.5 py-2 bg-stone-50/80 dark:bg-white/5 border-b border-stone-100 dark:border-white/5 text-[10px] font-bold text-stone-400 dark:text-rose-100/40 uppercase tracking-wider flex items-center justify-between">
                <span>{t("suggestedDistricts")}</span>
                <button
                  type="button"
                  onClick={() => setShowCustomSuggestions(false)}
                  className="text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
              <div className="max-h-48 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
                {customSuggestions.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      setDistrict(d);
                      setCustomDistrictInput(d);
                      setShowCustomSuggestions(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-stone-800 dark:text-rose-100 hover:bg-pink-50 dark:hover:bg-pink-950/40 font-semibold transition text-left cursor-pointer"
                  >
                    <MapPin size={13} className="text-pink-500 shrink-0" />
                    <span className="truncate">{d}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          {/* Custom Dropdown Trigger Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(!isOpen);
            }}
            className="w-full h-11 flex items-center justify-between bg-stone-50/50 dark:bg-stone-900/60 border border-stone-200 dark:border-white/10 hover:border-pink-400 rounded-xl px-3.5 text-xs sm:text-sm text-stone-800 dark:text-rose-50 outline-none transition cursor-pointer font-medium shadow-2xs"
          >
            <div className="flex items-center gap-2 truncate">
              <MapPin size={16} className="text-pink-500 shrink-0" />
              <span className="truncate">{district || t("selectDistrict")}</span>
            </div>
            <ChevronDown
              size={16}
              className={`text-stone-400 transition-transform duration-200 ${
                isOpen ? "rotate-180 text-pink-500" : ""
              }`}
            />
          </button>

          {/* Searchable Dropdown Popover */}
          {isOpen && (
            <div className="absolute z-[100] top-full left-0 right-0 mt-2 bg-white dark:bg-[#1e1215] border border-rose-100 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
              
              {/* Search Bar Inside Dropdown */}
              <div className="p-2.5 border-b border-stone-100 dark:border-white/5 bg-stone-50/50 dark:bg-stone-900/30">
                <div className="relative">
                  <Search size={14} className="absolute left-3 top-2.5 text-stone-400" />
                  <input
                    type="text"
                    autoFocus
                    placeholder={t("searchDistrictPlaceholder")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-stone-200 dark:border-white/10 bg-white dark:bg-stone-900 text-stone-800 dark:text-rose-100 outline-none focus:border-pink-400"
                  />
                  {searchTerm && (
                    <button
                      type="button"
                      onClick={() => setSearchTerm("")}
                      className="absolute right-2.5 top-2.5 text-stone-400 hover:text-stone-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Custom Type Row Option */}
              <div className="p-1.5 border-b border-stone-100 dark:border-white/5">
                <button
                  type="button"
                  onClick={() => {
                    setDistrict("OTHER");
                    setIsCustomDistrict(true);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-pink-600 dark:text-pink-400 hover:bg-pink-50 dark:hover:bg-pink-950/30 rounded-xl transition text-left cursor-pointer"
                >
                  <Edit3 size={14} className="shrink-0 text-pink-500" />
                  <span>{t("typeCustomDistrict")}</span>
                </button>
              </div>

              {/* District Options List */}
              <div className="max-h-56 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
                {filteredDistricts.length === 0 ? (
                  <div className="p-3 text-center text-xs text-stone-400 dark:text-rose-100/40">
                    No district found.{" "}
                    <button
                      type="button"
                      onClick={() => {
                        setDistrict("OTHER");
                        setIsCustomDistrict(true);
                        setCustomDistrictInput(searchTerm);
                        setIsOpen(false);
                      }}
                      className="text-pink-500 font-bold underline ml-1 cursor-pointer"
                    >
                      "{searchTerm}"
                    </button>
                  </div>
                ) : (
                  filteredDistricts.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setDistrict(d);
                        setIsCustomDistrict(false);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition text-left cursor-pointer ${
                        district === d
                          ? "bg-pink-50 dark:bg-pink-950/40 font-bold text-pink-600 dark:text-pink-300"
                          : "text-stone-700 dark:text-rose-100/80 hover:bg-stone-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <MapPin size={13} className={district === d ? "text-pink-500" : "text-stone-300 dark:text-rose-100/20"} />
                        <span className="truncate">{d}</span>
                      </div>
                      {district === d && <Check size={13} className="text-pink-500 shrink-0" />}
                    </button>
                  ))
                )}
              </div>

            </div>
          )}
        </div>
      )}
    </div>
  );
}
