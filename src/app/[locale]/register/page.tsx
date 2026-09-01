"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGoogleLogin } from "@react-oauth/google";
import { useLocale, useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";
import { FormField } from "@/components/form-field";
import { PrimaryButton } from "@/components/primary-button";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const avatars = {
  male: "/avatars/male.png",
  female: "/avatars/female.png",
};

export default function RegisterPage() {
  const router = useRouter();
  const locale = useLocale();
  const isBn = locale === "bn";
  const tAuth = useTranslations("auth");

  const [name, setName] = React.useState("");
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [avatar, setAvatar] = React.useState("male");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);

  const handleGoogleRegister = useGoogleLogin({
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
          setFormError(data?.message || (isBn ? "Google রেজিস্ট্রেশন ব্যর্থ হয়েছে।" : "Google registration failed."));
          return;
        }
        if (data.token) {
          localStorage.setItem("token", data.token);
          window.location.href = "/";
        }
      } catch {
        setFormError(isBn ? "Google রেজিস্টার প্রসেস করতে সমস্যা হয়েছে।" : "Failed to process Google sign up.");
      } finally {
        setGoogleLoading(false);
      }
    },
    onError: () => {
      setFormError(isBn ? "Google সাইন আপ করা সম্ভব হয়নি।" : "Google sign up was un-successful.");
    },
  });

  // Field-level & form-level error states
  const [errors, setErrors] = React.useState<Record<string, string>>({});
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

  // Input change handlers to clear field errors on re-typing
  const handleNameChange = (val: string) => {
    setName(val);
    if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
    if (formError) setFormError("");
  };

  const handleIdentifierChange = (val: string) => {
    setIdentifier(val);
    if (errors.identifier) setErrors((prev) => ({ ...prev, identifier: "" }));
    if (formError) setFormError("");
  };

  const handlePasswordChange = (val: string) => {
    setPassword(val);
    if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
    if (formError) setFormError("");
  };

  const handleConfirmPasswordChange = (val: string) => {
    setConfirmPassword(val);
    if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: "" }));
    if (formError) setFormError("");
  };

  function validate() {
    const next: Record<string, string> = {};
    const trimmedName = name.trim();
    const trimmedId = identifier.trim();

    if (!trimmedName) {
      next.name = isBn ? "আপনার পুরো নাম লিখুন।" : "Please enter your full name.";
    }

    if (!trimmedId) {
      next.identifier = isBn
        ? "ইমেইল অথবা মোবাইল নম্বর লিখুন।"
        : "Please enter your email or mobile phone number.";
    } else if (isPhoneInput) {
      const cleanPhone = trimmedId.replace(/[\s-]/g, "");
      const isBdPhone = /^(?:\+8801|8801|01)[3-9]\d{8}$/.test(cleanPhone);
      if (!isBdPhone) {
        next.identifier = isBn
          ? "সঠিক ১১ ডিজিটের মোবাইল নম্বর লিখুন (যেমন: 017XXXXXXXX)।"
          : "Please enter a valid 11-digit BD mobile number (e.g. 017XXXXXXXX).";
      }
    } else if (trimmedId.includes("@") || /[a-zA-Z]/.test(trimmedId)) {
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedId);
      if (!isEmail) {
        next.identifier = isBn
          ? "সঠিক ইমেইল ঠিকানা লিখুন (যেমন: user@domain.com)।"
          : "Please enter a valid email address (e.g. user@domain.com).";
      }
    }

    if (!password) {
      next.password = isBn
        ? "পাসওয়ার্ড নির্বাচন করুন।"
        : "Please choose a password.";
    } else if (password.length < 6) {
      next.password = isBn
        ? "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।"
        : "Password must be at least 6 characters.";
    } else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) {
      next.password = isBn
        ? "পাসওয়ার্ডে অন্তত একটি অক্ষর ও একটি সংখ্যা থাকতে হবে।"
        : "Password must contain at least one letter and one number.";
    }

    if (!confirmPassword) {
      next.confirmPassword = isBn
        ? "পাসওয়ার্ডটি নিশ্চিত করুন।"
        : "Please confirm your password.";
    } else if (password !== confirmPassword) {
      next.confirmPassword = isBn
        ? "পাসওয়ার্ড দুটি মিলছে না।"
        : "Passwords do not match.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const isEmail = identifier.includes("@");
      const endpoint = isEmail ? "/api/auth/register/email" : "/api/auth/register/phone";
      const selectedAvatar = avatars[avatar as keyof typeof avatars];

      const body = isEmail
        ? { name: name.trim(), email: identifier.trim(), password, avatar: selectedAvatar, photoURL: selectedAvatar }
        : { name: name.trim(), phone: identifier.trim(), password, avatar: selectedAvatar, photoURL: selectedAvatar };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data?.message || (isBn ? "রেজিস্ট্রেশন ব্যর্থ হয়েছে, আবার চেষ্টা করুন।" : "Registration failed. Please try again."));
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "/";
      }
    } catch {
      setFormError(isBn ? "সার্ভারে সংযোগ করা যায়নি। ইন্টারনেট সংযোগ চেক করুন।" : "Unable to connect to server. Please check your internet connection.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow={tAuth("registerEyebrow")}
      title={tAuth("createAccount")}
      subtitle={tAuth("createSubtitle")}
      image="https://res.cloudinary.com/dau8sazoh/image/upload/v1785587008/pexels-shvetsa-5217926_pkhpex.jpg"
      footer={
        <div className="text-center text-xs text-stone-500 dark:text-rose-100/60">
          <span>{tAuth("haveAccount")}</span>{" "}
          <Link
            href="/login"
            className="font-bold text-rose-500 hover:text-rose-600 hover:underline transition cursor-pointer"
          >
            {tAuth("loginBtn")}
          </Link>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
        {/* Avatar Selector Inline */}
        <div className="flex items-center justify-between rounded-xl border border-stone-200/80 bg-stone-50/60 px-4 py-2 dark:border-rose-900/60 dark:bg-[#1f1217]">
          <label className="text-[13px] font-semibold text-stone-700 dark:text-rose-100/90">
            {tAuth("avatarLabel")}
          </label>
          <div className="flex items-center gap-4">
            {Object.entries(avatars).map(([key, src]) => (
              <button
                type="button"
                key={key}
                onClick={() => setAvatar(key)}
                className={`relative rounded-full p-0.5 transition cursor-pointer bg-white dark:bg-white/10 ${avatar === key
                    ? "ring-2 ring-rose-500 scale-105 opacity-100"
                    : "opacity-80 hover:opacity-100 ring-1 ring-stone-200 dark:ring-white/20"
                  }`}
              >
                <Image
                  src={src}
                  alt={key}
                  width={36}
                  height={36}
                  unoptimized
                  className="rounded-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>

        <FormField
          id="name"
          label={tAuth("nameLabel")}
          placeholder={tAuth("namePlaceholder")}
          value={name}
          onChange={handleNameChange}
          error={errors.name}
          autoComplete="name"
        />

        <FormField
          id="identifier"
          label={tAuth("emailOrPhoneLabel")}
          type="text"
          placeholder={tAuth("emailOrPhonePlaceholder")}
          value={identifier}
          onChange={handleIdentifierChange}
          error={errors.identifier}
          helperText={helperBadge}
          autoComplete="username"
        />

        <FormField
          id="password"
          label={tAuth("passwordLabel")}
          type={showPassword ? "text" : "password"}
          placeholder={tAuth("registerPasswordPlaceholder")}
          value={password}
          onChange={handlePasswordChange}
          error={errors.password}
          autoComplete="new-password"
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

        <FormField
          id="confirmPassword"
          label={tAuth("confirmPasswordLabel")}
          type={showConfirmPassword ? "text" : "password"}
          placeholder={tAuth("confirmPasswordPlaceholder")}
          value={confirmPassword}
          onChange={handleConfirmPasswordChange}
          error={errors.confirmPassword}
          autoComplete="new-password"
          rightSlot={
            <button
              type="button"
              onClick={() => setShowConfirmPassword((s) => !s)}
              className="text-stone-400 hover:text-rose-500 cursor-pointer p-1 transition-colors flex items-center justify-center"
              tabIndex={-1}
              aria-label={showConfirmPassword ? tAuth("hide") : tAuth("show")}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
        />

        {/* Global Registration Error Alert */}
        {formError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300 shadow-xs flex items-start gap-2">
            <span className="shrink-0 text-sm">⚠️</span>
            <span className="leading-snug">{formError}</span>
          </div>
        )}

        <PrimaryButton type="submit" loading={loading} disabled={loading}>
          {loading ? (isBn ? "অ্যাকাউন্ট তৈরি হচ্ছে..." : "Creating account...") : tAuth("registerBtn")}
        </PrimaryButton>
      </form>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-stone-200 dark:bg-white/10" />
        <span className="text-[12px] text-stone-400 dark:text-rose-100/40">{tAuth("or")}</span>
        <div className="h-px flex-1 bg-stone-200 dark:bg-white/10" />
      </div>

      {/* Google OAuth Register Button */}
      <button
        type="button"
        onClick={() => handleGoogleRegister()}
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
            ? (isBn ? "সাইন আপ হচ্ছে..." : "Signing up...")
            : tAuth("signUpGoogle")}
        </span>
      </button>
    </AuthLayout>
  );
}
