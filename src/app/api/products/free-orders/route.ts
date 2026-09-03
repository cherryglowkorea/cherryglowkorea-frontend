// Rendering Strategy: Force-Dynamic Route Handler — Zero caching for real-time promotional gift stock & free-order availability.
export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    searchParams.set("type", "free");

    const backendUrl = `${API_BASE}/products/allProduct/public?${searchParams.toString()}`;

    const res = await fetch(backendUrl, {
      cache: "no-store",
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        { success: false, message: "Failed to fetch free-order products" },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
