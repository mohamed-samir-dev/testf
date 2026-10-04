"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { formatDateLong } from "../../utils";

interface OrderItem {
  productId: string; name: string; price: number; quantity: number; image?: string;
}
interface Order {
  orderId: string; createdAt: string; customer: string; whatsapp: string;
  address: string; nationalId: string; total: number; downPayment: number;
  months: number; monthlyPayment: number; installmentType: string;
  items: OrderItem[]; status: string;
}
interface Company {
  header?: string; footer?: string; stamp?: string; cancelStamp?: string;
  nameAr?: string; nameEn?: string; addressAr?: string; email?: string;
  taxNumber?: string; shippingCompany?: string; paymentMethod?: string; currencyAr?: string;
}

// Style helpers at module level — never recreated on render.
const TH: React.CSSProperties = {
  padding: "8px 12px", border: "1px solid #d1d5db", textAlign: "right",
  backgroundColor: "#3b82f6", color: "#fff", fontWeight: "bold",
};
function tdStyle(bg = "#fff"): React.CSSProperties {
  return { padding: "8px 12px", border: "1px solid #d1d5db", textAlign: "right", backgroundColor: bg, verticalAlign: "middle" };
}
function sectionTitleStyle(color: string): React.CSSProperties {
  return { backgroundColor: color, color: "#fff", padding: "6px 14px", fontWeight: "bold", fontSize: 14, borderRadius: "6px 6px 0 0" };
}
const INFO_BOX: React.CSSProperties = { border: "1px solid #d1d5db", borderRadius: 6, overflow: "hidden", flex: 1 };

function InfoRow({ label, value }: { label: string; value?: string }) {
  return (
    <tr>
      <td style={{ ...tdStyle("#f9fafb"), fontWeight: "bold", whiteSpace: "nowrap", width: 130 }}>{label}</td>
      <td style={tdStyle()}>{value || "—"}</td>
    </tr>
  );
}

