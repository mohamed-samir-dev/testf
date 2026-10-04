"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProductCard from "../components/products/ProductCard";
import type { Product } from "../components/products/types";

export default function SearchClient() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q) { setProducts([]); return; }
    // AbortController cancels the previous request when q changes quickly,
    // preventing race conditions where a slower earlier request overwrites
    // the results of a faster later one.
    const controller = new AbortController();
    setLoading(true);
    fetch(`/api/products?q=${encodeURIComponent(q)}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((data) => { if (!controller.signal.aborted) setProducts(Array.isArray(data) ? data : []); })
      .catch(() => {/* aborted — ignore */})
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [q]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8" dir="rtl">
      <h1 className="text-xl font-bold text-gray-800 mb-6">
        نتائج البحث عن: <span className="text-[#0F4C6E]">{q}</span>
      </h1>

      {loading && (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#0F4C6E] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && products.length === 0 && q && (
        <p className="text-center text-gray-500 py-20">لا توجد منتجات تطابق بحثك</p>
      )}

      {!loading && products.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p._id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
