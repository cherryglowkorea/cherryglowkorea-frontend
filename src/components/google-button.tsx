"use client";

import * as React from "react";
import Image from "next/image";

interface GoogleButtonProps {
  onClick?: () => void;
  label?: string;
  loading?: boolean;
}

export function GoogleButton({ onClick, label = "Google দিয়ে চালিয়ে যান", loading }: GoogleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-[14px] font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-rose-50 dark:hover:bg-white/10 cursor-pointer"
    >
      <Image src="/google.svg" alt="Google" width={20} height={20} className="w-5 h-5 object-contain" />
      {label}
    </button>
  );
}

