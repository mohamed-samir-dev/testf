import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getBackend, forwardCookies } from "../../../_lib";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ index: string }> }) {
  const { index } = await params;
  const res = await fetch(`${getBackend()}/api/admin/banners/${index}/image`, forwardCookies(req, { method: "DELETE" }));
  const data = await res.json();
  if (res.ok) revalidateTag("banners", "max");
  return NextResponse.json(data, { status: res.status });
}
