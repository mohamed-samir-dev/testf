import { NextResponse } from "next/server";
import { getBackend } from "../../admin/_lib";

// Public company endpoint — no cookies, no auth.
// Returns only the fields needed by client components (Navbar logo, WhatsApp button).
// Separated from /api/admin/company so that forwardCookies on the admin route
// does not prevent Data Cache from activating here.
// Route Handler-level cache: 3600s — company data changes at most a few times/year.
// Cache behavior: Expected from configuration, not verified by Vercel telemetry.
export const revalidate = 18000;

export async function GET() {
  try {
    const res = await fetch(`${getBackend()}/api/admin/company`, {
      next: { revalidate: 18000, tags: ["company"] },
    });
    if (!res.ok) return NextResponse.json({}, { status: 200 });
    const data = await res.json();
    return NextResponse.json(
      {
        logo: data.logo ?? "",
        nameAr: data.nameAr ?? "",
        nameEn: data.nameEn ?? "",
        phone: data.phone ?? "",
        whatsapp: data.whatsapp ?? "",
        email: data.email ?? "",
        website: data.website ?? "",
        details: data.details ?? "",
      },
      { status: 200 }
    );
  } catch {
    return NextResponse.json({}, { status: 200 });
  }
}
