"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import ProductCard from "../../components/products/ProductCard";
import type { Product } from "../../components/products/types";
import { slugConfigs, categoryHeroImages } from "../../lib/categoryConfig";
import { IoChevronBack, IoChevronForward, IoHomeOutline, IoClose } from "react-icons/io5";
import { BsGrid3X3GapFill } from "react-icons/bs";
import { HiAdjustmentsHorizontal } from "react-icons/hi2";

const normalizeAr = (s: string) =>
  s.trim().toLowerCase().replace(/[أإآٱ]/g, "ا").replace(/[ؤ]/g, "و").replace(/[ئ]/g, "ي").replace(/ة/g, "ه").replace(/\s+/g, " ");

function filterProducts(products: Product[], slug: string): Product[] {
  const config = slugConfigs[slug];
  if (!config) return products;
  const { brand, category, nameIncludes, nameExcludes } = config.filters;
  return products.filter((p) => {
    const normalizedName = normalizeAr(p.name ?? "");
    if (nameExcludes?.length && nameExcludes.some((kw) => normalizedName.includes(normalizeAr(kw)))) return false;
    const matchBrand = brand ? p.brand?.toLowerCase() === brand.toLowerCase() : true;
    const matchCategory = category ? normalizeAr(p.category ?? "") === normalizeAr(category) : false;
    const matchName = nameIncludes?.length
      ? nameIncludes.some((kw) => normalizedName.includes(normalizeAr(kw)))
      : false;
    if (nameIncludes?.length && category) return (matchBrand && matchName) || matchCategory;
    if (nameIncludes?.length) return matchBrand && matchName;
    if (category) return matchCategory;
    return matchBrand;
  });
}

function getColorHex(color: string): string {
  const c = color.toLowerCase();
  if (c.includes("أسود") || c.includes("اسود") || c.includes("black")) return "#1a1a1a";
  if (c.includes("أبيض") || c.includes("ابيض") || c.includes("white")) return "#f5f5f5";
  if (c.includes("سيلفر") || c.includes("فضي") || c.includes("silver")) return "#c0c0c0";
  if (c.includes("ذهبي") || c.includes("gold")) return "#d4af37";
  if (c.includes("أزرق") || c.includes("ازرق") || c.includes("blue")) return "#3b82f6";
  if (c.includes("أحمر") || c.includes("احمر") || c.includes("red")) return "#ef4444";
  if (c.includes("أخضر") || c.includes("اخضر") || c.includes("green")) return "#22c55e";
  if (c.includes("بنفسجي") || c.includes("purple")) return "#a855f7";
  if (c.includes("وردي") || c.includes("pink") || c.includes("روز")) return "#ec4899";
  if (c.includes("برتقال") || c.includes("orange")) return "#f97316";
  if (c.includes("بيج") || c.includes("beige") || c.includes("كريمي")) return "#d4c5a9";
  if (c.includes("رمادي") || c.includes("gray") || c.includes("grey")) return "#6b7280";
  if (c.includes("تيتانيوم") || c.includes("titanium")) return "#8a8a8a";
  if (c.includes("صحراوي") || c.includes("desert") || c.includes("sand")) return "#c2a878";
  return "#9ca3af";
}

const PRICE_SORTED_SLUGS_SET = new Set(["iphone-18-pro-max", "iphone-18-pro", "iphone-18-duo"]);

function sortProducts(filtered: Product[], slug: string): Product[] {
  const parseStorage = (s?: string) => {
    if (!s) return 0;
    const n = parseFloat(s);
    if (s.includes("تيرا") || s.toLowerCase().includes("tb")) return n * 1024;
    return n || 0;
  };
  const colorOrder = (c?: string) => {
    if (!c) return 99;
    if (c.includes("برتقال") || c.toLowerCase().includes("orange")) return 0;
    if (c.includes("سيلفر") || c.toLowerCase().includes("silver")) return 1;
    if (c.includes("ازرق") || c.includes("أزرق") || c.toLowerCase().includes("blue")) return 2;
    return 3;
  };
  return [...filtered].sort((a, b) => {
    if (PRICE_SORTED_SLUGS_SET.has(slug)) {
      return (a.salePrice ?? a.originalPrice ?? 0) - (b.salePrice ?? b.originalPrice ?? 0);
    }
    const storageDiff = parseStorage(a.storage) - parseStorage(b.storage);
    if (storageDiff !== 0) return storageDiff;
    return colorOrder(a.color) - colorOrder(b.color);
  });
}

