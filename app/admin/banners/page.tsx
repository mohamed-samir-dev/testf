"use client";
import { useState } from "react";
import { useBanners } from "./hooks/useBanners";
import BannersHeader from "./components/BannersHeader";
import BannerCard from "./components/BannerCard";

export default function BannersPage() {
  const {
    banners, loading, addingBanner, inputRefs,
    handleUpload, handleDeleteImage, handleDeleteSlot, handleToggle, handleAddBanner, handleReorder,
  } = useBanners();

  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const filled      = banners.filter((b) => b.url).length;
  const activeCount = banners.filter((b) => b.url && b.active).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 -mx-3 -mt-0 sm:-mx-5 md:-mx-6">
      <BannersHeader
        activeCount={activeCount}
        filled={filled}
        total={banners.length}
        addingBanner={addingBanner}
        onAdd={handleAddBanner}
      />
      <div className="p-4 sm:p-6 md:p-8 grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
        {banners.map((banner, i) => (
          // FIX #5: use banner.url + index as a more stable key than bare index.
          // Pure index keys cause React to reuse the wrong DOM node when items
          // are reordered — resulting in stale image previews and mismatched
          // loading spinners. url+index guarantees a fresh mount after reorder.
          <div
            key={`${banner.url}-${i}`}
            draggable
            onDragStart={() => setDragIndex(i)}
            onDragOver={(e) => { e.preventDefault(); setOverIndex(i); }}
            onDragLeave={() => setOverIndex(null)}
            onDrop={() => {
              if (dragIndex !== null) handleReorder(dragIndex, i);
              setDragIndex(null);
              setOverIndex(null);
            }}
            onDragEnd={() => { setDragIndex(null); setOverIndex(null); }}
            className={`transition-all duration-200 rounded-2xl ${
              dragIndex === i ? "opacity-40 scale-95" : ""
            } ${overIndex === i && dragIndex !== i ? "ring-2 ring-indigo-400 ring-offset-2" : ""}`}
          >
            <BannerCard
              banner={banner}
              index={i}
              isLoading={loading === i}
              inputRef={(el) => { inputRefs.current[i] = el; }}
              onUpload={handleUpload}
              onToggle={handleToggle}
              onDeleteImage={handleDeleteImage}
              onDeleteSlot={handleDeleteSlot}
              isDragging={dragIndex === i}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
