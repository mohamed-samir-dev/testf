import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getBackend, forwardCookies } from "../../_lib";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const res = await fetch(`${getBackend()}/api/admin/reviews/admin-add`, forwardCookies(req, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }));
  const data = await res.json();
  // ✅ FIX #3: flush if the new review was created as approved (visible on homepage immediately)
  if (res.ok && data?.approved) revalidateTag("reviews", "max");
  return NextResponse.json(data, { status: res.status });
}
