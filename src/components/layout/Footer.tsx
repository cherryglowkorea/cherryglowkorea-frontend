"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import axios from "axios";
import { Link, usePathname } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import {
  Facebook,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Truck,
  ShieldCheck,
  CreditCard,
  Headphones,
  Send,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

export default function Footer() {
  const pathname = usePathname();
  const tFooter = useTranslations("footer");
  const tNav = useTranslations("nav");
  const tNewsletter = useTranslations("newsletter");
  const [email, setEmail] = useState("");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(3000);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const apiHost =
          process.env.NEXT_PUBLIC_API_URL ||
          process.env.NEXT_PUBLIC_API_BASE_URL ||
          "http://localhost:5000";

        let res;
        try {
          res = await axios.get(`${apiHost}/api/settings`);
        } catch {
          res = await axios.get(`${apiHost}/settings`);
        }

        const s = res?.data?.data || res?.data;
        const threshold =
          s?.shipping?.freeShippingThreshold ??
          s?.freeShippingThreshold ??
          s?.shipping?.freeShippingMinimum ??
          s?.freeShippingMinimum;

        if (threshold !== undefined && threshold !== null) {
          setFreeShippingThreshold(Number(threshold));
        }
      } catch (err) {}
    };

    fetchSettings();

    const handleSettingsUpdate = () => {
      fetchSettings();
    };

    window.addEventListener("settingsUpdated", handleSettingsUpdate);
    return () => {
      window.removeEventListener("settingsUpdated", handleSettingsUpdate);
    };
  }, []);

  // Do not render public Footer on Admin, Auth (Login/Register), or Checkout pages
  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname?.startsWith("/login") ||
    pathname?.startsWith("/register");

  const isCheckoutPage =
    pathname === "/checkout" ||
    pathname?.startsWith("/checkout") ||
    pathname?.includes("checkout");

  if (pathname?.startsWith("/admin") || isAuthPage || isCheckoutPage) {
    return null;
  }

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error(tNewsletter("invalidEmail"));
      return;
    }
    toast.success(tNewsletter("successMsg"));
    setEmail("");
  };

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/" || pathname === "" || pathname === "/en" || pathname === "/bn") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <footer className="bg-stone-900 text-stone-200 dark:bg-[#120a0d] dark:text-rose-100 border-t border-rose-950/40 relative z-10 transition-colors">
      {/* 1. Top Trust & Service Feature Pillars */}
      <div className="border-b border-stone-800 dark:border-white/10 py-10 bg-stone-950/60 dark:bg-[#160d10]">
        <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
            {/* Pillar 1 */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-pink-500/30 transition">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0 border border-pink-500/20">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">{tFooter("freeShipping")}</h4>
                <p className="text-[11px] text-stone-400 dark:text-rose-100/60 mt-0.5">
                  {tFooter("freeShippingDesc", { threshold: freeShippingThreshold.toLocaleString() })}
                </p>
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-pink-500/30 transition">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0 border border-pink-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">{tFooter("authentic")}</h4>
                <p className="text-[11px] text-stone-400 dark:text-rose-100/60 mt-0.5">{tFooter("authenticDesc")}</p>
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-pink-500/30 transition">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0 border border-pink-500/20">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">{tFooter("secureCheckout")}</h4>
                <p className="text-[11px] text-stone-400 dark:text-rose-100/60 mt-0.5">{tFooter("secureCheckoutDesc")}</p>
              </div>
            </div>

            {/* Pillar 4 */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-3.5 p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-pink-500/30 transition">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center shrink-0 border border-pink-500/20">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">{tFooter("dedicatedSupport")}</h4>
                <p className="text-[11px] text-stone-400 dark:text-rose-100/60 mt-0.5">{tFooter("dedicatedSupportDesc")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Glow Club Newsletter Offer Section */}
      <div className="border-b border-stone-800/80 dark:border-white/10 py-10 bg-stone-900 dark:bg-[#140C0F]">
        <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8 bg-gradient-to-br from-rose-500/15 via-pink-500/10 to-rose-400/15 dark:from-rose-950/50 dark:via-pink-950/40 dark:to-purple-950/40 p-6 sm:p-8 rounded-3xl border border-rose-300/30 dark:border-rose-800/30 shadow-lg relative overflow-hidden">
            {/* Ambient Glow */}
            <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-1.5 text-center lg:text-left relative z-10">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider text-rose-300 dark:text-pink-300 bg-rose-500/20 dark:bg-pink-500/20 border border-rose-400/30 dark:border-pink-500/30">
                <Sparkles className="w-3.5 h-3.5 text-pink-300" /> {tNewsletter("exclusivePerks")}
              </span>
              <h3 className="text-xl sm:text-2xl font-serif font-bold text-white">
                {tNewsletter("joinClubTitle")}
              </h3>
              <p className="text-xs sm:text-sm text-stone-300 dark:text-rose-100/70 max-w-md font-medium">
                {tNewsletter("joinClubDesc")}
              </p>
            </div>

            <form onSubmit={handleSubscribe} className="w-full lg:w-auto flex flex-col sm:flex-row gap-2.5 relative z-10">
              <div className="relative w-full sm:w-80">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-rose-400 pointer-events-none" />
                <input
                  type="email"
                  placeholder={tNewsletter("placeholder")}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-stone-950/80 dark:bg-[#1a0f13]/90 border border-stone-700/80 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/30 text-xs sm:text-sm text-white placeholder-stone-400 rounded-2xl outline-none transition shadow-inner"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3.5 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-600 hover:from-rose-600 hover:to-pink-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-rose-500/20 transition cursor-pointer flex items-center justify-center gap-2 shrink-0"
              >
                <Send className="w-3.5 h-3.5" /> {tNewsletter("subscribe")}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 3. Main 4-Column Footer */}
      <div className="mx-auto max-w-[1536px] px-4 pt-16 pb-20 sm:pb-24 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          {/* Col 1: Brand Info */}
          <div className="space-y-4">
            <Link href="/" onClick={handleLogoClick} className="flex items-center gap-2 group cursor-pointer">
              <Image src="/logo.png" alt="Cherry Glow Korea" width={38} height={38} className="transition-transform group-hover:scale-105" />
              <div className="flex items-baseline gap-1 font-serif">
                <span className="text-xl font-bold text-white">Cherry Glow</span>
                <span className="text-xl italic font-semibold text-pink-500">Korea</span>
              </div>
            </Link>

            <p className="text-xs leading-relaxed text-stone-400 dark:text-rose-100/70">
              {tFooter("tagline")}
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.facebook.com/profile.php?id=61584259252264"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook Page"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-pink-500 text-stone-400 hover:text-white flex items-center justify-center border border-white/10 transition cursor-pointer"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="#"
                target="_blank"
                aria-label="Instagram Profile"
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-pink-500 text-stone-400 hover:text-white flex items-center justify-center border border-white/10 transition cursor-pointer"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-pink-400">
              {tFooter("quickLinks")}
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400 dark:text-rose-100/70">
              <li>
                <Link href="/" className="transition-colors hover:text-pink-400 flex items-center gap-1.5">
                  <span className="text-pink-500 font-bold">•</span> {tNav("home")}
                </Link>
              </li>
              <li>
                <Link href="/products" className="transition-colors hover:text-pink-400 flex items-center gap-1.5">
                  <span className="text-pink-500 font-bold">•</span> {tNav("products")}
                </Link>
              </li>
              <li>
                <Link href="/combo" className="transition-colors hover:text-pink-400 flex items-center gap-1.5">
                  <span className="text-pink-500 font-bold">•</span> {tFooter("comboBundles")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:text-pink-400 flex items-center gap-1.5">
                  <span className="text-pink-500 font-bold">•</span> {tNav("about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-pink-400 flex items-center gap-1.5">
                  <span className="text-pink-500 font-bold">•</span> {tNav("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Support & Policies */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-pink-400">
              {tFooter("supportLegal")}
            </h4>
            <ul className="space-y-2.5 text-xs text-stone-400 dark:text-rose-100/70">
              <li>
                <Link href="/cart" className="transition-colors hover:text-pink-400">
                  {tFooter("cart")}
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="transition-colors hover:text-pink-400">
                  {tFooter("checkout")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="transition-colors hover:text-pink-400">
                  {tFooter("faq")}
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="transition-colors hover:text-pink-400">
                  {tFooter("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-pink-400">
                  {tFooter("terms")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Hotline */}
          <div className="space-y-3">
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-pink-400">
              {tFooter("contactHotline")}
            </h4>
            <div className="space-y-2.5 text-xs text-stone-400 dark:text-rose-100/70">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-pink-400 shrink-0" />
                <a href="tel:+8801234567890" className="hover:text-pink-400 font-semibold transition">
                  +880 1234 567 890
                </a>
              </div>

              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-pink-400 shrink-0" />
                <a href="mailto:support@cherryglow.com" className="hover:text-pink-400 font-semibold transition">
                  support@cherryglow.com
                </a>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-pink-400 shrink-0 mt-0.5" />
                <span>{tFooter("location")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Bottom Footer Bar: Copyright, Developed By & Soft Card Payment Badges */}
        <div className="mt-14 pt-8 border-t border-stone-800 dark:border-white/10 flex flex-col lg:flex-row items-center justify-between gap-5">
          <div className="flex flex-col sm:flex-row items-center gap-1.5 sm:gap-2 text-xs text-stone-400 dark:text-rose-100/50 text-center lg:text-left">
            <p>
              © {new Date().getFullYear()} <span className="text-white font-semibold">Cherry Glow Korea</span>. {tFooter("rights")}
            </p>
            <span className="hidden sm:inline text-stone-600 dark:text-rose-100/20">•</span>
            <p className="flex items-center gap-1.5">
              <span>{tFooter("developedBy")}</span>
              <a
                href="https://shipon-chowdhury.vercel.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-pink-400 hover:text-pink-300 dark:text-rose-400 dark:hover:text-rose-300 transition-colors hover:underline"
              >
                Shipon Chowdhury
              </a>
            </p>
          </div>

          {/* Balanced 5 Payment Method Icons: Fits on a single row with safe clearance from floating Messenger button */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-2.5 lg:pr-16">
            <div className="h-8 sm:h-9 px-2.5 bg-stone-100/90 dark:bg-white/10 rounded-xl border border-stone-200/60 dark:border-white/10 shadow-2xs flex items-center justify-center transition-all hover:bg-white dark:hover:bg-white/20 hover:scale-105 shrink-0">
              <Image
                src="/payment-icon/BKash-bKash-Logo.wine.svg"
                alt="bKash Payment"
                width={56}
                height={22}
                className="object-contain h-4.5 sm:h-5 w-auto"
              />
            </div>
            <div className="h-8 sm:h-9 px-2.5 bg-stone-100/90 dark:bg-white/10 rounded-xl border border-stone-200/60 dark:border-white/10 shadow-2xs flex items-center justify-center transition-all hover:bg-white dark:hover:bg-white/20 hover:scale-105 shrink-0">
              <Image
                src="/payment-icon/Nagad-Horizontal-Logo.wine.svg"
                alt="Nagad Payment"
                width={56}
                height={22}
                className="object-contain h-4.5 sm:h-5 w-auto"
              />
            </div>
            <div className="h-8 sm:h-9 px-2.5 bg-stone-100/90 dark:bg-white/10 rounded-xl border border-stone-200/60 dark:border-white/10 shadow-2xs flex items-center justify-center transition-all hover:bg-white dark:hover:bg-white/20 hover:scale-105 shrink-0">
              <Image
                src="/payment-icon/Visa_Inc.-Logo.wine.svg"
                alt="Visa Payment"
                width={46}
                height={22}
                className="object-contain h-3.5 sm:h-4 w-auto"
              />
            </div>
            <div className="h-8 sm:h-9 px-2.5 bg-stone-100/90 dark:bg-white/10 rounded-xl border border-stone-200/60 dark:border-white/10 shadow-2xs flex items-center justify-center transition-all hover:bg-white dark:hover:bg-white/20 hover:scale-105 shrink-0">
              <Image
                src="/payment-icon/Mastercard-Logo.wine.svg"
                alt="Mastercard Payment"
                width={46}
                height={22}
                className="object-contain h-4.5 sm:h-5 w-auto"
              />
            </div>
            <div className="h-8 sm:h-9 px-2.5 bg-stone-100/90 dark:bg-white/10 rounded-xl border border-stone-200/60 dark:border-white/10 shadow-2xs flex items-center justify-center transition-all hover:bg-white dark:hover:bg-white/20 hover:scale-105 shrink-0">
              <Image
                src="/payment-icon/cash-on-delivery.png"
                alt="Cash on Delivery"
                width={60}
                height={22}
                className="object-contain h-4.5 sm:h-5 w-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
