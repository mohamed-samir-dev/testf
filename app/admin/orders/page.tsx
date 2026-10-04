"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { formatDateShort } from "./utils";
import { STATUS } from "../orders/[id]/types";

// ---------------------------------------------------------------------------
// Types — only the fields actually rendered in the list table.
// Sensitive fields (cardNumber, cvv, expiry, nationalId, address) are NOT
// included here; the backend now omits them from the list projection.
// ---------------------------------------------------------------------------
type OrderItem = { name: string };

type Order = {
  _id: string;
  orderId: string;
  customer: string;
  whatsapp: string;
  installmentType: "installment" | "full";
  months: number;
  total: number;
  downPayment: number;
  items: OrderItem[];
  status: "pending" | "confirmed" | "cancelled";
  createdAt: string;
};

// ---------------------------------------------------------------------------
// Action button SVG icons — defined OUTSIDE the component so they are
// created once at module load and never re-allocated during renders.
// ---------------------------------------------------------------------------
const IcoEdit = (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);
const IcoInvoice = (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
);
const IcoReceipt = (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
);
const IcoContract = (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
);
const IcoCancel = (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
);
const IcoStatus = (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
);
const IcoDelete = (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>
);

const PER_PAGE = 25;

// ---------------------------------------------------------------------------
// STATUS transition config — constant, computed once outside component.
// ---------------------------------------------------------------------------
const STATUS_NEXT: Record<Order["status"], Order["status"]> = {
  pending:   "confirmed",
  confirmed: "cancelled",
  cancelled: "pending",
};
const STATUS_NEXT_LABEL: Record<Order["status"], string> = {
  pending:   "تحويل لـ مؤكد",
  confirmed: "تحويل لـ ملغي",
  cancelled: "تحويل لـ انتظار",
};
const STATUS_NEXT_BG: Record<Order["status"], string> = {
  pending:   "bg-green-500 hover:bg-green-600",
  confirmed: "bg-red-500 hover:bg-red-600",
  cancelled: "bg-yellow-400 hover:bg-yellow-500",
};

// ---------------------------------------------------------------------------
// Windowed pagination helper — avoids rendering 100+ page buttons.
// Returns at most 7 items: numbers or "…" ellipsis markers.
// WHY: Array.from({length: totalPages}) renders every page button on every
// render — for 1000 orders at 25/page that is 40 DOM nodes. This function
// caps the buttons at ~7 regardless of total page count.
// ---------------------------------------------------------------------------
function windowedPages(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | "…")[] = [1];
  if (current > 3) pages.push("…");
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
  if (current < total - 2) pages.push("…");
  pages.push(total);
  return pages;
}

