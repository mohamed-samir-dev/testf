"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";
import { apiFetch } from "../../../lib/api";
import type { Category } from "../types";

const BASE = "/api/admin/main-categories";

function normalizeArabicSearch(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/[ىي]/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[\u064B-\u065F]/g, ""); // Remove Arabic diacritics
}

export function useMainCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [editCat, setEditCat] = useState<Category | null>(null);
  const [editName, setEditName] = useState("");
  const [editError, setEditError] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<Category | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [search, setSearch] = useState("");

  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // ── Fetch Categories ───────────────────────────────────────────────────────
  const fetchCategories = useCallback(async (signal?: AbortSignal) => {
    if (mountedRef.current) {
      setInitialLoading(true);
      setFetchError(false);
    }
    try {
      const res = await apiFetch(`${BASE}/extra`, { credentials: "include", signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: Category[] = await res.json();
      if (mountedRef.current) {
        setCategories(Array.isArray(data) ? data : []);
        setInitialLoading(false);
      }
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") return;
      console.error("[main-categories] fetch error:", err);
      if (mountedRef.current) {
        setInitialLoading(false);
        setFetchError(true);
        toast.error("فشل تحميل التصنيفات، يرجى إعادة المحاولة");
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchCategories(controller.signal);
    return () => controller.abort();
  }, [fetchCategories]);

  // ── Add Category ───────────────────────────────────────────────────────────
  const handleAdd = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedName = name.trim();
      if (!trimmedName) {
        setError("اسم التصنيف مطلوب");
        return;
      }
      setError("");
      setLoading(true);
      try {
        const res = await apiFetch(BASE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: trimmedName }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "حدث خطأ أثناء الإضافة");
          return;
        }

        setShowModal(false);
        setName("");
        toast.success(`تم إضافة "${data.name}" بنجاح 🎉`);

        // Optimistic update
        setCategories((prev) =>
          [...prev, { name: data.name, count: 0 }].sort((a, b) =>
            a.name.localeCompare(b.name, "ar")
          )
        );
      } catch {
        toast.error("حدث خطأ في الاتصال بالخادم");
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [name]
  );

  // ── Edit Category ──────────────────────────────────────────────────────────
  const handleEdit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editCat) return;
      const trimmedNew = editName.trim();
      const oldName = editCat.name;
      if (!trimmedNew) {
        setEditError("اسم التصنيف مطلوب");
        return;
      }
      if (trimmedNew === oldName) {
        setEditCat(null);
        return;
      }

      setEditError("");
      setEditLoading(true);
      const oldCount = editCat.count;

      try {
        const res = await apiFetch(`${BASE}/rename`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ oldName, newName: trimmedNew }),
        });
        const data = await res.json();
        if (!res.ok) {
          setEditError(data.error || "حدث خطأ أثناء التعديل");
          return;
        }

        setEditCat(null);
        toast.success("تم حفظ التعديلات بنجاح ✅");

        // Optimistic rename
        setCategories((prev) =>
          prev
            .map((c) => (c.name === oldName ? { name: trimmedNew, count: oldCount } : c))
            .sort((a, b) => a.name.localeCompare(b.name, "ar"))
        );
      } catch {
        toast.error("حدث خطأ في الاتصال بالخادم");
        fetchCategories(); // Rollback / resync
      } finally {
        if (mountedRef.current) setEditLoading(false);
      }
    },
    [editCat, editName, fetchCategories]
  );

  // ── Delete Category ────────────────────────────────────────────────────────
  const confirmDeleteAction = useCallback(async () => {
    if (!confirmDelete) return;
    const catToDelete = confirmDelete;
    const catName = catToDelete.name;
    setDeleteLoading(true);

    try {
      const res = await apiFetch(`${BASE}/remove`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name: catName }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "حدث خطأ أثناء الحذف");
        fetchCategories();
        return;
      }
      setCategories((prev) => prev.filter((c) => c.name !== catName));
      toast.success(`تم حذف "${catName}" بنجاح ✅`);
      setConfirmDelete(null);
    } catch {
      toast.error("حدث خطأ في الاتصال بالخادم");
      fetchCategories();
    } finally {
      if (mountedRef.current) setDeleteLoading(false);
    }
  }, [confirmDelete, fetchCategories]);

  // ── Normalized Search Filter ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    const query = normalizeArabicSearch(search);
    if (!query) return categories;
    return categories.filter((c) => normalizeArabicSearch(c.name).includes(query));
  }, [categories, search]);

  return {
    categories,
    filtered,
    search,
    setSearch,
    initialLoading,
    fetchError,
    fetchCategories,
    showModal,
    setShowModal,
    name,
    setName,
    error,
    setError,
    loading,
    handleAdd,
    editCat,
    setEditCat,
    editName,
    setEditName,
    editError,
    setEditError,
    editLoading,
    handleEdit,
    confirmDelete,
    setConfirmDelete,
    deleteLoading,
    confirmDeleteAction,
  };
}
