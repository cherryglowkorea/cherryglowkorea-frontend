/**
 * Resilient Image Utilities for Cherry Glow Korea
 * Handles URL extraction, CDN protocol normalization, Cloudinary transformation,
 * and graceful skincare branded fallbacks.
 */

export const DEFAULT_FALLBACK_IMAGE = "/placeholder.jpg";
export const SVG_FALLBACK_IMAGE = "/placeholder-skincare.svg";

const KNOWN_PLACEHOLDER_SUBSTRINGS = [
  "placeholder.jpg",
  "placeholder.png",
  "placeholder-skincare.svg",
  "placeholder.svg",
];

/**
 * Checks whether an image candidate is a known placeholder asset.
 */
export function isPlaceholderUrl(url: unknown): boolean {
  if (typeof url !== "string" || !url.trim()) return false;
  const lower = url.toLowerCase().trim();
  return KNOWN_PLACEHOLDER_SUBSTRINGS.some((ph) => lower.includes(ph));
}

/**
 * Validates whether an image URL is a usable, non-placeholder resource.
 */
export function isValidImageUrl(url: unknown): boolean {
  if (typeof url !== "string") return false;
  const clean = url.trim();
  if (!clean || clean.length < 4) return false;
  if (isPlaceholderUrl(clean)) return false;

  // Must be an absolute http(s) URL, a local public path starting with /, or a data URI
  return (
    clean.startsWith("http://") ||
    clean.startsWith("https://") ||
    clean.startsWith("/") ||
    clean.startsWith("data:image/")
  );
}

/**
 * Normalizes HTTP protocols to HTTPS for known image CDNs to satisfy Next.js security and CSP.
 */
export function normalizeImageUrl(url: string): string {
  if (!url || typeof url !== "string") return "";
  let clean = url.trim();

  // Upgrade http to https for known CDNs
  if (clean.startsWith("http://res.cloudinary.com")) {
    clean = clean.replace("http://res.cloudinary.com", "https://res.cloudinary.com");
  } else if (clean.startsWith("http://images.unsplash.com")) {
    clean = clean.replace("http://images.unsplash.com", "https://images.unsplash.com");
  } else if (clean.startsWith("http://i.ibb.co")) {
    clean = clean.replace("http://i.ibb.co", "https://i.ibb.co");
  }

  return clean;
}

/**
 * Safely applies Cloudinary responsive transformations only if not already transformed.
 */
export function getOptimizedCloudinaryUrl(url: string, width = 600): string {
  if (!url || typeof url !== "string") return DEFAULT_FALLBACK_IMAGE;
  const normalized = normalizeImageUrl(url);

  if (!normalized.includes("cloudinary.com") || !normalized.includes("/upload/")) {
    return normalized;
  }

  // Avoid injecting duplicate transformations if already present
  if (
    normalized.includes("/upload/w_") ||
    normalized.includes("/upload/c_") ||
    normalized.includes("/upload/f_")
  ) {
    return normalized;
  }

  return normalized.replace("/upload/", `/upload/w_${width},f_auto,q_auto:good/`);
}

interface ImageOptions {
  width?: number;
  optimize?: boolean;
}

/**
 * Extracts the best display image for a product.
 * Prioritizes genuine product photos over placeholder strings so valid images are never shadowed.
 */
export function getProductDisplayImage(
  product: any,
  options: ImageOptions = {}
): string {
  if (!product) return DEFAULT_FALLBACK_IMAGE;

  const { width = 600, optimize = true } = options;

  // 1. Gather all potential image candidates from product fields
  const rawCandidates: any[] = [
    product.image,
    product.thumbnail,
    product.images?.[0]?.url,
    typeof product.images?.[0] === "string" ? product.images[0] : null,
    ...(Array.isArray(product.images)
      ? product.images.map((i: any) => (typeof i === "string" ? i : i?.url))
      : []),
    ...(Array.isArray(product.gallery) ? product.gallery : []),
  ];

  // 2. Filter out null/undefined/empty candidates
  const cleanCandidates = rawCandidates.filter(
    (c): c is string => typeof c === "string" && c.trim().length > 0
  );

  // 3. FIRST PRIORITY: Find a genuine valid URL that is NOT a placeholder
  const genuineUrl = cleanCandidates.find((c) => isValidImageUrl(c));

  if (genuineUrl) {
    const normalized = normalizeImageUrl(genuineUrl);
    return optimize ? getOptimizedCloudinaryUrl(normalized, width) : normalized;
  }

  // 4. SECOND PRIORITY: If no genuine URL exists, return the official fallback
  return DEFAULT_FALLBACK_IMAGE;
}
