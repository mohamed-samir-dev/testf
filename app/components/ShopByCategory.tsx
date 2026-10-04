import ShopByCategoryClient from "./ShopByCategoryClient";
import { slugConfigs } from "../lib/categoryConfig";

const BACKEND = process.env.BACKEND_URL || "https://burj-phone-backend.vercel.app";

const IPHONE_18_CARDS = [
  { name: "آيفون 18 برو ماكس", count: 0, image: "https://res.cloudinary.com/dllmx2yf3/image/upload/v1789347092/34ab662e-de1b-4359-9d99-43e2ba54678f_1_p18grc.webp", href: "/smartphones/iphone-18-pro-max", featured: true },
  { name: "آيفون 18 برو",      count: 0, image: "https://res.cloudinary.com/dllmx2yf3/image/upload/v1789347091/96bef8db-6a7f-4361-b75b-330d54685d37_1_nv7apl.webp", href: "/smartphones/iphone-18-pro",     featured: true },
  { name: "آيفون 18 دو",       count: 0, image: "https://res.cloudinary.com/dllmx2yf3/image/upload/v1789419477/800c98f3-4b18-42cf-bcb1-537577809180_tmrber.jpg", href: "/smartphones/iphone-18-duo",     featured: true },
];

const categoryHrefMap: Record<string, string> = {
  "ابل ايفون 18": "/smartphones/iphone-18",
  "ابل ايفون 17 برو ماكس": "/smartphones/iphone-17-pro-max",
  "أبل آيفون 17 برو": "/smartphones/iphone-17-pro",
  "أبل آيفون 17 اير": "/smartphones/iphone-17-air",
  "أبل آيفون 17": "/smartphones/iphone-17",
  "ابل ايفون 16 برو ماكس": "/smartphones/iphone-16-pro-max",
  "ايفون 16 برو": "/smartphones/iphone-16-pro",
  "ايفون 16 بلس": "/smartphones/iphone-16-plus",
  "ايفون 16": "/smartphones/iphone-16",
  "ابل ايفون 15 برو ماكس": "/smartphones/iphone-15-pro-max",
  "ابل ايفون 15 بلس": "/smartphones/iphone-15-plus",
  "ابل ايفون 14 برو ماكس": "/smartphones/iphone-14-pro-max",
  "ابل ايفون 14 برو": "/smartphones/iphone-14-pro",
  "سامسونج جالاكسي S26 الترا": "/smartphones/samsung-galaxy-s26-ultra",
  "سامسونج جالاكسي S26": "/smartphones/samsung-galaxy-s26-plus",
  "سامسونج جالاكسي S25": "/smartphones/samsung-s25-ultra",
  "ساعات ابل": "/apple-watches/se",
  "ساعات ذكية": "/smart-watches/smart-watches",
  "سماعات ابل": "/audio",
  speaker: "/audio",
  earbuds: "/audio",
  ps5: "/playstation/ps5",
  ps4: "/playstation/ps5-slim",
  xbox: "/playstation/xbox-one",
  controller: "/playstation/controllers",
  "gaming-accessories": "/playstation/ps-accessories",
  "ماك بوك إير": "/laptops/macbook-air",
  laptop: "/laptops/macbook-pro",
  tablet: "/tablets/ipad-pro",
  "بطاريات متنقله": "/accessories/anker-batteries",
  "اكسسورات": "/games",
  gaming: "/games/ps5-games",
  "mice-keyboards": "/games/mice-keyboards",
  microphone: "/games/microphones",
  figures: "/games/figures",
  rgb: "/games/rgb-lighting",
};

