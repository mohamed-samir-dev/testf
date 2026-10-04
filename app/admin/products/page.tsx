"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "../../lib/api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
type Product = {
  _id: string;
  name: string;
  category: string;
  originalPrice: number;
  salePrice?: number;
};

type SubCat = { name: string; category: string; count: number };

type PageData = {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
};

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const PAGE_SIZE = 25;

// ---------------------------------------------------------------------------
// Icons — defined once at module level, never re-created per render.
// ---------------------------------------------------------------------------
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
  </svg>
);

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export default function ProductsPage() {
  const router = useRouter();

  // Server-driven state
  const [pageData, setPageData]     = useState<PageData | null>(null);
  const [subCats, setSubCats]       = useState<SubCat[]>([]);
  const [loading, setLoading]       = useState(true);

  // Filter state
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCat, setSelectedCat] = useState<string>("");
  // searchInput is what the user types; searchQuery is debounced and actually
  // sent to the server. This means zero API calls per keystroke — only one
  // call fires 350 ms after the user stops typing.
  const [searchInput, setSearchInput]   = useState("");
  const [searchQuery, setSearchQuery]   = useState("");

  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting]           = useState(false);

  // Debounce: schedule one fetch 350 ms after the last keystroke.
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ------------------------------------------------------------------
  // Fetch one page from the server.
  // WHY: All filtering, searching, and slicing happen in MongoDB —
  // the browser receives only PAGE_SIZE documents instead of the entire
  // catalogue.
  // ------------------------------------------------------------------
  const fetchPage = useCallback(async (page: number, q: string, category: string, signal?: AbortSignal) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(PAGE_SIZE),
      });
      if (q)        params.set("q", q);
      if (category) params.set("category", category);

      const res = await apiFetch(`/api/admin/products?${params}`, { credentials: "include", ...(signal ? { signal } : {}) });
      if (res.status === 401) {
        toast.error("انتهت الجلسة، يرجى تسجيل الدخول مجدداً");
        router.push("/admin/login");
        return;
      }
      if (res.ok && !signal?.aborted) {
        setPageData(await res.json());
      } else if (!signal?.aborted) {
        toast.error("فشل تحميل قائمة المنتجات");
      }
    } catch (err: unknown) {
      if (!signal?.aborted) {
        console.error("fetchPage error:", err);
      }
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [router]);

  const fetchSubCats = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await apiFetch("/api/admin/sub-categories", { credentials: "include", ...(signal ? { signal } : {}) });
      if (res.ok && !signal?.aborted) {
        const data: SubCat[] = await res.json();
        setSubCats(data);
      }
    } catch {
      // ignore abort or network blip
    }
  }, []);

  const isFirstRun = useRef(true);
  useEffect(() => {
    const controller = new AbortController();

    if (isFirstRun.current) {
      isFirstRun.current = false;
      fetchSubCats(controller.signal);
    }

    fetchPage(currentPage, searchQuery, selectedCat, controller.signal);

    return () => controller.abort();
  }, [currentPage, searchQuery, selectedCat, fetchPage, fetchSubCats]);

  // ------------------------------------------------------------------
  // Search debounce
  // ------------------------------------------------------------------
  function handleSearchChange(value: string) {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(value);
      setCurrentPage(1); // reset to page 1 on new search
    }, 350);
  }

  // ------------------------------------------------------------------
  // Category filter
  // ------------------------------------------------------------------
  function handleCategoryClick(cat: string) {
    setSelectedCat(cat);
    setCurrentPage(1);
  }

  // ------------------------------------------------------------------
  // Delete
  // ------------------------------------------------------------------
  async function confirmDeleteAction() {
    if (!confirmDelete || deleting) return;
    const { id, name } = confirmDelete;
    setConfirmDelete(null);
    setDeleting(true);
    try {
      const res  = await apiFetch(`/api/admin/products/${id}`, { method: "DELETE", credentials: "include" });
      const text = await res.text();
      const data = text ? JSON.parse(text) : {};
      if (!res.ok) return toast.error(data.error || data.message || "فشل الحذف");
      toast.success(`تم حذف "${name}" بنجاح ✅`);
      // Stay on the same page; if it becomes empty the fetch will show page-1.
      const nextPage = pageData && pageData.products.length === 1 && currentPage > 1
        ? currentPage - 1
        : currentPage;
      setCurrentPage(nextPage);
      fetchPage(nextPage, searchQuery, selectedCat);
      fetchSubCats(); // Refresh category chips counts after deletion
    } catch {
      toast.error("حدث خطأ أثناء الحذف");
    } finally {
      setDeleting(false);
    }
  }

  // ------------------------------------------------------------------
  // Pagination helpers
  // ------------------------------------------------------------------
  const total      = pageData?.total      ?? 0;
  const totalPages = pageData?.totalPages ?? 1;
  const products   = pageData?.products   ?? [];

  function renderPageButtons() {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3)               pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2)  pages.push("...");
      pages.push(totalPages);
    }
    return pages.map((page, idx) =>
      page === "..." ? (
        <span key={`dots-${idx}`} className="px-2 py-1 text-gray-400 text-sm">...</span>
      ) : (
        <button
          key={page}
          onClick={() => setCurrentPage(page as number)}
          className={`px-3 py-1 rounded-lg border text-sm font-medium ${
            page === currentPage
              ? "bg-blue-600 text-white border-blue-600"
              : "border-gray-300 text-gray-600 hover:bg-gray-100"
          }`}
        >
          {page}
        </button>
      )
    );
  }

  // ------------------------------------------------------------------
  // Row counter: account for skip so row numbers are always correct.
  // ------------------------------------------------------------------
  const rowOffset = (currentPage - 1) * PAGE_SIZE;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">الأصناف</h1>
        <button
          onClick={() => router.push("/admin/products/new")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
        >
          + إضافة منتج
        </button>
      </div>

      {/* Category filter chips */}
      {subCats.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => handleCategoryClick("")}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              !selectedCat ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            الكل ({total})
          </button>
          {subCats.map((cat) => (
            <button
              key={cat.category}
              onClick={() => handleCategoryClick(cat.category)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                selectedCat === cat.category ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
              }`}
            >
              {cat.category} ({cat.count})
            </button>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl shadow overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
          <span className="text-sm text-gray-500">
            إجمالي المنتجات: <span className="font-bold text-gray-700">{total}</span>
          </span>
          <input
            type="text"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="ابحث عن منتج..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-72"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-max text-sm text-right">
            <thead className="bg-gray-50 text-gray-600 font-semibold text-base">
              <tr>
                <th className="px-5 py-3 w-12">#</th>
                <th className="px-5 py-3 min-w-[200px]">الاسم</th>
                <th className="px-5 py-3 min-w-[140px]">التصنيف</th>
                <th className="px-5 py-3 min-w-[130px]">السعر</th>
                <th className="px-5 py-3 min-w-[100px]">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center">
                    <div className="flex justify-center">
                      <div className="w-7 h-7 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400">لا توجد منتجات</td>
                </tr>
              ) : (
                products.map((p, i) => (
                  <tr key={p._id} className="hover:bg-gray-50 text-base">
                    <td className="px-5 py-3 text-gray-400 font-medium">{rowOffset + i + 1}</td>
                    <td className="px-5 py-3 font-medium text-gray-800">{p.name}</td>
                    <td className="px-5 py-3 text-gray-600">{p.category || "—"}</td>
                    <td className="px-5 py-3 text-gray-700">
                      {p.salePrice ? (
                        <span>
                          <span className="text-green-600 font-semibold">{p.salePrice} ج.م</span>
                          <span className="text-gray-400 line-through text-xs mr-1">{p.originalPrice}</span>
                        </span>
                      ) : (
                        <span>{p.originalPrice} ج.م</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => router.push(`/admin/products/${p._id}/edit`)} className="text-blue-500 hover:text-blue-700" title="تعديل">
                          <EditIcon />
                        </button>
                        <button onClick={() => setConfirmDelete({ id: p._id, name: p.name })} className="text-red-500 hover:text-red-700" title="حذف">
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 mt-4 flex-wrap">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            السابق
          </button>
          {renderPageButtons()}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 rounded-lg border border-gray-300 text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            التالي
          </button>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4" dir="rtl">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">تأكيد الحذف</h2>
            <p className="text-sm text-gray-500 mb-1">هتحذف المنتج</p>
            <p className="text-base font-bold text-red-600 mb-4">« {confirmDelete.name} »</p>
            <div className="flex gap-3 justify-center">
              <button onClick={confirmDeleteAction} disabled={deleting} className="bg-red-500 hover:bg-red-600 text-white text-sm font-bold px-6 py-2 rounded-lg transition-colors disabled:opacity-60">
                {deleting ? "جاري الحذف..." : "نعم، احذف"}
              </button>
              <button onClick={() => setConfirmDelete(null)} disabled={deleting} className="border border-gray-300 text-gray-700 text-sm font-bold px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-60">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
