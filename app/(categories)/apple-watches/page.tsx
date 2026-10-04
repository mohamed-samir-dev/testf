import type { Metadata } from "next";
import CategoryLayout from "../../components/products/CategoryLayout";
import type { Product } from "../../components/products/types";

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

async function getAppleWatchesProducts(): Promise<Product[]> {
  try {
    const r = await fetch(
      `${BACKEND}/api/products?category=${encodeURIComponent("ساعات ابل")}`,
      { next: { revalidate: 18000, tags: ["products"] } }
    );
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data)) return data;
    }
  } catch {}
  return [];
}

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  const siteName = company.nameAr || "برج المبدع للتقنية";
  const title = `ساعات أبل | ${siteName}`;
  const description = `تسوق أحدث ساعات أبل الذكية بأفضل الأسعار وبالأقساط في ${siteName}.`;
  const logoUrl = company.logo
    ? (company.logo.startsWith("http") ? company.logo : `${SITE_URL}${company.logo}`)
    : `${SITE_URL}/web-app-manifest-512x512.png`;
  return {
    title,
    description,
    keywords: ["ساعات ابل", "Apple Watch", "ساعات ذكية", "أقساط", "السعودية", siteName],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/apple-watches`,
      title,
      description,
      siteName,
      locale: "ar_SA",
      images: logoUrl ? [{ url: logoUrl, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: { card: "summary_large_image", title, description, images: logoUrl ? [logoUrl] : [] },
    alternates: { canonical: `${SITE_URL}/apple-watches` },
  };
}

export default async function AppleWatchesPage() {
  const products = await getAppleWatchesProducts();
  return (
    <CategoryLayout
      title="ساعات أبل"
      parentLabel="ساعات أبل"
      parentHref="/apple-watches"
      products={products}
      loading={false}
      emptyIcon="⌚"
    />
  );
}
