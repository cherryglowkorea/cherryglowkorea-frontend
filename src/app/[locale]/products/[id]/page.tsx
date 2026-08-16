import { Metadata } from "next";
import ProductDetailsClient from "./ProductDetailsClient";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

/**
 * Fetch product server-side for Metadata & Structured Data
 */
async function getProduct(id: string) {
  try {
    const res = await fetch(`${API_BASE}/products/singleProduct/${id}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const p = await res.json();
    if (p && p.type === "combo") {
      const comboRes = await fetch(`${API_BASE}/combos/${id}`, {
        next: { revalidate: 60 },
      });
      if (comboRes.ok) return await comboRes.json();
    }
    return p;
  } catch (err) {
    return null;
  }
}

/**
 * Next.js Dynamic Metadata Generator for Google SEO & Social Sharing (OG Tags)
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Product Not Found | Cherry Glow Korea",
      description: "Authentic Korean skincare and cosmetics product.",
    };
  }

  const name = product.name || "Korean Skincare Product";
  const rawDesc = product.summary || product.description || product.useCase || "";
  const cleanDescription = Array.isArray(rawDesc)
    ? rawDesc.join(" ")
    : String(rawDesc).replace(/<[^>]*>/g, "").substring(0, 160);

  const price = product.salePrice || product.price || product.variants?.[0]?.price || 0;
  const brand = product.brand?.name || product.brand || "Cherry Glow";
  const category = product.category?.name || product.category || "Korean Skincare";

  const imageUrl =
    product.image ||
    product.thumbnail ||
    product.images?.[0]?.url ||
    "https://cherryglowkorea.com/og-image.jpg";

  const productUrl = `https://cherryglowkorea.com/products/${id}`;

  return {
    title: `${name} | ${brand} - Authentic K-Beauty`,
    description: `${cleanDescription || `Buy authentic ${name} in Bangladesh from Cherry Glow. Best price ৳${price}. Nationwide delivery available.`}`,
    keywords: `${name}, ${brand}, ${category}, Korean Skincare Bangladesh, Cherry Glow, K-Beauty`,
    alternates: {
      canonical: productUrl,
    },
    openGraph: {
      title: `${name} | ৳${price}`,
      description: cleanDescription || `Shop ${name} authentic Korean skincare with fast delivery in Bangladesh.`,
      url: productUrl,
      siteName: "Cherry Glow Korea",
      locale: "bn_BD",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: `${name} - ${brand}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: `${name} - Cherry Glow`,
      description: cleanDescription,
      images: [imageUrl],
    },
  };
}

/**
 * Server Component Page rendering JSON-LD Product Schema & Interactive UI
 */
export default async function Page({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return <ProductDetailsClient id={id} />;
  }

  const name = product.name || "Product";
  const rawDesc = product.summary || product.description || product.useCase || "";
  const cleanDescription = Array.isArray(rawDesc)
    ? rawDesc.join(" ")
    : String(rawDesc).replace(/<[^>]*>/g, "").substring(0, 300);

  const price = product.type === "combo"
    ? (product.salePrice || product.price || 0)
    : (product.salePrice || product.variants?.[0]?.price || product.price || 0);

  const images = [
    product.image,
    product.thumbnail,
    ...(product.images?.map((i: any) => i?.url) || []),
  ].filter(Boolean);

  const stock = product.type === "combo" ? (product.stock || 0) : (product.variants?.[0]?.stock || product.stock || 10);
  const brandName = product.brand?.name || product.brand || "Cherry Glow";
  const ratingValue = product.rating || 5.0;
  const reviewCount = product.numReviews || 1;

  /* ---------------- Google JSON-LD Product Schema Markup ---------------- */
  const jsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": name,
    "image": images.length > 0 ? images : ["https://cherryglowkorea.com/og-image.jpg"],
    "description": cleanDescription || `Authentic ${name} from ${brandName}`,
    "sku": product._id || id,
    "mpn": product._id || id,
    "brand": {
      "@type": "Brand",
      "name": brandName,
    },
    "offers": {
      "@type": "Offer",
      "url": `https://cherryglowkorea.com/products/${id}`,
      "priceCurrency": "BDT",
      "price": Number(price),
      "priceValidUntil": "2027-12-31",
      "itemCondition": "https://schema.org/NewCondition",
      "availability": stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": "Cherry Glow Korea",
      },
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": Number(ratingValue),
      "reviewCount": Number(reviewCount),
    },
  };

  return (
    <>
      {/* Server-Side Google E-Commerce Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailsClient initialProduct={product} id={id} />
    </>
  );
}