export default function CategoryPageClient({ slug, initialProducts }: { slug: string; initialProducts?: Product[] }) {
  const config = slugConfigs[slug];
  const sortedInitial = initialProducts
    ? sortProducts(filterProducts(initialProducts, slug), slug)
    : [];
  const [products, setProducts] = useState<Product[]>(sortedInitial);
  // If initialProducts is provided from the server, skip loading state entirely.
  const [loading, setLoading] = useState(!initialProducts);
  const [page, setPage] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedStorage, setSelectedStorage] = useState<string>("");
  const [showFilters, setShowFilters] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);
  const ITEMS_PER_PAGE = PRICE_SORTED_SLUGS_SET.has(slug) ? 10 : 12;

  useEffect(() => {
    // Skip client fetch if server already provided products (ISR path).
    // This eliminates the /api/products Function invocation for all
    // category page visits that hit the ISR cache.
    if (initialProducts) return;
    if (!config) return;
    const params = new URLSearchParams();
    if (config.filters.brand) params.set("brand", config.filters.brand);
    if (config.filters.category) params.set("category", config.filters.category);
    params.set("limit", "50");
    fetch(`/api/products?${params.toString()}`)
      .then((r) => r.json())
      .then((data: Product[]) => {
        const filtered = filterProducts(data, slug);
        setProducts(sortProducts(filtered, slug));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, config, initialProducts]);

  // Extract unique colors and storages
  const colors = useMemo(() => [...new Set(products.map((p) => p.color).filter(Boolean))] as string[], [products]);
  const storages = useMemo(() => [...new Set(products.map((p) => p.storage).filter(Boolean))] as string[], [products]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedColor && p.color !== selectedColor) return false;
      if (selectedStorage && p.storage !== selectedStorage) return false;
      return true;
    });
  }, [products, selectedColor, selectedStorage]);

  if (!config) return notFound();

  const label = config.label ?? slug;
  const parentLabel = config.parentLabel ?? "";
  const parentHref = config.parentHref ?? "/";
  const rawHeroImage = (config.heroImage || categoryHeroImages[slug] || "/bbb.webp").trim();
  const heroImage =
    !rawHeroImage
      ? "/bbb.webp"
      : rawHeroImage.startsWith("http://") ||
        rawHeroImage.startsWith("https://") ||
        rawHeroImage.startsWith("/")
      ? rawHeroImage
      : `/${rawHeroImage}`;
  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const currentProducts = filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // Windowed pagination — cap buttons at ~7 regardless of total pages.
  // WHY: Array.from({length: totalPages}) renders every button; for 100 products
  // at 12/page that is 9 buttons, but for edge cases with many products it grows
  // unbounded. Windowing keeps the DOM constant at ≤7 elements.
  function windowedPageButtons(current: number, total: number): (number | "…")[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (current > 3) pages.push("…");
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push("…");
    pages.push(total);
    return pages;
  }

  const goToPage = (n: number) => {
    setPage(n);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const clearFilters = () => {
    setSelectedColor("");
    setSelectedStorage("");
    setPage(1);
  };

  const hasActiveFilters = selectedColor || selectedStorage;

  return (
    <main className="min-h-screen bg-white" dir="rtl">
      {/* ═══ HERO WITH IMAGE ═══ */}
      <div className="relative h-[220px] sm:h-[280px] overflow-hidden">
        <Image
          src={heroImage}
          alt={label}
          fill
          className="object-cover"
          quality={85}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
        <div className="absolute inset-0 flex flex-col justify-end max-w-6xl mx-auto px-4 sm:px-6 pb-8">
          {/* Breadcrumb */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-sm mb-4">
            <Link href="/" className="text-white/70 hover:text-white flex items-center gap-1 transition-colors">
              <IoHomeOutline size={13} />
              الرئيسية
            </Link>
            <IoChevronBack size={11} className="text-white/40" />
            <Link href={parentHref} className="text-white/70 hover:text-white transition-colors">{parentLabel}</Link>
            <IoChevronBack size={11} className="text-white/40" />
            <span className="text-white font-bold">{label}</span>
          </div>
          {/* Title */}
          <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight">{label}</h1>
          <p className="text-white/60 text-xs sm:text-sm mt-1">
            {filteredProducts.length} منتج متوفر
          </p>
        </div>
      </div>

      {/* ═══ FILTERS ═══ */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 pt-5">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-sm font-bold text-gray-700"
            >
              <HiAdjustmentsHorizontal size={18} className="text-[#1F6F8B]" />
              تصفية المنتجات
            </button>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 transition-colors">
                <IoClose size={14} />
                مسح الفلاتر
              </button>
            )}
          </div>

          <div className={showFilters ? "block" : "hidden"}>
            <div className="flex flex-wrap gap-4">
              {/* Color Filter */}
              {colors.length > 1 && (
                <div className="flex-1 min-w-[150px]">
                  <label className="text-xs text-gray-500 font-medium mb-1.5 block">اللون</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setSelectedColor(""); setPage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!selectedColor ? "bg-[#1F6F8B] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      الكل
                    </button>
                    {colors.map((c) => (
                      <button
                        key={c}
                        onClick={() => { setSelectedColor(c); setPage(1); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${selectedColor === c ? "bg-[#1F6F8B] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full border border-gray-300 shrink-0" style={{ backgroundColor: getColorHex(c) }} />
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Storage Filter */}
              {storages.length > 1 && (
                <div className="flex-1 min-w-[150px]">
                  <label className="text-xs text-gray-500 font-medium mb-1.5 block">السعة</label>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => { setSelectedStorage(""); setPage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${!selectedStorage ? "bg-[#1F6F8B] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                    >
                      الكل
                    </button>
                    {storages.map((s) => (
                      <button
                        key={s}
                        onClick={() => { setSelectedStorage(s); setPage(1); }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedStorage === s ? "bg-[#1F6F8B] text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div ref={gridRef} className="max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-8 scroll-mt-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-square bg-gray-200" />
                <div className="p-3.5 space-y-3">
                  <div className="h-3.5 rounded-full w-[80%] bg-gray-200" />
                  <div className="h-3 rounded-full w-[55%] bg-gray-200" />
                  <div className="h-9 rounded-xl bg-gray-200 mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : !filteredProducts.length ? (
          <div className="flex flex-col items-center justify-center py-20 sm:py-32 gap-5 text-center">
            <span className="text-5xl">📦</span>
            <div>
              <p className="text-gray-700 text-lg sm:text-xl font-extrabold mb-1.5">
                {hasActiveFilters ? "لا توجد منتجات تطابق الفلتر" : "المنتجات ستُضاف قريباً"}
              </p>
              <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">
                {hasActiveFilters ? "جرب تغيير خيارات التصفية" : "هذا القسم قيد التحضير"}
              </p>
            </div>
            {hasActiveFilters && (
              <button onClick={clearFilters} className="px-5 py-2.5 bg-[#1F6F8B] text-white rounded-xl text-sm font-bold">
                مسح الفلاتر
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl shadow-sm border border-gray-100">
                <BsGrid3X3GapFill className="text-[#1F6F8B]" size={14} />
                <span className="text-sm font-extrabold text-[#0a3550]">{filteredProducts.length}</span>
                <span className="text-[11px] text-gray-400 font-medium">منتج</span>
              </div>
              {totalPages > 1 && (
                <div className="text-xs text-gray-400">
                  صفحة <span className="font-bold text-[#0F4C6E]">{page}</span> من {totalPages}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {currentProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center disabled:opacity-30"
                >
                  <IoChevronForward size={18} />
                </button>
                {windowedPageButtons(page, totalPages).map((n, idx) =>
                  n === "…"
                    ? <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-400 text-sm">…</span>
                    : <button
                        key={n}
                        onClick={() => goToPage(n)}
                        className={`w-9 h-9 rounded-xl text-sm font-bold transition-all ${page === n ? "bg-[#1F6F8B] text-white" : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"}`}
                      >
                        {n}
                      </button>
                )}
                <button
                  onClick={() => goToPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center disabled:opacity-30"
                >
                  <IoChevronBack size={18} />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
