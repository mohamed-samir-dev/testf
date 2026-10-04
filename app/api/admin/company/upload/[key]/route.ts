import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { getBackend, forwardCookies } from "../../../_lib";

const ALLOWED_COMPANY_KEYS = new Set(["logo", "header", "footer", "stamp", "cancelStamp"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

export async function POST(req: NextRequest, { params }: { params: Promise<{ key: string }> }) {
  try {
    const { key } = await params;
    if (!ALLOWED_COMPANY_KEYS.has(key)) {
      return NextResponse.json({ error: "حقل غير مسموح" }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;
    if (!file) {
      return NextResponse.json({ error: "لم يتم رفع أي ملف" }, { status: 400 });
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return NextResponse.json({ error: "حجم الصورة يتجاوز الحد المسموح (5 ميغابايت)" }, { status: 400 });
    }

    const res = await fetch(
      `${getBackend()}/api/admin/company/upload/${key}`,
      forwardCookies(req, { method: "POST", body: formData })
    );
    const data = await res.json();
    if (res.ok) revalidateTag("company", "max");
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("POST /api/admin/company/upload proxy error:", err);
    return NextResponse.json({ error: "خطأ في رفع الصورة" }, { status: 500 });
  }
}

