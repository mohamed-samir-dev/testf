import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getBackend, forwardCookies } from "../_lib";

export async function GET(req: NextRequest) {
  // Forward pagination/search query params (?page, ?limit, ?q, ?category)
  // directly to the backend so filtering and slicing happen in the database,
  // not in the browser.
  const { searchParams } = req.nextUrl;
  const qs = searchParams.toString();
  const url = `${getBackend()}/api/admin/products${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, forwardCookies(req, { method: "GET" }));
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function POST(req: NextRequest) {
  const contentType = req.headers.get("content-type") || "";
  const body = await req.arrayBuffer();
  const res = await fetch(`${getBackend()}/api/admin/products`, {
    ...forwardCookies(req, { method: "POST" }),
    body: Buffer.from(body),
    headers: {
      ...(forwardCookies(req, {}).headers as Record<string, string>),
      "content-type": contentType,
    },
    // @ts-expect-error duplex needed for streaming body
    duplex: "half",
  });
  const data = await res.json();
  // Flush homepage product ISR cache so the new product appears immediately.
  if (res.ok) revalidateTag("products", "max");
  return NextResponse.json(data, { status: res.status });
}
