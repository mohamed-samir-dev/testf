import { NextRequest, NextResponse } from "next/server";

function isJwtExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const jsonStr = atob(base64);
    const payload = JSON.parse(jsonStr);
    if (!payload.exp) return false;
    // Use a 30-second buffer so minor clock drift between the frontend edge
    // and the backend doesn't cause premature "session expired" redirects.
    return Math.floor(Date.now() / 1000) >= payload.exp - 30;
  } catch {
    return true;
  }
}

export default function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  if (host.includes("burj-almubdia.com")) {
    return NextResponse.redirect(
      new URL(req.nextUrl.pathname + req.nextUrl.search, "https://burjjstorre.com"),
      301
    );
  }

  const { pathname } = req.nextUrl;
  const token = req.cookies.get("admin_token")?.value;
  const isAuthValid = !!token && !isJwtExpired(token);

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!isAuthValid) {
      const res = NextResponse.redirect(new URL("/admin/login", req.url));
      if (token) {
        res.cookies.set("admin_token", "", { maxAge: 0, path: "/" });
      }
      return res;
    }
  }

  if (pathname === "/admin/login") {
    if (isAuthValid) {
      return NextResponse.redirect(new URL("/admin/dashboard", req.url));
    }
    // If token exists but is expired, clear it so login page is clean
    if (token && !isAuthValid) {
      const res = NextResponse.next();
      res.cookies.set("admin_token", "", { maxAge: 0, path: "/" });
      res.headers.set("x-pathname", pathname);
      return res;
    }
  }

  const res = NextResponse.next();
  res.headers.set("x-pathname", pathname);
  return res;
}

export const config = {
  // Edge middleware runs exclusively on /admin routes.
  matcher: ["/admin/:path*"],
};
