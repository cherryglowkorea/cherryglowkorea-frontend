"use client";

import * as React from "react";

export function FormField({
  label,
  id,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  autoComplete,
  rightSlot,
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[13px] font-medium text-stone-700 dark:text-rose-100/80"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`w-full rounded-xl border bg-white px-4 py-2.5 text-[14px] text-stone-900 placeholder:text-stone-400 outline-none transition-all hover:border-stone-300 focus:border-rose-400 focus:ring-2 focus:ring-rose-500/15 dark:bg-white/5 dark:text-white dark:placeholder:text-rose-100/30 dark:focus:ring-rose-500/10 ${
            rightSlot ? "pr-11" : ""
          } ${
            error
              ? "border-red-300 focus:border-red-400 focus:ring-red-100 dark:border-red-400/50"
              : "border-stone-200 dark:border-white/10"
          }`}
        />
        {rightSlot && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</div>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} className="mt-1.5 text-[12.5px] text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
