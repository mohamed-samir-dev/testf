import { NextResponse } from "next/server";
import { getBackend } from "../admin/_lib";

// Cache the public company endpoint — data changes only when admin updates it
// (on-demand revalidation via revalidateTag("company") handles that).
// This prevents repeated backend round-trips for the logo/name used by Navbar.
export const revalidate = 18000;

export async function GET() {
  try {
    const res = await fetch(`${getBackend()}/api/admin/company`, {
      next: { revalidate: 18000, tags: ["company"] },
    });
    if (!res.ok) return NextResponse.json({}, { status: 200 });
    const data = await res.json();
    return NextResponse.json(data, { status: 200 });
  } catch {
    return NextResponse.json({}, { status: 200 });
  }
}
