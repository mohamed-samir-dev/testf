import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../_lib";

// GET /api/admin/main-categories/extra
// Admin-only endpoint — requires auth cookie (authMiddleware on the backend).
// forwardCookies is intentional here: the cookie carries the admin JWT.
// Side-effect: Next.js Data Cache is bypassed because the cookie header varies
// per request. This is CORRECT for an admin view that must always show live data
// (category counts change with every product mutation).
// No next:{tags} or cache:"force-cache" — admin pages should never be stale.
export async function GET(req: NextRequest) {
  const res = await fetch(`${getBackend()}/api/admin/main-categories/extra`, forwardCookies(req, {}));
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
