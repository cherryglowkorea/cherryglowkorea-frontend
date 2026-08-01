"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth-layout";
import { FormField } from "@/components/form-field";
import { PrimaryButton } from "@/components/primary-button";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

function passwordIssue(password) {
  if (password.length < 6) return "পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।";
  if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password))
    return "পাসওয়ার্ডে অন্তত একটি অক্ষর ও একটি সংখ্যা থাকতে হবে।";
  return "";
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [resetToken, setResetToken] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [errors, setErrors] = React.useState({});
  const [formError, setFormError] = React.useState("");

  React.useEffect(() => {
    const token = sessionStorage.getItem("reset_token");
    if (!token) {
      router.replace("/forgot-password");
      return;
    }
    setResetToken(token);
  }, [router]);

  function validate() {
    const next = {};
    const pwIssue = passwordIssue(password);
    if (pwIssue) next.password = pwIssue;
    if (confirmPassword !== password) next.confirmPassword = "পাসওয়ার্ড দুটি মিলছে না।";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError("");
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetToken, newPassword: password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setFormError(data?.message || "পাসওয়ার্ড পরিবর্তন করা যায়নি, আবার চেষ্টা করুন।");
        return;
      }

      sessionStorage.removeItem("reset_token");
      sessionStorage.removeItem("reset_email");
      setSuccess(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setFormError("সার্ভারে সংযোগ করা যায়নি। ইন্টারনেট চেক করুন।");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <AuthLayout
        eyebrow="সম্পন্ন হয়েছে"
        title="পাসওয়ার্ড পরিবর্তন হয়ে গেছে"
        subtitle="নতুন পাসওয়ার্ড দিয়ে লগইন পেজে নিয়ে যাচ্ছি..."
      >
        <div className="flex justify-center py-6">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 dark:bg-rose-500/10">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M5 13l4 4L19 7"
                stroke="#EC4899"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      eyebrow="শেষ ধাপ"
      title="নতুন পাসওয়ার্ড দিন"
      subtitle="একটা শক্তিশালী পাসওয়ার্ড বেছে নিন যা আপনি আগে ব্যবহার করেননি।"
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          id="password"
          label="নতুন পাসওয়ার্ড"
          type={showPassword ? "text" : "password"}
          placeholder="কমপক্ষে ৬ অক্ষর, ১টি সংখ্যাসহ"
          value={password}
          onChange={setPassword}
          error={errors.password}
          autoComplete="new-password"
          rightSlot={
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="text-[12px] font-medium text-stone-400 hover:text-rose-500 cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? "লুকান" : "দেখুন"}
            </button>
          }
        />

        <FormField
          id="confirmPassword"
          label="পাসওয়ার্ড আবার লিখুন"
          type={showPassword ? "text" : "password"}
          placeholder="••••••••"
          value={confirmPassword}
          onChange={setConfirmPassword}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        {formError && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600 dark:bg-red-500/10 dark:text-red-300">
            {formError}
          </p>
        )}

        <PrimaryButton type="submit" loading={loading}>
          পাসওয়ার্ড পরিবর্তন করুন
        </PrimaryButton>
      </form>
    </AuthLayout>
  );
}
