"use client";
import { useRef } from "react";
import CategorySlider from "./CategorySlider";

type Category = {
  name: string;
  count: number;
  image: string;
  href: string;
  featured?: boolean;
};

export default function ShopByCategoryClient({ categories }: { categories: Category[] }) {
  const trackRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "prev" | "next") => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir === "next" ? -320 : 320, behavior: "smooth" });
  };

  return (
    <section className="w-full py-6 sm:py-8" dir="rtl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-4 sm:mb-6">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-tight">
              تسوّق حسب القسم
            </h2>
            <p className="text-sm text-gray-400 mt-1.5 font-medium">
              كل ما تحتاجه، في مكان واحد
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 mb-1">
            <button
              onClick={() => scroll("prev")}
              aria-label="السابق"
              className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 bg-white hover:border-[#A842E4] hover:text-[#A842E4] text-gray-400 transition-all duration-200"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              onClick={() => scroll("next")}
              aria-label="التالي"
              className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-200 bg-white hover:border-[#A842E4] hover:text-[#A842E4] text-gray-400 transition-all duration-200"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <CategorySlider categories={categories} trackRef={trackRef} />
    </section>
  );
}
