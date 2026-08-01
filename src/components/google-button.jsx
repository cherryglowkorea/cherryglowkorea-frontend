"use client";

import * as React from "react";

export function GoogleButton({ onClick, label = "Google দিয়ে চালিয়ে যান", loading }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={loading}
      className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-[14px] font-medium text-stone-700 transition-colors hover:bg-stone-50 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-rose-50 dark:hover:bg-white/10 cursor-pointer"
    >
      <svg width="18" height="18" viewBox="0 0 48 48">
        <path
          fill="#FFC107"
          d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.6-6 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34.4 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
        />
        <path
          fill="#FF3D00"
          d="m6.3 14.7 6.6 4.8C14.6 15.8 18.9 13 24 13c3 0 5.8 1.1 7.9 3l5.7-5.7C34.4 6.1 29.5 4 24 4c-7.4 0-13.8 4.1-17.2 10.2z"
        />
        <path
          fill="#4CAF50"
          d="M24 44c5.4 0 10.2-2.1 13.9-5.4l-6.4-5.4C29.5 34.9 26.9 36 24 36c-5.3 0-9.7-3.4-11.3-8l-6.6 5.1C9.9 39.7 16.4 44 24 44z"
        />
        <path
          fill="#1976D2"
          d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l6.4 5.4C41.4 35.6 44 30.2 44 24c0-1.3-.1-2.7-.4-3.5z"
        />
      </svg>
      {label}
    </button>
  );
}
