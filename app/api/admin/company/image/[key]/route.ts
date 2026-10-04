import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getBackend, forwardCookies } from "../../../_lib";

const ALLOWED_COMPANY_KEYS = new Set(["logo", "header", "footer", "stamp", "cancelStamp"]);

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params;
    if (!ALLOWED_COMPANY_KEYS.has(key)) {
      return NextResponse.json({ error: "حقل غير مسموح" }, { status: 400 });
    }

    const res = await fetch(
      `${getBackend()}/api/admin/company/image/${key}`,
      forwardCookies(req, { method: "DELETE" })
    );
    const data = await res.json();
    if (res.ok) revalidateTag("company", "max");
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("DELETE /api/admin/company/image proxy error:", err);
    return NextResponse.json({ error: "خطأ في حذف الصورة" }, { status: 500 });
  }
}

