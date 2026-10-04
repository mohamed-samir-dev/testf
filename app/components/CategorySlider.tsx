"use client";
import Image from "next/image";
import Link from "next/link";

type Category = {
  name: string;
  count: number;
  image: string;
  href: string;
  featured?: boolean;
};

export default function CategorySlider({
  categories,
  trackRef,
}: {
  categories: Category[];
  trackRef: React.RefObject<HTMLDivElement | null>;
}) {
  return (
    <div className="relative w-full" dir="rtl">
      {/* fade edges */}
      <div className="pointer-events-none absolute inset-y-0 right-0 w-12 z-10 bg-gradient-to-l from-white to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-12 z-10 bg-gradient-to-r from-white to-transparent" />

      <div
        ref={trackRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto px-4 sm:px-6 pb-3 pt-1"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
      >
        {categories.map((cat, i) => (
          <CategoryCard key={`${cat.name}-${i}`} cat={cat} />
        ))}
      </div>
    </div>
  );
}

// No useState — hover effects are pure CSS via Tailwind group-hover utilities.
// Eliminates N React re-renders (one per card) on every mouse-enter/leave.
function CategoryCard({ cat }: { cat: Category }) {
  return (
    <Link
      href={cat.href}
      className={[
        "group relative shrink-0 flex flex-col overflow-hidden rounded-2xl bg-white",
        "border border-gray-100 w-[140px] sm:w-[160px] transition-all duration-300",
        "shadow-[0_1px_4px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_24px_rgba(133,67,192,0.10)]",
      ].join(" ")}
    >
      {/* Image */}
      <div className="relative w-full bg-gray-50 overflow-hidden" style={{ paddingBottom: "100%" }}>
        {cat.image ? (
          <Image
            src={cat.image}
            alt={cat.name}
            fill
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
            quality={75}
            sizes="(max-width:640px) 140px, 160px"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-3xl bg-purple-50">🛍️</div>
        )}

        {cat.featured && (
          <span className="absolute top-2 right-2 text-[9px] font-bold px-2 py-0.5 rounded-full bg-[#A842E4] text-white">
            جديد
          </span>
        )}
      </div>

      {/* Content */}
      <div className="px-3 py-2.5 flex items-center justify-between gap-2">
        <span className="text-[12px] sm:text-[13px] font-bold text-gray-800 leading-snug line-clamp-2 flex-1">
          {cat.name}
        </span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          className="shrink-0 text-[#A842E4] transition-transform duration-200 group-hover:-translate-x-[3px]"
        >
          <path d="M9 3L5 7L9 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </Link>
  );
}
