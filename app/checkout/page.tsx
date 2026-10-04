"use client";
import PriceEquivalent from "../components/PriceEquivalent";

import { useState, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, PackageCheck, CheckCircle2, User, MapPin, Phone, Loader2 } from "lucide-react";
import { useCartStore } from "../store/cartStore";
import "../cart/cart.css";

const fmt = (n: number) => n.toLocaleString("en-US");
const API = process.env.NEXT_PUBLIC_API_URL || "https://burj-phone-backend.vercel.app";
const resolveImg = (src: string) =>
  src?.startsWith("http") ? src : `${API}${src?.startsWith("/") ? src : `/${src || ""}`}`;

function Field({
  label,
  value,
  error,
  placeholder,
  required,
  inputMode,
  onChange,
}: {
  label: string;
  value: string;
  error?: string;
  placeholder?: string;
  required?: boolean;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        className={`w-full px-4 py-3 text-sm border rounded-xl transition focus:outline-none ${
          error
            ? "border-red-300 bg-red-50 focus:border-red-400"
            : "border-gray-200 bg-white focus:border-[#173e48]"
        }`}
      />
      {error && (
        <p className="text-xs text-red-500 font-medium flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}
    </div>
  );
}

function CheckoutInner() {
  const router = useRouter();
  const { items, totalPrice, clear } = useCartStore();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [confirmedTotal, setConfirmedTotal] = useState(0);

  const total = done ? confirmedTotal : totalPrice();

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  useEffect(() => {
    if (!items.length && !done) router.replace("/cart");
  }, [items.length, done, router]);

  if (!items.length && !done) return null;

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "الاسم مطلوب";
    if (!phone.trim()) e.phone = "رقم الجوال مطلوب";
    else if (!/^\+?\d{7,15}$/.test(phone.replace(/\s/g, "")))
      e.phone = "رقم الجوال غير صحيح";
    if (!address.trim()) e.address = "العنوان مطلوب";
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;

    setLoading(true);
    try {
      const orderId = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const payload = {
        orderId,
        customer: name.trim(),
        whatsapp: phone.replace(/\s/g, ""),
        address: address.trim(),
        items: items.map((i) => ({
          productId: i.product._id,
          name: i.product.name,
          price:
            i.price ??
            i.product.salePrice ??
            i.product.originalPrice ??
            (i.product as { price?: number }).price ??
            0,
          quantity: i.qty,
          color: i.color || "",
          storage: i.storage || "",
        })),
        total,
        paymentMethod: "cash_on_delivery",
      };

      const response = await fetch(`${API}/api/orders/cod`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.ok) throw new Error(result.error || "تعذر حفظ الطلب، حاول مرة أخرى");
      setConfirmedTotal(result.totalEGP);

      setDone(true);
      clear();
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : "تعذر الاتصال، حاول مرة أخرى" });
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4 py-16"
        style={{ background: "linear-gradient(135deg,#f0fdf9 0%,#e8f8f5 100%)" }}
        dir="rtl"
      >
        <div className="w-full max-w-sm bg-white rounded-3xl shadow-xl border border-green-100 overflow-hidden">
          <div className="bg-gradient-to-br from-[#173e48] to-[#1B7174] px-6 py-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/15 mb-4">
              <CheckCircle2 className="w-9 h-9 text-white" />
            </div>
            <h2 className="text-xl font-black text-white mb-1">تم استلام طلبك!</h2>
            <p className="text-sm text-white/70">سنتواصل معك قريباً لتأكيد التوصيل</p>
          </div>
          <div className="px-6 py-6 space-y-3">
            <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-4">
              <PackageCheck className="text-[#1B7174] shrink-0" size={22} />
              <div>
                <p className="text-sm font-black text-[#173e48]">الدفع عند الاستلام</p>
                <p className="text-xs text-gray-400 mt-0.5">لا يلزم الدفع الآن — ادفع عند استلام طلبك</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl px-4 py-3 text-center">
              <p className="text-xs text-gray-400 mb-1">إجمالي الطلب</p>
              <p className="text-2xl font-black text-[#173e48]">
                {fmt(total)}{" "}
                <span className="text-base font-medium text-gray-400">ج.م</span>
                <PriceEquivalent amount={total} />
              </p>
            </div>
            <Link
              href="/"
              className="block w-full py-3.5 rounded-xl text-center text-white font-black text-sm"
              style={{ background: "linear-gradient(135deg,#65E0CD,#1B7174)" }}
            >
              العودة للمتجر
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col items-center px-4 pt-6 pb-16 gap-5"
      dir="rtl"
    >
      {/* HEADER */}
      <div className="w-full max-w-lg">
        <Link href="/cart" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#173e48] transition mb-4">
          <ArrowRight size={15} /> ارجع للسلة
        </Link>
        <h1 className="text-2xl font-black text-[#173e48]">إتمام الطلب</h1>
        <p className="text-sm text-gray-400 mt-1">ادفع عند استلام طلبك — لا يلزم بطاقة الآن</p>
      </div>

      {/* ORDER SUMMARY */}
      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-50">
          <p className="text-sm font-black text-gray-600">ملخص الطلب</p>
        </div>
        <div className="divide-y divide-gray-50">
          {items.map((item) => {
            const rawImg =
              item.image ||
              item.product.images?.[0] ||
              (item.product as { image?: string }).image;
            const img = rawImg ? resolveImg(rawImg) : null;
            const price =
              item.price ??
              item.product.salePrice ??
              item.product.originalPrice ??
              (item.product as { price?: number }).price ??
              0;
            return (
              <div
                key={item.id || `${item.product._id}_${item.color}_${item.storage}`}
                className="flex items-center gap-3 px-4 py-3"
              >
                <div className="w-12 h-12 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
                  {img ? (
                    <Image
                      src={img}
                      alt={item.product.name}
                      width={48}
                      height={48}
                      className="object-contain w-full h-full p-1"
                    />
                  ) : (
                    <span className="text-lg">📦</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-[#173e48] truncate">
                    {item.product.name}
                  </p>
                  {(item.color || item.storage) && (
                    <p className="text-xs text-gray-400">
                      {[item.color, item.storage].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  <p className="text-xs text-gray-400">× {item.qty}</p>
                </div>
                <p className="text-sm font-black text-[#173e48] shrink-0">
                  {fmt(price * item.qty)} ج.م
                </p>
              </div>
            );
          })}
        </div>
        <div className="px-4 py-3 bg-gray-50 flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-500">الإجمالي</span>
          <span className="text-lg font-black text-[#173e48]">{fmt(total)} ج.م <PriceEquivalent amount={total} /></span>
        </div>
      </div>

      {/* CUSTOMER FORM */}
      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-50 flex items-center gap-2">
          <User size={16} className="text-gray-400" />
          <p className="text-sm font-black text-gray-600">بياناتك</p>
        </div>
        <div className="px-4 py-5 space-y-4">
          <Field
            label="الاسم الكامل"
            value={name}
            error={errors.name}
            placeholder="أدخل اسمك الكامل"
            required
            onChange={setName}
          />
          <Field
            label="رقم الجوال"
            value={phone}
            error={errors.phone}
            placeholder="05XXXXXXXX"
            required
            inputMode="tel"
            onChange={setPhone}
          />
        </div>
      </div>

      {/* ADDRESS */}
      <div className="w-full max-w-lg bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-4 py-4 border-b border-gray-50 flex items-center gap-2">
          <MapPin size={16} className="text-gray-400" />
          <p className="text-sm font-black text-gray-600">عنوان التوصيل</p>
        </div>
        <div className="px-4 py-5">
          <Field
            label="العنوان"
            value={address}
            error={errors.address}
            placeholder="المدينة، الحي، الشارع..."
            required
            onChange={setAddress}
          />
        </div>
      </div>

      {/* PAYMENT METHOD BADGE */}
      <div className="w-full max-w-lg bg-amber-50 border border-amber-200 rounded-2xl px-4 py-4 flex items-center gap-3">
        <PackageCheck size={22} className="text-amber-600 shrink-0" />
        <div>
          <p className="text-sm font-black text-amber-800">الدفع عند الاستلام</p>
          <p className="text-xs text-amber-600 mt-0.5">
            لا يلزم الدفع الآن — ادفع نقداً عند استلام طلبك
          </p>
        </div>
      </div>

      {/* SUBMIT */}
      <div className="w-full max-w-lg">
        {errors.submit && <p role="alert" className="text-red-600 text-sm">{errors.submit}</p>}
          <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full py-4 rounded-2xl text-white font-black text-base flex items-center justify-center gap-2 disabled:opacity-60 transition hover:opacity-90"
          style={{ background: "linear-gradient(135deg,#173e48,#1B7174)" }}
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              جاري تأكيد الطلب...
            </>
          ) : (
            <>
              <PackageCheck size={18} />
              تأكيد الطلب — الدفع عند الاستلام
            </>
          )}
        </button>
        <p className="text-center text-xs text-gray-400 mt-3 flex items-center justify-center gap-1">
          <Phone size={11} /> سنتواصل معك على الجوال لتأكيد موعد التوصيل
        </p>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
  return mounted ? <CheckoutInner /> : <div className="min-h-screen bg-gray-50" aria-busy="true" />;
}