export default function CancellationInvoicePage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder]     = useState<Order | null>(null);
  const [company, setCompany] = useState<Company>({});

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(false);

  // ── Single consolidated fetch — eliminates the old N+1 product image requests ──
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

    const images = document.querySelectorAll<HTMLImageElement>("img");
    if (images.length === 0) {
      clearTimeout(timer);
      setTimeout(() => { if (!printed) { printed = true; window.print(); } }, 400);
      return;
    }

    let loaded = 0;
    const tryPrint = () => {
      if (printed) return;
      if (++loaded >= images.length) {
        printed = true;
        clearTimeout(timer);
        window.print();
      }
    };

    images.forEach((img) => {
      if (img.complete) tryPrint();
      else { img.onload = tryPrint; img.onerror = tryPrint; }
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

  const currency = company.currencyAr || "ج.م";

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: 24, maxWidth: 900, margin: "0 auto", direction: "rtl", position: "relative", backgroundColor: "#fff", minHeight: "100vh" }}>
      {(company.cancelStamp || company.stamp) && (
        <img
          src={company.cancelStamp || company.stamp}
          alt="stamp"
          style={{ position: "absolute", top: "50%", left: "40%", transform: "translate(-50%, -50%)", width: 280, opacity: 0.65, pointerEvents: "none", zIndex: 9999 }}
        />
      )}
      <style>{`
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        html, body { background: #fff; margin: 0; }
        thead { display: table-header-group; }
        tfoot  { display: table-row-group; }
        .invoice-flex-row  { display: flex; gap: 12px; margin-bottom: 16px; }
        .invoice-table-wrap { overflow-x: auto; margin-bottom: 16px; }
        @media (max-width: 600px) { .invoice-flex-row { flex-direction: column; } }
      `}</style>

      {company.header && (
        <img src={company.header} alt="header" style={{ width: "100%", marginBottom: 16 }} />
      )}

      {/* رسالة الإلغاء */}
      <div style={{ border: "1px solid #fca5a5", borderRadius: 8, padding: "10px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, backgroundColor: "#fef2f2" }}>
        <span style={{ fontSize: 18 }}>❌</span>
        <div style={{ fontSize: 13, color: "#991b1b", lineHeight: 1.7 }}>
          <span style={{ fontWeight: "bold" }}>تم إلغاء الطلب</span> بناءً على طلب العميل — سيتم استرجاع المبلغ خلال <strong>١٤ يوم عمل</strong> حسب سياسة المتجر
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, fontSize: 14 }}>
        <span style={{ fontWeight: "bold" }}>رقم الطلب: #{order.orderId}</span>
        <span style={{ color: "#6b7280" }}>{formatDateLong(order.createdAt)}</span>
      </div>

      {/* مصدرة من / مصدرة إلى */}
      <div className="invoice-flex-row">
        <div style={INFO_BOX}>
          <div style={sectionTitleStyle("#6366f1")}>مصدرة من:</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <tbody>
              <InfoRow label="المتجر"       value={`${company.nameAr || ""} | ${company.nameEn || ""}`} />
              <InfoRow label="الرقم الضريبي" value={company.taxNumber} />
              <InfoRow label="العنوان"       value={company.addressAr} />
              <InfoRow label="البريد"        value={company.email} />
            </tbody>
          </table>
        </div>
        <div style={INFO_BOX}>
          <div style={sectionTitleStyle("#10b981")}>مصدرة إلى:</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <tbody>
              <InfoRow label="الاسم"       value={order.customer} />
              <InfoRow label="العنوان"     value={order.address} />
              <InfoRow label="الجوال"      value={order.whatsapp} />
              <InfoRow label="رقم الهوية" value={order.nationalId} />
            </tbody>
          </table>
        </div>
      </div>

      {/* تفاصيل الدفع والشحن */}
      <div className="invoice-flex-row">
        <div style={INFO_BOX}>
          <div style={sectionTitleStyle("#f59e0b")}>تفاصيل الدفع:</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <tbody>
              <InfoRow label="المبلغ"       value={`${order.total.toFixed(2)} ${currency}`} />
              {order.installmentType === "installment" && (
                <InfoRow label="الدفعة الأولى" value={`${order.downPayment.toFixed(2)} ${currency}`} />
              )}
              {order.installmentType === "installment" && (
                <InfoRow label="الأقساط" value={`${order.months} شهر`} />
              )}
              <InfoRow label="طريقة الدفع" value={"الدفع عند الاستلام"} />
            </tbody>
          </table>
        </div>
        <div style={INFO_BOX}>
          <div style={sectionTitleStyle("#3b82f6")}>تفاصيل الشحن:</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <tbody>
              <InfoRow label="بواسطة"       value={company.shippingCompany || "مندوب توصيل"} />
              <InfoRow label="رقم الشحنة"   value={`#${order.orderId}`} />
              <InfoRow label="الوقت المتوقع" value="(من 8 إلى 48 ساعة)" />
            </tbody>
          </table>
        </div>
      </div>

      {/* جدول المنتجات */}
      <div className="invoice-table-wrap">
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, minWidth: 500 }}>
          <thead>
            <tr>
              <th style={TH}>الصورة</th>
              <th style={TH}>المنتج</th>
              <th style={TH}>الكمية</th>
              <th style={TH}>إجمالي الطلب</th>
              <th style={TH}>المبلغ المسترد</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item, i) => {
              const rowBg = i % 2 === 0 ? "#fff" : "#f9fafb";
              return (
                <tr key={i} style={{ backgroundColor: rowBg }}>
                  <td style={{ ...tdStyle(rowBg), textAlign: "center", width: 70 }}>
                    {item.image
                      ? <img src={item.image} alt={item.name} style={{ width: 56, height: 56, objectFit: "contain", borderRadius: 6, border: "1px solid #e5e7eb" }} />
                      : <div style={{ width: 56, height: 56, backgroundColor: "#f3f4f6", borderRadius: 6, display: "inline-flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#9ca3af" }}>لا صورة</div>
                    }
                  </td>
                  <td style={tdStyle(rowBg)}>{item.name}</td>
                  <td style={{ ...tdStyle(rowBg), textAlign: "center" }}>{item.quantity}</td>
                  <td style={tdStyle(rowBg)}>{order.total.toFixed(2)} {currency}</td>
                  <td style={{ ...tdStyle(rowBg), fontWeight: "bold", color: "#dc2626" }}>{order.downPayment.toFixed(2)} {currency}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {company.footer && (
        <img src={company.footer} alt="footer" style={{ width: "100%" }} />
      )}
    </div>
  );
}
