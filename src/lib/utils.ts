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

export function getVariantLabel(v?: any, index: number = 0): string {
  if (!v) return `Option ${index + 1}`;

  const isValidString = (val: any) =>
    val !== null &&
    val !== undefined &&
    String(val).trim().length > 0 &&
    String(val).trim().toLowerCase() !== "null" &&
    String(val).trim().toLowerCase() !== "undefined";

  if (isValidString(v.size)) return String(v.size).trim();

  const hasWeight = isValidString(v.weight);
  const hasUnit = isValidString(v.unit);

  if (hasWeight && hasUnit) return `${String(v.weight).trim()}${String(v.unit).trim()}`;
  if (hasWeight) return `${String(v.weight).trim()}`;

  const hasVolume = isValidString(v.volume);
  if (hasVolume && hasUnit) return `${String(v.volume).trim()}${String(v.unit).trim()}`;
  if (hasVolume) return `${String(v.volume).trim()}`;

  if (isValidString(v.name)) return String(v.name).trim();
  if (isValidString(v.title)) return String(v.title).trim();

  if (v.price && Number(v.price) > 0) {
    return `৳${Number(v.price).toLocaleString()}`;
  }

  return `Option ${index + 1}`;
}

export interface FormattedPrice {
  display: "strikethrough-free" | "free-only" | "strikethrough-normal" | "normal";
  originalText: string | null;
  finalText: string;
  isFree: boolean;
}

export function formatPrice(
  originalPrice: number = 0,
  finalPrice: number = 0,
  currency: string = "৳"
): FormattedPrice {
  const orig = Number(originalPrice) || 0;
  const final = Number(finalPrice) || 0;

  if (final === 0) {
    if (orig > 0) {
      return {
        display: "strikethrough-free",
        originalText: `${currency}${orig.toLocaleString()}`,
        finalText: "FREE",
        isFree: true,
      };
    }
    return {
      display: "free-only",
      originalText: null,
      finalText: "FREE",
      isFree: true,
    };
  }

  if (orig > final) {
    return {
      display: "strikethrough-normal",
      originalText: `${currency}${orig.toLocaleString()}`,
      finalText: `${currency}${final.toLocaleString()}`,
      isFree: false,
    };
  }

  return {
    display: "normal",
    originalText: null,
    finalText: `${currency}${final.toLocaleString()}`,
    isFree: false,
  };
}