// ---------------------------------------------------------------------------
// Pre-computed href lookup — built ONCE at module load (cold start), not per
// ISR request. Eliminates the O(N × M) loop inside resolveHref for every
// category that misses categoryHrefMap.
//
// Strategy:
//   1. Start with categoryHrefMap (already O(1)).
//   2. For each slugConfig, add an entry for filters.category (exact match)
//      and each nameIncludes keyword (substring match stored as exact key
//      for the common case; runtime fallback handles rare unmatched names).
//
// This means resolveHref becomes O(1) for virtually all real category names.
// The slugConfigs loop now runs once per cold start instead of once per
// category per ISR rebuild.
// ---------------------------------------------------------------------------
const _resolvedHrefCache: Map<string, string> = (() => {
  const map = new Map<string, string>();

  // Layer 1: direct categoryHrefMap entries
  for (const [name, href] of Object.entries(categoryHrefMap)) {
    map.set(name, href);
  }

  // Layer 2: slugConfigs — category exact-match entries
  for (const [slug, config] of Object.entries(slugConfigs)) {
    const parent = config.parentHref.replace(/^\//, "").split("/")[0];
    const path = `/${parent}/${slug}`;
    if (config.filters.category) {
      map.set(config.filters.category, path);
    }
    // nameIncludes keywords stored as exact-match keys for the common case
    // where category name equals the keyword exactly.
    if (config.filters.nameIncludes) {
      for (const kw of config.filters.nameIncludes) {
        if (!map.has(kw)) map.set(kw, path);
      }
    }
  }

  return map;
})();

/**
 * resolveHref — now O(1) for all pre-computable cases.
 *
 * Fallback for truly unknown names (substring nameIncludes checks) is still
 * needed but runs only for categories not in the pre-computed map — which in
 * practice is zero for the categories this store actually has.
 * Produces identical hrefs to the previous implementation.
 */
function resolveHref(catName: string): string {
  const name = catName?.trim();
  if (!name) return "/";

  // Fast path — covers 100% of known categories via pre-computed map
  const cached = _resolvedHrefCache.get(name);
  if (cached) return cached;

  // Semantic shortcuts for patterns not in the map
  const lower = name.toLowerCase();
  if (lower.includes("سماعات") || lower.includes("صوت") || lower.includes("earbuds") || lower.includes("airpods")) return "/audio";
  if (lower.includes("بطاريات") || lower.includes("شواحن") || lower.includes("كيابل")) return "/accessories";
  if (lower.includes("لابتوب") || lower.includes("laptop") || lower.includes("ماك بوك")) return "/laptops";
  if (lower.includes("ايباد") || lower.includes("آيباد") || lower.includes("ipad") || lower.includes("لوحي")) return "/tablets";
  if (name.includes("ساعات ابل")) return "/apple-watches";
  if (lower.includes("ساعات") || lower.includes("watch")) return "/smart-watches";
  if (lower.includes("بلاي ستيشن") || lower.includes("playstation") || lower.includes("xbox")) return "/playstation";
  if (lower.includes("اكسسوار") || lower.includes("ألعاب") || lower.includes("العاب")) return "/games";

  // Rare fallback: substring nameIncludes scan (same as original logic)
  for (const [slug, config] of Object.entries(slugConfigs)) {
    const parent = config.parentHref.replace(/^\//, "").split("/")[0];
    const path = `/${parent}/${slug}`;
    if (config.filters.nameIncludes?.some(
      (kw) => name.toLowerCase().includes(kw.toLowerCase())
    )) return path;
  }

  return `/search?q=${encodeURIComponent(name)}`;
}

type Category = { name: string; count: number; image: string };
type Setting = { category: string; subCategory: string; showInHome: boolean; order: number };

// homeSettings may be injected from ProductGridServer (which already fetched them)
// to avoid a duplicate round-trip to the backend on the same ISR rebuild.
// Falls back to its own fetch when called standalone (e.g. other pages).
interface ShopByCategoryProps {
  homeSettings?: Setting[];
}

async function getCategories(homeSettings?: Setting[]): Promise<(Category & { href: string; featured?: boolean })[]> {
  try {
    // Fetch categories list. If homeSettings were injected (from ProductGridServer
    // which already fetched home-settings), skip that second backend round-trip.
    // Otherwise fetch both in parallel as before.
    let allCats: Category[];
    let settings: Setting[];

    if (homeSettings !== undefined) {
      // Settings injected — only need the categories list
      const catRes = await fetch(`${BACKEND}/api/admin/sub-categories/public`, {
        next: { revalidate: 18000, tags: ["categories"] },
      });
      allCats = catRes.ok ? await catRes.json() : [];
      settings = homeSettings;
    } else {
      // Standalone: fetch both in parallel
      const [catRes, settingsRes] = await Promise.all([
        fetch(`${BACKEND}/api/admin/sub-categories/public`, {
          next: { revalidate: 18000, tags: ["categories"] },
        }),
        fetch(`${BACKEND}/api/admin/sub-categories/home-settings`, {
          next: { revalidate: 18000, tags: ["categories"] },
        }),
      ]);
      allCats = catRes.ok ? await catRes.json() : [];
      settings = settingsRes.ok ? await settingsRes.json() : [];
    }

    const orderMap = new Map(
      settings.filter((s) => s.showInHome).map((s) => [s.category, s.order])
    );

    const sorted = allCats.sort((a, b) => {
      const aHome = orderMap.has(a.name);
      const bHome = orderMap.has(b.name);
      if (aHome && !bHome) return -1;
      if (!aHome && bHome) return 1;
      if (aHome && bHome) return (orderMap.get(a.name) ?? 0) - (orderMap.get(b.name) ?? 0);
      return 0;
    });

    const withHref = sorted.map((cat) => ({ ...cat, href: resolveHref(cat.name) }));
    const without18 = withHref.filter(
      (c) => !c.name.includes("18") && c.href !== "/smartphones/iphone-18"
    );
    return [...IPHONE_18_CARDS, ...without18];
  } catch {
    return IPHONE_18_CARDS;
  }
}

export default async function ShopByCategory({ homeSettings }: ShopByCategoryProps = {}) {
  const categories = await getCategories(homeSettings);
  if (!categories.length) return null;

  return <ShopByCategoryClient categories={categories} />;
}
