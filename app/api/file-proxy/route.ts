import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");
  if (!url) return new NextResponse("missing url", { status: 400 });

  let parsed: URL;
  try {
    parsed = new URL(url);
    const allowedHosts = [
      "res.cloudinary.com",
      "cloudinary.com",
      "burjjstorre.com",
      "burj-phone-backend.vercel.app",
    ];
    const isAllowed = allowedHosts.some(
      (h) => parsed.hostname === h || parsed.hostname.endsWith(`.${h}`)
    );
    if (!["http:", "https:"].includes(parsed.protocol) || !isAllowed) {
      return new NextResponse("Forbidden target URL", { status: 403 });
    }
  } catch {
    return new NextResponse("Invalid URL", { status: 400 });
  }

  const isPdf = /\.pdf($|\?)/i.test(url);
  // Only replace /image/upload/ with /raw/upload/ for PDF files
  const fetchUrl = isPdf
    ? url.replace("/image/upload/", "/raw/upload/").replace(/\/fl_attachment:[^/]+\//, "/")
    : url;

  const res = await fetch(fetchUrl);
  if (!res.ok) return new NextResponse("failed", { status: res.status });

  let contentType = res.headers.get("content-type") || "";
  
  if (!contentType || contentType === "application/octet-stream") {
    if (isPdf) contentType = "application/pdf";
    else if (/\.(jpg|jpeg)($|\?)/i.test(url)) contentType = "image/jpeg";
    else if (/\.png($|\?)/i.test(url)) contentType = "image/png";
    else if (/\.webp($|\?)/i.test(url)) contentType = "image/webp";
    else contentType = "application/pdf";
  }

  return new Response(res.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": "inline",
      "Cache-Control": "public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400",
    },
  });
}
