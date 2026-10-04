import { NextRequest, NextResponse } from "next/server";

export function getBackend(): string {
  const url = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "https://burj-phone-backend.vercel.app";
  return url.replace(/\/$/, "");
}

export function forwardCookies(req: NextRequest, init: RequestInit = {}): RequestInit {
  const cookieHeader = req.headers.get("cookie") || "";
  const tokenFromCookies = req.cookies.get("admin_token")?.value;
  const tokenFromHeader = cookieHeader.match(/(?:^|;\s*)admin_token=([^;]+)/)?.[1];
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;

  const token = tokenFromCookies || tokenFromHeader || bearerToken || null;

  let mergedCookie = cookieHeader;
  if (token && !mergedCookie.includes("admin_token=")) {
    mergedCookie = mergedCookie ? `${mergedCookie}; admin_token=${token}` : `admin_token=${token}`;
  }

  const existingHeaders = (init.headers as Record<string, string>) || {};

  return {
    ...init,
    headers: {
      ...existingHeaders,
      ...(mergedCookie ? { cookie: mergedCookie } : {}),
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
  };
}

export function handleAdminResponse(res: Response, data: unknown): NextResponse {
  const response = NextResponse.json(data, { status: res.status });
  if (res.status === 401) {
    const isProd = process.env.NODE_ENV === "production";
    response.cookies.set("admin_token", "", {
      maxAge: 0,
      path: "/",
      httpOnly: true,
      secure: isProd,
      sameSite: "lax",
    });
  }
  return response;
}
