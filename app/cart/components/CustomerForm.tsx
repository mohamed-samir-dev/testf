"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { IoPersonOutline, IoCardOutline, IoCallOutline, IoLocationOutline } from "react-icons/io5";
import type { CustomerInfo } from "../../store/cartStore";

/* ── HIDDEN (محفوظ للرجوع) ──────────────────────────────────────────
import Image from "next/image";
import { useMemo } from "react";
import { IoCalendarOutline, IoWalletOutline, IoChevronDown } from "react-icons/io5";

const EGP = () => (
  <span className="text-sm font-medium whitespace-nowrap">ج.م</span>
);
const fmt = (n: number) => n.toLocaleString("en-US");

const maxMonths = installmentMonths ?? 24;
const MONTHS_OPTIONS = Array.from({ length: maxMonths }, (_, i) => i + 1);
const minDownPayment = 1000 * itemCount;
const DOWN_PAYMENT_OPTIONS = [minDownPayment, minDownPayment + 500, minDownPayment + 1000];
const [months, setMonths] = useState(initialData?.months ?? maxMonths);
const [downPaymentExtra, setDownPaymentExtra] = useState<number>(0);
const downPayment = minDownPayment + downPaymentExtra;

const monthlyPayment = useMemo(() => {
  const remaining = total - downPayment;
  return remaining > 0 ? Math.ceil(remaining / months) : 0;
}, [total, months, downPayment]);

const schedule = useMemo(() => {
  const now = new Date();
  return Array.from({ length: months }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() + i + 1, now.getDate());
    return { index: i + 1, date: `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`, amount: monthlyPayment };
  });
}, [months, monthlyPayment]);

const selectClass = "w-full rounded-xl px-4 py-3 text-sm font-bold text-gray-800 bg-[#f9f5ff]/50 border border-[#8543C0]/10 focus:outline-none focus:border-[#8543C0] focus:ring-2 focus:ring-[#8543C0]/10 focus:bg-white transition-all duration-200 cursor-pointer appearance-none";

── OrderPopup (الموودال القديم – الدفع عند الاستلام) ─────────────────
function OrderPopup({ whatsapp, onClose }: { whatsapp: string; onClose: () => void }) {
  const wa = whatsapp.startsWith("0") ? "966" + whatsapp.slice(1) : whatsapp;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4" dir="rtl">
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 300, damping: 25 }} className="bg-white rounded-3xl shadow-[0_24px_80px_rgba(0,0,0,0.15)] w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-br from-[#090D54] via-[#611FA0] to-[#7A2FCC] px-6 pt-8 pb-6 text-center relative">
          <button onClick={onClose} className="absolute top-4 left-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 transition-all"><span className="text-xl leading-none">&times;</span></button>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, delay: 0.15 }} className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/10 flex items-center justify-center"><span className="text-4xl">✅</span></motion.div>
          <h2 className="text-white font-extrabold text-xl">تم استلام طلبك!</h2>
          <p className="text-white/60 text-sm mt-1">شكراً لثقتك بنا</p>
        </div>
        <div className="px-6 py-6 space-y-4 text-center">
          <p className="text-gray-600 text-sm leading-8">تم تسجيل طلبك بنجاح 🎉<br /><span className="font-extrabold text-gray-800">سنتواصل معك على واتساب</span><br />لتأكيد الطلب وترتيب التوصيل.<br /><span className="text-[#8543C0] font-bold">الدفع عند الاستلام</span></p>
          <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#25D366] text-white font-bold text-sm">تواصل معنا على واتساب</a>
          <button onClick={onClose} className="w-full py-3 rounded-2xl border border-gray-200 text-gray-500 font-bold text-sm hover:bg-gray-50 transition-colors">إغلاق</button>
        </div>
      </motion.div>
    </div>
  );
}
──────────────────────────────────────────────────────────────────── */

