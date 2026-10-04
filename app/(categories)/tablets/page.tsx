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

async function getTabletsProducts(): Promise<Product[]> {
  try {
    const [tabletRes, appleRes] = await Promise.all([
      fetch(`${BACKEND}/api/products?category=tablet`, { next: { revalidate: 18000, tags: ["products"] } }),
      fetch(`${BACKEND}/api/products?brand=Apple`, { next: { revalidate: 18000, tags: ["products"] } }),
    ]);
    const [tablets, appleProds] = await Promise.all([
      tabletRes.ok ? tabletRes.json() : [],
      appleRes.ok ? appleRes.json() : [],
    ]);
    const ipads = Array.isArray(appleProds)
      ? appleProds.filter((p: Product) =>
          p.name?.toLowerCase().includes("ipad") ||
          p.name?.includes("ايباد") ||
          p.name?.includes("آيباد")
        )
      : [];
    const seen = new Set<string>();
    const merged: Product[] = [];
    for (const p of [...(Array.isArray(tablets) ? tablets : []), ...ipads]) {
      if (p?._id && !seen.has(p._id)) {
        seen.add(p._id);
        merged.push(p);
      }
    }
    return merged;
  } catch {}
  return [];
}

export async function generateMetadata(): Promise<Metadata> {
  const company = await getCompany();
  const siteName = company.nameAr || "برج المبدع للتقنية";
  const title = `الأجهزة اللوحية ايبادات | ${siteName}`;
  const description = `تسوق أحدث أجهزة أيباد والأجهزة اللوحية بأفضل الأسعار وبالأقساط في ${siteName}.`;
  const logoUrl = company.logo
    ? (company.logo.startsWith("http") ? company.logo : `${SITE_URL}${company.logo}`)
    : `${SITE_URL}/web-app-manifest-512x512.png`;
  return {
    title,
    description,
    keywords: ["ايباد", "iPad", "أجهزة لوحية", "تابلت", "أبل", "أقساط", "السعودية", siteName],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/tablets`,
      title,
      description,
      siteName,
      locale: "ar_SA",
      images: logoUrl ? [{ url: logoUrl, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: { card: "summary_large_image", title, description, images: logoUrl ? [logoUrl] : [] },
    alternates: { canonical: `${SITE_URL}/tablets` },
  };
}

export default async function TabletsPage() {
  const products = await getTabletsProducts();
  return (
    <CategoryLayout
      title="الأجهزة اللوحية ايبادات"
      parentLabel="الأجهزة اللوحية ايبادات"
      parentHref="/tablets"
      products={products}
      loading={false}
      emptyIcon="📱"
    />
  );
}
