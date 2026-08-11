"use client";

import * as React from "react";

export interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export function PrimaryButton({ loading = false, children, disabled = false, ...props }: PrimaryButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className="flex w-full items-center justify-center gap-2 rounded-xl bg-rose-500 hover:bg-rose-600 px-4 py-3 text-[14px] font-semibold text-white shadow-sm hover:shadow-md transition-all active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
    >
      {loading && (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      )}
      {children}
    </button>
  );
}
