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

async function getLaptopsProducts(): Promise<Product[]> {
  try {
    const r = await fetch(
      `${BACKEND}/api/products?category=${encodeURIComponent("laptop,ماك بوك إير,monitor")}`,
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
  const title = `لابتوبات وشاشات | ${siteName}`;
  const description = `تسوق أحدث أجهزة ماك بوك ولابتوبات وشاشات بأفضل الأسعار وبالأقساط في ${siteName}.`;
  const logoUrl = company.logo
    ? (company.logo.startsWith("http") ? company.logo : `${SITE_URL}${company.logo}`)
    : `${SITE_URL}/web-app-manifest-512x512.png`;
  return {
    title,
    description,
    keywords: ["لابتوبات", "ماك بوك", "MacBook", "شاشات", "أقساط", "السعودية", siteName],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/laptops`,
      title,
      description,
      siteName,
      locale: "ar_SA",
      images: logoUrl ? [{ url: logoUrl, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: { card: "summary_large_image", title, description, images: logoUrl ? [logoUrl] : [] },
    alternates: { canonical: `${SITE_URL}/laptops` },
  };
}

export default async function LaptopsPage() {
  const products = await getLaptopsProducts();
  return (
    <CategoryLayout
      title="لابتوبات وشاشات"
      parentLabel="لابتوبات وشاشات"
      parentHref="/laptops"
      products={products}
      loading={false}
      emptyIcon="💻"
    />
  );
}
