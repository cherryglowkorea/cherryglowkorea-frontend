"use client";

import * as React from "react";
import Image from "next/image";

interface GoogleButtonProps {
  label?: string;
  onClick?: () => void;
  loading?: boolean;
}

export default function GoogleButton({ label = "Continue with Google", onClick, loading }: GoogleButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white dark:bg-[#1a0f13] border border-stone-200/80 dark:border-rose-900/60 shadow-sm hover:shadow-md hover:border-rose-400/80 text-stone-700 dark:text-rose-100 font-medium text-sm transition-all duration-200 cursor-pointer disabled:opacity-50"
    >
      <Image src="/google.svg" alt="Google" width={20} height={20} className="w-5 h-5 object-contain" />
      <span>{label}</span>
    </button>
  );
}


