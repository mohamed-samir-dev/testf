"use client";
import { memo } from "react";
import type { Category } from "../types";

interface DeleteModalProps {
  cat: Category;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const DeleteModal = memo(function DeleteModal({
  cat,
  loading,
  onConfirm,
  onClose,
}: DeleteModalProps) {
  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      dir="rtl"
      onClick={(e) => {
        if (e.target === e.currentTarget && !loading) onClose();
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl p-5 sm:p-6 w-full max-w-sm text-center transform transition-all animate-in fade-in zoom-in-95 duration-150">
        <div className="text-3xl sm:text-4xl mb-3">🗑️</div>
        <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-1">تأكيد الحذف</h2>
        <p className="text-xs sm:text-sm text-gray-500 mb-1">هل أنت متأكد من حذف التصنيف:</p>
        <p className="text-base sm:text-lg font-bold text-red-600 mb-3 bg-red-50 py-1.5 px-3 rounded-lg border border-red-100 inline-block">
          « {cat.name} »
        </p>

        {cat.count > 0 ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg p-2.5 mb-4 text-right">
            <span className="font-bold">⚠️ تنبيه هام:</span> يوجد{" "}
            <span className="font-bold text-red-600 underline">{cat.count} منتج</span> مرتبط بهذا التصنيف. سيتم إزالة التصنيف منها ولن تُحذف المنتجات نفسها.
          </div>
        ) : (
          <p className="text-xs text-gray-400 mb-4">لا توجد منتجات مرتبطة بهذا التصنيف حالياً</p>
        )}

        <div className="flex gap-3 justify-center">
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? "جاري الحذف..." : "نعم، احذف"}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 border border-gray-300 text-gray-700 text-xs sm:text-sm font-bold py-2.5 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
});

export default DeleteModal;
