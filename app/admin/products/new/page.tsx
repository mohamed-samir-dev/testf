"use client";
import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { apiFetch } from "../../../lib/api";
import { compressImage } from "../../../lib/image-utils";

type GalleryItem = { id: string; type: "url" | "file"; value: string; file?: File };

let _galleryCounter = 0;
function nextGalleryId() {
  return `gi-${++_galleryCounter}`;
}

export default function NewProductPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [category, setCategory] = useState("");
  const [inStock, setInStock] = useState(true);
  const [description, setDescription] = useState("");
  const [overviewImage, setOverviewImage] = useState("");
  // سعر الصرف — يُجلب من API

  // Main image: URL or file
  const [imageMode, setImageMode] = useState<"upload" | "url">("upload");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);
  const [imageInputKey, setImageInputKey] = useState(0);

  // Gallery
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [galleryInputKey, setGalleryInputKey] = useState(0);

  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  // Track blob URLs for cleanup to prevent browser memory leaks
  const imagePreviewRef = useRef("");

  // جلب سعر الصرف الحالي


  useEffect(() => {
    const controller = new AbortController();

    apiFetch("/api/admin/categories", { credentials: "include", signal: controller.signal })
      .then((r: Response) => r.json())
      .then((data: string[]) => {
        if (!controller.signal.aborted) setCategories(data.filter(Boolean).sort());
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          console.error("Failed to load categories:", err);
          toast.error("فشل تحميل التصنيفات");
        }
      });

    return () => controller.abort();
  }, []);

  // Cleanup all blob URLs on unmount
  useEffect(() => {
    return () => {
      if (imagePreviewRef.current && imagePreviewRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreviewRef.current);
      }
      setGalleryItems((prev) => {
        for (const item of prev) {
          if (item.type === "file" && item.value.startsWith("blob:")) {
            URL.revokeObjectURL(item.value);
          }
        }
        return prev;
      });
    };
  }, []);

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const rawFile = e.target.files?.[0];
    if (!rawFile) return;

    // Revoke previous preview blob
    if (imagePreviewRef.current && imagePreviewRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreviewRef.current);
    }

    // Pre-compress image client-side to minimize upload payload, memory, and backend bandwidth
    const file = await compressImage(rawFile);
    const newUrl = URL.createObjectURL(file);
    imagePreviewRef.current = newUrl;
    setImageFile(file);
    setImagePreview(newUrl);
    setImageInputKey((k) => k + 1);
  }

  function addGalleryUrl() {
    setGalleryItems((prev) => [...prev, { id: nextGalleryId(), type: "url", value: "" }]);
  }

  async function handleGalleryFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileList = Array.from(files);
    const compressedFiles = await Promise.all(fileList.map((f: File) => compressImage(f)));

    const newItems: GalleryItem[] = compressedFiles.map((f: File) => ({
      id: nextGalleryId(),
      type: "file" as const,
      value: URL.createObjectURL(f),
      file: f,
    }));

    setGalleryItems((prev) => [...prev, ...newItems]);
    setGalleryInputKey((k) => k + 1);
  }

  function removeGalleryItem(id: string) {
    setGalleryItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.type === "file" && item.value.startsWith("blob:")) {
        URL.revokeObjectURL(item.value);
      }
      return prev.filter((i) => i.id !== id);
    });
  }

  function updateGalleryUrl(id: string, url: string) {
    setGalleryItems((prev) => prev.map((item) => (item.id === id ? { ...item, value: url } : item)));
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (saving) return;

      const numOriginal = parseFloat(originalPrice);
      if (isNaN(numOriginal) || numOriginal <= 0) {
        return toast.error("يرجى إدخال سعر صحيح أكبر من الصفر");
      }

      if (salePrice) {
        const numSale = parseFloat(salePrice);
        if (isNaN(numSale) || numSale < 0) {
          return toast.error("سعر البيع لا يمكن أن يكون سالباً");
        }
        if (numSale >= numOriginal) {
          return toast.error("سعر البيع بعد الخصم يجب أن يكون أقل من السعر الأصلي");
        }
      }

      setSaving(true);
      try {
        const fd = new FormData();
        fd.append("name", name.trim());
        fd.append("originalPrice", originalPrice);
        if (salePrice) fd.append("salePrice", salePrice);
        fd.append("category", category);
        fd.append("inStock", String(inStock));
        fd.append("description", description);
        fd.append("overviewImage", overviewImage);

        // Main image
        if (imageMode === "upload" && imageFile) {
          fd.append("image", imageFile);
        } else if (imageMode === "url" && imageUrl) {
          fd.append("imageUrl", imageUrl.trim());
        }

        // Gallery
        const urls = galleryItems.filter((i) => i.type === "url" && i.value).map((i) => i.value.trim());
        fd.append("galleryUrls", JSON.stringify(urls));
        galleryItems.filter((i) => i.type === "file" && i.file).forEach((i) => fd.append("galleryFiles", i.file!));

        const res = await apiFetch("/api/admin/products", {
          method: "POST",
          credentials: "include",
          body: fd,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "فشل الإضافة");

        toast.success("تم إضافة المنتج بنجاح ✅");
        router.push("/admin/products");
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "حدث خطأ");
      } finally {
        setSaving(false);
      }
    },
    [saving, name, originalPrice, salePrice, category, inStock, description, overviewImage, imageMode, imageFile, imageUrl, galleryItems, router]
  );

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg mx-auto space-y-4 py-4">
      <h1 className="text-xl font-bold text-gray-800">إضافة منتج جديد</h1>

      {/* Main Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">الصورة الأساسية</label>
        <div className="flex gap-2 mb-2">
          <button type="button" onClick={() => setImageMode("upload")} className={`px-3 py-1.5 text-xs rounded-lg border ${imageMode === "upload" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600"}`}>
            رفع صورة
          </button>
          <button type="button" onClick={() => setImageMode("url")} className={`px-3 py-1.5 text-xs rounded-lg border ${imageMode === "url" ? "bg-blue-600 text-white border-blue-600" : "border-gray-300 text-gray-600"}`}>
            رابط صورة
          </button>
        </div>

        {imageMode === "upload" ? (
          <>
            <input key={imageInputKey} ref={imageInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleImageChange} />
            {imagePreview ? (
              <div onClick={() => imageInputRef.current?.click()} className="relative w-full h-48 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden cursor-pointer group">
                <img src={imagePreview} alt="صورة المنتج" className="w-full h-full object-contain" />
                <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="text-white text-sm font-medium">تغيير الصورة</span>
                </div>
              </div>
            ) : (
              <button type="button" onClick={() => imageInputRef.current?.click()} className="w-full border-2 border-dashed border-gray-300 rounded-xl py-10 flex flex-col items-center gap-2 hover:border-blue-400 hover:bg-blue-50 transition-colors group">
                <svg className="w-10 h-10 text-gray-300 group-hover:text-blue-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-sm text-gray-500 group-hover:text-blue-600">اضغط لاختيار صورة</p>
                <p className="text-xs text-gray-400">JPG, PNG, WEBP (يتم الضغط تلقائياً)</p>
              </button>
            )}
          </>
        ) : (
          <>
            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className={inputCls} dir="ltr" />
            {imageUrl && (
              <div className="mt-2 w-full h-48 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
                <img src={imageUrl} alt="صورة المنتج" className="w-full h-full object-contain" />
              </div>
            )}
          </>
        )}
      </div>

      {/* Image Gallery */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">معرض الصور</label>
        <div className="space-y-2">
          {galleryItems.map((item) => (
            <div key={item.id} className="flex items-center gap-2">
              {item.type === "url" ? (
                <input type="text" value={item.value || ""} onChange={(e) => updateGalleryUrl(item.id, e.target.value)} placeholder="https://..." className={inputCls + " flex-1"} dir="ltr" />
              ) : (
                <div className="flex-1 flex items-center gap-2 border border-gray-300 rounded-xl px-3 py-2">
                  <img src={item.value} alt="" className="w-10 h-10 object-cover rounded" />
                  <span className="text-xs text-gray-500 truncate">{item.file?.name}</span>
                </div>
              )}
              <button type="button" onClick={() => removeGalleryItem(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <button type="button" onClick={addGalleryUrl} className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
            + رابط صورة
          </button>
          <input key={galleryInputKey} ref={galleryInputRef} type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={handleGalleryFiles} />
          <button type="button" onClick={() => galleryInputRef.current?.click()} className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
            + رفع صور
          </button>
        </div>
        {/* Gallery preview */}
        {galleryItems.some((i) => i.value) && (
          <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
            {galleryItems.filter((i) => i.value).map((item) => (
              <img key={item.id} src={item.value} alt="" className="w-16 h-16 object-cover rounded-lg border border-gray-200 flex-shrink-0" />
            ))}
          </div>
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          اسم المنتج <span className="text-red-500">*</span>
        </label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="مثال: iPhone 15 Pro Max" className={inputCls} required />
      </div>

      {/* Original Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          السعر الأساسي (جنيه مصري EGP) <span className="text-red-500">*</span>
        </label>
        <input type="number" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} placeholder="0" min="0" step="0.01" className={inputCls} required />
        <p className="text-xs text-gray-400 mt-0.5">السعر الأساسي بالجنيه المصري — المرجع الرئيسي</p>
      </div>

      {/* Sale Price */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">سعر البيع بعد الخصم (جنيه مصري EGP)</label>
        <input type="number" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} placeholder="اتركه فارغاً إن لم يكن هناك خصم" min="0" step="0.01" className={inputCls} />
        <p className="text-xs text-red-400 mt-0.5">هذا هو السعر المعروض بالأحمر — يجب أن يكون أقل من الأصلي</p>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">التصنيف</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
          <option value="">-- اختر تصنيف --</option>
          {categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
        <select value={inStock ? "true" : "false"} onChange={(e) => setInStock(e.target.value === "true")} className={inputCls}>
          <option value="true">متوفر</option>
          <option value="false">غير متوفر</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="وصف المنتج..." rows={4} className={inputCls + " resize-none"} />
      </div>

      {/* Overview Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">صورة النظرة العامة (رابط)</label>
        <input type="text" value={overviewImage} onChange={(e) => setOverviewImage(e.target.value)} placeholder="https://res.cloudinary.com/..." className={inputCls} dir="ltr" />
        <p className="text-xs text-gray-400 mt-1">الصورة اللي تظهر في سكشن النظرة العامة بصفحة المنتج</p>
        {overviewImage && (
          <div className="mt-2 relative w-full h-40 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden">
            <img src={overviewImage} alt="صورة النظرة العامة" className="w-full h-full object-contain" />
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={() => router.push("/admin/products")} className="flex-1 py-2.5 border border-gray-300 text-gray-700 rounded-xl text-sm hover:bg-gray-50">
          إلغاء
        </button>
        <button type="submit" disabled={saving} className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-60">
          {saving ? "جاري الحفظ..." : "حفظ المنتج"}
        </button>
      </div>
    </form>
  );
}

const inputCls = "w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
