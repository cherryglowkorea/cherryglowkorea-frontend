import { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://cherryglowkorea.com";
const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let products: any[] = [];
  let combos: any[] = [];

  // Fetch all active products dynamically for sitemap indexing
  try {
    const res = await fetch(`${API_BASE}/products/allProduct`, { next: { revalidate: 3600 } });
    if (res.ok) {
      products = await res.json();
    }
  } catch (err) {
    // fallback empty array
  }

  // Fetch combo deals
  try {
    const comboRes = await fetch(`${API_BASE}/combos`, { next: { revalidate: 3600 } });
    if (comboRes.ok) {
      combos = await comboRes.json();
    }
  } catch (err) {
    // fallback empty array
  }

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${SITE_URL}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/combo`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/shipping`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
  ];

  const productRoutes: MetadataRoute.Sitemap = Array.isArray(products)
    ? products.map((p: any) => ({
        url: `${SITE_URL}/products/${p._id || p.id}`,
        lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }))
    : [];

  const comboRoutes: MetadataRoute.Sitemap = Array.isArray(combos)
    ? combos.map((c: any) => ({
        url: `${SITE_URL}/combo/${c._id || c.id}`,
        lastModified: c.updatedAt ? new Date(c.updatedAt) : new Date(),
        changeFrequency: "weekly",
        priority: 0.8,
      }))
    : [];

  return [...staticRoutes, ...productRoutes, ...comboRoutes];
}
