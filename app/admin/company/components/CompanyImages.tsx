"use client";
import { memo, useMemo } from "react";
import { getThumbnailUrl, imageFields } from "../constants";
import type { CompanyData } from "../types";

interface CompanyImagesProps {
  data: CompanyData;
  uploadingKey?: string | null;
  previewUrls?: Record<string, string>;
  disabled?: boolean;
  onImageChange: (key: string, file: File) => void;
  onImageDelete: (key: string) => void;
}

// Single image slot — memoised so it only re-renders when its own url or upload state changes
const ImageField = memo(function ImageField({
  fieldKey,
  label,
  url,
  previewUrl,
  isUploading,
  disabled,
  onImageChange,
  onImageDelete,
}: {
  fieldKey: string;
  label: string;
  url: string;
  previewUrl?: string;
  isUploading: boolean;
  disabled?: boolean;
  onImageChange: (key: string, file: File) => void;
  onImageDelete: (key: string) => void;
}) {
  const displayUrl = previewUrl || url;
  // Use Cloudinary thumbnail transformation to fetch lightweight WebP/AVIF (160x160)
  // instead of a 5MB original image.
  const optimizedUrl = useMemo(() => getThumbnailUrl(displayUrl), [displayUrl]);

  return (
    <div>
      <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">{label}</label>
      {displayUrl && (
        <div className="relative inline-block mb-2">
          <img
            src={optimizedUrl}
            alt={label}
            className={`h-14 w-auto max-w-[120px] object-contain rounded border bg-gray-50 ${isUploading ? "opacity-50" : ""}`}
            loading="lazy"
            decoding="async"
          />
          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <button
              type="button"
              disabled={disabled}
              onClick={() => onImageDelete(fieldKey)}
              className="absolute -top-2 -left-2 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs leading-none transition"
              title="حذف الصورة"
            >
              ×
            </button>
          )}
        </div>
      )}
      <input
        type="file"
        accept="image/*"
        disabled={disabled || isUploading}
        onChange={(e) => e.target.files?.[0] && onImageChange(fieldKey, e.target.files[0])}
        className="w-full text-xs sm:text-sm text-gray-500 file:mr-2 file:py-1 file:px-2 sm:file:py-1.5 sm:file:px-3 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 disabled:opacity-50"
      />
    </div>
  );
});

// Memoised: custom comparator ensures CompanyImages NEVER re-renders
// when text fields in `data` change during keystrokes.
const CompanyImages = memo(
  function CompanyImages({
    data,
    uploadingKey,
    previewUrls,
    disabled,
    onImageChange,
    onImageDelete,
  }: CompanyImagesProps) {
    return (
      <div>
        <div className="flex items-start gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-sm w-full mb-3">
          <span className="shrink-0 text-base">⚠️</span>
          <span>رفع الصورة يتم تحسينه وضغطه تلقائياً — تذكر النقر على &quot;حفظ البيانات&quot; بعد إنهاء التعديلات.</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-5">
          {imageFields.map(({ key, label }) => (
            <ImageField
              key={key}
              fieldKey={key}
              label={label}
              url={data[key] || ""}
              previewUrl={previewUrls?.[key]}
              isUploading={uploadingKey === key}
              disabled={disabled || !!uploadingKey}
              onImageChange={onImageChange}
              onImageDelete={onImageDelete}
            />
          ))}
        </div>
      </div>
    );
  },
  (prev, next) => {
    if (prev.uploadingKey !== next.uploadingKey) return false;
    if (prev.disabled !== next.disabled) return false;
    if (prev.onImageChange !== next.onImageChange) return false;
    if (prev.onImageDelete !== next.onImageDelete) return false;
    for (const { key } of imageFields) {
      if (prev.data[key] !== next.data[key]) return false;
      if (prev.previewUrls?.[key] !== next.previewUrls?.[key]) return false;
    }
    return true;
  }
);

export default CompanyImages;

