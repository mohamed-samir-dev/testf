import type { Metadata } from "next";
import PrivacyClient from "./PrivacyClient";

const BACKEND = process.env.BACKEND_URL || "https://burj-phone-backend.vercel.app";
const SITE_URL = "https://burjjstorre.com";

export const revalidate = 18000;

async function getCompany() {
  try {
    const r = await fetch(`${BACKEND}/api/admin/company`, {
      next: { revalidate: 18000, tags: ["company"] },
    });
    return r.ok ? r.json() : {};
  } catch {
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  const siteName = company.nameAr || "برج المبدع للتقنية";
  const title = `سياسة الخصوصية | ${siteName}`;
  const description = `سياسة الخصوصية واتفاقية الاستخدام - الشروط العامة المنظمة لاستخدام موقع ${siteName}.`;
  const ogImageUrl = company.logo
    ? (company.logo.startsWith("http") ? company.logo : `${SITE_URL}${company.logo}`)
    : `${SITE_URL}/web-app-manifest-512x512.png`;
  return {
    title,
    description,
    keywords: ["سياسة الخصوصية", "شروط الاستخدام", siteName, "السعودية"],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/privacy`,
      title,
      description,
      locale: "ar_SA",
      siteName,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImageUrl] },
    alternates: { canonical: `${SITE_URL}/privacy` },
  };
}

export default async function PrivacyPage() {
  const company = await getCompany();
  return <PrivacyClient initialCompany={company} />;
}
