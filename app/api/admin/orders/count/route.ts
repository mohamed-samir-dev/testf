import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../_lib";

/**
 * GET /api/admin/orders/count
 *
 * Calls the dedicated lightweight /api/checkout/count endpoint which uses
 * MongoDB estimatedDocumentCount() (O(1) metadata read, 0ms execution, 0 CPU)
 * and in-memory cache on the backend.
 */
export async function GET(req: NextRequest) {
  const url = `${getBackend()}/api/checkout/count`;
  try {
    const res = await fetch(url, forwardCookies(req, { cache: "no-store" }));
    // Return 200 with count:0 for any non-OK response (e.g. 401 when the admin
    // session has expired) so the browser console stays clean. The navbar badge
    // simply shows nothing until the user logs in again.
    if (!res.ok) return NextResponse.json({ count: 0 });
    const data = await res.json();
    const count = typeof data.count === "number" ? data.count : 0;
    return NextResponse.json({ count });
  } catch {
    return NextResponse.json({ count: 0 });
  }
}
