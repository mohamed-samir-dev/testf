import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../../../_lib";

export async function POST(req: NextRequest, { params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const body = await req.arrayBuffer();
  const contentType = req.headers.get("content-type") || "";
  const res = await fetch(
    `${getBackend()}/api/admin/sub-categories/image/${encodeURIComponent(category)}`,
    forwardCookies(req, {
      method: "POST",
      headers: { "content-type": contentType },
      body,
    })
  );
  const data = await res.json();
  if (res.ok) revalidateTag("categories", "max");
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const res = await fetch(
    `${getBackend()}/api/admin/sub-categories/image/${encodeURIComponent(category)}`,
    forwardCookies(req, { method: "DELETE" })
  );
  const data = await res.json();
  if (res.ok) revalidateTag("categories", "max");
  return NextResponse.json(data, { status: res.status });
}
