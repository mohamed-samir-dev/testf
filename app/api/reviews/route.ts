import { NextRequest, NextResponse } from "next/server";
import { getBackend } from "../admin/_lib";

// Route Handler-level cache — 300s TTL.
// Public endpoint, no cookies, no auth. Full Route Cache active.
// ✅ FIX #4: added next:{tags:["reviews"]} so revalidateTag("reviews","max") from
// admin mutation proxies can flush this cache immediately (e.g. after approving/
// deleting a review) instead of waiting the full 300s TTL.
export const revalidate = 300;

export async function GET() {
  try {
    const res = await fetch(`${getBackend()}/api/admin/reviews`, {
      cache: "force-cache",
      next: { revalidate: 300, tags: ["reviews"] }, // ✅ FIX #4: tag added
    });
    return new Response(res.body, {
      status: res.status,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${getBackend()}/api/admin/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
