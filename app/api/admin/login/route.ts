import { NextRequest, NextResponse } from "next/server";
import { getBackend } from "../_lib";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  }

  const backendUrl = getBackend();

  let res: Response;
  try {
    res = await fetch(`${backendUrl}/api/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    return NextResponse.json({ error: "تعذر الاتصال بالخادم" }, { status: 502 });
  }

  let data: Record<string, unknown> = {};
  try {
    data = await res.json();
  } catch {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 502 });
  }

  const response = NextResponse.json(data, { status: res.status });

  if (res.ok) {
    const setCookie = res.headers.get("set-cookie") || "";
    const tokenMatch = setCookie.match(/admin_token=([^;]+)/);
    const token =
      (typeof data?.token === "string" ? data.token : null) ||
      (tokenMatch ? tokenMatch[1] : null);

    if (token) {
      const isProd = process.env.NODE_ENV === "production";
      response.cookies.set("admin_token", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60,
        path: "/",
      });
    }
  }

  return response;
}
