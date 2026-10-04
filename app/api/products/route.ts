import { NextRequest } from "next/server";
import { getBackend } from "../admin/_lib";

// Route Handler-level cache — makes this route ○ Static in Next.js build output.
// With this directive the Vercel Function is NOT invoked on a cache hit;
// the full response is served from Full Route Cache for 60 seconds.
// Public endpoint, no cookies, no user-specific data.
// Cache behavior: Expected from configuration, not verified by Vercel telemetry.
export const revalidate = 60;

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") || "";
  const brand = req.nextUrl.searchParams.get("brand") || "";
  const category = req.nextUrl.searchParams.get("category") || "";
  const limit = req.nextUrl.searchParams.get("limit") || "";
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (brand) params.set("brand", brand);
  if (category) params.set("category", category);
  if (limit) params.set("limit", limit);
  const res = await fetch(`${getBackend()}/api/products?${params.toString()}`, {
    method: "GET",
    next: { revalidate: 60 },
  });
  // Stream backend JSON directly — no parse/stringify on this Function.
  return new Response(res.body, {
    status: res.status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
    },
  });
}
