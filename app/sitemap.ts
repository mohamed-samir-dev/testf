import { MetadataRoute } from "next";
import { slugConfigs } from "./lib/categoryConfig";

const BASE_URL = "https://burjjstorre.com";
const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "https://burj-phone-backend.vercel.app";

const staticRoutes: { path: string; priority: number; changeFreq: MetadataRoute.Sitemap[number]["changeFrequency"] }[] = [
  { path: "", priority: 1.0, changeFreq: "daily" },
  { path: "/smartphones", priority: 0.9, changeFreq: "weekly" },
  { path: "/laptops", priority: 0.9, changeFreq: "weekly" },
  { path: "/tablets", priority: 0.9, changeFreq: "weekly" },
  { path: "/audio", priority: 0.9, changeFreq: "weekly" },
  { path: "/apple-watches", priority: 0.9, changeFreq: "weekly" },
  { path: "/smart-watches", priority: 0.9, changeFreq: "weekly" },
  { path: "/playstation", priority: 0.9, changeFreq: "weekly" },
  { path: "/accessories", priority: 0.9, changeFreq: "weekly" },
  { path: "/games", priority: 0.9, changeFreq: "weekly" },
  { path: "/about", priority: 0.7, changeFreq: "monthly" },
  { path: "/privacy", priority: 0.6, changeFreq: "monthly" },
  { path: "/return-policy", priority: 0.6, changeFreq: "monthly" },
  { path: "/payment", priority: 0.6, changeFreq: "monthly" },
  { path: "/cart", priority: 0.5, changeFreq: "weekly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const static_urls: MetadataRoute.Sitemap = staticRoutes.map(({ path, priority, changeFreq }) => ({
    url: `${BASE_URL}${path}`,
    changeFrequency: changeFreq,
    priority,
    lastModified: now,
  }));

  const slug_urls: MetadataRoute.Sitemap = Object.keys(slugConfigs).map((slug) => ({
    url: `${BASE_URL}/categories/${slug}`,
    changeFrequency: "weekly",
    priority: 0.7,
    lastModified: now,
  }));

  let product_urls: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${BACKEND_URL}/api/products`, { next: { revalidate: 18000 } });
    if (res.ok) {
      const products: { _id: string }[] = await res.json();
      product_urls = products.map((p) => ({
        url: `${BASE_URL}/product/${p._id}`,
        changeFrequency: "daily",
        priority: 0.6,
        lastModified: now,
      }));
    }
  } catch {
    // skip if backend unavailable
  }

  return [...static_urls, ...slug_urls, ...product_urls];
}
