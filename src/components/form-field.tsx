"use client";

import * as React from "react";

export interface FormFieldProps {
  label?: string;
  id?: string;
  type?: string;
  placeholder?: string;
  value?: any;
  onChange?: (val: any) => void;
  error?: string;
  helperText?: string;
  autoComplete?: string;
  rightSlot?: React.ReactNode;
}

export function FormField({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  helperText,
  autoComplete,
  rightSlot,
}: FormFieldProps) {
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex items-center justify-between">
          <label
            htmlFor={id}
            className="block text-[13px] font-semibold text-stone-700 dark:text-rose-100/90"
          >
            {label}
          </label>
          {helperText && !error && (
            <span className="text-[11px] font-medium text-pink-600 dark:text-pink-300 bg-pink-50 dark:bg-pink-950/60 px-2 py-0.5 rounded-full border border-pink-200 dark:border-pink-900/50 shadow-2xs">
              {helperText}
            </span>
          )}
        </div>
      )}
      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          value={value || ""}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(e) => onChange && onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-xl border bg-stone-50/70 px-4 py-2.5 text-[14px] font-medium text-stone-900 placeholder:text-stone-400 outline-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] transition-all duration-200 hover:border-stone-300 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/25 focus:shadow-[0_0_15px_rgba(244,63,94,0.15)] dark:bg-[#1a0f13] dark:text-white dark:placeholder:text-stone-400 dark:shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)] dark:hover:border-rose-800/80 dark:focus:bg-[#221319] dark:focus:border-rose-400 dark:focus:ring-rose-400/20 dark:focus:shadow-[0_0_20px_rgba(244,63,94,0.2)] ${
            rightSlot ? "pr-11" : ""
          } ${
            error
              ? "border-red-500 ring-2 ring-red-500/20 focus:border-red-500 dark:border-red-500 dark:ring-red-500/30"
              : "border-stone-200 dark:border-rose-900/60"
          }`}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[12px] font-semibold text-red-500 flex items-center gap-1">
          <span>⚠️</span> {error}
        </p>
      )}
    </div>
  );
}
