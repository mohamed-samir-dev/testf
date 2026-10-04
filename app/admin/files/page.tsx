"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { FiUpload, FiLink, FiExternalLink, FiTrash2, FiPlus } from "react-icons/fi";

// ─── Types ───────────────────────────────────────────────────────────────────
type FooterItem = { image: string; linkType: string; link: string; file: string };
type Data = {
  qrImage: string; qrLink: string;
  img1: string; link1: string; linkType1: string; file1: string;
  img2: string; link2: string; linkType2: string; file2: string;
  footerItems: FooterItem[];
};

const DEFAULT_DATA: Data = {
  qrImage: "", qrLink: "",
  img1: "", link1: "", linkType1: "link", file1: "",
  img2: "", link2: "", linkType2: "link", file2: "",
  footerItems: [],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function openFile(url: string) {
  if (!url) return;
  window.open(`/view-file?url=${encodeURIComponent(url)}`, "_blank", "noopener,noreferrer");
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function FilesPage() {
  const [data, setData] = useState<Data>(DEFAULT_DATA);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [msgs, setMsgs] = useState<Record<string, string>>({});
  const [uploading, setUploading] = useState<string | null>(null);
  const [addingItem, setAddingItem] = useState(false);

  // Stable counter used as image cache-buster — avoids Date.now() on every render.
  const bustCounterRef = useRef(0);
  const [imgKeys, setImgKeys] = useState<Record<string, number>>({});

  const bumpKey = useCallback((k: string) => {
    bustCounterRef.current += 1;
    const v = bustCounterRef.current;
    setImgKeys((p) => ({ ...p, [k]: v }));
  }, []);

  // Input refs
  const qrRef    = useRef<HTMLInputElement>(null);
  const img1Ref  = useRef<HTMLInputElement>(null);
  const img2Ref  = useRef<HTMLInputElement>(null);
  const fileRef1 = useRef<HTMLInputElement>(null);
  const fileRef2 = useRef<HTMLInputElement>(null);
  const imgRefs  = useRef<Record<number, HTMLInputElement | null>>({});
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  // ── Feedback message (auto-clears after 3s) ───────────────────────────────
  const showMsg = useCallback((section: string, text: string) => {
    setMsgs((p) => ({ ...p, [section]: text }));
    const t = setTimeout(
      () => setMsgs((p) => ({ ...p, [section]: "" })),
      3000
    );
    return () => clearTimeout(t);
  }, []);

  // ── Load ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetch(`/api/admin/company`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        const normalize = (item: Partial<FooterItem>): FooterItem => ({
          image:    item.image    || "",
          linkType: item.linkType || (item.file ? "file" : "link"),
          link:     item.link     || "",
          file:     item.file     || "",
        });
        setData({
          qrImage:   d.qrImage   || "",
          qrLink:    d.qrLink    || "",
          img1:      d.img1      || "",
          link1:     d.link1     || "",
          linkType1: d.link1Type || d.linkType1 || (d.file1 ? "file" : "link"),
          file1:     d.file1     || "",
          img2:      d.img2      || "",
          link2:     d.link2     || "",
          linkType2: d.link2Type || d.linkType2 || (d.file2 ? "file" : "link"),
          file2:     d.file2     || "",
          footerItems: (d.footerItems || []).map(normalize),
        });
      })
      .catch(() => showMsg("load", "❌ فشل تحميل البيانات"));
  }, [showMsg]);

  // ── Unified save helper ───────────────────────────────────────────────────
  const saveSection = useCallback(async (section: string, body: object) => {
    setSavingSection(section);
    try {
      const r = await fetch(`/api/admin/company`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      showMsg(section, r.ok ? "✅ تم الحفظ" : "❌ حدث خطأ");
    } catch {
      showMsg(section, "❌ خطأ في الاتصال");
    } finally {
      setSavingSection(null);
    }
  }, [showMsg]);

  // ── Unified upload helper with client-side file size & type validation ────
  const uploadWithFile = useCallback(async (
    endpoint: string,
    fieldName: "image" | "file",
    uploadingKey: string,
    file: File,
    onSuccess: (url: string) => void
  ) => {
    // Client-side payload limit (4.5 MB serverless execution limit)
    const MAX_SIZE = 4.5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      showMsg("upload", "❌ حجم الملف كبير جداً (الحد الأقصى 4.5 ميجابايت لتجنب فشل الرفع والضغط على السيرفر)");
      return;
    }
    if (fieldName === "image" && !file.type.startsWith("image/")) {
      showMsg("upload", "❌ يجب اختيار ملف صورة صالح");
      return;
    }

    setUploading(uploadingKey);
    try {
      const fd = new FormData();
      fd.append(fieldName, file);
      const r = await fetch(endpoint, { method: "POST", credentials: "include", body: fd });
      const json = await r.json();
      if (!r.ok) { showMsg("upload", json.error || "❌ فشل الرفع"); return; }
      if (json.url) {
        onSuccess(json.url);
        bumpKey(uploadingKey);
        showMsg("upload", "✅ تم الرفع بنجاح");
      }
    } catch {
      showMsg("upload", "❌ خطأ في الاتصال");
    } finally {
      setUploading(null);
    }
  }, [bumpKey, showMsg]);

  // ── Delete a footer-item from backend + local state ───────────────────────
  // ✅ FIX #4: was only updating local state, not calling DELETE API
  const deleteFooterItem = useCallback(async (index: number) => {
    try {
      const r = await fetch(`/api/admin/company/footer-items/${index}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!r.ok) { showMsg("items", "❌ فشل الحذف"); return; }
      setData((p) => {
        const items = [...p.footerItems];
        items.splice(index, 1);
        return { ...p, footerItems: items };
      });
      showMsg("items", "✅ تم حذف العنصر بنجاح");
    } catch {
      showMsg("items", "❌ خطأ في الاتصال");
    }
  }, [showMsg]);

  // ── Add a new footer-item via backend ────────────────────────────────────
  const addFooterItem = useCallback(async () => {
    setAddingItem(true);
    try {
      const r = await fetch(`/api/admin/company/footer-items/add`, {
        method: "POST",
        credentials: "include",
      });
      if (!r.ok) { showMsg("items", "❌ فشل الإضافة"); return; }
      setData((p) => ({
        ...p,
        footerItems: [
          ...p.footerItems,
          { image: "", linkType: "link", link: "", file: "" },
        ],
      }));
      showMsg("items", "✅ تمت الإضافة بنجاح");
    } catch {
      showMsg("items", "❌ خطأ في الاتصال");
    } finally {
      setAddingItem(false);
    }
  }, [showMsg]);

  // ── Update a footer-item field in local state ─────────────────────────────
  const updateItem = useCallback((index: number, field: keyof FooterItem, value: string) => {
    setData((p) => {
      const items = [...p.footerItems];
      items[index] = { ...items[index], [field]: value };
      return { ...p, footerItems: items };
    });
  }, []);

  // ── Shared UI helpers ─────────────────────────────────────────────────────
  function MsgBadge({ section }: { section: string }) {
    const m = msgs[section];
    if (!m) return null;
    return (
      <span className={`text-xs px-2 py-1 rounded-lg font-medium ${
        m.includes("✅") ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
      }`}>{m}</span>
    );
  }

  const warningBanner = (
    <div className="flex items-start gap-1.5 text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-1.5 text-xs w-full">
      <span className="shrink-0">⚠️</span>
      <span>مسموح برابط واحد أو ملف واحد فقط — لا يمكن الجمع بينهما</span>
    </div>
  );

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="w-full space-y-4 sm:space-y-6" dir="rtl">

      {/* Header */}
      <h1 className="text-xl sm:text-2xl font-bold text-gray-800">الملفات والصور</h1>

      {msgs["load"] && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{msgs["load"]}</p>
      )}
      {msgs["upload"] && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2">{msgs["upload"]}</p>
      )}

      {/* ── QR Section ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-600">الكيو آر</h2>
          <div className="flex items-center gap-2">
            <MsgBadge section="qr" />
            <button
              onClick={() => saveSection("qr", { qrLink: data.qrLink })}
              disabled={savingSection === "qr"}
              className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {savingSection === "qr" ? "جاري..." : "حفظ"}
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:px-5 sm:py-4">
          {/* QR Image */}
          <div className="relative shrink-0">
            <div
              onClick={() => qrRef.current?.click()}
              className="relative w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group overflow-hidden"
            >
              {uploading === "qr" ? (
                <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : data.qrImage ? (
                <>
                  <Image key={imgKeys["qr"] ?? 0} src={data.qrImage} alt="qr" fill sizes="80px" className="object-contain p-1" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiUpload className="text-white" size={16} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-blue-500 transition-colors">
                  <FiUpload size={20} />
                  <span className="text-[10px]">رفع صورة</span>
                </div>
              )}
              <input ref={qrRef} type="file" accept="image/*" className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  e.target.value = "";
                  uploadWithFile("/api/admin/company/footer-image/qrImage", "image", "qr", file,
                    (url) => setData((p) => ({ ...p, qrImage: url })));
                }}
              />
            </div>
            {/* ✅ FIX #2: delete now calls saveSection with qrImage:"" — works because whitelist now includes qrImage */}
            {data.qrImage && (
              <button
                onClick={() => {
                  setData((p) => ({ ...p, qrImage: "" }));
                  saveSection("qr", { qrImage: "" });
                }}
                className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors z-10"
              >
                <FiTrash2 size={12} />
              </button>
            )}
          </div>
          {/* QR Link */}
          <div className="flex-1 min-w-0 w-full flex items-center gap-2">
            <FiLink className="text-gray-400 shrink-0" size={15} />
            <input
              type="text"
              value={data.qrLink}
              onChange={(e) => setData((p) => ({ ...p, qrLink: e.target.value }))}
              placeholder="رابط عند الضغط على الكيو آر..."
              className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>
        </div>
      </div>

      {/* ── Footer Items Section ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-600">معروف</h2>
          <div className="flex items-center gap-2">
            <MsgBadge section="items" />
            {/* ✅ FIX #5: Add button now present and wired to POST /footer-items/add */}
            <button
              onClick={addFooterItem}
              disabled={addingItem}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {addingItem
                ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <FiPlus size={12} />}
              إضافة
            </button>
            <button
              onClick={() => saveSection("items", { footerItems: data.footerItems })}
              disabled={savingSection === "items"}
              className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {savingSection === "items" ? "جاري..." : "حفظ"}
            </button>
          </div>
        </div>

        {data.footerItems.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-gray-400">
            لا توجد صور — اضغط &quot;إضافة&quot; لإضافة أول صورة
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {data.footerItems.map((item, i) => (
              <div key={i} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:px-5 sm:py-4">
                {/* Image slot */}
                <div className="relative shrink-0">
                  <div
                    onClick={() => imgRefs.current[i]?.click()}
                    className="relative w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group overflow-hidden"
                  >
                    {uploading === `img-${i}` ? (
                      <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    ) : item.image ? (
                      <>
                        <Image key={imgKeys[`img-${i}`] ?? 0} src={item.image} alt="preview" fill sizes="80px" className="object-contain p-1" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <FiUpload className="text-white" size={16} />
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-blue-500 transition-colors">
                        <FiUpload size={20} />
                        <span className="text-[10px]">رفع صورة</span>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      ref={(el) => { imgRefs.current[i] = el; }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        e.target.value = "";
                        uploadWithFile(
                          `/api/admin/company/footer-items/image/${i}`,
                          "image", `img-${i}`, file,
                          (url) => setData((p) => {
                            const items = [...p.footerItems];
                            items[i] = { ...items[i], image: url };
                            return { ...p, footerItems: items };
                          })
                        );
                      }}
                    />
                  </div>
                  {item.image && (
                    <button
                      onClick={() => updateItem(i, "image", "")}
                      className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors z-10"
                    >
                      <FiTrash2 size={12} />
                    </button>
                  )}
                </div>

                {/* Link / File controls */}
                <div className="flex-1 min-w-0 w-full space-y-2">
                  <div className="flex gap-4">
                    {["link", "file"].map((t) => (
                      <label key={t} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
                        <input
                          type="radio"
                          name={`type-${i}`}
                          value={t}
                          checked={(item.linkType ?? "link") === t}
                          onChange={() => updateItem(i, "linkType", t)}
                          className="accent-blue-600"
                        />
                        {t === "link" ? "رابط" : "ملف"}
                      </label>
                    ))}
                  </div>
                  {warningBanner}

                  {(item.linkType ?? "link") === "link" ? (
                    <div className="flex items-center gap-2 w-full">
                      <FiLink className="text-gray-400 shrink-0" size={15} />
                      <input
                        type="text"
                        value={item.link}
                        onChange={(e) => updateItem(i, "link", e.target.value)}
                        placeholder="https://..."
                        className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => fileRefs.current[i]?.click()}
                        disabled={uploading === `file-${i}`}
                        className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50 shrink-0"
                      >
                        {uploading === `file-${i}`
                          ? <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                          : <FiUpload size={13} />}
                        رفع ملف
                      </button>
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg,.webp"
                        className="hidden"
                        ref={(el) => { fileRefs.current[i] = el; }}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          e.target.value = "";
                          uploadWithFile(
                            `/api/admin/company/footer-items/file/${i}`,
                            "file", `file-${i}`, file,
                            (url) => setData((p) => {
                              const items = [...p.footerItems];
                              items[i] = { ...items[i], file: url };
                              return { ...p, footerItems: items };
                            })
                          );
                        }}
                      />
                      {item.file && (
                        <>
                          <button onClick={() => openFile(item.file)} className="flex items-center gap-1 text-emerald-600 text-sm hover:underline">
                            <FiExternalLink size={13} />
                            عرض الملف
                          </button>
                          <button onClick={() => updateItem(i, "file", "")} className="text-red-400 hover:text-red-600 text-xs hover:underline">
                            حذف
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* ✅ FIX #4: Delete item button now calls deleteFooterItem which hits the backend */}
                <button
                  onClick={() => deleteFooterItem(i)}
                  className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="حذف هذا العنصر"
                >
                  <FiTrash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Section 1 ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-600">مركز الاعمال السعودي</h2>
          <div className="flex items-center gap-2">
            <MsgBadge section="s1" />
            <button
              onClick={() => saveSection("s1", { link1: data.link1, link1Type: data.linkType1, file1: data.file1 })}
              disabled={savingSection === "s1"}
              className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {savingSection === "s1" ? "جاري..." : "حفظ"}
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:px-5 sm:py-4">
          <div className="relative shrink-0">
            <div
              onClick={() => img1Ref.current?.click()}
              className="relative w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group overflow-hidden"
            >
              {uploading === "img1" ? (
                <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : data.img1 ? (
                <>
                  <Image key={imgKeys["img1"] ?? 0} src={data.img1} alt="img1" fill sizes="80px" className="object-contain p-1" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiUpload className="text-white" size={16} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-blue-500 transition-colors">
                  <FiUpload size={20} />
                  <span className="text-[10px]">رفع صورة</span>
                </div>
              )}
              <input ref={img1Ref} type="file" accept="image/*" className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  e.target.value = "";
                  uploadWithFile("/api/admin/company/footer-image/img1", "image", "img1", file,
                    (url) => setData((p) => ({ ...p, img1: url })));
                }}
              />
            </div>
            {/* ✅ FIX #2: img1 delete now works — img1 is in whitelist */}
            {data.img1 && (
              <button
                onClick={() => { setData((p) => ({ ...p, img1: "" })); saveSection("s1", { img1: "" }); }}
                className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors z-10"
              >
                <FiTrash2 size={12} />
              </button>
            )}
          </div>
          <div className="flex-1 min-w-0 w-full space-y-2">
            <div className="flex gap-4">
              {["link", "file"].map((t) => (
                <label key={t} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
                  <input
                    type="radio" name="type-1" value={t}
                    checked={(data.linkType1 || "link") === t}
                    onChange={() => setData((p) => ({ ...p, linkType1: t }))}
                    className="accent-blue-600"
                  />
                  {t === "link" ? "رابط" : "ملف"}
                </label>
              ))}
            </div>
            {warningBanner}
            {(data.linkType1 || "link") === "link" ? (
              <div className="flex items-center gap-2 w-full">
                <FiLink className="text-gray-400 shrink-0" size={15} />
                <input
                  type="text" value={data.link1}
                  onChange={(e) => setData((p) => ({ ...p, link1: e.target.value }))}
                  placeholder="رابط سكشن 1..."
                  className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => fileRef1.current?.click()}
                  disabled={uploading === "file1"}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50 shrink-0"
                >
                  {uploading === "file1"
                    ? <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    : <FiUpload size={13} />}
                  رفع ملف
                </button>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                  ref={fileRef1}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    e.target.value = "";
                    uploadWithFile("/api/admin/company/footer-file/file1", "file", "file1", file,
                      (url) => setData((p) => ({ ...p, file1: url })));
                  }}
                />
                {data.file1 && (
                  <>
                    <button onClick={() => openFile(data.file1)} className="flex items-center gap-1 text-emerald-600 text-sm hover:underline">
                      <FiExternalLink size={13} /> عرض الملف
                    </button>
                    <button
                      onClick={() => {
                        setData((p) => ({ ...p, file1: "" }));
                        saveSection("s1", { file1: "" });
                      }}
                      className="text-red-400 hover:text-red-600 text-xs hover:underline"
                    >
                      حذف
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 2 ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-600">ضريبة القيمة المضافة</h2>
          <div className="flex items-center gap-2">
            <MsgBadge section="s2" />
            <button
              onClick={() => saveSection("s2", { link2: data.link2, link2Type: data.linkType2, file2: data.file2 })}
              disabled={savingSection === "s2"}
              className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-medium rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              {savingSection === "s2" ? "جاري..." : "حفظ"}
            </button>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 sm:px-5 sm:py-4">
          <div className="relative shrink-0">
            <div
              onClick={() => img2Ref.current?.click()}
              className="relative w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 bg-white flex items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all group overflow-hidden"
            >
              {uploading === "img2" ? (
                <span className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              ) : data.img2 ? (
                <>
                  <Image key={imgKeys["img2"] ?? 0} src={data.img2} alt="img2" fill sizes="80px" className="object-contain p-1" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <FiUpload className="text-white" size={16} />
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-1 text-gray-400 group-hover:text-blue-500 transition-colors">
                  <FiUpload size={20} />
                  <span className="text-[10px]">رفع صورة</span>
                </div>
              )}
              <input ref={img2Ref} type="file" accept="image/*" className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  e.target.value = "";
                  uploadWithFile("/api/admin/company/footer-image/img2", "image", "img2", file,
                    (url) => setData((p) => ({ ...p, img2: url })));
                }}
              />
            </div>
            {/* ✅ FIX #2: img2 delete now works */}
            {data.img2 && (
              <button
                onClick={() => { setData((p) => ({ ...p, img2: "" })); saveSection("s2", { img2: "" }); }}
                className="absolute -top-2 -left-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-md transition-colors z-10"
              >
                <FiTrash2 size={12} />
              </button>
            )}
          </div>
          <div className="flex-1 min-w-0 w-full space-y-2">
            <div className="flex gap-4">
              {["link", "file"].map((t) => (
                <label key={t} className="flex items-center gap-1.5 cursor-pointer text-sm text-gray-600">
                  <input
                    type="radio" name="type-2" value={t}
                    checked={(data.linkType2 || "link") === t}
                    onChange={() => setData((p) => ({ ...p, linkType2: t }))}
                    className="accent-blue-600"
                  />
                  {t === "link" ? "رابط" : "ملف"}
                </label>
              ))}
            </div>
            {warningBanner}
            {(data.linkType2 || "link") === "link" ? (
              <div className="flex items-center gap-2 w-full">
                <FiLink className="text-gray-400 shrink-0" size={15} />
                <input
                  type="text" value={data.link2}
                  onChange={(e) => setData((p) => ({ ...p, link2: e.target.value }))}
                  placeholder="رابط سكشن 2..."
                  className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                />
              </div>
            ) : (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => fileRef2.current?.click()}
                  disabled={uploading === "file2"}
                  className="flex items-center gap-1.5 px-3 py-2 bg-blue-50 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-100 border border-blue-200 transition-colors disabled:opacity-50 shrink-0"
                >
                  {uploading === "file2"
                    ? <span className="w-3.5 h-3.5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    : <FiUpload size={13} />}
                  رفع ملف
                </button>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg,.webp"
                  className="hidden"
                  ref={fileRef2}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    e.target.value = "";
                    uploadWithFile("/api/admin/company/footer-file/file2", "file", "file2", file,
                      (url) => setData((p) => ({ ...p, file2: url })));
                  }}
                />
                {data.file2 && (
                  <>
                    <button onClick={() => openFile(data.file2)} className="flex items-center gap-1 text-emerald-600 text-sm hover:underline">
                      <FiExternalLink size={13} /> عرض الملف
                    </button>
                    <button
                      onClick={() => {
                        setData((p) => ({ ...p, file2: "" }));
                        saveSection("s2", { file2: "" });
                      }}
                      className="text-red-400 hover:text-red-600 text-xs hover:underline"
                    >
                      حذف
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
