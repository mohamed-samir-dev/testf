import type { Metadata } from "next";
import { Noto_Kufi_Arabic } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import ClientLayout from "./components/ClientLayout";
import Footer from "./components/Footer";

const notoKufiArabic = Noto_Kufi_Arabic({
  subsets: ["arabic"],
  weight: ["300", "400", "500", "700"],
  display: "swap",
});

const BACKEND = process.env.BACKEND_URL || "https://burj-phone-backend.vercel.app";
const SITE_URL = "https://burjjstorre.com";

async function getCompany() {
  try {
    const r = await fetch(`${BACKEND}/api/admin/company`, { next: { revalidate: 18000, tags: ["company"] } });
    return r.ok ? r.json() : {};
  } catch {
    return {};
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const c = await getCompany();

  const siteName = c.nameAr || "برج المبدع ";
  const description = c.details || "برج المبدع  - أجهزة إلكترونية بالأقساط داخل المملكة العربية السعودية. أفضل الأسعار على الجوالات، اللابتوبات، الأجهزة اللوحية والإكسسوارات.";

  // الصورة اللي تظهر على واتساب وتيليجرام - لازم تكون URL كامل ومتاح للعموم
  const ogImageUrl = c.logo
    ? (c.logo.startsWith("http") ? c.logo : `${SITE_URL}${c.logo}`)
    : `${SITE_URL}/web-app-manifest-512x512.png`;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: siteName,
      template: `%s | ${siteName}`,
    },
    description,
    keywords: [
      siteName,
      c.nameEn || "Burj Al-Mubdia Tech",
      "برج المبدع", "برج المبدع ", "أقساط", "جوالات", "لابتوب", "أجهزة إلكترونية",
      "سامسونج", "آبل", "أيفون", "شاومي",
      "السعودية", "الرياض", "جدة",
    ],
    authors: [{ name: siteName, url: SITE_URL }],
    creator: siteName,
    publisher: siteName,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large" },
    },
    icons: {
      icon: [
        { url: "/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
        { url: "/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: [{ url: "/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" }],
    },
    manifest: "/site.webmanifest",
    openGraph: {
      type: "website",
      locale: "ar_SA",
      url: SITE_URL,
      siteName,
      title: siteName,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: siteName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: siteName,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: SITE_URL,
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION || "",
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ar" dir="rtl">
      <body className={`${notoKufiArabic.className} antialiased`} suppressHydrationWarning>
        <ClientLayout footer={<Footer />}>{children}</ClientLayout>
        
        {/* Saudi Business Certificate Verification Seal */}
        <div 
          className="sbc-verify-seal" 
          data-token="WVNXMXYvcFZqS0JScUNPdmswWDQ3UT09" 
          style={{ position: "fixed", bottom: "16px", left: "16px", zIndex: 9999 }}
        />
        <Script 
          src="https://eauthenticate.saudibusiness.gov.sa/EAuthSealApi/seal.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
