"use client";

import * as React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

export interface AuthLayoutProps {
  eyebrow?: any;
  title?: any;
  subtitle?: any;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  image?: string;
}

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  image = "https://res.cloudinary.com/dau8sazoh/image/upload/v1785587008/pexels-ron-lach-8154394_fxsjue.jpg",
}: AuthLayoutProps) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] w-full bg-stone-50/50 font-sans text-stone-800 dark:bg-[#12080B] dark:text-rose-50 transition-colors overflow-hidden">
      {/* Left — Lifestyle image & brand panel */}
      <div className="relative hidden w-[45%] xl:w-[48%] shrink-0 overflow-hidden bg-[#2A1620] lg:flex lg:flex-col lg:justify-between">
        {/* Background Image */}
        {image && (
          <Image
            src={image}
            alt="Cherry Glow Korea"
            fill
            sizes="48vw"
            priority
            className="object-cover object-center transition-transform duration-1000 hover:scale-105 opacity-85"
          />
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1C1417] via-[#1C1417]/55 to-black/30" />

        {/* Layered Glow */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-24 top-[-10%] h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,_#F472B6_0%,_transparent_70%)] opacity-35 blur-2xl" />
          <div className="absolute right-[-15%] top-[40%] h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,_#EC4899_0%,_transparent_70%)] opacity-30 blur-3xl" />
        </div>

        <div className="relative z-10 px-12 pt-10">
          <Link href="/" className="inline-flex items-baseline gap-1 group">
            <span className="font-serif text-3xl font-bold tracking-tight text-white drop-shadow-md">
              Cherry Glow
            </span>
            <span className="font-serif text-3xl italic font-semibold text-rose-300 drop-shadow-md">
              Korea
            </span>
          </Link>
        </div>

        <div className="relative z-10 px-12 pb-12">
          <p className="max-w-md font-serif text-2xl font-medium leading-snug text-white drop-shadow-lg xl:text-3xl">
            Beauty that cares, skin that shows it.
          </p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-rose-100/90 drop-shadow-md">
            ত্বকের যত্ন হোক ভালোবাসা দিয়ে — dermatologically tested skincare,
            made for every skin type.
          </p>
        </div>
      </div>

      {/* Right — perfectly centered form container area with subtle ambient background */}
      <div className="relative flex flex-1 flex-col items-center justify-center px-6 py-10 sm:px-12 md:px-16 lg:px-16 bg-gradient-to-br from-rose-50/50 via-stone-50/80 to-pink-50/40 dark:from-[#150a0d] dark:via-[#12080b] dark:to-[#180b0f] transition-colors">
        {/* Subtle Ambient Radial Glow on Right Panel */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[550px] rounded-full bg-[radial-gradient(circle,_#F472B6_0%,_transparent_70%)] opacity-[0.07] dark:opacity-[0.12] blur-3xl" />
        </div>

        {/* Centered Form Wrapper Card */}
        <div className="relative z-10 w-full max-w-[520px]">
          {/* Soft Diffused Floating Form Card */}
          <div className="rounded-3xl border border-stone-200/70 bg-white/95 backdrop-blur-xl p-7 sm:p-9 shadow-[0_2px_4px_rgba(0,0,0,0.02),0_8px_20px_rgba(0,0,0,0.04),0_20px_40px_rgba(0,0,0,0.05)] dark:border-rose-900/40 dark:bg-[#1b0d12]/95 dark:shadow-[0_10px_30px_rgba(0,0,0,0.4),0_0_60px_rgba(244,63,94,0.07)] transition-all duration-300">
            {eyebrow && (
              <span className="inline-block rounded-full bg-rose-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-600 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-100 dark:border-rose-900/50 mb-3">
                {eyebrow}
              </span>
            )}

            {title && (
              <h1 className="font-serif text-2xl font-bold text-stone-900 dark:text-white sm:text-3xl">
                {title}
              </h1>
            )}

            {subtitle && (
              <p className="mt-2 text-[14px] text-stone-500 dark:text-rose-100/60">
                {subtitle}
              </p>
            )}

            <div className="mt-6">{children}</div>

            {footer && (
              <div className="mt-6 text-center text-[13px] text-stone-500 dark:text-rose-100/50 border-t border-stone-100 dark:border-rose-900/30 pt-5">
                {footer}
              </div>
            )}
          </div>

          {/* Minimal Auth Page Copyright Line */}
          <div className="mt-6 text-center text-[12px] font-medium text-stone-400 dark:text-rose-100/40">
            © 2026 Cherry Glow Korea. All rights reserved.
          </div>
        </div>
      </div>
    </div>
  );
}
