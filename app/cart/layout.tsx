import type { Metadata } from "next";

const BACKEND = process.env.BACKEND_URL || "https://burj-phone-backend.vercel.app";
const SITE_URL = "https://burjjstorre.com";

async function getCompany() {
  try {
    const r = await fetch(`${BACKEND}/api/admin/company`, { next: { revalidate: 18000 } });
    return r.ok ? r.json() : {};
  } catch { return {}; }
}

export async function generateMetadata(): Promise<Metadata> {
  const c = await getCompany();
  return {
    title: "سلة التسوق",
    description: c.details || "راجع منتجاتك وأكمل طلبك بسهولة.",
    robots: { index: false, follow: false },
    alternates: { canonical: `${SITE_URL}/cart` },
  };
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
  return children;
}
