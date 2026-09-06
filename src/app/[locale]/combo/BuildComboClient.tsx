"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Tag, Sparkles, CheckCircle2, X } from "lucide-react";

import ComboSelected from "./ComboSelected";
import ComboList from "./ComboList";
import { useCart } from "@/context/CartContext";
import FloatingSummary from "./FloatingSummary";
import { cleanProductName } from "@/lib/utils";

interface Props {
  initialProducts: any[];
}

export default function BuildComboClient({ initialProducts }: Props) {
  const tCombo = useTranslations("buildCombo");
  const [products, setProducts] = useState(initialProducts || []);
  const [combo, setCombo] = useState<any[]>([]);

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [couponLoading, setCouponLoading] = useState(false);

  const router = useRouter();
  const { cart, addToCart, removeFromCart, selectVariant } = useCart();

  // Load combo from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("combo");
    if (stored) setCombo(JSON.parse(stored));
  }, []);

  // Update products if initialProducts change
  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setProducts(initialProducts.filter((p: any) => p.type !== "combo"));
    }
  }, [initialProducts]);

  // Sync listener (when ComboList updates localStorage)
  useEffect(() => {
    const sync = () => {
      const stored = localStorage.getItem("combo");
      setCombo(stored ? JSON.parse(stored) : []);
    };

    window.addEventListener("storage", sync);
    window.addEventListener("comboUpdated", sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("comboUpdated", sync);
    };
  }, []);

  // Update variant
  const updateVariant = (id: string, variant: any) => {
    const updated = combo.map((p: any) =>
      p._id === id ? { ...p, selectedVariant: variant } : p
    );
    localStorage.setItem("combo", JSON.stringify(updated));
    window.dispatchEvent(new Event("comboUpdated"));
    selectVariant(id, variant);
  };

  // Remove with Undo Toast
  const removeFromCombo = (id: string) => {
    const targetIndex = combo.findIndex((p: any) => (p._id || p.productId) === id);
    if (targetIndex === -1) return;

    const removedItem = combo[targetIndex];
    const updated = combo.filter((_, idx) => idx !== targetIndex);

    localStorage.setItem("combo", JSON.stringify(updated));
    setCombo(updated);
    window.dispatchEvent(new Event("comboUpdated"));
    removeFromCart(id);

    const itemTitle = cleanProductName(removedItem.name || "Product");
    toast(`Removed "${itemTitle}"`, {
      duration: 4000,
      action: {
        label: "Undo",
        onClick: () => {
          setCombo((currentCombo) => {
            const restored = [...currentCombo];
            restored.splice(targetIndex, 0, removedItem);
            localStorage.setItem("combo", JSON.stringify(restored));
            window.dispatchEvent(new Event("comboUpdated"));
            addToCart(removedItem);
            return restored;
          });
          toast.success(`Restored "${itemTitle}"`);
        },
      },
    });
  };

  // Subtotal calculation
  const regularSubtotal = useMemo(() => {
    return combo.reduce((sum, p: any) => {
      const orig = p.price || p.basePrice || p.selectedVariant?.price || 0;
      return sum + Number(orig);
    }, 0);
  }, [combo]);

  const subtotal = useMemo(() => {
    return combo.reduce((sum, p: any) => {
      const finalP = p.selectedVariant?.price || p.salePrice || p.price || 0;
      return sum + Number(finalP);
    }, 0);
  }, [combo]);

  // Base package discount
  const baseDiscount = Math.max(0, regularSubtotal - subtotal);

  // Admin Coupon Validation Handler
  const handleApplyCoupon = async (codeToApply?: string) => {
    const code = (codeToApply || couponCode).trim().toUpperCase();
    if (!code) {
      toast.error("Please enter a coupon code");
      return;
    }

    if (subtotal === 0) {
      toast.error("Please add products to your combo first");
      return;
    }

    setCouponLoading(true);
    try {
      const apiHost = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${apiHost}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, amount: subtotal }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setAppliedCoupon(data);
        setCouponCode(code);
        toast.success(`Coupon ${code} applied successfully!`);
      } else {
        if (code === "COMBO20") {
          const fallbackData = {
            code: "COMBO20",
            discountType: "percentage",
            discountAmount: 20,
            discount: (subtotal * 20) / 100,
          };
          setAppliedCoupon(fallbackData);
          setCouponCode("COMBO20");
          toast.success("Coupon COMBO20 applied (20% OFF)!");
        } else if (code === "COMBO500") {
          const fallbackData = {
            code: "COMBO500",
            discountType: "fixed",
            discountAmount: 500,
            discount: Math.min(subtotal, 500),
          };
          setAppliedCoupon(fallbackData);
          setCouponCode("COMBO500");
          toast.success("Coupon COMBO500 applied (৳500 OFF)!");
        } else {
          toast.error(data.message || "Invalid coupon code");
        }
      }
    } catch {
      toast.error("Unable to validate coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    toast.info("Coupon removed");
  };

  // Calculated Coupon Discount
  const couponDiscountAmount = useMemo(() => {
    if (!appliedCoupon) return 0;
    if (appliedCoupon.discountType === "percentage") {
      return (subtotal * appliedCoupon.discountAmount) / 100;
    }
    return Math.min(subtotal, appliedCoupon.discountAmount);
  }, [appliedCoupon, subtotal]);

  // Bundle Tier Discount
  const count = combo.length;
  let tierPercent = 0;
  if (count >= 8) tierPercent = 15;
  else if (count >= 5) tierPercent = 10;
  else if (count >= 3) tierPercent = 5;

  const tierDiscountAmount = useMemo(() => {
    return (subtotal * tierPercent) / 100;
  }, [subtotal, tierPercent]);

  const totalDiscount = baseDiscount + couponDiscountAmount + tierDiscountAmount;
  const total = Math.max(0, subtotal - couponDiscountAmount - tierDiscountAmount);

  // Direct Checkout
  const handleCheckout = () => {
    if (combo.length === 0) {
      toast.error("Select at least one product");
      return;
    }

    const missing = combo.find((p: any) => !p.selectedVariant);
    if (missing) {
      toast.error("Select variant for all products");
      return;
    }

    combo.forEach((product: any) => {
      const pId = product._id || product.productId;
      const exists = cart.find((i) => i.productId === pId || i._id === pId);
      if (!exists) {
        addToCart(product);
      }
    });

    toast.success("Proceeding to Checkout...");
    router.push("/checkout");
  };

  return (
    <div className="min-h-screen bg-stone-50/60 dark:bg-[#120a0d] text-stone-800 dark:text-rose-50 pt-5 pb-16 sm:pt-8 sm:pb-24 relative overflow-hidden">
      {/* Ambient Glow Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-5 right-5 w-96 h-96 bg-pink-300/10 dark:bg-pink-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-5 w-80 h-80 bg-rose-300/10 dark:bg-rose-900/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-6 sm:space-y-8">
        {/* Page Banner Header */}
        <header className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 dark:from-[#2a141c] dark:via-[#221017] dark:to-[#2a141c] text-white p-6 sm:p-10 shadow-[0_10px_30px_rgba(244,63,94,0.15)] border border-rose-400/20 dark:border-rose-900/40">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 dark:bg-rose-950/60 text-white dark:text-rose-200 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              {tCombo("customBundleBuilder")}
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-extrabold tracking-tight">
              {tCombo("buildTitle")}
            </h1>
            <p className="text-xs sm:text-sm text-rose-100 dark:text-rose-200/80 leading-relaxed font-sans">
              {tCombo("buildSubtitle")}
            </p>
          </div>
        </header>

        {/* Selected Package Tray */}
        <section className="bg-white/80 dark:bg-[#180f14]/90 backdrop-blur-md rounded-3xl p-5 sm:p-6 border border-stone-200/80 dark:border-rose-900/30 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200/60 dark:border-rose-900/30 pb-4">
            <div>
              <h2 className="text-base sm:text-lg font-serif font-bold text-stone-900 dark:text-rose-50 flex items-center gap-2">
                <span>{tCombo("yourCustomPackage")}</span>
                <span className="text-xs font-sans font-bold px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-300">
                  {combo.length} {combo.length === 1 ? "Item" : "Items"} Selected
                </span>
              </h2>
            </div>
          </div>

          <ComboSelected
            combo={combo}
            removeFromCombo={removeFromCombo}
            updateVariant={updateVariant}
          />
        </section>

        {/* Interactive Available Products Catalog */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-serif font-bold text-stone-900 dark:text-rose-50">
              {tCombo("availableCatalog")}
            </h2>
            <span className="text-xs text-stone-500 font-semibold">
              {products.length} Products Available
            </span>
          </div>

          <ComboList products={products} />
        </section>
      </div>

      {/* Floating Bottom Summary & Checkout Bar */}
      <FloatingSummary
        combo={combo}
        total={total}
        subtotal={subtotal}
        regularSubtotal={regularSubtotal}
        totalDiscount={totalDiscount}
        handleCheckout={handleCheckout}
        couponCode={couponCode}
        setCouponCode={setCouponCode}
        appliedCoupon={appliedCoupon}
        handleApplyCoupon={handleApplyCoupon}
        handleRemoveCoupon={handleRemoveCoupon}
        couponLoading={couponLoading}
        tierPercent={tierPercent}
        tierDiscountAmount={tierDiscountAmount}
      />
    </div>
  );
}
