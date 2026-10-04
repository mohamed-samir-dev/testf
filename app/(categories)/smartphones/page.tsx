import type { Metadata } from "next";
import SmartphonesClient from "./SmartphonesClient";

// Removed force-dynamic: metadata doesn't change per-request.
// revalidate: 18000 — metadata rebuilt hourly, served from cache otherwise.
export const revalidate = 18000;

const BACKEND = process.env.BACKEND_URL || "https://burj-phone-backend.vercel.app";
const SITE_URL = "https://burjjstorre.com";

async function getCompany() {
  try {
    const r = await fetch(`${BACKEND}/api/admin/company`, { next: { revalidate: 18000 } });
    return r.ok ? r.json() : {};
  } catch {
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  const siteName = company.nameAr || "برج المبدع للتقنية";
  const title = `الهواتف الذكية | ${siteName}`;
  const description = `تسوق أحدث الهواتف الذكية بأفضل الأسعار وبالأقساط في ${siteName}. آيفون، سامسونج، شاومي وأكثر.`;
  const logoUrl = company.logo
    ? (company.logo.startsWith("http") ? company.logo : `${SITE_URL}${company.logo}`)
    : `${SITE_URL}/web-app-manifest-512x512.png`;
  return {
    title,
    description,
    keywords: ["هواتف ذكية", "آيفون", "سامسونج", "شاومي", "أقساط", "السعودية", siteName],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/smartphones`,
      title,
      description,
      siteName,
      locale: "ar_SA",
      images: logoUrl ? [{ url: logoUrl, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: { card: "summary_large_image", title, description, images: logoUrl ? [logoUrl] : [] },
    alternates: { canonical: `${SITE_URL}/smartphones` },
  };
}

async function getSmartphonesProducts() {
  try {
    const [appleRes, samsungRes] = await Promise.all([
      fetch(`${BACKEND}/api/products?brand=Apple&limit=50`, { next: { revalidate: 18000, tags: ["products"] } }),
      fetch(`${BACKEND}/api/products?brand=Samsung&limit=50`, { next: { revalidate: 18000, tags: ["products"] } }),
    ]);
    const [appleProds, samsungProds] = await Promise.all([
      appleRes.ok ? appleRes.json() : [],
      samsungRes.ok ? samsungRes.json() : [],
    ]);
    const allProds = [
      ...(Array.isArray(appleProds) ? appleProds : []),
      ...(Array.isArray(samsungProds) ? samsungProds : []),
    ];
    return allProds.filter((p) =>
      p.category?.includes("ايفون") ||
      p.category?.includes("آيفون") ||
      p.category?.includes("جالكسي") ||
      p.category?.includes("جالاكسي") ||
      p.category?.toLowerCase().includes("iphone") ||
      p.category?.toLowerCase().includes("samsung")
    );
  } catch {}
  return [];
}

export default async function SmartphonesPage() {
  const products = await getSmartphonesProducts();
  return <SmartphonesClient initialProducts={products} />;
}
