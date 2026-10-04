import type { Metadata } from "next";
import ReturnPolicyClient from "./ReturnPolicyClient";

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
  const title = `سياسة الاستبدال والاسترجاع | ${siteName}`;
  const description = `الشروط المنظمة لطلبات الإلغاء والاستبدال والاسترجاع داخل ${siteName}.`;
  const ogImageUrl = company.logo
    ? (company.logo.startsWith("http") ? company.logo : `${SITE_URL}${company.logo}`)
    : `${SITE_URL}/web-app-manifest-512x512.png`;
  return {
    title,
    description,
    keywords: ["سياسة الاسترجاع", "استبدال", "إلغاء طلب", siteName, "السعودية"],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/return-policy`,
      title,
      description,
      locale: "ar_SA",
      siteName,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImageUrl] },
    alternates: { canonical: `${SITE_URL}/return-policy` },
  };
}

export default async function ReturnPolicyPage() {
  const company = await getCompany();
  return <ReturnPolicyClient initialCompany={company} />;
}
