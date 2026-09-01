"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useGoogleLogin } from "@react-oauth/google";
import { useLocale, useTranslations } from "next-intl";
import { Eye, EyeOff, ShieldCheck } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";
import { FormField } from "@/components/form-field";
import { PrimaryButton } from "@/components/primary-button";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const isBn = locale === "bn";
  const tAuth = useTranslations("auth");

  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [rememberMe, setRememberMe] = React.useState(true);
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const handleGoogleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      setGoogleLoading(true);
      setFormError("");
      try {
        const res = await fetch(`${API_BASE}/api/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code: codeResponse.code }),
        });
        const data = await res.json();
        if (!res.ok) {
          setFormError(data?.message || (isBn ? "Google লগইন ব্যর্থ হয়েছে।" : "Google login failed."));
          return;
        }
        if (data.token) {
          localStorage.setItem("token", data.token);
          window.location.href = "/";
        }
      } catch {
        setFormError(isBn ? "Google লগইন প্রসেস করতে সমস্যা হয়েছে।" : "Failed to process Google sign in.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setFormError(isBn ? "Google লগইন করা সম্ভব হয়নি।" : "Google login was un-successful.");
    },
  });

  // Error states
  const [fieldErrors, setFieldErrors] = React.useState<{ identifier?: string; password?: string }>({});
  const [formError, setFormError] = React.useState("");

  // Phone number auto-detection logic
  const isPhoneInput = React.useMemo(() => {
    const trimmed = identifier.trim();
    if (!trimmed) return false;
    return /^[+0-9\s-]+$/.test(trimmed);
  }, [identifier]);

  const helperBadge = React.useMemo(() => {
    const trimmed = identifier.trim();
    if (!trimmed) return undefined;
    if (isPhoneInput) return "📱 BD Mobile (+880)";
    if (trimmed.includes("@")) return "✉️ Email Address";
    return undefined;
  }, [identifier, isPhoneInput]);

  const handleIdentifierChange = (val: string) => {
    setIdentifier(val);
    if (fieldErrors.identifier) {
      setFieldErrors((prev) => ({ ...prev, identifier: undefined }));
    }
    if (formError) setFormError("");
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (fieldErrors.password) {
      setFieldErrors((prev) => ({ ...prev, password: undefined }));
    }
    if (formError) setFormError("");
  };

  const validateForm = () => {
    const errs: { identifier?: string; password?: string } = {};
    const trimmedId = identifier.trim();

    if (!trimmedId) {
      errs.identifier = isBn
        ? "ইমেইল অথবা মোবাইল নম্বর লিখুন।"
        : "Please enter your email or mobile phone number.";
    } else if (isPhoneInput) {
      // Validate BD Phone number
      const cleanPhone = trimmedId.replace(/[\s-]/g, "");
      const isBdPhone = /^(?:\+8801|8801|01)[3-9]\d{8}$/.test(cleanPhone);
      if (!isBdPhone) {
        errs.identifier = isBn
          ? "সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)।"
          : "Please enter a valid 11-digit BD mobile number (e.g. 017XXXXXXXX).";
      }
    } else if (trimmedId.includes("@") || /[a-zA-Z]/.test(trimmedId)) {
      // Validate Email Format
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedId);
      if (!isEmail) {
        errs.identifier = isBn
          ? "সঠিক ইমেইল ঠিকানা লিখুন (যেমন: user@domain.com)।"
          : "Please enter a valid email address (e.g. user@domain.com).";
      }
    }

    if (!password) {
      errs.password = isBn
        ? "আপনার পাসওয়ার্ড লিখুন।"
        : "Please enter your password.";
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!validateForm()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        // Generic security-focused error message
        setFormError(
          data?.message ||
            (isBn
              ? "ইমেইল/মোবাইল নম্বর বা পাসওয়ার্ড সঠিক নয়।"
              : "Invalid email/phone or password. Please check your credentials.")
        );
        return;
      }

      if (data.token) {
        if (rememberMe) {
          localStorage.setItem("rememberMe", "true");
        } else {
          localStorage.removeItem("rememberMe");
        }
        localStorage.setItem("token", data.token);
        const userRole = data.user?.role;
        const redirectTarget =
          searchParams.get("redirect") ||
          (["admin", "super_admin", "manager"].includes(userRole) ? "/admin" : "/");
        window.location.href = redirectTarget;
      }
    } catch {
      setFormError(
        isBn
          ? "সার্ভারে সংযোগ করা যায়নি। ইন্টারনেট সংযোগ চেক করুন।"
          : "Unable to connect to server. Please check your internet connection."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow={tAuth("loginEyebrow")}
      title={tAuth("welcomeBack")}
      subtitle={tAuth("welcomeSubtitle")}
      image="https://res.cloudinary.com/dau8sazoh/image/upload/v1785587008/pexels-ron-lach-8154394_fxsjue.jpg"
      footer={
        <div className="text-center text-xs text-stone-500 dark:text-rose-100/60">
          <span>{tAuth("noAccount")}</span>{" "}
          <Link
            href="/register"
            className="font-bold text-rose-500 hover:text-rose-600 hover:underline transition cursor-pointer"
          >
            {tAuth("registerBtn")}
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          id="identifier"
          label={tAuth("emailOrPhoneLabel")}
          type="text"
          placeholder={tAuth("emailOrPhonePlaceholder")}
          value={identifier}
          onChange={handleIdentifierChange}
          error={fieldErrors.identifier}
          helperText={helperBadge}
          autoComplete="username"
        />

        <FormField
          id="password"
          label={tAuth("passwordLabel")}
          type={showPassword ? "text" : "password"}
          placeholder={tAuth("passwordPlaceholder")}
          value={password}
          onChange={handlePasswordChange}
          error={fieldErrors.password}
          autoComplete="current-password"
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="text-stone-400 hover:text-rose-500 cursor-pointer p-1 transition-colors flex items-center justify-center"
              tabIndex={-1}
              aria-label={showPassword ? tAuth("hide") : tAuth("show")}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        {/* Remember Me Checkbox & Forgot Password Link Row */}
        <div className="flex items-center justify-between pt-1 text-xs">
          <label className="flex items-center gap-2 font-medium text-stone-600 dark:text-rose-100/80 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 rounded border-stone-300 dark:border-rose-900/60 text-rose-500 focus:ring-rose-400 accent-rose-500 cursor-pointer"
            />
            <span>{isBn ? "আমাকে মনে রাখুন" : "Remember Me"}</span>
          </label>

          <Link
            href="/forgot-password"
            className="font-medium text-rose-500 hover:text-rose-600 hover:underline transition"
          >
            {tAuth("forgotPassword")}
          </Link>
        </div>

        {/* Form Global Security Error Alert */}
        {formError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 shadow-xs flex items-start gap-2">
            <span className="shrink-0 text-sm">⚠️</span>
            <span className="leading-snug">{formError}</span>
          </div>
        )}

        <PrimaryButton type="submit" loading={loading} disabled={loading}>
          {loading ? (isBn ? "সাইন ইন হচ্ছে..." : "Signing in...") : tAuth("loginBtn")}
        </PrimaryButton>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-stone-200 dark:bg-white/10" />
        <span className="text-[12px] text-stone-400 dark:text-rose-100/40">{tAuth("or")}</span>
        <div className="h-px flex-1 bg-stone-200 dark:bg-white/10" />
      </div>

      {/* Google OAuth Login Button */}
      <button
        type="button"
        onClick={() => handleGoogleLogin()}
        disabled={googleLoading || loading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white dark:bg-[#1a0f13] border border-stone-200/80 dark:border-rose-900/60 shadow-sm hover:shadow-md hover:border-rose-400/80 text-stone-700 dark:text-rose-100 font-medium text-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
      >
        <Image
          src="/google.svg"
          alt="Google"
          width={20}
          height={20}
          className="w-5 h-5 object-contain"
        />
        <span>
          {googleLoading
            ? (isBn ? "লগইন হচ্ছে..." : "Signing in...")
            : tAuth("continueGoogle")}
        </span>
      </button>
    </AuthLayout>
  );
}
