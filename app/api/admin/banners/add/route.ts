import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getBackend, forwardCookies } from "../../_lib";

export async function POST(req: NextRequest) {
  const res = await fetch(`${getBackend()}/api/admin/banners/add`, forwardCookies(req, { method: "POST" }));
  const data = await res.json();
  // Invalidate banner ISR cache so Banner.tsx shows the new banner immediately.
  if (res.ok) revalidateTag("banners", "max");
  return NextResponse.json(data, { status: res.status });
}
