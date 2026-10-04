import { NextRequest } from "next/server";
import { getBackend, forwardCookies, handleAdminResponse } from "../../../_lib";

// ---------------------------------------------------------------------------
// GET /api/admin/orders/[id]/invoice
//
// Proxies to the backend consolidated endpoint /api/checkout/:id/invoice which:
//   1. Fetches order and company in parallel
//   2. Performs a single batch query for product images (Product.find({ _id: { $in: ... } }))
//   3. Returns { order, company } in ONE single round trip, eliminating N+1 DB calls.
// ---------------------------------------------------------------------------

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const backend = getBackend();
  const cookies = forwardCookies(req, { cache: "no-store" });

  const res = await fetch(`${backend}/api/checkout/${id}/invoice`, cookies);
  const data = await res.json().catch(() => ({}));
  return handleAdminResponse(res, data);
}
