import type { Metadata } from "next";
import GamesClient from "./GamesClient";

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
  const title = `الألعاب | ${siteName}`;
  const description = `تسوق أحدث الألعاب وبطاقات الشحن بأفضل الأسعار في ${siteName}. شحن سريع وضمان معتمد.`;
  const ogImageUrl = company.logo
    ? (company.logo.startsWith("http") ? company.logo : `${SITE_URL}${company.logo}`)
    : `${SITE_URL}/web-app-manifest-512x512.png`;
  return {
    title,
    description,
    keywords: ["ألعاب", "بلاي ستيشن", "Xbox", "بطاقات شحن", "أقساط", "السعودية", siteName],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/games`,
      title,
      description,
      siteName,
      locale: "ar_SA",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImageUrl] },
    alternates: { canonical: `${SITE_URL}/games` },
  };
}

async function getGamesProducts() {
  try {
    const r = await fetch(
      `${BACKEND}/api/products?category=${encodeURIComponent("اكسسورات,gaming,mice-keyboards,microphone,figures,rgb")}&limit=50`,
      { next: { revalidate: 18000, tags: ["products"] } }
    );
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data)) return data;
    }
  } catch {}
  return [];
}

export default async function GamesPage() {
  const products = await getGamesProducts();
  return <GamesClient initialProducts={products} />;
}
