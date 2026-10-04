import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies, handleAdminResponse } from "../_lib";

export async function GET(req: NextRequest) {
  // Forward pagination + search query params to the backend so the DB does
  // the filtering/pagination instead of loading every order into JS memory.
  const { searchParams } = req.nextUrl;
  const qs = searchParams.toString();
  const url = `${getBackend()}/api/checkout${qs ? `?${qs}` : ""}`;
  try {
    const res = await fetch(url, forwardCookies(req, {}));
    const data = await res.json();
    return handleAdminResponse(res, data);
  } catch {
    return NextResponse.json({ orders: [], total: 0, pages: 1 }, { status: 500 });
  }
}
