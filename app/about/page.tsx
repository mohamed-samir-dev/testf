import type { Metadata } from "next";
import AboutClient from "./AboutClient";

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
  const title = `عن ${siteName}`;
  const description = company.details || `تعرف على ${siteName} - رؤيتنا وخدماتنا في بيع الأجهزة الإلكترونية بالأقساط داخل المملكة العربية السعودية.`;
  const ogImageUrl = company.logo
    ? (company.logo.startsWith("http") ? company.logo : `${SITE_URL}${company.logo}`)
    : `${SITE_URL}/web-app-manifest-512x512.png`;
  return {
    title,
    description,
    keywords: [siteName, "عن المؤسسة", "أجهزة إلكترونية بالأقساط", "السعودية"],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/about`,
      title,
      description,
      locale: "ar_SA",
      siteName,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title }],
    },
    twitter: { card: "summary_large_image", title, description, images: [ogImageUrl] },
    alternates: { canonical: `${SITE_URL}/about` },
  };
}

export default async function AboutPage() {
  const company = await getCompany();
  return <AboutClient initialCompany={company} />;
}
