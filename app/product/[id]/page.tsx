import type { Metadata } from "next";
import { cache } from "react";
import ProductPageClient from "./ProductPageClient";

const BACKEND = process.env.BACKEND_URL || "https://burj-phone-backend.vercel.app";
const SITE_URL = "https://burjjstorre.com";

// Wrap both fetchers with React cache so generateMetadata and ProductPage
// share the same in-flight promise within a single render pass.
// Next.js Data Cache (revalidate: 18000) handles cross-request deduplication;
// React cache handles within-request deduplication so the network call
// fires exactly once per render regardless of how many callers exist.
export const revalidate = 18000;
export const dynamicParams = true;

// Pre-render products at build time so /product/[id] is SSG instead of Dynamic SSR
export async function generateStaticParams() {
  try {
    const res = await fetch(`${BACKEND}/api/products?limit=200`, {
      next: { revalidate: 18000 },
    });
    if (!res.ok) return [];
    const products = await res.json();
    if (!Array.isArray(products)) return [];
    return products.map((p: any) => ({
      id: String(p._id),
    }));
  } catch {
    return [];
  }
}

const getProduct = cache(async (id: string) => {
  if (!/^[a-zA-Z0-9_-]{1,64}$/.test(id)) return null;
  try {
    const r = await fetch(`${BACKEND}/api/products/${id}`, {
      next: { revalidate: 18000, tags: [`product-${id}`] },
    });
    return r.ok ? r.json() : null;
  } catch {
    return null;
  }
});

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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  // Both calls share the cached promise — no duplicate network fetch.
  const [product, company] = await Promise.all([getProduct(id), getCompany()]);

  if (!product) {
    return { title: "المنتج غير موجود" };
  }

  const siteName = company.nameAr || "برج المبدع للتقنية";
  const title = product.name;

  const parts: string[] = [];
  if (product.brand) parts.push(product.brand);
  if (product.storage) parts.push(product.storage);
  if (product.color) parts.push(product.color);
  if (product.salePrice || product.price) {
    const price = product.salePrice || product.price;
    parts.push(`${price} جنيه مصري`);
  }
  if (product.installment?.available) parts.push("بالأقساط");

  const description = product.brief
    ? product.brief
    : product.description
    ? product.description.slice(0, 160)
    : `${title}${parts.length ? " - " + parts.join(" | ") : ""} - متوفر في ${siteName}`;

  const rawImg = product.images?.[0] || product.image || "";
  const imageUrl = rawImg.startsWith("http")
    ? rawImg
    : rawImg
    ? `${BACKEND}${rawImg}`
    : `${SITE_URL}/web-app-manifest-512x512.png`;

  return {
    title,
    description,
    keywords: [
      product.name,
      product.brand || "",
      product.category || "",
      "أقساط",
      "شراء",
      "السعودية",
      siteName,
    ].filter(Boolean),
    openGraph: {
      type: "website",
      url: `${SITE_URL}/product/${id}`,
      title: `${title} | ${siteName}`,
      description,
      images: [{ url: imageUrl, width: 1200, height: 630, alt: title }],
      siteName,
      locale: "ar_SA",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteName}`,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `${SITE_URL}/product/${id}`,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  // Reuses the same cached promises from generateMetadata — zero extra fetches.
  const [product, company] = await Promise.all([getProduct(id), getCompany()]);

  const siteName = company.nameAr || "برج المبدع للتقنية";
  const price = product?.salePrice || product?.price || 0;
  const rawImg = product?.images?.[0] || product?.image || "";
  const imageUrl = rawImg.startsWith("http")
    ? rawImg
    : rawImg
    ? `${BACKEND}${rawImg}`
    : "";

  const jsonLd = product
    ? {
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.description || product.brief || product.name,
        image: imageUrl,
        brand: product.brand
          ? { "@type": "Brand", name: product.brand }
          : undefined,
        offers: {
          "@type": "Offer",
          url: `${SITE_URL}/product/${id}`,
          priceCurrency: "EGP",
          price: price,
          availability: product.inStock
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
          seller: { "@type": "Organization", name: siteName },
        },
      }
    : null;

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <ProductPageClient id={id} initialProduct={product} />
    </>
  );
}
