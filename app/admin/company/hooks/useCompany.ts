"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useCompanyStore } from "../../../store/companyStore";
import { API, defaultData, toFullUrl, withCacheBust } from "../constants";
import type { CompanyData } from "../types";

// Image keys that need URL normalisation on load.
const IMAGE_KEYS = new Set(["logo", "header", "footer", "stamp", "cancelStamp"]);

// Max file size allowed for image uploads: 5 MB.
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

export function useCompany() {
  const { setLogo } = useCompanyStore();
  const [data, setData] = useState<CompanyData>(defaultData);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingKey, setUploadingKey] = useState<string | null>(null);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState(false);

  // Track the last-saved snapshot so handleSave only sends changed fields.
  const savedRef = useRef<CompanyData>(defaultData);

  // Mirror of data state kept in a ref so handleSave can read the current
  // value without being listed as a dependency (avoids recreating it on every keystroke).
  const dataRef = useRef<CompanyData>(defaultData);

  // Keep track of active blob URLs for memory leak cleanup on unmount
  const activeBlobsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const blobs = activeBlobsRef.current;
    return () => {
      blobs.forEach((url) => URL.revokeObjectURL(url));
      blobs.clear();
    };
  }, []);

  const loadData = useCallback(() => {
    // AbortController: cancels the in-flight request if the component unmounts
    // before the response arrives — prevents "Can't perform a React state update
    // on an unmounted component" warnings and avoids stale state updates.
    const controller = new AbortController();
    setLoading(true);
    setLoadError(false);

    fetch(`/api/admin/company`, {
      credentials: "include",
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((res) => {
        if (!res || typeof res !== "object") throw new Error("Invalid response");
        const merged: CompanyData = { ...defaultData };
        for (const k of Object.keys(defaultData)) {
          if (res[k] !== undefined && res[k] !== "") {
            merged[k] = IMAGE_KEYS.has(k) ? toFullUrl(res[k]) : res[k];
          }
        }
        setData(merged);
        dataRef.current = merged;
        savedRef.current = merged;
      })
      .catch((err) => {
        // Ignore AbortError — it's an intentional cancellation, not a real failure.
        if (err?.name === "AbortError") return;
        setLoadError(true);
        toast.error("فشل تحميل بيانات الشركة");
      })
      .finally(() => setLoading(false));

    return controller;
  }, []);

  useEffect(() => {
    const controller = loadData();
    // Cleanup: abort the fetch if the component unmounts mid-flight.
    return () => controller.abort();
  }, [loadData]);

  const handleChange = useCallback((key: string, value: string) => {
    setData((prev) => {
      const next = { ...prev, [key]: value };
      dataRef.current = next;
      return next;
    });
  }, []);

  const handleImageChange = useCallback(async (key: string, file: File) => {
    if (uploadingKey) {
      toast.error("يرجى الانتظار حتى اكتمال رفع الصورة الحالية");
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("الملف المرفوع يجب أن يكون صورة فقط");
      return;
    }

    // Client-side size guard — catches oversized files before the expensive upload.
    if (file.size > MAX_IMAGE_BYTES) {
      toast.error("حجم الصورة يتجاوز الحد المسموح (5 ميغابايت)");
      return;
    }

    // Instant local preview for zero-perceived latency
    const localBlob = URL.createObjectURL(file);
    activeBlobsRef.current.add(localBlob);
    setPreviewUrls((prev) => ({ ...prev, [key]: localBlob }));
    setUploadingKey(key);

    const formData = new FormData();
    formData.append("image", file);
    try {
      const res = await fetch(`/api/admin/company/upload/${key}`, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "فشل رفع الصورة");
        return;
      }
      const fullUrl = json.url.startsWith("http") ? json.url : `${API}${json.url}`;
      setData((prev) => {
        const next = { ...prev, [key]: fullUrl };
        dataRef.current = next;
        return next;
      });
      // Keep savedRef in sync so the image URL isn't treated as a dirty field.
      savedRef.current = { ...savedRef.current, [key]: fullUrl };
      if (key === "logo") { setLogo(withCacheBust(fullUrl)); }
      toast.success("تم رفع الصورة بنجاح");
    } catch (e) {
      console.error(e);
      toast.error("فشل رفع الصورة");
    } finally {
      URL.revokeObjectURL(localBlob);
      activeBlobsRef.current.delete(localBlob);
      setPreviewUrls((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
      setUploadingKey(null);
    }
  }, [setLogo, uploadingKey]);

  const handleImageDelete = useCallback(async (key: string) => {
    if (uploadingKey) return;
    try {
      const res = await fetch(`/api/admin/company/image/${key}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) { toast.error("فشل حذف الصورة"); return; }
      setData((prev) => {
        const next = { ...prev, [key]: "" };
        dataRef.current = next;
        return next;
      });
      savedRef.current = { ...savedRef.current, [key]: "" };
      if (key === "logo") setLogo("");
      toast.success("تم حذف الصورة");
    } catch {
      toast.error("فشل حذف الصورة");
    }
  }, [setLogo, uploadingKey]);

  const handleSave = useCallback(async () => {
    if (uploadingKey) {
      toast.error("يرجى الانتظار حتى اكتمال رفع الصورة");
      return;
    }

    // Read the latest data from the ref (stable, no stale closure).
    const current = dataRef.current;
    const saved = savedRef.current;
    const diff: Partial<CompanyData> = {};
    for (const k of Object.keys(current)) {
      if (current[k] !== saved[k]) diff[k] = current[k];
    }

    if (Object.keys(diff).length === 0) {
      toast("لا توجد تغييرات للحفظ", { icon: "ℹ️" });
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/company`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(diff), // only changed fields, not the whole object
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "فشل الحفظ");
      }
      // Update snapshot so future saves diff against the new state.
      savedRef.current = { ...saved, ...diff } as CompanyData;
      toast.success("تم حفظ بيانات الشركة");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }, [uploadingKey]);

  return {
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
    retryLoad: loadData,
  };
}
