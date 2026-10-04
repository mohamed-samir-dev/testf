import { NextResponse } from "next/server";
import { getBackend } from "../_lib";

// Public cached read — used by Banner.tsx server component.
// revalidate: 18000 means the Vercel Function is NOT invoked on cache hits;
// the full response is served from Full Route Cache for 1 hour.
// On-demand invalidation via revalidateTag("banners") in the mutation routes
// above ensures the cache is flushed immediately when an admin changes banners.
export const revalidate = 18000;

export async function GET() {
  try {
    const res = await fetch(`${getBackend()}/api/admin/banners`, {
      next: { revalidate: 18000, tags: ["banners"] },
    });
    if (!res.ok) return NextResponse.json([], { status: 200 });
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
