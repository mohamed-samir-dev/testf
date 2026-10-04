"use client";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import type { BannerItem } from "../types";

const BASE = "/api/admin/banners";

// FIX #1: fire-and-forget — no await needed, revalidation is background work
const revalidateBanners = () =>
  fetch("/api/revalidate?tag=banners", { method: "POST" }).catch(() => {});

export function useBanners() {
  const [banners, setBanners] = useState<BannerItem[]>([]);
  const [loading, setLoading] = useState<number | null>(null);
  const [addingBanner, setAddingBanner] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // FIX #3: AbortController — cancel initial fetch on unmount
  useEffect(() => {
    const controller = new AbortController();
    fetch(BASE, { credentials: "include", signal: controller.signal })
      .then((r) => r.json())
      .then((data) => { if (!controller.signal.aborted && Array.isArray(data)) setBanners(data); })
      .catch(() => {});
    return () => controller.abort();
  }, []);

  // ── Upload ────────────────────────────────────────────────────────────────
  const handleUpload = async (index: number, file: File) => {
    setLoading(index);
    const form = new FormData();
    form.append("image", file);
    try {
      const res = await fetch(`${BASE}/upload/${index}`, {
        method: "POST", credentials: "include", body: form,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // FIX #1: update local state — no re-fetch needed
      setBanners((prev) => prev.map((b, i) => i === index ? { ...b, url: data.url ?? b.url } : b));
      revalidateBanners();
      toast.success("تم رفع البانر");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل الرفع");
    } finally {
      setLoading(null);
    }
  };

  // ── Delete image ──────────────────────────────────────────────────────────
  const handleDeleteImage = async (index: number) => {
    setLoading(index);
    try {
      const res = await fetch(`${BASE}/${index}/image`, {
        method: "DELETE", credentials: "include",
      });
      if (!res.ok) throw new Error("فشل الحذف");
      // FIX #1: clear url + deactivate locally
      setBanners((prev) => prev.map((b, i) => i === index ? { ...b, url: "", active: false } : b));
      revalidateBanners();
      toast.success("تم حذف الصورة");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل الحذف");
    } finally {
      setLoading(null);
    }
  };

  // ── Delete slot ───────────────────────────────────────────────────────────
  const handleDeleteSlot = async (index: number) => {
    setLoading(index);
    try {
      const res = await fetch(`${BASE}/${index}`, {
        method: "DELETE", credentials: "include",
      });
      if (!res.ok) throw new Error("فشل الحذف");
      // FIX #1: remove slot locally
      setBanners((prev) => prev.filter((_, i) => i !== index));
      revalidateBanners();
      toast.success("تم حذف البانر");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل الحذف");
    } finally {
      setLoading(null);
    }
  };

  // ── Toggle active ─────────────────────────────────────────────────────────
  const handleToggle = async (index: number) => {
    setLoading(index);
    try {
      const res = await fetch(`${BASE}/toggle/${index}`, {
        method: "PATCH", credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // FIX #1: flip active locally using server-confirmed value
      setBanners((prev) => prev.map((b, i) => i === index ? { ...b, active: data.active } : b));
      revalidateBanners();
      toast.success(data.active ? "تم تفعيل البانر" : "تم إيقاف البانر");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل التعديل");
    } finally {
      setLoading(null);
    }
  };

  // ── Add banner ────────────────────────────────────────────────────────────
  const handleAddBanner = async () => {
    setAddingBanner(true);
    try {
      const res = await fetch(`${BASE}/add`, {
        method: "POST", credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      // FIX #1: append new empty slot locally
      setBanners((prev) => [...prev, { url: "", active: false }]);
      revalidateBanners();
      toast.success("تمت إضافة بانر جديد");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشلت الإضافة");
    } finally {
      setAddingBanner(false);
    }
  };

  // ── Reorder ───────────────────────────────────────────────────────────────
  const handleReorder = async (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return;

    // FIX #2: optimistic reorder — update UI immediately, no re-fetch on success
    const optimistic = [...banners];
    const [moved] = optimistic.splice(fromIndex, 1);
    optimistic.splice(toIndex, 0, moved);
    setBanners(optimistic);

    try {
      const order = Array.from({ length: banners.length }, (_, i) => i);
      const [m] = order.splice(fromIndex, 1);
      order.splice(toIndex, 0, m);
      const res = await fetch(`${BASE}/reorder`, {
        method: "PATCH", credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order }),
      });
      if (!res.ok) throw new Error("فشل الترتيب");
      // FIX #2: no fetchBanners() — optimistic state is already correct
      revalidateBanners();
      toast.success("تم تغيير الترتيب");
    } catch (e: unknown) {
      // FIX #2: on error, rollback to original order (not a full re-fetch)
      setBanners(banners);
      toast.error(e instanceof Error ? e.message : "فشل الترتيب");
    }
  };

  return {
    banners, loading, addingBanner, inputRefs,
    handleUpload, handleDeleteImage, handleDeleteSlot,
    handleToggle, handleAddBanner, handleReorder,
  };
}
