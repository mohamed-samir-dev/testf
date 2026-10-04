"use client";

import { useEffect, useState } from "react";
import CategoryLayout from "../../components/products/CategoryLayout";
import type { Product } from "../../components/products/types";

// Previously: fetched ALL products, filtered in browser.
// Now: sends ?category= to backend — MongoDB filters directly.
export default function GamesClient({ initialProducts = [] }: { initialProducts?: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);

  useEffect(() => {
    if (initialProducts.length > 0) return;
    fetch(`/api/products?category=${encodeURIComponent("اكسسورات,gaming,mice-keyboards,microphone,figures,rgb")}`)
      .then((r) => r.json())
      .then((data: Product[]) => {
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initialProducts]);

  return <CategoryLayout title="اكسسورات" parentLabel="اكسسورات" products={products} loading={loading} emptyIcon="🕹️" />;
}
