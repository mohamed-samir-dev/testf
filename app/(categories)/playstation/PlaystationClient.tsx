"use client";

import { useEffect, useState } from "react";
import CategoryLayout from "../../components/products/CategoryLayout";
import type { Product } from "../../components/products/types";

// Previously: fetched ALL products, filtered in browser.
// Now: sends each PS category to backend — MongoDB filters, only matching
// products returned. Eliminates full-catalog download.
const PS_CATEGORIES = ["ps5", "ps4", "xbox", "controller", "gaming-accessories", "بلاي ستيشن"];

export default function PlaystationClient({ initialProducts = [] }: { initialProducts?: Product[] }) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [loading, setLoading] = useState(initialProducts.length === 0);

  useEffect(() => {
    if (initialProducts.length > 0) return;
    fetch(`/api/products?category=${encodeURIComponent(PS_CATEGORIES.join(","))}`)
      .then((r) => r.json())
      .then((data: Product[]) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [initialProducts]);

  return (
    <CategoryLayout
      title="أجهزة بلاي ستيشن"
      parentLabel="أجهزة بلاي ستيشن"
      products={products}
      loading={loading}
      emptyIcon="🎮"
    />
  );
}
