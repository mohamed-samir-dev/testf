"use client";
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

// ---------------------------------------------------------------------------
// lucide-react was previously imported here (Smartphone, Palette, etc.)
// which adds ~15 KB to the print-page bundle.
// Replaced with lightweight inline SVG paths — zero bundle cost.
// ---------------------------------------------------------------------------

interface OrderItem {
  name: string; price: number; quantity: number; color?: string; storage?: string;
}
interface Order {
  orderId: string; createdAt: string; customer: string; whatsapp: string;
  address: string; nationalId?: string; total: number; downPayment: number;
  months: number; monthlyPayment: number; installmentType: string; items: OrderItem[];
}
interface Company {
  header?: string; footer?: string; nameEn?: string; nameAr?: string; stamp?: string;
}

// Inline SVGs — hoisted to module scope, never reallocated.
const IcoPhone = (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12" y2="18"/></svg>
);
const IcoPalette = (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><circle cx="8.5" cy="9" r="1.5"/><circle cx="15.5" cy="9" r="1.5"/><circle cx="12" cy="16" r="1.5"/></svg>
);

const C1 = "#680DCA", C2 = "#180362", C4 = "#9653D2";

export default function PrintOrderPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder]     = useState<Order | null>(null);
  const [company, setCompany] = useState<Company>({});
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // ── One consolidated fetch replacing two separate sequential fetches ──
  useEffect(() => {
    fetch(`/api/admin/orders/${id}/invoice`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.json();
      })
      .then(({ order: o, company: c }) => {
        if (!o || !o.orderId) {
          setError(true);
        } else {
          setOrder(o);
          setCompany(c ?? {});
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!order) return;
    let printed = false;
    const timer = setTimeout(() => {
      if (!printed) { printed = true; window.print(); }
    }, 2000);

    const imgs = document.querySelectorAll<HTMLImageElement>("img");
    const pending = Array.from(imgs).filter((img) => !img.complete);
    if (pending.length === 0) {
      clearTimeout(timer);
      setTimeout(() => { if (!printed) { printed = true; window.print(); } }, 400);
      return;
    }

    let loaded = 0;
    pending.forEach((img) => {
      const done = () => {
        if (printed) return;
        if (++loaded >= pending.length) {
          printed = true;
          clearTimeout(timer);
          window.print();
        }
      };
      img.addEventListener("load", done, { once: true });
      img.addEventListener("error", done, { once: true });
    });

    return () => clearTimeout(timer);
  }, [order]);

  if (loading) return (
    <div style={{ textAlign: "center", padding: 60, fontFamily: "Arial", color: "#666" }}>جاري التحميل...</div>
  );

  if (error || !order) return (
    <div style={{ textAlign: "center", padding: 60, fontFamily: "Arial", color: "#dc2626", fontWeight: "bold" }}>
      لم يتم العثور على الطلب أو حدث خطأ أثناء التحميل
    </div>
  );

  // ── Financial summary rows — computed once, not inside JSX map ──
  type SummaryRow = [string, string, React.ReactNode];
  const firstPaymentDate = new Date(order.createdAt);
  firstPaymentDate.setMonth(firstPaymentDate.getMonth() + 1);

  const summaryRows: SummaryRow[] = [
    ["سعر الجهاز الإجمالي", `${order.total.toLocaleString("ar-SA")} جنيه مصري`,                                               <svg key="a" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={C4} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12" y2="16"/></svg>],
    ["الدفعة المقدمة",      `${order.downPayment.toLocaleString("ar-SA")} جنيه مصري`,                                          <svg key="b" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={C4} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>],
    ["المبلغ المتبقي",      `${(order.total - order.downPayment).toLocaleString("ar-SA")} جنيه مصري`,                          <svg key="c" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={C4} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>],
    ["عدد الأقساط",         `${order.months} شهر`,                                                                        <svg key="d" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={C4} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>],
    ["قيمة القسط الشهري",   `${order.monthlyPayment.toLocaleString("ar-SA")} جنيه مصري`,                                       <svg key="e" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={C4} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/></svg>],
    ["تاريخ أول قسط",       firstPaymentDate.toLocaleDateString("ar-SA"),                                                 <svg key="f" xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 24 24" fill="none" stroke={C4} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>],
  ];

  const contractTerms = [
    "يقر العميل باستلام الجهاز بحالة جيدة ويكون مسؤولاً عنه بالكامل.",
    "يلتزم العميل بسداد الأقساط الشهرية في مواعيدها المحددة.",
    "في حال تأخر السداد سيتم تطبيق غرامة تأخير حسب سياسة المؤسسة.",
    "يبقى الجهاز ملكاً للمؤسسة حتى يتم سداد كامل المبلغ المتفق عليه.",
    "لا يحق للعميل إلغاء أو إيقاف الخطة إلا بموافقة خطية من المؤسسة.",
    "يقر العميل بصحة البيانات المقدمة ويكون مسؤولاً عن أي خطأ فيها.",
    "يتم التواصل مع العميل عبر الوسائل المتاحة (اتصال - رسائل نصية - واتساب).",
    "يخضع هذا العقد للأنظمة والقوانين المعمول بها في المملكة العربية السعودية.",
    "أي نزاع ينشأ عن هذا العقد يتم حله وديًا، وفي حال تعذر ذلك يُحال للجهات المختصة.",
    "أقر العميل بقراءة العقد وفهمه والموافقة على جميع بنوده.",
  ];
  const arabicNumerals = ["١","٢","٣","٤","٥","٦","٧","٨","٩","١٠"];

  return (
    <>
      <style>{`
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; box-sizing: border-box; }
        html, body { margin: 0; padding: 0; background: white; }
        @media print {
          @page { size: A4 portrait; margin: 0; }
          html, body { width: 210mm; height: 297mm; overflow: hidden; }
        }
        @media screen {
          body { background: #f0f0f0; display: flex; justify-content: center; }
        }
      `}</style>
      <div
        ref={contentRef}
        style={{ fontFamily: "'Segoe UI', Tahoma, sans-serif", padding: "6px 12px", width: "210mm", height: "297mm", overflow: "hidden", position: "relative", direction: "rtl", background: "white" }}
      >
        {company.header && (
          <img src={company.header} alt="header" style={{ width: "100%", marginBottom: 4 }} />
        )}

        {/* عنوان العقد */}
        <div style={{ textAlign: "center", marginBottom: 6 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: C2, letterSpacing: 2 }}>عقد اتفاق بالتقسيط</div>
          <div style={{ fontSize: 13, color: C2, marginTop: 2, fontWeight: 600 }}>
            بين {company.nameAr || "مؤسسة مدار للأجهزة الإلكترونية"} <span style={{ color: C4, fontWeight: 800 }}>(المقرض)</span>
            {" "}&nbsp;والعميل <span style={{ color: C4, fontWeight: 800 }}>(المستفيد)</span>
          </div>
        </div>

        {/* بيانات العميل + المؤسسة */}
        <div style={{ display: "flex", alignItems: "stretch", gap: 8, marginBottom: 6, position: "relative" }}>
          <div style={{ flex: 1, border: `1px solid ${C4}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ background: `linear-gradient(135deg, ${C1}, ${C2})`, color: "white", textAlign: "center", padding: "7px 0", fontWeight: 800, fontSize: 15 }}>بيانات العميل</div>
            <div style={{ padding: "6px 14px 8px", fontSize: 12, color: C2, lineHeight: 1.9, display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ wordBreak: "break-word" }}><span style={{ color: C1, fontWeight: 700 }}>الاسم الرباعي: </span>{order.customer}</div>
              <div style={{ wordBreak: "break-word" }}><span style={{ color: C1, fontWeight: 700 }}>رقم الهوية الوطنية: </span>{order.nationalId || "_______________"}</div>
              <div style={{ wordBreak: "break-word" }}><span style={{ color: C1, fontWeight: 700 }}>رقم الجوال: </span>{order.whatsapp}</div>
              <div style={{ wordBreak: "break-word" }}><span style={{ color: C1, fontWeight: 700 }}>العنوان: </span>{order.address}</div>
            </div>
          </div>

          <div style={{ position: "absolute", left: "50%", top: "60%", transform: "translate(-50%, -50%)", zIndex: 3, pointerEvents: "none" }}>
            <img src="/printo.webp" alt="اتفاق" style={{ width: 90, height: 90, objectFit: "contain", opacity: 0.95 }} />
          </div>

          <div style={{ flex: 1, border: `1px solid ${C4}`, borderRadius: 10, overflow: "hidden" }}>
            <div style={{ background: `linear-gradient(135deg, ${C1}, ${C2})`, color: "white", textAlign: "center", padding: "7px 0", fontWeight: 800, fontSize: 15 }}>بيانات المؤسسة</div>
            <div style={{ padding: "6px 45px 8px 14px", fontSize: 12, color: C2, lineHeight: 1.9, display: "flex", flexDirection: "column", gap: 2 }}>
              <div style={{ wordBreak: "break-word" }}><span style={{ color: C1, fontWeight: 700 }}>اسم المؤسسة: </span>{company.nameAr || "مؤسسة مدار للأجهزة الإلكترونية"}</div>
              <div style={{ wordBreak: "break-word" }}><span style={{ color: C1, fontWeight: 700 }}>سجل تجاري رقم: </span>1010569266</div>
              <div style={{ wordBreak: "break-word" }}><span style={{ color: C1, fontWeight: 700 }}>العنوان: </span>المملكة العربية السعودية</div>
              <div style={{ wordBreak: "break-word" }}><span style={{ color: C1, fontWeight: 700 }}>رقم الجوال: </span>0599171457</div>
            </div>
          </div>
        </div>

        {/* وصف الاتفاق */}
        <div style={{ fontSize: 11, color: C2, fontWeight: 500, lineHeight: 1.6, marginTop: 4, marginBottom: 4, textAlign: "center", padding: "0 60px" }}>
          تم الاتفاق بين الطرفين على أن تقوم المؤسسة ببيع الجهاز الموضح أدناه للعميل نظام التقسيط وفقاً للشروط والأحكام التالية:
        </div>

        {/* محتوى العقد: تفاصيل + شروط */}
        <div style={{ display: "flex", gap: 0, alignItems: "stretch", marginTop: 16 }}>
          {/* تفاصيل العقد */}
          <div style={{ width: "50%", flexShrink: 0, padding: "0 4px 0 8px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 5 }}>
              <div style={{ fontWeight: 900, fontSize: 13, color: "white", background: `linear-gradient(135deg, ${C1}, ${C2})`, borderRadius: 20, padding: "4px 18px" }}>تفاصيل العقد</div>
            </div>
            <div style={{ fontSize: 12, color: C2, lineHeight: 1.7 }}>
              {order.items.map((item, i) => (
                <div key={i} style={{ borderBottom: `1px dashed #c4a8e8`, paddingBottom: 2, marginBottom: 3 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: C1, fontWeight: 700, whiteSpace: "nowrap", fontSize: 11 }}>
                      {IcoPhone} الجهاز{order.items.length > 1 ? ` ${i + 1}` : ""}:
                    </span>
                    <span style={{ fontSize: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</span>
                  </div>
                  {(item.storage || item.color) && (
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: C1, fontWeight: 700, whiteSpace: "nowrap", fontSize: 11 }}>
                        {IcoPalette} السعة / اللون:
                      </span>
                      <span style={{ fontSize: 12 }}>{[item.storage, item.color].filter(Boolean).join(" / ")}</span>
                    </div>
                  )}
                </div>
              ))}
              {summaryRows.map(([label, val, icon]) => (
                <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: `1px dashed #c4a8e8`, paddingBottom: 1, marginBottom: 2 }}>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 3, color: C1, fontWeight: 700, whiteSpace: "nowrap" }}>
                    <span style={{ display: "inline-flex" }}>{icon}</span>
                    {label}:
                  </span>
                  <span>{val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* خط فاصل */}
          <div style={{ width: 1, background: C4, alignSelf: "stretch" }} />

          {/* شروط وأحكام */}
          <div style={{ flex: 1, padding: "0 0 0 12px" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 5 }}>
              <div style={{ fontWeight: 900, fontSize: 13, color: "white", background: `linear-gradient(135deg, ${C1}, ${C2})`, borderRadius: 20, padding: "4px 18px" }}>شروط وأحكام العقد</div>
            </div>
            <div style={{ fontSize: 11, color: C2, lineHeight: 1.65 }}>
              {contractTerms.map((t, i) => (
                <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", borderBottom: `1px dashed #c4a8e8`, paddingBottom: 1, marginBottom: 2 }}>
                  <span style={{ color: C4, fontWeight: 800, minWidth: 16, fontSize: 11, flexShrink: 0, lineHeight: 1.5 }}>{arabicNumerals[i]}.</span>
                  <span style={{ fontSize: 11, lineHeight: 1.5 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* نص الموافقة */}
        <div style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: C2, lineHeight: 1.5, marginTop: 8, marginBottom: 5 }}>
          بناءً على ما سبق، يُقرّ الطرفان بالموافقة على جميع ما ورد في هذا العقد، والتزام كل طرف بما يترتب عليه من حقوق وواجبات.
        </div>

        {/* التوقيعات */}
        <div style={{ display: "flex", justifyContent: "space-around", marginBottom: 5, marginTop: 24 }}>
          <div style={{ fontSize: 12, color: C2, textAlign: "right", display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ fontWeight: 900, fontSize: 13, color: C1 }}>توقيع العميل</div>
            <div><span style={{ color: C1, fontWeight: 700 }}>الاسم: </span>{order.customer}</div>
            <div><span style={{ color: C1, fontWeight: 700 }}>التاريخ: </span>....../....../.....20م</div>
            <div><span style={{ color: C1, fontWeight: 700 }}>التوقيع: </span>................................</div>
          </div>
          <div style={{ fontSize: 12, color: C2, textAlign: "right", display: "flex", flexDirection: "column", gap: 4, position: "relative" }}>
            {company.stamp && (
              <img src={company.stamp} alt="ختم" style={{ position: "absolute", top: -110, left: -90, height: 300, width: 300, objectFit: "contain", opacity: 0.9, zIndex: 2 }} />
            )}
            <div style={{ fontWeight: 900, fontSize: 13, color: C1 }}>توقيع المؤسسة</div>
            <div><span style={{ color: C1, fontWeight: 700 }}>الاسم: </span>{company.nameAr || "مؤسسة مدار للأجهزة الإلكترونية"}</div>
            <div><span style={{ color: C1, fontWeight: 700 }}>التاريخ: </span>{new Date(order.createdAt).toLocaleDateString("ar-SA")}</div>
            {!company.stamp && (
              <span style={{ display: "inline-block", width: 100, height: 100, border: `1px dashed ${C4}`, borderRadius: "50%" }} />
            )}
          </div>
        </div>

        {company.footer && (
          <div style={{ marginTop: 32 }}>
            <div style={{ borderTop: `2px solid ${C4}`, marginBottom: 16 }} />
            <img src={company.footer} alt="footer" style={{ width: "100%" }} />
          </div>
        )}
      </div>
    </>
  );
}
