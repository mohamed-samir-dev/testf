"use client";
import { memo } from "react";
import type { Category } from "../types";

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

interface CategoriesTableProps {
  categories: Category[];
  filtered: Category[];
  search: string;
  loading: boolean;
  error: boolean;
  onRetry: () => void;
  onSearchChange: (v: string) => void;
  onEdit: (cat: Category) => void;
  onDelete: (cat: Category) => void;
}

const CategoriesTable = memo(function CategoriesTable({
  categories,
  filtered,
  search,
  loading,
  error,
  onRetry,
  onSearchChange,
  onEdit,
  onDelete,
}: CategoriesTableProps) {
  return (
    <div className="bg-white rounded-xl shadow overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm text-gray-500">
            إجمالي التصنيفات:
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            {categories.length}
          </span>
        </div>

        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث عن تصنيف..."
            className="w-full border border-gray-300 rounded-lg pr-9 pl-8 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <div className="absolute right-3 top-2.5 text-gray-400 pointer-events-none">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          {search && (
            <button
              onClick={() => onSearchChange("")}
              className="absolute left-2.5 top-2 text-gray-400 hover:text-gray-600 text-xs px-1 rounded"
              title="مسح البحث"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-right">
          <thead className="bg-gray-50 text-gray-600 font-semibold text-xs sm:text-sm border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 w-16">#</th>
              <th className="px-4 py-3">اسم التصنيف</th>
              <th className="px-4 py-3">عدد المنتجات</th>
              <th className="px-4 py-3 w-28 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 4 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="px-4 py-3.5"><div className="h-4 w-6 bg-gray-200 rounded"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                  <td className="px-4 py-3.5"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                  <td className="px-4 py-3.5 text-center"><div className="h-4 w-12 bg-gray-200 rounded mx-auto"></div></td>
                </tr>
              ))
            ) : error ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-sm">
                  <p className="text-red-500 font-medium mb-2">⚠️ حدث خطأ أثناء تحميل التصنيفات</p>
                  <button
                    onClick={onRetry}
                    className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1.5 rounded-md font-medium transition-colors"
                  >
                    إعادة المحاولة
                  </button>
                </td>
              </tr>
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-gray-400 text-sm">
                  {search ? "لا توجد نتائج تطابق بحثك" : "لا توجد تصنيفات رئيسية بعد"}
                </td>
              </tr>
            ) : (
              filtered.map((cat, i) => (
                <tr key={cat.name} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-400 font-medium text-xs sm:text-sm">{i + 1}</td>
                  <td className="px-4 py-3 font-semibold text-gray-800 text-sm sm:text-base">
                    {cat.name}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        cat.count > 0 ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {cat.count} منتج
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => onEdit(cat)}
                        className="text-blue-500 hover:text-blue-700 p-1 rounded hover:bg-blue-50 transition-colors"
                        title="تعديل اسم التصنيف"
                      >
                        <EditIcon />
                      </button>
                      <button
                        onClick={() => onDelete(cat)}
                        className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors"
                        title="حذف التصنيف"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
});

export default CategoriesTable;
