"use client";

import * as React from "react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

export function AuthLayout({
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  image = "https://res.cloudinary.com/dau8sazoh/image/upload/v1785587008/pexels-ron-lach-8154394_fxsjue.jpg",
}) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] w-full bg-white font-sans text-stone-800 dark:bg-[#140A0D] dark:text-rose-50 transition-colors">
      {/* Left — image & brand panel */}
      <div className="relative hidden w-[42%] shrink-0 overflow-hidden bg-[#2A1620] lg:flex lg:flex-col lg:justify-between">
        {/* Background Image */}
        {image && (
          <Image
            src={image}
            alt="Cherry Glow Korea"
            fill
            sizes="42vw"
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

      {/* Right — card form panel */}
      <div className="relative flex w-full flex-1 flex-col justify-center px-4 py-6 sm:px-8 lg:px-12">
        <div className="mx-auto w-full max-w-[480px] sm:max-w-[500px] rounded-3xl border border-stone-200/50 bg-white p-6 sm:p-8 md:p-9 shadow-xs dark:border-white/10 dark:bg-[#23181C]/90 transition-all">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-rose-500 dark:text-rose-300">
            {eyebrow}
          </p>
          <h1 className="font-serif text-2xl font-bold leading-tight text-stone-900 dark:text-white sm:text-[28px]">
            {title}
          </h1>
          <p className="mt-1 text-[13.5px] leading-snug text-stone-500 dark:text-rose-100/60">
            {subtitle}
          </p>

          <div className="mt-5">{children}</div>

          {footer && (
            <div className="mt-5 border-t border-stone-100 pt-5 text-center text-[13px] text-stone-500 dark:border-white/10 dark:text-rose-100/60">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
