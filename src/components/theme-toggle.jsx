"use client";

import * as React from "react";
import { useTheme } from "next-themes";

export function ThemeToggle({ variant = "default" }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  const isDarkVar = variant === "dark" || variant === "compact";

  if (!mounted) {
    return <div className={isDarkVar ? "h-7 w-7" : "h-10 w-10"} />;
  }

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-label={isDark ? "লাইট মোডে যান" : "ডার্ক মোডে যান"}
      className={
        isDarkVar
          ? "group relative flex h-8 w-8 items-center justify-center rounded-full border border-stone-700 bg-stone-800/90 text-stone-200 hover:bg-stone-700 hover:text-white transition cursor-pointer"
          : "group relative flex h-10 w-10 items-center justify-center rounded-full border border-rose-200/60 bg-white/70 text-rose-500 shadow-sm backdrop-blur transition-colors hover:bg-rose-50 dark:border-white/10 dark:bg-white/5 dark:text-rose-300 dark:hover:bg-white/10 cursor-pointer"
      }
    >
      {isDark ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.6" />
          <path
            d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5Z"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
