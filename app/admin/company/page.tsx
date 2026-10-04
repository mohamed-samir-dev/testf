"use client";
import { useCompany } from "./hooks/useCompany";
import CompanyFields from "./components/CompanyFields";
import CompanyImages from "./components/CompanyImages";

export default function CompanyPage() {
  const {
    data,
    loading,
    saving,
    uploadingKey,
    previewUrls,
    loadError,
    handleChange,
    handleImageChange,
    handleImageDelete,
    handleSave,
    retryLoad,
  } = useCompany();

  if (loading) return <div className="text-center py-20 text-gray-500 text-xl">جاري التحميل...</div>;

  // Error state: shown when the initial fetch fails so the user can retry
  // instead of being left with an empty form that silently discards changes.
  if (loadError) {
    return (
      <div className="text-center py-20 space-y-4">
        <p className="text-red-600 text-lg font-semibold">فشل تحميل بيانات الشركة</p>
        <button
          onClick={retryLoad}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  const isBusy = saving || !!uploadingKey;

  return (
    <div className="pt-2">
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-800 mb-4 sm:mb-6">بيانات الشركة</h1>
      <div className="bg-white rounded-xl shadow p-4 sm:p-6 space-y-4 sm:space-y-5">
        <CompanyFields data={data} onChange={handleChange} disabled={saving} />
        <CompanyImages
          data={data}
          uploadingKey={uploadingKey}
          previewUrls={previewUrls}
          disabled={saving}
          onImageChange={handleImageChange}
          onImageDelete={handleImageDelete}
        />
        <button
          onClick={handleSave}
          disabled={isBusy}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold py-3 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isBusy && <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />}
          <span>
            {saving ? "جاري الحفظ..." : uploadingKey ? "جاري رفع الصورة..." : "حفظ البيانات"}
          </span>
        </button>
      </div>
    </div>
  );
}

