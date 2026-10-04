import { NextResponse } from "next/server";
import { getBackend } from "../admin/_lib";

// Route Handler-level cache — 300s TTL.
// This opts the handler into Next.js Full Route Cache so that Vercel can
// serve the cached response without invoking the Function for 5 minutes
// after the first execution.
// Conditions verified before adding this directive:
//   - No req parameter (no cookies, no headers, no query params read)
//   - Returns identical public data for every caller
//   - No authentication or user-specific logic
// NOTE: force-dynamic was previously set here but overrides revalidate, disabling caching.
// Removed — revalidate:300 alone is sufficient and correct.
export const revalidate = 300;

export async function GET() {
  try {
    const [settingsRes, maxRes] = await Promise.all([
      fetch(`${getBackend()}/api/admin/sub-categories/home-settings`, {
        next: { revalidate: 300, tags: ["categories"] },
      }),
      fetch(`${getBackend()}/api/admin/sub-categories/max`, {
        next: { revalidate: 300, tags: ["categories"] },
      }),
    ]);
    const settings = settingsRes.ok ? await settingsRes.json() : [];
    const maxData = maxRes.ok ? await maxRes.json() : { max: 4 };
    return NextResponse.json({ settings, max: maxData.max ?? 4 });
  } catch {
    return NextResponse.json({ settings: [], max: 4 });
  }
}
