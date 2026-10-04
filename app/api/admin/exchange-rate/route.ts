import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getBackend, forwardCookies } from "../_lib";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(
      `${getBackend()}/api/admin/exchange-rate`,
      forwardCookies(req, { cache: "no-store" })
    );
    if (!res.ok)
      return NextResponse.json({ error: "Backend unavailable" }, { status: res.status });
    const data = await res.json();
    return NextResponse.json(data, {
      status: res.status,
      headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
    });
  } catch (err) {
    console.error("GET /api/admin/exchange-rate proxy error:", err);
    return NextResponse.json({ error: "خطأ في الاتصال بالخادم" }, { status: 502 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(
      `${getBackend()}/api/admin/exchange-rate`,
      forwardCookies(req, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
    );
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      return NextResponse.json(
        { error: (errData as { error?: string }).error || "Backend unavailable" },
        { status: res.status }
      );
    }
    const data = await res.json();
    // Flush any cached product responses that embed the exchange rate.
    // next/cache revalidateTag requires a cache-life profile as second arg in Next.js 16.
    revalidateTag("products", "max");
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("PUT /api/admin/exchange-rate proxy error:", err);
    return NextResponse.json({ error: "خطأ في الاتصال بالخادم" }, { status: 502 });
  }
}
