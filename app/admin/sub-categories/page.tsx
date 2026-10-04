"use client";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";
import { apiFetch } from "../../lib/api";
import { compressImage } from "../../lib/image-utils";

type SubCat = { name: string; category: string; count: number };
type Settings = { category: string; subCategory: string; showInHome: boolean; order: number; image?: string };

// Icons defined outside the component to avoid re-creation on re-renders
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

const ImageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
  </svg>
);

// Arabic search normalization helper
function normalizeArabic(text: string): string {
  if (!text) return "";
  return text
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/[ىي]/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[\u064B-\u065F]/g, ""); // strip diacritics
}

export default function SubCategoriesPage() {
  const [items, setItems] = useState<SubCat[]>([]);
  const [settings, setSettings] = useState<Settings[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editItem, setEditItem] = useState<SubCat | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<SubCat | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [max, setMax] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 12;

  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState("");
  const [addLoading, setAddLoading] = useState(false);

  const [imageUploadCat, setImageUploadCat] = useState<SubCat | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageDeleting, setImageDeleting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Multi-key O(1) lookup Map for settings
  const settingsMap = useMemo(() => {
    const map = new Map<string, Settings>();
    for (const s of settings) {
      map.set(`${s.category}||${s.subCategory}`, s);
      if (!map.has(s.category)) map.set(s.category, s);
      if (!map.has(s.subCategory)) map.set(s.subCategory, s);
    }
    return map;
  }, [settings]);

  const getSetting = useCallback((cat: SubCat): Settings | undefined => {
    return (
      settingsMap.get(`${cat.category}||${cat.name}`) ||
      settingsMap.get(`${cat.name}||${cat.name}`) ||
      settingsMap.get(cat.name) ||
      settingsMap.get(cat.category)
    );
  }, [settingsMap]);

  // Derived counts and lists
  const visibleCount = useMemo(
    () => settings.filter((s) => s.showInHome && s.category !== "__config__").length,
    [settings]
  );

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const query = normalizeArabic(search);
    return items.filter(
      (c) =>
        normalizeArabic(c.name).includes(query) ||
        normalizeArabic(c.category || "").includes(query)
    );
  }, [items, search]);

  const totalPages = useMemo(() => Math.max(1, Math.ceil(filtered.length / PAGE_SIZE)), [filtered]);

  const paginated = useMemo(
    () => filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage]
  );

  const pageNumbers = useMemo(
    () => Array.from({ length: totalPages }, (_, i) => i + 1),
    [totalPages]
  );

  // Consolidated data fetch: 1 request instead of 4
  const fetchData = async (signal?: AbortSignal) => {
    const opts = { credentials: "include" as const, signal };
    try {
      // Try fast consolidated endpoint first
      const allRes = await apiFetch("/api/admin/sub-categories/all-data", opts);
      if (signal?.aborted) return;

      if (allRes.ok) {
        const data = await allRes.json();
        setItems(Array.isArray(data?.items) ? data.items : []);
        setSettings(Array.isArray(data?.settings) ? data.settings : []);
        setMax(data?.max ?? 4);
        return;
      }

      // Safe fallback to individual requests if all-data route not yet deployed
      const [res1, res2, res3, res4] = await Promise.all([
        apiFetch("/api/admin/sub-categories", opts),
        apiFetch("/api/admin/sub-categories/settings", opts),
        apiFetch("/api/admin/sub-categories/max", opts),
        apiFetch("/api/admin/sub-categories/extra", opts),
      ]);
      if (signal?.aborted) return;

      if (!res1.ok || !res2.ok) {
        toast.error("حدث خطأ أثناء تحميل البيانات");
        return;
      }
      const fromProducts: SubCat[] = await res1.json();
      const extra: SubCat[] = res4.ok ? await res4.json() : [];
      const names = new Set(fromProducts.map((c) => c.name));
      setItems([...fromProducts, ...extra.filter((c) => !names.has(c.name))]);
      setSettings(await res2.json());
      if (res3.ok) {
        const d = await res3.json();
        setMax(d?.max ?? 4);
      }
    } catch (err) {
      if (signal?.aborted) return;
      toast.error("تعذّر الاتصال بالخادم");
      console.error("[sub-categories fetch error]", err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    void fetchData(controller.signal);
    return () => controller.abort();
  }, []);

  // Image Upload with client-side compression
  async function handleImageUpload(rawFile: File) {
    if (!imageUploadCat) return;
    setImageUploading(true);
    try {
      // Compress to max 1200px / WebP — saves up to 98% bandwidth and prevents 413 error
      const compressed = await compressImage(rawFile, { maxWidth: 1200, maxHeight: 1200, quality: 0.82 });
      const fd = new FormData();
      fd.append("image", compressed);

      const targetKey = imageUploadCat.name || imageUploadCat.category;
      const res = await apiFetch(`/api/admin/sub-categories/image/${encodeURIComponent(targetKey)}`, {
        method: "POST",
        credentials: "include",
        body: fd,
      });

      if (!res.ok) {
        toast.error("حدث خطأ أثناء رفع الصورة");
        return;
      }

      const { url } = await res.json();
      toast.success("تم تغيير الصورة بنجاح ✅");

      // Update local settings state
      setSettings((prev) => {
        const catKey = targetKey;
        const exists = prev.find((s) => s.category === catKey || s.subCategory === catKey);
        if (exists) {
          return prev.map((s) =>
            s.category === catKey || s.subCategory === catKey ? { ...s, image: url } : s
          );
        }
        return [...prev, { category: catKey, subCategory: catKey, showInHome: false, order: 0, image: url }];
      });
      setImageUploadCat(null);
    } catch (err) {
      console.error("[image upload error]", err);
      toast.error("فشل رفع الصورة");
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  // Delete image
  async function handleImageDelete() {
    if (!imageUploadCat) return;
    setImageDeleting(true);
    try {
      const targetKey = imageUploadCat.name || imageUploadCat.category;
      const res = await apiFetch(`/api/admin/sub-categories/image/${encodeURIComponent(targetKey)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        toast.error("حدث خطأ أثناء حذف الصورة");
        return;
      }
      toast.success("تم إزالة الصورة المخصصة بنجاح ✅");
      setSettings((prev) =>
        prev.map((s) =>
          s.category === targetKey || s.subCategory === targetKey ? { ...s, image: "" } : s
        )
      );
      setImageUploadCat(null);
    } catch {
      toast.error("تعذّر الاتصال بالخادم");
    } finally {
      setImageDeleting(false);
    }
  }

  // Add new sub-category
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!addName.trim()) return;
    setAddLoading(true);
    try {
      const res = await apiFetch("/api/admin/sub-categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: addName.trim() }),
      });
      if (!res.ok) {
        const d = await res.json();
        return toast.error(d.error || "حدث خطأ أثناء الإضافة");
      }
      const created: SubCat = await res.json();
      toast.success(`تم إضافة "${created.name}" بنجاح 🎉`);
      setShowAddModal(false);
      setAddName("");
      setItems((prev) => {
        if (prev.some((i) => i.name === created.name)) return prev;
        return [{ name: created.name, category: created.category || "", count: 0 }, ...prev];
      });
    } catch {
      toast.error("تعذّر الاتصال بالخادم");
    } finally {
      setAddLoading(false);
    }
  }

  // Toggle show in home
  async function handleToggleHome(cat: SubCat) {
    const setting = getSetting(cat);
    if (!setting?.showInHome && visibleCount >= max) {
      return toast.error(`الحد الأقصى ${max} تصنيفات في الرئيسية`);
    }

    const catKey = cat.name || cat.category;
    try {
      const res = await apiFetch("/api/admin/sub-categories/settings/toggle", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ category: catKey, subCategory: catKey }),
      });
      if (!res.ok) return toast.error("حدث خطأ");

      const { showInHome } = await res.json();
      setSettings((prev) => {
        const exists = prev.find((s) => s.category === catKey || s.subCategory === catKey);
        if (exists) {
          return prev.map((s) =>
            s.category === catKey || s.subCategory === catKey ? { ...s, showInHome } : s
          );
        }
        return [...prev, { category: catKey, subCategory: catKey, showInHome, order: 0 }];
      });
      toast.success(showInHome ? "سيظهر في الرئيسية ✅" : "تم الإخفاء من الرئيسية");
    } catch {
      toast.error("تعذّر الاتصال بالخادم");
    }
  }

  // Order change on blur (only fires if changed)
  async function handleOrderChange(cat: SubCat, newOrder: number) {
    const setting = getSetting(cat);
    const currentOrder = setting?.order ?? 0;
    if (currentOrder === newOrder) return; // Skip redundant network request!

    const catKey = cat.name || cat.category;
    try {
      const res = await apiFetch("/api/admin/sub-categories/settings/order", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ category: catKey, subCategory: catKey, order: newOrder }),
      });
      if (!res.ok) {
        toast.error("حدث خطأ أثناء تحديث الترتيب");
        return;
      }
      setSettings((prev) => {
        const exists = prev.find((s) => s.category === catKey || s.subCategory === catKey);
        if (exists) {
          return prev.map((s) =>
            s.category === catKey || s.subCategory === catKey ? { ...s, order: newOrder } : s
          );
        }
        return [...prev, { category: catKey, subCategory: catKey, showInHome: false, order: newOrder }];
      });
      toast.success("تم تحديث الترتيب ✅");
    } catch {
      toast.error("تعذّر الاتصال بالخادم");
    }
  }

  // Edit sub-category
  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!editItem || !editName.trim()) return;
    setEditLoading(true);
    try {
      const res = await apiFetch("/api/admin/sub-categories/rename", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          oldName: editItem.name,
          oldCategory: editItem.category,
          newName: editName.trim(),
          newCategory: editCategory.trim(),
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        return toast.error(d?.error || "حدث خطأ أثناء التعديل");
      }
      toast.success("تم التعديل بنجاح ✅");

      const trimmedNewName = editName.trim();
      const trimmedNewCat = editCategory.trim();

      setItems((prev) =>
        prev.map((i) =>
          i.name === editItem.name ? { ...i, name: trimmedNewName, category: trimmedNewCat } : i
        )
      );

      setSettings((prev) =>
        prev.map((s) => {
          if (s.subCategory === editItem.name || s.category === editItem.name) {
            return { ...s, subCategory: trimmedNewName, category: trimmedNewName };
          }
          return s;
        })
      );
      setEditItem(null);
    } catch {
      toast.error("تعذّر الاتصال بالخادم");
    } finally {
      setEditLoading(false);
    }
  }

  // Delete sub-category
  async function handleDelete() {
    if (!confirmDelete) return;
    setDeleteLoading(true);
    try {
      const res = await apiFetch("/api/admin/sub-categories/remove", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: confirmDelete.name }),
      });
      if (!res.ok) return toast.error("حدث خطأ أثناء الحذف");
      toast.success(`تم حذف "${confirmDelete.name}" بنجاح ✅`);
      const targetName = confirmDelete.name;
      setItems((prev) => prev.filter((i) => i.name !== targetName));
      setSettings((prev) =>
        prev.filter((s) => s.subCategory !== targetName && s.category !== targetName)
      );
      setConfirmDelete(null);
    } catch {
      toast.error("تعذّر الاتصال بالخادم");
    } finally {
      setDeleteLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-800">التصنيفات الفرعية</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            إدارة التصنيفات، الصور المخصصة، والترتيب في الصفحة الرئيسية
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 text-xs sm:text-sm font-medium transition-colors shadow-sm"
        >
          <span className="text-base leading-none">+</span> إضافة تصنيف
        </button>
      </div>

      {/* Info Banner */}
      <div className="flex items-start gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs sm:text-sm">
        <span className="shrink-0 text-base">⚠️</span>
        <span>
          لعرض تصنيف فرعي في الصفحة الرئيسية، فعّل خيار{" "}
          <strong className="font-semibold text-amber-900">&ldquo;عرض في الرئيسية&rdquo;</strong> وحدد الترتيب (الأصغر يظهر أولاً).
          الحد الأقصى الحالي <strong className="font-bold">{max}</strong> تصنيفات — لتعديل الحد الأقصى زر صفحة{" "}
          <Link href="/admin/category-items" className="font-bold underline hover:text-amber-900">
            التصنيفات في الرئيسية
          </Link>.
        </span>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3 sm:px-4 py-3 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <span className="text-xs sm:text-sm text-gray-600">
              إجمالي التصنيفات: <strong className="text-gray-900">{items.length}</strong>
            </span>
            <span
              className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                visibleCount >= max ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-green-100 text-green-700"
              }`}
            >
              في الرئيسية: {visibleCount} / {max}
            </span>
          </div>

          <div className="relative w-full sm:w-64">
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="ابحث بالاسم أو التصنيف..."
              className="border border-gray-300 rounded-lg px-3 py-1.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full bg-white"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto scrollbar-visible">
          <table className="w-full text-xs sm:text-sm text-right min-w-[700px]">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
              <tr>
                <th className="px-3 sm:px-4 py-3 w-10">#</th>
                <th className="px-3 sm:px-4 py-3 w-14 text-center">الصورة</th>
                <th className="px-3 sm:px-4 py-3">اسم التصنيف الفرعي</th>
                <th className="px-3 sm:px-4 py-3">التصنيف الرئيسي</th>
                <th className="px-3 sm:px-4 py-3">عدد المنتجات</th>
                <th className="px-3 sm:px-4 py-3 text-center">عرض في الرئيسية</th>
                <th className="px-3 sm:px-4 py-3 text-center">الترتيب</th>
                <th className="px-3 sm:px-4 py-3 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-3 sm:px-4 py-3"><div className="h-4 bg-gray-200 rounded w-5" /></td>
                    <td className="px-3 sm:px-4 py-3"><div className="h-8 w-8 bg-gray-200 rounded-lg mx-auto" /></td>
                    <td className="px-3 sm:px-4 py-3"><div className="h-4 bg-gray-200 rounded w-28" /></td>
                    <td className="px-3 sm:px-4 py-3"><div className="h-4 bg-gray-200 rounded w-20" /></td>
                    <td className="px-3 sm:px-4 py-3"><div className="h-4 bg-gray-200 rounded w-14" /></td>
                    <td className="px-3 sm:px-4 py-3"><div className="h-4 bg-gray-200 rounded w-6 mx-auto" /></td>
                    <td className="px-3 sm:px-4 py-3"><div className="h-4 bg-gray-200 rounded w-12 mx-auto" /></td>
                    <td className="px-3 sm:px-4 py-3"><div className="h-4 bg-gray-200 rounded w-16 mx-auto" /></td>
                  </tr>
                ))
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                    <div className="text-3xl mb-2">🔍</div>
                    <p className="text-sm">لا توجد نتائج مطابقة</p>
                  </td>
                </tr>
              ) : (
                paginated.map((cat, i) => {
                  const setting = getSetting(cat);
                  const isVisible = setting?.showInHome ?? false;
                  const customImage = setting?.image;

                  return (
                    <tr key={`${cat.category}-${cat.name}-${i}`} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-3 sm:px-4 py-3 text-gray-400 font-medium">
                        {(currentPage - 1) * PAGE_SIZE + i + 1}
                      </td>

                      {/* Thumbnail Preview */}
                      <td className="px-3 sm:px-4 py-3 text-center">
                        <button
                          onClick={() => setImageUploadCat(cat)}
                          className="relative inline-block group"
                          title="تغيير الصورة"
                        >
                          {customImage ? (
                            <div className="w-9 h-9 rounded-lg overflow-hidden border border-gray-200 bg-gray-100 flex items-center justify-center shadow-xs">
                              <Image
                                src={customImage}
                                alt={cat.name}
                                width={36}
                                height={36}
                                className="object-cover w-full h-full group-hover:opacity-75 transition-opacity"
                              />
                            </div>
                          ) : (
                            <div className="w-9 h-9 rounded-lg border border-dashed border-gray-300 bg-gray-50 flex items-center justify-center text-gray-400 group-hover:border-blue-400 group-hover:text-blue-500 transition-colors">
                              <ImageIcon />
                            </div>
                          )}
                        </button>
                      </td>

                      {/* Name */}
                      <td className="px-3 sm:px-4 py-3 font-semibold text-gray-800">
                        {cat.name}
                      </td>

                      {/* Parent Category */}
                      <td className="px-3 sm:px-4 py-3">
                        <span className="inline-block px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-600 font-medium">
                          {cat.category || "عام"}
                        </span>
                      </td>

                      {/* Count */}
                      <td className="px-3 sm:px-4 py-3">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            cat.count > 0 ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {cat.count} منتج
                        </span>
                      </td>

                      {/* Show in home checkbox */}
                      <td className="px-3 sm:px-4 py-3 text-center">
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={() => handleToggleHome(cat)}
                          disabled={!isVisible && visibleCount >= max}
                          className="w-4 h-4 accent-blue-600 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                          title={!isVisible && visibleCount >= max ? "تم الوصول للحد الأقصى" : "تبديل الظهور"}
                        />
                      </td>

                      {/* Order Input */}
                      <td className="px-3 sm:px-4 py-3 text-center">
                        <input
                          type="number"
                          min={0}
                          key={`order-${cat.name}-${setting?.order ?? 0}`}
                          defaultValue={setting?.order ?? 0}
                          onBlur={(e) => handleOrderChange(cat, parseInt(e.target.value) || 0)}
                          disabled={!isVisible}
                          className="w-14 border border-gray-300 rounded px-1.5 py-1 text-xs text-center focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-30 disabled:cursor-not-allowed bg-white"
                        />
                      </td>

                      {/* Actions */}
                      <td className="px-3 sm:px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => {
                              setEditItem(cat);
                              setEditName(cat.name ?? "");
                              setEditCategory(cat.category ?? "");
                            }}
                            className="p-1 rounded text-blue-600 hover:bg-blue-50 transition-colors"
                            title="تعديل"
                          >
                            <EditIcon />
                          </button>
                          <button
                            onClick={() => setImageUploadCat(cat)}
                            className="p-1 rounded text-emerald-600 hover:bg-emerald-50 transition-colors"
                            title="تغيير الصورة"
                          >
                            <ImageIcon />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(cat)}
                            className="p-1 rounded text-red-600 hover:bg-red-50 transition-colors"
                            title="حذف"
                          >
                            <TrashIcon />
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1.5 pt-2 flex-wrap">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            ‹ السابق
          </button>
          {pageNumbers.map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`px-3 py-1.5 rounded-lg border text-xs sm:text-sm font-medium transition-colors ${
                page === currentPage
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "border-gray-300 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs sm:text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            التالي ›
          </button>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 px-4" dir="rtl">
          <div className="bg-white rounded-xl p-5 sm:p-6 w-full max-w-md shadow-xl border border-gray-100">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">إضافة تصنيف فرعي جديد</h2>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">اسم التصنيف الفرعي</label>
                <input
                  type="text"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="مثال: آيفون 17 برو ماكس"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={addLoading || !addName.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {addLoading ? "جاري الإضافة..." : "إضافة"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setAddName("");
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 px-4" dir="rtl">
          <div className="bg-white rounded-xl p-5 sm:p-6 w-full max-w-md shadow-xl border border-gray-100">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-2">تعديل التصنيف</h2>
            <p className="text-xs text-gray-500 mb-4">تعديل اسم التصنيف والتصنيف الرئيسي التابع له</p>

            {editItem.count > 0 && (
              <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                ⚠️ سيتم تحديث هذا التصنيف تلقائياً في <strong className="font-bold">{editItem.count} منتج</strong> مرتبط به
              </div>
            )}

            <form onSubmit={handleEdit} className="space-y-3.5">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">اسم التصنيف الفرعي</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">التصنيف الرئيسي (النوع)</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  placeholder="مثال: الهواتف الذكية"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex gap-2 pt-3">
                <button
                  type="submit"
                  disabled={editLoading || !editName.trim()}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  {editLoading ? "جاري الحفظ..." : "حفظ التعديلات"}
                </button>
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Upload Modal with Compression and Delete */}
      {imageUploadCat && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 px-4" dir="rtl">
          <div className="bg-white rounded-xl p-5 sm:p-6 w-full max-w-sm shadow-xl border border-gray-100 text-center">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1">
              صورة التصنيف: {imageUploadCat.name}
            </h2>
            <p className="text-xs text-gray-500 mb-4">تظهر هذه الصورة في ودجت التصنيفات في الصفحة الرئيسية</p>

            {/* Existing image preview if present */}
            {getSetting(imageUploadCat)?.image && (
              <div className="mb-4">
                <div className="relative w-28 h-28 mx-auto rounded-xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                  <Image
                    src={getSetting(imageUploadCat)!.image!}
                    alt={imageUploadCat.name}
                    width={112}
                    height={112}
                    className="object-cover w-full h-full"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleImageDelete}
                  disabled={imageDeleting}
                  className="mt-2 text-xs text-red-600 hover:text-red-700 font-semibold underline disabled:opacity-50"
                >
                  {imageDeleting ? "جاري الإزالة..." : "إزالة الصورة المخصصة"}
                </button>
              </div>
            )}

            <label className="block border-2 border-dashed border-gray-300 rounded-xl p-5 cursor-pointer hover:border-blue-400 hover:bg-blue-50/20 transition-all mb-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                disabled={imageUploading}
                onChange={(e) => {
                  if (e.target.files?.[0]) handleImageUpload(e.target.files[0]);
                }}
              />
              <div className="text-2xl mb-1">📷</div>
              <span className="text-xs sm:text-sm text-gray-600 font-medium block">
                {imageUploading ? "جاري ضغط ورفع الصورة..." : "اضغط لاختيار صورة من جهازك"}
              </span>
              <span className="text-[11px] text-gray-400 mt-1 block">يتم ضغط الصورة تلقائياً لسرعة التحميل القصوى</span>
            </label>

            <button
              onClick={() => setImageUploadCat(null)}
              disabled={imageUploading || imageDeleting}
              className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center z-50 px-4" dir="rtl">
          <div className="bg-white rounded-xl shadow-xl p-5 sm:p-6 w-full max-w-sm text-center border border-gray-100">
            <div className="text-4xl mb-3">🗑️</div>
            <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-1">تأكيد الحذف</h2>
            <p className="text-xs sm:text-sm text-gray-500 mb-2">هل أنت متأكد من حذف هذا التصنيف؟</p>
            <div className="bg-red-50 text-red-700 font-bold text-sm sm:text-base py-2 px-3 rounded-lg mb-3">
              « {confirmDelete.name} »
            </div>
            <p className="text-xs text-gray-400 mb-5 leading-relaxed">
              سيتم إزالة هذا التصنيف من جميع المنتجات المرتبطة به وحذف إعدادات ظهوره وصورته
            </p>
            <div className="flex gap-2.5 justify-center">
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-semibold py-2.5 rounded-lg transition-colors shadow-xs disabled:opacity-50"
              >
                {deleteLoading ? "جاري الحذف..." : "نعم، احذف"}
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                disabled={deleteLoading}
                className="flex-1 border border-gray-300 text-gray-700 text-xs sm:text-sm font-semibold py-2.5 rounded-lg hover:bg-gray-50 transition-colors"
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
