"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function Viewer() {
  const params = useSearchParams();
  const url = params.get("url");

  if (!url) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-500 text-lg">
        لا يوجد ملف لعرضه
      </div>
    );
  }

  const isPdf = /\.pdf($|\?)/i.test(url);
  const proxyUrl = `/api/file-proxy?url=${encodeURIComponent(url)}`;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50" dir="rtl">
      <div className="bg-white p-3.5 px-6 flex items-center justify-between border-b shadow-xs">
        <span className="text-sm font-bold text-gray-800">عرض الملف</span>
        <div className="flex items-center gap-2">
          <a
            href={proxyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition"
          >
            فتح في نافذة جديدة
          </a>
          <a
            href={proxyUrl}
            download
            className="text-xs bg-violet-600 text-white px-4 py-1.5 rounded-lg hover:bg-violet-700 transition font-medium"
          >
            تحميل الملف
          </a>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        {isPdf ? (
          <iframe
            src={proxyUrl}
            title="عرض الملف"
            className="w-full rounded-xl border border-gray-200 shadow-xs bg-white"
            style={{ minHeight: "calc(100vh - 100px)" }}
          />
        ) : (
          <div className="max-w-4xl mx-auto flex items-center justify-center p-2">
            <img
              src={proxyUrl}
              alt="الملف المعروض"
              className="max-h-[85vh] w-auto max-w-full rounded-xl shadow-md border border-gray-200 object-contain bg-white"
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default function ViewFilePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-gray-500">
          جاري التحميل...
        </div>
      }
    >
      <Viewer />
    </Suspense>
  );
}
