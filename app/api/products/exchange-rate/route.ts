import { NextRequest } from "next/server";
import { getBackend } from "../../admin/_lib";

// Public endpoint — no auth required.
// Cache for 60 s so the exchange rate is available without hitting the backend on every request,
// but stays reasonably fresh if an admin changes it.
export const revalidate = 60;

export async function GET(_req: NextRequest) {
  const res = await fetch(`${getBackend()}/api/products/exchange-rate`, {
    method: "GET",
    next: { revalidate: 60 },
  });
  return new Response(res.body, {
    status: res.status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30",
    },
  });
}
