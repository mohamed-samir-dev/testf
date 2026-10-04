"use client";
import { memo } from "react";
import type { Category } from "../types";

interface EditModalProps {
  editCat: Category;
  editName: string;
  editError: string;
  editLoading: boolean;
  onNameChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}

const EditModal = memo(function EditModal({
  editCat,
  editName,
  editError,
  editLoading,
  onNameChange,
  onSubmit,
  onClose,
}: EditModalProps) {
  const trimmed = editName.trim();
  const isValid = trimmed.length > 0 && trimmed !== editCat.name;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4"
      dir="rtl"
      onClick={(e) => {
        if (e.target === e.currentTarget && !editLoading) onClose();
      }}
    >
      <div className="bg-white rounded-xl p-5 sm:p-6 w-full max-w-md shadow-2xl">
        <h2 className="text-base sm:text-lg font-bold text-gray-800 mb-2">تعديل التصنيف</h2>
        <p className="text-xs text-gray-500 mb-4">الاسم الحالي: <span className="font-semibold text-gray-700">{editCat.name}</span></p>

        {editCat.count > 0 && (
          <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            ⚠️ سيتم تحديث اسم هذا التصنيف تلقائياً في <span className="font-bold underline">{editCat.count} منتج</span> مرتبط به.
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              اسم التصنيف الجديد
            </label>
            <input
              type="text"
              value={editName}
              onChange={(e) => onNameChange(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              autoFocus
              disabled={editLoading}
            />
          </div>
          {editError && <p className="text-red-500 text-xs sm:text-sm">{editError}</p>}
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={editLoading || !isValid}
              className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 transition-colors"
            >
              {editLoading ? "جاري الحفظ..." : "حفظ التعديلات"}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={editLoading}
              className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

export default EditModal;