function Field({ label, icon, error, children }: { label: string; icon: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-wide">
        {icon}
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="text-red-400 text-xs font-bold">
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

interface CustomerFormProps {
  total: number;
  itemCount: number;
  initialData?: CustomerInfo | null;
  installmentMonths?: number;
  onSubmit: (info: CustomerInfo) => void;
}

export default function CustomerForm({ total: _total, itemCount: _itemCount, initialData, installmentMonths: _installmentMonths, onSubmit }: CustomerFormProps) {
  const router = useRouter();
  const [name, setName] = useState(initialData?.name ?? "");
  const [nationalId, setNationalId] = useState(initialData?.nationalId ?? "");
  const [whatsapp, setWhatsapp] = useState(initialData?.whatsapp ?? "");
  const [address, setAddress] = useState(initialData?.address ?? "");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const inputClass = (field: string) =>
    `w-full rounded-xl px-4 py-3 text-sm text-gray-800 bg-[#f9f5ff]/50 border focus:outline-none transition-all duration-200 placeholder:text-gray-300 ${
      errors[field]
        ? "border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100 bg-red-50/30"
        : "border-[#8543C0]/10 focus:border-[#8543C0] focus:ring-2 focus:ring-[#8543C0]/10 focus:bg-white"
    }`;

  const handleSubmit = () => {
    const newErrors: Record<string, string> = {};
    if (!name.trim()) newErrors.name = "مطلوب";
    if (!nationalId.trim()) newErrors.nationalId = "مطلوب";
    else if (!/^[12]\d{9}$/.test(nationalId.trim())) newErrors.nationalId = "رقم هوية غير صحيح، يجب أن يبدأ بـ 1 أو 2 ويتكون من 10 أرقام";
    if (!whatsapp.trim()) newErrors.whatsapp = "مطلوب";
    else if (!/^05\d{8}$/.test(whatsapp.trim())) newErrors.whatsapp = "رقم غير صحيح، يجب أن يبدأ بـ 05 ويتكون من 10 أرقام";
    if (!address.trim()) newErrors.address = "مطلوب";
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      document.getElementById(`field-${Object.keys(newErrors)[0]}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    onSubmit({ name: name.trim(), nationalId: nationalId.trim(), whatsapp: whatsapp.trim(), address: address.trim(), installmentType: "full", months: 0, downPayment: 0 });
    router.push("/checkout");
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="space-y-4">

      {/* Customer Info */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 space-y-4 border border-[#8543C0]/[0.06] shadow-[0_2px_16px_rgba(133,67,192,0.05)]">
        <div className="flex items-center gap-2 pb-2 border-b border-[#8543C0]/[0.06]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#8543C0]/10 to-[#A842E4]/10 flex items-center justify-center">
            <IoPersonOutline size={16} className="text-[#8543C0]" />
          </div>
          <h3 className="text-sm font-extrabold text-gray-800">بيانات العميل</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="الاسم كاملاً" icon={<IoPersonOutline size={12} className="text-[#8543C0]" />} error={errors.name}>
            <input id="field-name" value={name} onChange={(e) => { setName(e.target.value.replace(/[^a-zA-Z\u0600-\u06FF\s]/g, "")); setErrors((p) => ({ ...p, name: "" })); }} placeholder="محمد أحمد" className={inputClass("name")} />
          </Field>
          <Field label="رقم الهوية / الإقامة" icon={<IoCardOutline size={12} className="text-[#8543C0]" />} error={errors.nationalId}>
            <input id="field-nationalId" value={nationalId} inputMode="numeric" onChange={(e) => { setNationalId(e.target.value.replace(/[^0-9]/g, "").slice(0, 10)); setErrors((p) => ({ ...p, nationalId: "" })); }} placeholder="1XXXXXXXXX" maxLength={10} className={inputClass("nationalId")} />
          </Field>
          <Field label="رقم الواتساب" icon={<IoCallOutline size={12} className="text-[#8543C0]" />} error={errors.whatsapp}>
            <input id="field-whatsapp" type="tel" inputMode="numeric" value={whatsapp} onChange={(e) => { setWhatsapp(e.target.value.replace(/[^0-9]/g, "").slice(0, 10)); setErrors((p) => ({ ...p, whatsapp: "" })); }} placeholder="05XXXXXXXX" className={inputClass("whatsapp")} />
          </Field>
          <Field label="العنوان" icon={<IoLocationOutline size={12} className="text-[#8543C0]" />} error={errors.address}>
            <input id="field-address" value={address} onChange={(e) => { setAddress(e.target.value); setErrors((p) => ({ ...p, address: "" })); }} placeholder="المدينة - الحي - الشارع" className={inputClass("address")} />
          </Field>
        </div>
      </div>

      {/* Submit */}
      <motion.button
        whileHover={{ scale: 1.01, y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        className="w-full relative overflow-hidden bg-gradient-to-r from-[#7A2FCC] via-[#8543C0] to-[#A842E4] text-white font-bold py-4 rounded-2xl text-sm shadow-[0_8px_30px_rgba(133,67,192,0.35)] hover:shadow-[0_12px_40px_rgba(133,67,192,0.45)] transition-shadow duration-300"
      >
        <span className="relative z-10">تأكيد الطلب</span>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_2.5s_infinite]" />
      </motion.button>
    </motion.div>
  );
}
