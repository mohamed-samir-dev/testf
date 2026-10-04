import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getBackend, forwardCookies } from "../../../_lib";

export async function POST(req: NextRequest, { params }: { params: Promise<{ category: string }> }) {
  const { category } = await params;
  const res = await fetch(`${getBackend()}/api/admin/category-banners/${encodeURIComponent(category)}/add`, forwardCookies(req, { method: "POST" }));
  const data = await res.json();
  if (res.ok) {
    revalidateTag("category-banners", "max");
    revalidateTag("banners", "max");
  }
  return NextResponse.json(data, { status: res.status });
}
