import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function cleanProductName(name?: string): string {
  if (!name) return "";
  return name
    .replace(/^(Copy of\s*)+/gi, "")
    .replace(/\s*\(Copy\)\s*$/gi, "")
    .replace(/\s*\(Copy\s*\d*\)$/gi, "")
    .trim();
}
