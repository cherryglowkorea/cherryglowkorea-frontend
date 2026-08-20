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
