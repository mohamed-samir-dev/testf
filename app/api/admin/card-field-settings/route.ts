import { NextRequest, NextResponse } from "next/server";
import { getBackend, forwardCookies } from "../_lib";

const path = "/api/admin/card-field-settings";

export async function GET(req: NextRequest) {
  try {
    const res = await fetch(`${getBackend()}${path}`, forwardCookies(req, {}));
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch {
    return NextResponse.json({ error: "Backend unavailable" }, { status: 503 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const res = await fetch(`${getBackend()}${path}`, forwardCookies(req, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }));
    const text = await res.text();
    console.log("[PATCH] backend status:", res.status, "body:", text);
    let data: unknown;
    try { data = JSON.parse(text); } catch { data = { error: text }; }
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    console.error("[PATCH] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
