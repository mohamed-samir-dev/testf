import { ProductGrid } from "./index";
import type { Product } from "./types";

// Homepage data is cached for five minutes and invalidated by product edits.
const BACKEND = process.env.BACKEND_URL || "https://burj-phone-backend.vercel.app";

type HomeSettings = {
  category: string;
  subCategory: string;
  showInHome: boolean;
  order: number;
};

export default async function ProductGridServer() {
  let products: Product[] | undefined;
  let homeConfig = { settings: [] as HomeSettings[], max: 4 };
  let bannerMap: Record<string, string[]> = {};

  try {
    // All three independent fetches start in parallel — no waterfall.
    const [prodsRes, settingsRes, maxRes] = await Promise.all([
      fetch(
        `${BACKEND}/api/products/home`,
        { next: { revalidate: 18000, tags: ["products"] } }
      ),
      fetch(`${BACKEND}/api/admin/sub-categories/home-settings`, {
        next: { revalidate: 18000, tags: ["categories"] },
      }),
      fetch(`${BACKEND}/api/admin/sub-categories/max`, {
        next: { revalidate: 18000, tags: ["categories"] },
      }),
    ]);

    const [prodsData, settingsData, maxData] = await Promise.all([
      prodsRes.ok ? prodsRes.json() : null,
      settingsRes.ok ? settingsRes.json() : [],
      maxRes.ok ? maxRes.json() : { max: 4 },
    ]);

    const sanitizedProds = prodsData !== null && Array.isArray(prodsData)
      ? prodsData.map((p: any) => ({
          _id: String(p._id),
          name: p.name || "",
          exchangeRate: p.exchangeRate,
          originalPrice: p.originalPrice ?? p.price ?? 0,
          salePrice: p.salePrice ?? undefined,
          price: p.price ?? p.salePrice ?? p.originalPrice ?? 0,
          discountPercent: p.discountPercent ?? 0,
          image: p.image || undefined,
          images: Array.isArray(p.images) && p.images.length > 0 ? [p.images[0]] : p.image ? [p.image] : [],
          color: p.color || undefined,
          storage: p.storage || undefined,
          freeDelivery: p.freeDelivery ?? true,
          deliveryTime: p.deliveryTime || undefined,
          warrantyYears: p.warrantyYears ?? undefined,
          inStock: p.inStock ?? true,
          status: p.status || undefined,
          purchasable: p.purchasable ?? true,
          category: p.category || "",
          subCategory: p.subCategory || undefined,
          brand: p.brand || undefined,
        }))
      : undefined;

    products = sanitizedProds as Product[] | undefined;
    homeConfig = {
      settings: Array.isArray(settingsData) ? settingsData : [],
      max: maxData?.max ?? 4,
    };

    // Category banners depend on the product list — inherently sequential.
    // Everything else is already done by this point.
    const cats = products
      ? [...new Set(products.map((p) => p.category).filter(Boolean))]
      : [];
    if (cats.length) {
      const bannersRes = await fetch(
        `${BACKEND}/api/admin/category-banners-bulk?categories=${encodeURIComponent(
          cats.join(",")
        )}`,
        { next: { revalidate: 18000, tags: ["banners"] } }
      );
      if (bannersRes.ok) {
        const data = await bannersRes.json();
        if (data && typeof data === "object") bannerMap = data;
      }
    }
  } catch {
    // Retain successfully loaded products if only category banners fail.
  }

  return (
    <ProductGrid
      initialProducts={products}
      initialConfig={homeConfig}
      initialBannerMap={bannerMap}
    />
  );
}
