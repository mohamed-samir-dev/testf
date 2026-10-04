import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../_lib";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search;
  const res = await fetch(`${getBackend()}/api/admin/reviews/all${search}`, forwardCookies(req, {
    cache: "no-store",
  }));
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
