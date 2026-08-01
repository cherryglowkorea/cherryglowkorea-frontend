"use client";

import * as React from "react";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { GoogleLogin } from "@react-oauth/google";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/auth-layout";
import { FormField } from "@/components/form-field";
import { PrimaryButton } from "@/components/primary-button";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const avatars = {
  male: "/avatars/male.png",
  female: "/avatars/female.png",
};

function passwordIssue(password) {
  if (password.length < 6) return "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।";
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))
    return "পাসওয়ার্ডে অন্তত একটি অক্ষর ও একটি সংখ্যা থাকতে হবে।";
  return "";
}

export default function RegisterPage() {
  const router = useRouter();
  const tAuth = useTranslations("auth");
  const [method, setMethod] = React.useState("email");
  const [name, setName] = React.useState("");
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [avatar, setAvatar] = React.useState("male");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [formError, setFormError] = React.useState("");

  function validate() {
    const next = {};
    if (!name.trim()) next.name = "আপনার নাম লিখুন।";
    if (!identifier.trim()) next.identifier = method === "email" ? "ইমেইল লিখুন।" : "ফোন নম্বর লিখুন।";
    const pwIssue = passwordIssue(password);
    if (pwIssue) next.password = pwIssue;
    if (password !== confirmPassword) next.confirmPassword = "পাসওয়ার্ড মিলছে না।";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const endpoint = method === "email" ? "/api/auth/register/email" : "/api/auth/register/phone";
      const selectedAvatar = avatars[avatar];

      const body =
        method === "email"
          ? { name, email: identifier, password, avatar: selectedAvatar, photoURL: selectedAvatar }
          : { name, phone: identifier, password, avatar: selectedAvatar, photoURL: selectedAvatar };

      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data?.message || "রেজিস্ট্রেশন ব্যর্থ হয়েছে, আবার চেষ্টা করুন।");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
        window.location.href = "/";
      }
    } catch {
      setFormError("সার্ভারে সংযোগ করা যায়নি। ইন্টারনেট চেক করুন।");
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
        <>
          {tAuth("haveAccount")}{" "}
          <Link href="/login" className="font-medium text-rose-500 hover:underline">
            {tAuth("loginBtn")}
          </Link>
        </>
      }
    >
      <div className="mb-4 flex rounded-xl bg-stone-100 p-1 dark:bg-white/5">
        {["email", "phone"].map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMethod(m);
              setIdentifier("");
              setErrors({});
              setFormError("");
            }}
            className={`flex-1 rounded-lg py-2 text-[13px] font-medium transition-colors cursor-pointer ${
              method === m
                ? "bg-white text-rose-600 shadow-sm dark:bg-white/10 dark:text-rose-300"
                : "text-stone-500 dark:text-rose-100/50"
            }`}
          >
            {m === "email" ? tAuth("emailTab") : tAuth("phoneTab")}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        {/* Avatar Selector Inline */}
        <div className="flex items-center justify-between rounded-xl border border-stone-100 bg-stone-50/50 px-4 py-2 dark:border-white/5 dark:bg-white/5">
          <label className="text-[13px] font-medium text-stone-700 dark:text-rose-100/80">
            {tAuth("avatarLabel")}
          </label>
          <div className="flex items-center gap-4">
            {Object.entries(avatars).map(([key, src]) => (
              <button
                type="button"
                key={key}
                onClick={() => setAvatar(key)}
                className={`relative rounded-full p-0.5 transition cursor-pointer bg-white dark:bg-white/10 ${
                  avatar === key
                    ? "ring-2 ring-rose-500 scale-105 opacity-100"
                    : "opacity-80 hover:opacity-100 ring-1 ring-stone-200 dark:ring-white/20"
                }`}
              >
                <Image
                  src={src}
                  alt={key}
                  width={38}
                  height={38}
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
          onChange={setName}
          error={errors.name}
          autoComplete="name"
        />

        <FormField
          id="identifier"
          label={method === "email" ? tAuth("emailLabel") : tAuth("phoneLabel")}
          type={method === "email" ? "email" : "tel"}
          placeholder={method === "email" ? tAuth("emailPlaceholder") : tAuth("phonePlaceholder")}
          value={identifier}
          onChange={setIdentifier}
          error={errors.identifier}
          autoComplete={method === "email" ? "email" : "tel"}
        />

        <FormField
          id="password"
          label={tAuth("passwordLabel")}
          type={showPassword ? "text" : "password"}
          placeholder={tAuth("registerPasswordPlaceholder")}
          value={password}
          onChange={setPassword}
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
          onChange={setConfirmPassword}
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

        {formError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600 dark:bg-red-500/10 dark:text-red-300">
            {formError}
          </p>
        )}

        <PrimaryButton type="submit" loading={loading}>
          {tAuth("registerBtn")}
        </PrimaryButton>

        <p className="text-center text-[12px] leading-relaxed text-stone-400 dark:text-rose-100/40">
          {tAuth("termsAgree")}
        </p>
      </form>

      <div className="my-3 flex items-center gap-3">
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
                setFormError(data?.message || "Google সাইনআপ ব্যর্থ হয়েছে।");
                return;
              }
              if (data.token) {
                localStorage.setItem("token", data.token);
                window.location.href = "/";
              }
            } catch {
              setFormError("Google সাইনআপে সমস্যা হয়েছে, আবার চেষ্টা করুন।");
            } finally {
              setGoogleLoading(false);
            }
          }}
          onError={() => setFormError("Google সাইনআপ বাতিল হয়েছে।")}
          theme="outline"
          size="large"
          width="100%"
          text="signup_with"
        />
      </div>
    </AuthLayout>
  );
}
