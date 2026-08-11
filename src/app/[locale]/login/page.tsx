"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import { useRouter, useSearchParams } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";
import { FormField } from "@/components/form-field";
import { PrimaryButton } from "@/components/primary-button";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tAuth = useTranslations("auth");
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [formError, setFormError] = React.useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!identifier.trim() || !password) {
      setFormError("সব ঘর পূরণ করুন।");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data?.message || "লগইন ব্যর্থ হয়েছে, আবার চেষ্টা করুন।");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        const userRole = data.user?.role;
        const redirectTarget = searchParams.get("redirect") || (["admin", "super_admin", "manager"].includes(userRole) ? "/admin" : "/");
        window.location.href = redirectTarget;
      }
    } catch {
      setFormError("সার্ভারে সংযোগ করা যায়নি। ইন্টারনেট চেক করুন।");
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
        <>
          {tAuth("noAccount")}{" "}
          <Link href="/register" className="font-medium text-rose-500 hover:underline">
            {tAuth("registerBtn")}
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          id="identifier"
          label={tAuth("emailOrPhoneLabel")}
          type="text"
          placeholder={tAuth("emailOrPhonePlaceholder")}
          value={identifier}
          onChange={setIdentifier}
          autoComplete="username"
        />

        <FormField
          id="password"
          label={tAuth("passwordLabel")}
          type={showPassword ? "text" : "password"}
          placeholder={tAuth("passwordPlaceholder")}
          value={password}
          onChange={setPassword}
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

        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-[13px] font-medium text-rose-500 hover:underline">
            {tAuth("forgotPassword")}
          </Link>
        </div>

        {formError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600 dark:bg-red-500/10 dark:text-red-300">
            {formError}
          </p>
        )}

        <PrimaryButton type="submit" loading={loading}>
          {tAuth("loginBtn")}
        </PrimaryButton>
      </form>

      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-stone-200 dark:bg-white/10" />
        <span className="text-[12px] text-stone-400 dark:text-rose-100/40">{tAuth("or")}</span>
        <div className="h-px flex-1 bg-stone-200 dark:bg-white/10" />
      </div>

      <div className="flex justify-center w-full">
        <GoogleLogin
          onSuccess={async (credentialResponse) => {
            setGoogleLoading(true);
            try {
              const res = await fetch(`${API_BASE}/api/auth/google`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: credentialResponse.credential }),
              });
              const data = await res.json();
              if (!res.ok) {
                setFormError(data?.message || "Google লগইন ব্যর্থ হয়েছে।");
                return;
              }
              if (data.token) {
                localStorage.setItem("token", data.token);
                window.location.href = "/";
              }
            } catch {
              setFormError("Google লগইনে সমস্যা হয়েছে, আবার চেষ্টা করুন।");
            } finally {
              setGoogleLoading(false);
            }
          }}
          onError={() => setFormError("Google লগইন বাতিল হয়েছে।")}
          theme="outline"
          size="large"
          width="100%"
          text="continue_with"
        />
      </div>
    </AuthLayout>
  );
}
