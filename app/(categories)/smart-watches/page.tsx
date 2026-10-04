import type { Metadata } from "next";
import Link from "next/link";

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
  const title = `الساعات الذكية | ${siteName}`;
  const description = `تسوق أحدث الساعات الذكية بأفضل الأسعار وبالأقساط في ${siteName}. Apple Watch وأكثر.`;
  const logoUrl = company.logo
    ? (company.logo.startsWith("http") ? company.logo : `${SITE_URL}${company.logo}`)
    : `${SITE_URL}/web-app-manifest-512x512.png`;
  return {
    title,
    description,
    keywords: ["ساعات ذكية", "Apple Watch", "أبل ووتش", "أقساط", "السعودية", siteName],
    openGraph: {
      type: "website",
      url: `${SITE_URL}/smart-watches`,
      title,
      description,
      siteName,
      locale: "ar_SA",
      images: logoUrl ? [{ url: logoUrl, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: { card: "summary_large_image", title, description, images: logoUrl ? [logoUrl] : [] },
    alternates: { canonical: `${SITE_URL}/smart-watches` },
  };
}

export default async function SmartWatchesPage() {
  return (
    <main className="min-h-screen bg-gray-50" dir="rtl">
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-400 mb-2">
            <Link href="/" className="hover:text-purple-600 transition">الرئيسية</Link>
            <span>/</span>
            <span className="text-gray-600">الساعات الذكية</span>
          </div>
          <h1 className="text-lg sm:text-2xl font-bold text-gray-800">الساعات الذكية</h1>
          <p className="text-xs sm:text-sm text-gray-500">جميع المنتجات المتوفرة</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          <Link
            href="/smart-watches/smart-watches"
            className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200 flex flex-col items-center gap-2 text-center group"
          >
            <div className="w-12 h-12 rounded-full bg-purple-50 flex items-center justify-center text-2xl group-hover:bg-purple-100 transition">
              ⌚
            </div>
            <p className="text-sm font-medium text-gray-700 group-hover:text-purple-700 transition leading-tight">
              الساعات الذكية
            </p>
          </Link>
        </div>
      </div>
    </main>
  );
}
