import type { Metadata } from "next";
import { cache } from "react";
import { slugConfigs } from "../../lib/categoryConfig";
import type { SlugConfig } from "../../lib/categoryConfig";
import CategoryPageClient from "./CategoryPageClient";
import type { Product } from "../../components/products/types";

// Pre-render all known slugs at build time (ISR).
// Products are now pre-fetched server-side and passed as initialProducts,
// eliminating the client-side /api/products fetch on every category page visit.
// Cache behavior: Expected from configuration, not verified by Vercel telemetry.
export const revalidate = 18000;

// Statically generate all slug paths known at build time.
// Disallow unknown dynamic params so bot requests (e.g. /wp-login.php) immediately 404 at CDN Edge without running a Serverless Function.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(slugConfigs).map((slug) => ({ slug }));
}

const BACKEND = process.env.BACKEND_URL || "https://burj-phone-backend.vercel.app";
const SITE_URL = "https://burjjstorre.com";

// React cache deduplicates these within a single render pass so
// generateMetadata and the page component share the same promise.
const getCompany = cache(async () => {
  try {
    const r = await fetch(`${BACKEND}/api/admin/company`, {
      next: { revalidate: 18000, tags: ["company"] },
    });
    return r.ok ? r.json() : {};
  } catch {
    return {};
  }
});

// Fetch only the fields needed by CategoryPageClient — avoids sending the full
// product document (specs, sections, installment, description, etc.) to the
// browser for the category listing view.
const getProductsForSlug = cache(async (config: SlugConfig): Promise<Product[] | undefined> => {
  try {
    const params = new URLSearchParams();
    if (config.filters.brand) params.set("brand", config.filters.brand);
    if (config.filters.category) params.set("category", config.filters.category);
    params.set("limit", "50");
    const r = await fetch(`${BACKEND}/api/products?${params.toString()}`, {
      next: { revalidate: 18000 },
    });
    if (!r.ok) return undefined;
    const data = await r.json();
    return Array.isArray(data) ? data : undefined;
  } catch {
    return undefined;
  }
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const config = slugConfigs[slug];
  // Shared cache — same promise reused in CategorySlugPage below.
  const company = await getCompany();

  const siteName = company.nameAr || "برج المبدع للتقنية";
  const label = config?.label ?? slug;
  const parentLabel = config?.parentLabel ?? "";

  const title = parentLabel ? `${label} - ${parentLabel}` : label;
  const description = `تسوق ${label} بأفضل الأسعار وبالأقساط في ${siteName}. ${
    parentLabel ? `ضمن قسم ${parentLabel}.` : ""
  } شحن سريع وضمان معتمد.`;

  const logoUrl = company.logo
    ? company.logo.startsWith("http")
      ? company.logo
      : `${SITE_URL}${company.logo}`
    : `${SITE_URL}/web-app-manifest-512x512.png`;

  const parentHref = config?.parentHref ?? "";
  const canonicalUrl = parentHref && parentHref !== "/"
    ? `${SITE_URL}${parentHref}/${slug}`
    : `${SITE_URL}/${slug}`;

  return {
    title,
    description,
    keywords: [label, parentLabel, siteName, "أقساط", "شراء", "السعودية"].filter(Boolean),
    openGraph: {
      type: "website",
      url: canonicalUrl,
      title: `${title} | ${siteName}`,
      description,
      siteName,
      locale: "ar_SA",
      images: logoUrl ? [{ url: logoUrl, width: 1200, height: 630, alt: title }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      images: logoUrl ? [logoUrl] : [],
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function CategorySlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const config = slugConfigs[slug];

  // Pre-fetch products server-side so CategoryPageClient receives initialProducts
  // and skips its own client-side fetch entirely.
  // Both getCompany and getProductsForSlug run in parallel — independent fetches.
  const initialProducts = config
    ? await getProductsForSlug(config)
    : undefined;

  return <CategoryPageClient slug={slug} initialProducts={initialProducts} />;
}