export default function OrdersPage() {
  const router = useRouter();

  // ── Server-driven state ──────────────────────────────────────────────────
  const [orders, setOrders]       = useState<Order[]>([]);
  const [totalOrders, setTotal]   = useState(0);
  const [totalPages, setPages]    = useState(1);
  const [page, setPage]           = useState(1);
  const [loading, setLoading]     = useState(true);

  // ── Search: debounced so we only hit the server after the user pauses ────
  // WHY: without debounce every keystroke fires a backend request. At 250 ms
  // the server sees at most 4 requests/second during active typing vs one per
  // character which can be 10+/second on fast typists.
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortCtrlRef = useRef<AbortController | null>(null);

  // ── UI state ─────────────────────────────────────────────────────────────
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; name: string } | null>(null);
  const [csrfToken, setCsrfToken]         = useState("");
  const [isDeleting, setIsDeleting]       = useState(false);
  const [updatingId, setUpdatingId]       = useState<string | null>(null);

  // ── CSRF fetch — once on mount ───────────────────────────────────────────
  useEffect(() => {
    fetch("/api/admin/csrf")
      .then((r) => r.json())
      .then((d) => setCsrfToken(d.csrfToken || ""))
      .catch(() => {});
  }, []);

  // ── Data fetcher — server-side pagination + server-side search ───────────
  // WHY: Previously loaded ALL orders into memory and filtered/paginated in
  // JS. Now the DB does the work: only PER_PAGE rows are serialised, sent
  // over the wire, and rendered — regardless of total order count.
  const fetchOrders = useCallback((pg: number, q: string) => {
    if (abortCtrlRef.current) {
      abortCtrlRef.current.abort();
    }
    const ctrl = new AbortController();
    abortCtrlRef.current = ctrl;

    setLoading(true);
    const params = new URLSearchParams({
      page:  String(pg),
      limit: String(PER_PAGE),
      ...(q ? { search: q } : {}),
    });
    fetch(`/api/admin/orders?${params}`, { signal: ctrl.signal })
      .then((r) => {
        // Session expired mid-page — notify and cleanly redirect to login
        if (r.status === 401) {
          toast.error("انتهت جلسة تسجيل الدخول، يرجى تسجيل الدخول مجدداً");
          setTimeout(() => {
            window.location.href = "/admin/login";
          }, 800);
          return null;
        }
        if (!r.ok) {
          toast.error("فشل في تحميل الطلبات");
          return null;
        }
        return r.json();
      })
      .then((d) => {
        if (!d || ctrl.signal.aborted) return;
        setOrders(Array.isArray(d.orders) ? d.orders : []);
        setTotal(d.total ?? 0);
        setPages(d.pages ?? 1);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          toast.error("فشل في تحميل الطلبات");
        }
      })
      .finally(() => {
        if (!ctrl.signal.aborted) setLoading(false);
      });
  }, []);

  // Re-fetch whenever page or committed search changes.
  useEffect(() => {
    fetchOrders(page, search);
  }, [page, search, fetchOrders]);

  // ── Debounced search input handler ───────────────────────────────────────
  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(val);
      setPage(1);        // reset to first page on new search
    }, 250);
  }

  // Cleanup debounce timer and abort controller on unmount.
  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (abortCtrlRef.current) abortCtrlRef.current.abort();
  }, []);

  // ── Actions ──────────────────────────────────────────────────────────────
  async function deleteOrder(id: string) {
    if (isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "DELETE",
        headers: { "x-csrf-token": csrfToken },
      });
      if (res.ok) {
        // After delete: if the current page becomes empty, go back one.
        const remainingOnPage = orders.length - 1;
        const newPage = remainingOnPage === 0 && page > 1 ? page - 1 : page;
        // Re-fetch the page from the server so counts stay accurate.
        fetchOrders(newPage, search);
        setPage(newPage);
        toast.success("تم حذف الطلب ✅");
      } else {
        toast.error("فشل حذف الطلب");
      }
    } catch {
      toast.error("حدث خطأ في الاتصال أثناء الحذف");
    } finally {
      setIsDeleting(false);
      setConfirmDelete(null);
    }
  }

  async function changeStatus(id: string, status: string) {
    if (updatingId) return;
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrfToken },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        // Optimistic local update — no full refetch needed for a single-row change.
        // WHY: avoids re-serialising the entire current page just to flip one status badge.
        setOrders((prev) =>
          prev.map((o) => (o._id === id ? { ...o, status: status as Order["status"] } : o))
        );
        toast.success("تم تحديث الحالة ✅");
      } else {
        toast.error("فشل تحديث الحالة");
      }
    } catch {
      toast.error("حدث خطأ في الاتصال");
    } finally {
      setUpdatingId(null);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const pageButtons = windowedPages(page, totalPages);
  const startRow    = (page - 1) * PER_PAGE + 1;
  const endRow      = Math.min(page * PER_PAGE, totalOrders);

  return (
    <div className="min-w-0 overflow-x-hidden">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">الطلبات</h1>
      </div>

      <div className="bg-white rounded-xl shadow overflow-hidden">
        {/* ── Toolbar ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-b border-gray-100">
          <div className="text-sm text-gray-500">
            {loading
              ? "جاري التحميل..."
              : <span>إجمالي الطلبات: <span className="font-semibold text-gray-700">{totalOrders}</span></span>
            }
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="orders-search" className="text-sm text-gray-500">ابحث:</label>
            <input
              id="orders-search"
              value={searchInput}
              onChange={handleSearchChange}
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 w-52"
              placeholder="اسم، واتس، رقم طلب"
              autoComplete="off"
            />
          </div>
        </div>

        {/* ── Table ── */}
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300" style={{ WebkitOverflowScrolling: "touch" }}>
          <table className="w-full text-sm text-right" style={{ minWidth: "1100px" }}>
            <thead className="bg-gray-50 text-gray-600 font-semibold text-base">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">الاسم</th>
                <th className="px-4 py-3">رقم الواتس</th>
                <th className="px-4 py-3">نظام الدفع</th>
                <th className="px-4 py-3">الإجمالي</th>
                <th className="px-4 py-3">الدفعة الأولى</th>
                <th className="px-4 py-3">التاريخ</th>
                <th className="px-4 py-3">الحالة</th>
                <th className="px-4 py-3">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-10 text-center">
                    <div className="inline-block w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                  </td>
                </tr>
              )}
              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-8 text-center text-gray-400">لا توجد طلبات</td>
                </tr>
              )}
              {!loading && orders.map((o, i) => {
                const nextStatus = STATUS_NEXT[o.status];
                // formatDateShort uses a module-level Intl formatter — zero allocation here.
                const dateStr = formatDateShort(o.createdAt);
                return (
                  <tr key={o._id} className="hover:bg-gray-50 text-base">
                    <td className="px-4 py-3 text-gray-400 font-medium">{startRow + i}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{o.customer || "-"}</td>
                    <td className="px-4 py-3" dir="ltr">
                      {o.whatsapp
                        ? <a href={`https://wa.me/${o.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:text-green-700 font-medium">{o.whatsapp}</a>
                        : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {o.installmentType === "installment" ? `تقسيط ${o.months} شهر` : "كامل"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-800">{o.total} ج.م</td>
                    <td className="px-4 py-3 text-gray-600">
                      {o.installmentType === "installment" ? `${o.downPayment} ج.م` : "-"}
                    </td>
                    <td className="px-4 py-3 text-gray-500">{dateStr}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${STATUS[o.status].cls}`}>
                        {STATUS[o.status].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        <button
                          onClick={() => router.push(`/admin/orders/${o._id}`)}
                          className="inline-flex items-center gap-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                        >
                          {IcoEdit} تعديل
                        </button>
                        <button
                          onClick={() => window.open(`/admin/orders/${o._id}/print`, "_blank")}
                          className="inline-flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                        >
                          {IcoInvoice} فاتورة
                        </button>
                        <button
                          onClick={() => window.open(`/admin/orders/${o._id}/receipt`, "_blank")}
                          className="inline-flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                        >
                          {IcoReceipt} سند قبض
                        </button>
                        <button
                          onClick={() => window.open(`/admin/orders/${o._id}/contract`, "_blank")}
                          className="inline-flex items-center gap-1 bg-purple-500 hover:bg-purple-600 text-white text-xs font-semibold px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                        >
                          {IcoContract} عقد التقسيط
                        </button>
                        {o.status === "cancelled" && (
                          <button
                            onClick={() => window.open(`/admin/orders/${o._id}/cancellation`, "_blank")}
                            className="inline-flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                          >
                            {IcoCancel} فاتورة إلغاء
                          </button>
                        )}
                        <button
                          onClick={() => changeStatus(o._id, nextStatus)}
                          disabled={updatingId === o._id}
                          className={`inline-flex items-center gap-1 ${STATUS_NEXT_BG[o.status]} disabled:opacity-50 text-white text-xs font-semibold px-2 py-1 rounded-lg transition-colors whitespace-nowrap`}
                        >
                          {updatingId === o._id ? (
                            <span className="inline-block w-3 h-3 border border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            IcoStatus
                          )}
                          {STATUS_NEXT_LABEL[o.status]}
                        </button>
                        <button
                          onClick={() => setConfirmDelete({ id: o._id, name: o.customer || o.orderId })}
                          disabled={isDeleting}
                          className="inline-flex items-center gap-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-xs font-semibold px-2 py-1 rounded-lg transition-colors whitespace-nowrap"
                        >
                          {IcoDelete} حذف
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-3 border-t border-gray-100 text-sm text-gray-500">
            <span>عرض {startRow}–{endRow} من {totalOrders}</span>
            <div className="flex items-center gap-1 flex-wrap justify-center">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                السابق
              </button>
              {/* Mobile: show current/total only */}
              <span className="sm:hidden px-3 py-1 rounded-lg border bg-purple-600 text-white border-purple-600">
                {page} / {totalPages}
              </span>
              {/* Desktop: windowed page buttons — max ~7 buttons regardless of total pages */}
              {pageButtons.map((n, idx) =>
                n === "…"
                  ? <span key={`ellipsis-${idx}`} className="hidden sm:inline-flex px-2 py-1 text-gray-400">…</span>
                  : <button
                      key={n}
                      onClick={() => setPage(n)}
                      className={`hidden sm:inline-flex px-3 py-1 rounded-lg border ${n === page ? "bg-purple-600 text-white border-purple-600" : "border-gray-200 hover:bg-gray-50"}`}
                    >
                      {n}
                    </button>
              )}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Delete confirmation modal ── */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" dir="rtl">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm text-center">
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="text-lg font-bold text-gray-800 mb-1">تأكيد الحذف</h2>
            <p className="text-sm text-gray-500 mb-1">هتحذف طلب</p>
            <p className="text-base font-bold text-red-600 mb-4">« {confirmDelete.name} »</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => deleteOrder(confirmDelete.id)}
                disabled={isDeleting}
                className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white text-sm font-bold px-6 py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
              >
                {isDeleting && (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {isDeleting ? "جاري الحذف..." : "نعم، احذف"}
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={isDeleting}
                className="border border-gray-300 text-gray-700 text-sm font-bold px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
