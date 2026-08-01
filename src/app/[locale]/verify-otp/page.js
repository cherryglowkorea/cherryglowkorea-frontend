"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth-layout";
import { PrimaryButton } from "@/components/primary-button";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function VerifyOtpPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [digits, setDigits] = React.useState(Array(OTP_LENGTH).fill(""));
  const [loading, setLoading] = React.useState(false);
  const [resending, setResending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [secondsLeft, setSecondsLeft] = React.useState(RESEND_SECONDS);
  const inputsRef = React.useRef([]);

  React.useEffect(() => {
    const stored = sessionStorage.getItem("reset_email");
    if (!stored) {
      router.replace("/forgot-password");
      return;
    }
    setEmail(stored);
  }, [router]);

  React.useEffect(() => {
    if (secondsLeft <= 0) return;
    const timer = setTimeout(() => setSecondsLeft((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [secondsLeft]);

  function handleChange(index, value) {
    const digit = value.replace(/[^0-9]/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < OTP_LENGTH - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  }

  function handleKeyDown(index, e) {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = Array(OTP_LENGTH).fill("");
    pasted.split("").forEach((d, i) => (next[i] = d));
    setDigits(next);
    inputsRef.current[Math.min(pasted.length, OTP_LENGTH - 1)]?.focus();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const otp = digits.join("");

    if (otp.length < OTP_LENGTH) {
      setError("সম্পূর্ণ ৬ সংখ্যার কোড লিখুন।");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-reset-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "কোডটি সঠিক নয় অথবা মেয়াদ শেষ হয়ে গেছে।");
        return;
      }

      sessionStorage.setItem("reset_token", data.resetToken);
      router.push("/reset-password");
    } catch {
      setError("সার্ভারে সংযোগ করা যায়নি। ইন্টারনেট চেক করুন।");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (secondsLeft > 0 || !email) return;
    setResending(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data?.message || "কোড আবার পাঠানো যায়নি।");
        return;
      }
      setSecondsLeft(RESEND_SECONDS);
      setDigits(Array(OTP_LENGTH).fill(""));
      inputsRef.current[0]?.focus();
    } catch {
      setError("সার্ভারে সংযোগ করা যায়নি।");
    } finally {
      setResending(false);
    }
  }

  const maskedEmail = email.replace(/^(.{2}).+(@.+)$/, "$1•••$2");

  return (
    <AuthLayout
      eyebrow="যাচাইকরণ"
      title="আপনার কোড লিখুন"
      subtitle={email ? `${maskedEmail} — এই ঠিকানায় ৬ সংখ্যার কোড পাঠানো হয়েছে।` : "আপনার ইমেইলে পাঠানো কোডটি লিখুন।"}
      footer={
        <>
          ভুল ইমেইল দিয়েছেন?{" "}
          <Link href="/forgot-password" className="font-medium text-rose-500 hover:underline">
            আবার শুরু করুন
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div className="flex justify-between gap-2">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputsRef.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className="h-14 w-12 rounded-xl border border-stone-200 bg-white text-center text-xl font-semibold text-stone-900 outline-none transition-colors focus:border-rose-400 focus:ring-4 focus:ring-rose-100 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:ring-rose-500/10 sm:w-14"
            />
          ))}
        </div>

        {error && (
          <p className="rounded-lg bg-red-50 px-3 py-2 text-[13px] text-red-600 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
        )}

        <PrimaryButton type="submit" loading={loading}>
          কোড যাচাই করুন
        </PrimaryButton>

        <p className="text-center text-[13px] text-stone-500 dark:text-rose-100/50">
          {secondsLeft > 0 ? (
            <>নতুন কোড পাঠানো যাবে {secondsLeft} সেকেন্ড পর</>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              className="font-medium text-rose-500 hover:underline disabled:opacity-60 cursor-pointer"
            >
              {resending ? "পাঠানো হচ্ছে..." : "কোড আবার পাঠান"}
            </button>
          )}
        </p>
      </form>
    </AuthLayout>
  );
}
