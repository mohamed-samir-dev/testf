import { NextRequest, NextResponse } from "next/server";
import { getBackend } from "../_lib";

export async function GET(req: NextRequest) {
  const res = await fetch(`${getBackend()}/api/checkout/csrf-token`, {
    headers: { cookie: req.headers.get("cookie") || "" },
  });
  const data = await res.json().catch(() => ({}));
  const response = NextResponse.json(data, { status: res.status });
  // Set csrf_token cookie directly on the response for the browser
  if (data.csrfToken) {
    response.cookies.set("csrf_token", data.csrfToken, {
      httpOnly: false,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
  }
  return response;
}
