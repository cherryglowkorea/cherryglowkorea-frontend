"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/auth-layout";
import { FormField } from "@/components/form-field";
import { PrimaryButton } from "@/components/primary-button";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("আপনার ইমেইল লিখুন।");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data?.message || "এই ইমেইলে কোনো অ্যাকাউন্ট পাওয়া যায়নি।");
        return;
      }

      sessionStorage.setItem("reset_email", email);
      router.push("/verify-otp");
    } catch {
      setError("সার্ভারে সংযোগ করা যায়নি। ইন্টারনেট চেক করুন।");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout
      eyebrow="পাসওয়ার্ড রিসেট"
      title="পাসওয়ার্ড ভুলে গেছেন?"
      subtitle="চিন্তা নেই — আপনার ইমেইলে একটা ৬ সংখ্যার কোড পাঠিয়ে দিচ্ছি।"
      footer={
        <>
          মনে পড়ে গেছে?{" "}
          <Link href="/login" className="font-medium text-rose-500 hover:underline">
            লগইনে ফিরে যান
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <FormField
          id="email"
          label="ইমেইল"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={setEmail}
          autoComplete="email"
          error={error}
        />

        <PrimaryButton type="submit" loading={loading}>
          রিসেট কোড পাঠান
        </PrimaryButton>

        <p className="text-center text-[12.5px] leading-relaxed text-stone-400 dark:text-rose-100/40">
          শুধু ফোন নম্বর দিয়ে অ্যাকাউন্ট খুলেছেন ও ইমেইল যোগ করেননি? আগে{" "}
          <Link href="/profile" className="underline hover:text-rose-500">
            প্রোফাইলে ইমেইল যোগ করুন
          </Link>{" "}
          অথবা সরাসরি{" "}
          <a href="tel:+8801700000000" className="underline hover:text-rose-500">
            কাস্টমার কেয়ারে
          </a>{" "}
          কল করুন।
        </p>
      </form>
    </AuthLayout>
  );
}
