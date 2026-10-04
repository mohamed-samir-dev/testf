"use client";

import { useEffect, useState } from "react";
import CategoryLayout from "../../components/products/CategoryLayout";
import type { Product } from "../../components/products/types";

// Previously: fetched ALL products, filtered in browser.
// Now: sends category params to backend — MongoDB filters by category,
// only matching products are returned. Eliminates full-catalog download.
const AUDIO_CATEGORIES = ["سماعات ابل", "speaker", "earbuds"];

export default function AudioClient({ initialProducts = [] }: { initialProducts?: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);

  useEffect(() => {
    if (initialProducts.length > 0) return;
    // Single optimized query using comma-separated categories
    fetch(`/api/products?category=${encodeURIComponent(AUDIO_CATEGORIES.join(","))}`)
      .then((r) => r.json())
      .then((data: Product[]) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initialProducts]);

  return (
    <CategoryLayout
      title="أجهزة صوت و سماعات"
      parentLabel="أجهزة صوت و سماعات"
      products={products}
      loading={loading}
      emptyIcon="🎧"
    />
  );
}
