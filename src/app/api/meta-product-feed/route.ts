import { NextResponse, NextRequest } from "next/server";
import { getDatabase } from "@/lib/mongodb";
import { generateMetaProductFeedXml } from "@/lib/metaFeed";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    let products: any[] = [];

    // Dynamically derive host & protocol for full product and image links
    const host = request.headers.get("host") || "localhost:3000";
    const protocol =
      request.headers.get("x-forwarded-proto") ||
      (host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https");
    const baseUrl = `${protocol}://${host}`;

    try {
      const db = await getDatabase();
      products = await db
        .collection("products")
        .find({ status: { $ne: "inactive" } })
        .sort({ createdAt: -1 })
        .toArray();
    } catch (dbError) {
      console.error("Direct MongoDB query error in API route, falling back to API:", dbError);
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://cherry-glow-database.onrender.com";
      const res = await fetch(`${apiUrl}/products/allProduct/public?limit=1000`, {
        next: { revalidate: 60 },
      });
      if (res.ok) {
        const data = await res.json();
        products = Array.isArray(data) ? data : data.products || [];
      }
    }

    const xmlFeed = generateMetaProductFeedXml(products, baseUrl);

    return new NextResponse(xmlFeed, {
      status: 200,
      headers: {
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400",
      },
    });
  } catch (error: any) {
    console.error("Meta product feed route error:", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><error><message>${error?.message || "Internal Server Error"}</message></error>`,
      {
        status: 500,
        headers: { "Content-Type": "application/xml; charset=utf-8" },
      }
    );
  }
}
