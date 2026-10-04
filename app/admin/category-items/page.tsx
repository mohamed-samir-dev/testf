"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { apiFetch } from "../../lib/api";

type SubCat = { name: string; category: string; count: number };
type Settings = { category: string; subCategory: string; showInHome: boolean; order: number };

export default function CategoryItemsPage() {
  const [items, setItems] = useState<SubCat[]>([]);
  const [settings, setSettings] = useState<Settings[]>([]);
  const [max, setMax] = useState(4);
  const [maxInput, setMaxInput] = useState<string>("4");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [search, setSearch] = useState("");
  const [actionLoadingKey, setActionLoadingKey] = useState<string | null>(null);

  const loadData = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setFetchError(false);

    try {
      const [subsRes, setsRes, maxRes] = await Promise.all([
        apiFetch("/api/admin/sub-categories", { credentials: "include", signal }),
        apiFetch("/api/admin/sub-categories/settings", { credentials: "include", signal }),
        apiFetch("/api/admin/sub-categories/settings/max", { credentials: "include", signal }),
      ]);

      if (signal?.aborted) return;

      if (!subsRes.ok || !setsRes.ok || !maxRes.ok) {
        throw new Error("One or more requests failed");
      }

      const [subs, sets, maxData] = await Promise.all([
        subsRes.json(),
        setsRes.json(),
        maxRes.json(),
      ]);

      if (signal?.aborted) return;

      setItems(Array.isArray(subs) ? subs : []);
      setSettings(Array.isArray(sets) ? sets : []);
      const m = typeof maxData?.max === "number" ? maxData.max : 4;
      setMax(m);
      setMaxInput(String(m));
      setLoading(false);
    } catch (err) {
      if (signal?.aborted) return;
      console.error("[category-items] fetch error:", err);
      setLoading(false);
      setFetchError(true);
      toast.error("فشل تحميل البيانات، يرجى إعادة المحاولة");
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    loadData(controller.signal);
    return () => controller.abort();
  }, [loadData]);

  // Save maximum allowed categories in homepage
  async function handleSaveMax() {
    const parsed = parseInt(maxInput, 10);
    if (isNaN(parsed) || parsed < 1) return toast.error("الحد الأدنى 1");
    if (parsed > 50) return toast.error("الحد الأقصى 50");

    setSaving(true);
    try {
      const res = await apiFetch("/api/admin/sub-categories/settings/max", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ max: parsed }),
      });
      if (!res.ok) {
        toast.error("حدث خطأ أثناء الحفظ");
      } else {
        setMax(parsed);
        toast.success(`تم تحديث الحد إلى ${parsed} ✅`);
      }
    } catch {
      toast.error("تعذّر الاتصال بالخادم");
    } finally {
      setSaving(false);
    }
  }

  // Hide / remove a category from home directly
  async function handleToggleHide(catKey: string, subCatName: string) {
    const itemKey = `${catKey}||${subCatName}`;
    setActionLoadingKey(itemKey);

    try {
      const res = await apiFetch("/api/admin/sub-categories/settings/toggle", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ category: catKey, subCategory: subCatName }),
      });
      if (!res.ok) throw new Error("Toggle failed");
      const { showInHome } = await res.json();

      setSettings((prev) =>
        prev.map((s) =>
          s.category === catKey && s.subCategory === subCatName ? { ...s, showInHome } : s
        )
      );

      toast.success(showInHome ? "سيظهر في الرئيسية ✅" : "تم الإخفاء من الرئيسية");
    } catch {
      toast.error("فشل تعديل حالة العرض في الرئيسية");
    } finally {
      setActionLoadingKey(null);
    }
  }

  // Reorder priority (Move Up / Down)
  async function handleMove(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= visible.length) return;

    const currentItem = visible[index];
    const targetItem = visible[targetIndex];

    const currentKey = `${currentItem.category}||${currentItem.subCategory}`;
    setActionLoadingKey(currentKey);

    const newOrderCurrent = targetItem.order || targetIndex;
    const newOrderTarget = currentItem.order || index;

    // Optimistic update
    setSettings((prev) =>
      prev.map((s) => {
        if (s.category === currentItem.category && s.subCategory === currentItem.subCategory) {
          return { ...s, order: newOrderCurrent };
        }
        if (s.category === targetItem.category && s.subCategory === targetItem.subCategory) {
          return { ...s, order: newOrderTarget };
        }
        return s;
      })
    );

    try {
      await Promise.all([
        apiFetch("/api/admin/sub-categories/settings/order", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            category: currentItem.category,
            subCategory: currentItem.subCategory,
            order: newOrderCurrent,
          }),
        }),
        apiFetch("/api/admin/sub-categories/settings/order", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            category: targetItem.category,
            subCategory: targetItem.subCategory,
            order: newOrderTarget,
          }),
        }),
      ]);
      toast.success("تم تحديث ترتيب العرض ✅");
    } catch {
      toast.error("فشل حفظ الترتيب الجديد");
      loadData(); // Revert on failure
    } finally {
      setActionLoadingKey(null);
    }
  }

  // Build O(1) lookup Map for product counts
  const itemsMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) {
      if (item.category) map.set(item.category, item.count);
      if (item.name) map.set(item.name, item.count);
      map.set(`${item.category}||${item.name}`, item.count);
    }
    return map;
  }, [items]);

  // Visible homepage categories sorted by order
  const visible = useMemo(() => {
    return settings
      .filter((s) => s.showInHome && s.category !== "__config__")
      .sort((a, b) => a.order - b.order)
      .map((s) => {
        const count =
          itemsMap.get(`${s.category}||${s.subCategory}`) ??
          itemsMap.get(s.category) ??
          itemsMap.get(s.subCategory) ??
          0;
        return { ...s, count };
      });
  }, [settings, itemsMap]);

  // Filtered by search
  const filteredVisible = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return visible;
    return visible.filter(
      (s) =>
        s.category.toLowerCase().includes(q) ||
        s.subCategory.toLowerCase().includes(q)
    );
  }, [visible, search]);

  const parsedMaxInput = parseInt(maxInput, 10);
  const maxInputValid = !isNaN(parsedMaxInput) && parsedMaxInput >= 1 && parsedMaxInput <= 50;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 sm:mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">
              التصنيفات المعروضة في الرئيسية
            </h1>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                visible.length >= max
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {visible.length} من {max}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            تحكم في التصنيفات التي تظهر في الصفحة الرئيسية لمتجرك وترتيب ظهورها
          </p>
        </div>

        <Link
          href="/admin/sub-categories"
          className="inline-flex items-center justify-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs sm:text-sm font-medium px-3.5 py-2 rounded-lg transition-colors w-fit"
        >
          <span>إدارة كافة التصنيفات</span>
          <span>←</span>
        </Link>
      </div>

      {/* Max control bar */}
      <div className="bg-white rounded-xl shadow p-4 mb-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs sm:text-sm text-gray-700 font-semibold">
            الحد الأقصى للتصنيفات في الرئيسية:
          </span>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min={1}
              max={50}
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              className="w-20 border border-gray-300 rounded-lg px-2.5 py-1.5 text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSaveMax}
              disabled={saving || !maxInputValid || parsedMaxInput === max}
              className="bg-blue-600 text-white text-xs sm:text-sm font-medium px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all"
            >
              {saving ? "جاري الحفظ..." : "حفظ الحد"}
            </button>
          </div>
        </div>

        {maxInputValid && visible.length > parsedMaxInput && (
          <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
            <span>⚠️</span>
            <span>
              يوجد <span className="font-bold">{visible.length}</span> تصنيف مختار، سيظهر أول{" "}
              <span className="font-bold">{parsedMaxInput}</span> فقط في الواجهة.
            </span>
          </div>
        )}
      </div>

      {/* Search & Table Card */}
      <div className="bg-white rounded-xl shadow overflow-hidden">
        {visible.length > 5 && (
          <div className="p-3 border-b border-gray-100 bg-gray-50/50 flex justify-end">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="تصفية حسب الاسم..."
              className="w-full sm:w-56 border border-gray-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right min-w-[550px]">
            <thead className="bg-gray-50 text-gray-600 font-semibold text-xs sm:text-sm border-b border-gray-100">
              <tr>
                <th className="px-4 py-3 w-16 text-center">الترتيب</th>
                <th className="px-4 py-3">اسم التصنيف</th>
                <th className="px-4 py-3">التصنيف الرئيسي</th>
                <th className="px-4 py-3">عدد المنتجات</th>
                <th className="px-4 py-3 text-center">حالة الظهور</th>
                <th className="px-4 py-3 text-center w-36">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 4 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="px-4 py-3 text-center"><div className="h-4 w-6 bg-gray-200 rounded mx-auto"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-28 bg-gray-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                    <td className="px-4 py-3"><div className="h-4 w-16 bg-gray-200 rounded"></div></td>
                    <td className="px-4 py-3 text-center"><div className="h-4 w-14 bg-gray-200 rounded mx-auto"></div></td>
                    <td className="px-4 py-3 text-center"><div className="h-4 w-20 bg-gray-200 rounded mx-auto"></div></td>
                  </tr>
                ))
              ) : fetchError ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm">
                    <span className="text-red-500 font-medium">⚠️ فشل تحميل البيانات</span>
                    <button
                      onClick={() => loadData()}
                      className="mr-3 text-blue-600 underline text-xs font-semibold"
                    >
                      إعادة المحاولة
                    </button>
                  </td>
                </tr>
              ) : filteredVisible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400 text-sm">
                    {search ? (
                      "لا توجد نتائج تطابق بحثك"
                    ) : (
                      <div className="space-y-2">
                        <p>لا توجد تصنيفات مفعلة للعرض في الرئيسية حالياً</p>
                        <Link
                          href="/admin/sub-categories"
                          className="inline-block text-xs text-blue-600 hover:underline font-semibold"
                        >
                          انتقل إلى صفحة التصنيفات الفرعية لتفعيلها في الرئيسية ←
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                filteredVisible.map((s, i) => {
                  const isExceedingMax = i >= max;
                  const itemKey = `${s.category}||${s.subCategory}`;
                  const isActionLoading = actionLoadingKey === itemKey;

                  return (
                    <tr
                      key={itemKey}
                      className={`hover:bg-gray-50 transition-colors ${
                        isExceedingMax ? "bg-gray-50/70 opacity-60" : ""
                      }`}
                    >
                      {/* Order Position */}
                      <td className="px-4 py-3 text-center font-bold text-gray-600 text-xs sm:text-sm">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-gray-700">
                          {i + 1}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="px-4 py-3 font-semibold text-gray-800 text-xs sm:text-sm">
                        {s.subCategory || s.category}
                      </td>

                      {/* Category */}
                      <td className="px-4 py-3 text-gray-600 text-xs sm:text-sm">
                        {s.category || "-"}
                      </td>

                      {/* Product count */}
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            s.count > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {s.count} منتج
                        </span>
                      </td>

                      {/* Status badge */}
                      <td className="px-4 py-3 text-center">
                        {isExceedingMax ? (
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                            تجاوز الحد (مخفي)
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            معروض بالرئيسية
                          </span>
                        )}
                      </td>

                      {/* Actions: Reorder + Hide */}
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Move Up */}
                          <button
                            onClick={() => handleMove(i, "up")}
                            disabled={i === 0 || isActionLoading}
                            className="p-1 rounded text-gray-500 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                            title="تقديم في الترتيب"
                          >
                            ▲
                          </button>
                          {/* Move Down */}
                          <button
                            onClick={() => handleMove(i, "down")}
                            disabled={i === visible.length - 1 || isActionLoading}
                            className="p-1 rounded text-gray-500 hover:text-blue-600 hover:bg-blue-50 disabled:opacity-20 disabled:hover:bg-transparent transition-colors"
                            title="تأخير في الترتيب"
                          >
                            ▼
                          </button>

                          {/* Quick Toggle / Hide */}
                          <button
                            onClick={() => handleToggleHide(s.category, s.subCategory)}
                            disabled={isActionLoading}
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors disabled:opacity-50"
                            title="إخفاء من الرئيسية"
                          >
                            {isActionLoading ? "..." : "إخفاء"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
