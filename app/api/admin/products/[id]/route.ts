import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getBackend, forwardCookies } from "../../_lib";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${getBackend()}/api/admin/products/${id}`, forwardCookies(req, { method: "GET" }));
  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const contentType = req.headers.get("content-type") || "";
  const body = await req.arrayBuffer();
  const res = await fetch(`${getBackend()}/api/admin/products/${id}`, {
    ...forwardCookies(req, { method: "PUT" }),
    body: Buffer.from(body),
    headers: {
      ...(forwardCookies(req, {}).headers as Record<string, string>),
      "content-type": contentType,
    },
    // @ts-expect-error duplex needed for streaming body
    duplex: "half",
  });
  const data = await res.json();
  // Flush homepage product ISR cache and specific product cache immediately after any product update.
  if (res.ok) {
    revalidateTag("products", "max");
    revalidateTag(`product-${id}`, "max");
  }
  return NextResponse.json(data, { status: res.status });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const res = await fetch(`${getBackend()}/api/admin/products/${id}`, forwardCookies(req, { method: "DELETE" }));
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  // Flush homepage product ISR cache and specific product cache immediately after deletion.
  if (res.ok) {
    revalidateTag("products", "max");
    revalidateTag(`product-${id}`, "max");
  }
  return NextResponse.json(data, { status: res.status });
}
