import type { Metadata } from "next";
import AudioClient from "./AudioClient";

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
  const title = `أجهزة صوت وسماعات | ${siteName}`;
  const description = `تسوق سماعات أبل وأجهزة الصوت بأفضل الأسعار في ${siteName}. شحن سريع وضمان معتمد.`;
  const logoUrl = company.logo
    ? (company.logo.startsWith("http") ? company.logo : `${SITE_URL}${company.logo}`)
    : `${SITE_URL}/web-app-manifest-512x512.png`;
  return {
    title,
    description,
    keywords: ["سماعات", "أجهزة صوت", "AirPods", "أبل", "أقساط", "السعودية", siteName],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/audio`,
      title,
      description,
      siteName,
      locale: "ar_SA",
      images: logoUrl ? [{ url: logoUrl, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: { card: "summary_large_image", title, description, images: logoUrl ? [logoUrl] : [] },
    alternates: { canonical: `${SITE_URL}/audio` },
  };
}

async function getAudioProducts() {
  try {
    const r = await fetch(
      `${BACKEND}/api/products?category=${encodeURIComponent("سماعات ابل,speaker,earbuds")}&limit=50`,
      { next: { revalidate: 18000, tags: ["products"] } }
    );
    if (r.ok) {
      const data = await r.json();
      if (Array.isArray(data)) return data;
    }
  } catch {}
  return [];
}

export default async function AudioPage() {
  const products = await getAudioProducts();
  return <AudioClient initialProducts={products} />;
}
