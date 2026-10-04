import { Banner } from "./components/banner";
import ProductGridServer from "./components/products/ProductGridServer";
import CustomerReviewsServer from "./components/CustomerReviewsServer";
import ShopByCategory from "./components/ShopByCategory";
import { STORE_INFO } from "./lib/store-info";

// Revalidate every 1 hour (3600s) — on-demand revalidation handles instant updates when admin edits data.
// Eliminates tens of thousands of unnecessary ISR writes per month.
export const revalidate = 18000;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://burjjstorre.com";
const BACKEND = process.env.BACKEND_URL || "https://burj-phone-backend.vercel.app";

// Shared cached fetch — deduplicated with layout.tsx's generateMetadata call
// because both use the same URL + revalidate value within the same render.
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

export default async function Home() {
  const c = await getCompany();
  const siteName = c.nameAr || "برج المبدع للتقنية";
  const logoUrl = c.logo
    ? (c.logo.startsWith("http") ? c.logo : `${BACKEND}${c.logo}`)
    : "";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    alternateName: c.nameEn || "Burj Al-Mubdia Tech",
    url: SITE_URL,
    logo: logoUrl,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: STORE_INFO.internationalPhone,
        contactType: "customer service",
        areaServed: "EG",
        availableLanguage: "Arabic",
      },
      {
        "@type": "ContactPoint",
        telephone: STORE_INFO.internationalPhone,
        contactType: "sales",
        areaServed: "EG",
        availableLanguage: "Arabic",
      },
    ].filter(Boolean),
    address: c.addressAr
      ? { "@type": "PostalAddress", addressLocality: c.addressAr, addressCountry: "SA" }
      : undefined,
    email: c.email || undefined,
    sameAs: c.website ? [c.website] : [],
  };

  const webSiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />
      <main className="min-h-screen bg-white">
        <Banner />
        <ShopByCategory />
        <ProductGridServer />
        <CustomerReviewsServer />
      </main>
    </>
  );
}
