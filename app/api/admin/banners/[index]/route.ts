import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getBackend, forwardCookies } from "../../_lib";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ index: string }> }) {
  const { index } = await params;
  const res = await fetch(`${getBackend()}/api/admin/banners/${index}`, forwardCookies(req, { method: "DELETE" }));
  const data = await res.json();
  // Invalidate banner ISR cache so Banner.tsx reflects the deletion immediately.
  if (res.ok) revalidateTag("banners", "max");
  return NextResponse.json(data, { status: res.status });
}
