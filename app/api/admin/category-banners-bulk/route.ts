import { NextRequest } from "next/server";
import { getBackend } from "../_lib";

// Route Handler-level cache — 300s TTL.
// Public endpoint, no auth, no cookies. Full Route Cache active.
// Cache behavior: Expected from configuration, not verified by Vercel telemetry.
export const revalidate = 300;

// Verified: /api/admin/category-banners-bulk is a public endpoint — no auth
// middleware in backend (adminRoutes.js line 1063: router.get("/category-banners-bulk", async ...)).
// No cookies or user-specific data involved.
// Double-JSON eliminated: backend JSON body is streamed directly to the client.
// Cache behavior: Expected from configuration, not verified by Vercel telemetry.
export async function GET(req: NextRequest) {
  const categories = req.nextUrl.searchParams.get("categories") || "";
  const res = await fetch(
    `${getBackend()}/api/admin/category-banners-bulk?categories=${encodeURIComponent(categories)}`,
    { next: { revalidate: 300, tags: ["category-banners", "banners"] } }
  );
  return new Response(res.body, {
    status: res.status,
    headers: { "Content-Type": "application/json" },
  });
}
