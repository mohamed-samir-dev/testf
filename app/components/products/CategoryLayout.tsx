"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import ProductCard from "../products/ProductCard";
import type { Product } from "../products/types";
import { IoChevronBack, IoChevronForward, IoHomeOutline } from "react-icons/io5";
import { HiOutlineSparkles } from "react-icons/hi2";
import { BsGrid3X3GapFill } from "react-icons/bs";

const ITEMS_PER_PAGE = 12;

interface Props {
  title: string;
  parentLabel?: string;
  parentHref?: string;
  products: Product[];
  loading: boolean;
  emptyIcon?: string;
}



/* ── windowed page buttons — max ~7 elements regardless of total pages ── */
function windowedPageButtons(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

/* ── main layout ── */
export default function CategoryLayout({ title, parentLabel, parentHref = "/", products, loading, emptyIcon = "📦" }: Props) {
  const [page, setPage] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);
  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);

  const goToPage = (n: number) => {
    setPage(n);
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const currentProducts = products.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <main className="min-h-screen cat-page-bg" dir="rtl">
      {/* ═══ HERO ═══ */}
      <div className="cat-hero relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-wrap items-center gap-2 text-[11px] sm:text-sm pt-5 sm:pt-8 mb-5 sm:mb-8">
            <Link href="/" className="cat-breadcrumb-pill">
              <IoHomeOutline size={13} />
              الرئيسية
            </Link>
            {parentLabel && (
              <>
                <IoChevronBack size={11} className="text-white/30" />
                {parentHref ? (
                  <Link href={parentHref} className="cat-breadcrumb-pill">{parentLabel}</Link>
                ) : (
                  <span className="cat-breadcrumb-pill">{parentLabel}</span>
                )}
              </>
            )}
          </div>

          <div className="pb-12 sm:pb-16">
            <div className="flex items-start gap-3.5 sm:gap-4">
              <div className="cat-icon-box">
                <HiOutlineSparkles className="text-[#7CC043] text-xl sm:text-2xl" />
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl sm:text-4xl font-black text-white leading-tight tracking-tight">{title}</h1>
                <p className="text-white/50 text-xs sm:text-sm mt-1.5 font-medium">اكتشف أفضل المنتجات بأسعار لا تُقاوم</p>
              </div>
              {!loading && products.length > 0 && (
                <div className="cat-count-badge">
                  <span className="text-lg sm:text-xl font-black">{products.length}</span>
                  <span className="text-[10px] sm:text-xs opacity-70">منتج</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 60V30C180 10 360 0 540 10C720 20 900 45 1080 45C1260 45 1350 30 1440 20V60H0Z" fill="#ffffff" />
            <path d="M0 60V40C200 20 400 15 600 25C800 35 1000 50 1200 45C1320 42 1380 35 1440 30V60H0Z" fill="#ffffff" fillOpacity="0.5" />
          </svg>
        </div>
      </div>

      {/* ═══ CONTENT ═══ */}
      <div ref={gridRef} className="max-w-6xl mx-auto px-3 sm:px-6 py-5 sm:py-10 scroll-mt-4">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="cat-skeleton-card rounded-[20px] overflow-hidden">
                <div className="aspect-square cat-shimmer" />
                <div className="p-3 space-y-2.5">
                  <div className="h-3 rounded-full w-[80%] cat-shimmer" />
                  <div className="h-3 rounded-full w-[55%] cat-shimmer" />
                  <div className="h-5 rounded-full w-[40%] cat-shimmer mt-1" />
                  <div className="h-9 rounded-xl cat-shimmer mt-2" />
                </div>
              </div>
            ))}
          </div>
        ) : !products.length ? (
          <div className="flex flex-col items-center justify-center py-20 sm:py-32 gap-5 text-center">
            <div className="cat-empty-icon">
              <span className="text-5xl">{emptyIcon}</span>
            </div>
            <div>
              <p className="text-gray-700 text-lg sm:text-xl font-extrabold mb-1.5">المنتجات ستُضاف قريباً</p>
              <p className="text-gray-400 text-sm max-w-xs mx-auto leading-relaxed">هذا القسم قيد التحضير، تابعنا للمزيد من المنتجات المميزة</p>
            </div>
            <Link href="/" className="cat-back-btn">
              <IoHomeOutline size={16} />
              العودة للرئيسية
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-5 sm:mb-8">
              <div className="cat-toolbar-badge">
                <BsGrid3X3GapFill className="text-[#1F6F8B]" size={14} />
                <span className="text-sm font-extrabold text-[#0a3550]">{products.length}</span>
                <span className="text-[11px] text-gray-400 font-medium">منتج متوفر</span>
              </div>
              {totalPages > 1 && (
                <div className="cat-page-indicator">
                  <span className="text-[11px] text-gray-400">صفحة</span>
                  <span className="text-sm font-bold text-[#0F4C6E]">{page}</span>
                  <span className="text-[11px] text-gray-400">من {totalPages}</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {currentProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="cat-pagination">
                <button
                  onClick={() => goToPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="cat-pg-arrow"
                >
                  <IoChevronForward size={18} />
                </button>

                <div className="flex items-center gap-1.5">
                  {windowedPageButtons(page, totalPages).map((n, idx) =>
                    n === "…"
                      ? <span key={`ellipsis-${idx}`} className="px-2 py-1 text-gray-400 text-sm">…</span>
                      : <button
                          key={n}
                          onClick={() => goToPage(n)}
                          className={`cat-pg-num ${page === n ? "active" : ""}`}
                        >
                          {page === n && (
                            <div className="absolute inset-0 cat-pg-active-bg rounded-xl" />
                          )}
                          <span className="relative z-10">{n}</span>
                        </button>
                  )}
                </div>

                <button
                  onClick={() => goToPage(Math.min(totalPages, page + 1))}
                  disabled={page === totalPages}
                  className="cat-pg-arrow"
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
