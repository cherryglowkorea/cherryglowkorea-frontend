import { NextRequest } from "next/server";
import { GET as handleFeed } from "../../meta-product-feed/route";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  return handleFeed(request);
}
