"use client";
import PriceEquivalent from "../../../components/PriceEquivalent";

import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  IoCartOutline, IoShieldCheckmark, IoCarOutline,
  IoCheckmarkDoneCircle, IoFlash, IoBagCheckOutline, IoCheckmarkCircle,
} from "react-icons/io5";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "../../../components/products/types";

const fmt = (n: number) => n.toLocaleString("en-US");

const DOWN_OPTIONS = [1000, 1500, 2000];
const MONTH_OPTIONS = [6, 12, 18, 24];

// toKey is defined once here and used both for rendering storage buttons and
// for comparing against selectedStorage. ProductPageClient passes selectedStorage
// using the same toKey logic, so the keys always match.
const toKey = (o: { storage: string; ram?: string; size?: string }) =>
  `${o.storage}|${o.ram ?? ""}|${o.size ?? ""}`;

interface ProductInfoProps {
  product: Product;
  selectedColor: string;
  selectedStorage: string;
  // Pre-computed by ProductPageClient — no need to re-derive in this component.
  originalPrice: number;
  salePrice: number | null | undefined;
  addedToCart: boolean;
  onColorChange: (c: string) => void;
  onStorageChange: (s: string) => void;
  onAddToCart: () => void;
}

function InstallmentCalc({ price }: { price: number }) {
  const [down, setDown] = useState(1000);
  const [months, setMonths] = useState(24);
  const remaining = Math.max(0, price - down);
  const monthly = Math.ceil(remaining / months);

  return (
    <div className="px-3 sm:px-5 py-3 sm:py-4" style={{ borderBottom: "1px solid #f0ebe4", background: "rgba(133,67,192,0.04)" }}>
      <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-2.5 sm:mb-3" style={{ color: "#611FA0" }}>
        حاسبة التقسيط
      </p>

      {/* Down payment */}
      <div className="mb-2.5 sm:mb-3">
        <p className="text-[10px] sm:text-[11px] font-bold mb-1.5" style={{ color: "#1F2C3E" }}>الدفعة المقدمة</p>
        <div className="flex gap-1.5 sm:gap-2">
          {DOWN_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDown(d)}
              className="flex-1 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black border transition-all duration-200"
              style={{
                backgroundColor: down === d ? "#8543C0" : "#faf7f2",
                color: down === d ? "#fff" : "#1F2C3E",
                borderColor: down === d ? "#8543C0" : "#EBE6E2",
                boxShadow: down === d ? "0 4px 14px rgba(133,67,192,0.3)" : "none",
              }}
            >
              {fmt(d)}
            </button>
          ))}
        </div>
      </div>

      {/* Months */}
      <div className="mb-3 sm:mb-4">
        <p className="text-[10px] sm:text-[11px] font-bold mb-1.5" style={{ color: "#1F2C3E" }}>عدد الأشهر</p>
        <div className="flex gap-1.5 sm:gap-2">
          {MONTH_OPTIONS.map((m) => (
            <button
              key={m}
              onClick={() => setMonths(m)}
              className="flex-1 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black border transition-all duration-200"
              style={{
                backgroundColor: months === m ? "#8543C0" : "#faf7f2",
                color: months === m ? "#fff" : "#1F2C3E",
                borderColor: months === m ? "#8543C0" : "#EBE6E2",
                boxShadow: months === m ? "0 4px 14px rgba(133,67,192,0.3)" : "none",
              }}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Result */}
      <div className="rounded-xl sm:rounded-2xl p-2.5 sm:p-4 grid grid-cols-3 gap-2" style={{ background: "linear-gradient(135deg, #8543C0, #611FA0)" }}>
        <div className="text-center">
          <p className="text-[9px] sm:text-[10px] text-white/70 font-semibold mb-0.5">دفعة مقدمة</p>
          <p className="text-sm sm:text-lg font-black text-white leading-tight">{fmt(down)}</p>
          <p className="text-[9px] text-white/60">ج.م</p>
        </div>
        <div className="text-center border-x border-white/20">
          <p className="text-[9px] sm:text-[10px] text-white/70 font-semibold mb-0.5">عدد الأشهر</p>
          <p className="text-sm sm:text-lg font-black text-white leading-tight">{months}</p>
          <p className="text-[9px] text-white/60">شهر</p>
        </div>
        <div className="text-center">
          <p className="text-[9px] sm:text-[10px] text-white/70 font-semibold mb-0.5">القسط الشهري</p>
          <p className="text-sm sm:text-lg font-black text-white leading-tight">{fmt(monthly)}</p>
          <p className="text-[9px] text-white/60">ج.م</p>
        </div>
      </div>
    </div>
  );
}

export default function ProductInfo({
  product, selectedColor, selectedStorage,
  originalPrice, salePrice,
  addedToCart,
  onColorChange, onStorageChange, onAddToCart,
}: ProductInfoProps) {
  const router = useRouter();
  const { name, brand, freeDelivery, inStock, taxIncluded, installment } = product;

  const hasVariants = product.variants && product.variants.length > 0;
  // storageOpts only needed here to render the storage selector buttons.
  const activeVariant = product.variants?.find((v) => v.color === selectedColor);
  const storageOpts = activeVariant?.storageOptions ?? product.variants?.[0]?.storageOptions ?? [];

  const hasDiscount = salePrice != null && salePrice > 0 && salePrice < originalPrice;
  const savingsPercent = hasDiscount
    ? Math.round(((originalPrice - (salePrice ?? 0)) / originalPrice) * 100)
    : 0;

  return (
    <div className="lg:sticky lg:top-[72px]">
      <div className="rounded-3xl overflow-hidden" style={{ border: "1px solid #EBE6E2", background: "#fff" }}>

        {/* ── Name + Brand + Stock ── */}
        <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3 sm:pb-4" style={{ borderBottom: "1px solid #f0ebe4" }}>
          <div className="flex items-center gap-2 mb-2">
            {brand && (
              brand.toLowerCase() === "apple" ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(133,67,192,0.1)" }}>
                  <svg viewBox="0 0 814 1000" width="12" height="12" fill="#8543C0" xmlns="http://www.w3.org/2000/svg">
                    <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-57.8-155.5-127.4C46 790.7 0 663 0 541.8c0-207.5 135.4-317.3 269-317.3 70.1 0 128.4 46.4 172.5 46.4 42.8 0 109.6-49 192.5-49 30.9 0 111.9 2.6 168.3 80.1zm-234-181.5c31.1-36.9 53.1-88.1 53.1-139.3 0-7.1-.6-14.3-1.9-20.1-50.6 1.9-110.8 33.7-147.1 75.8-28.5 32.4-55.1 83.6-55.1 135.5 0 7.8 1.3 15.6 1.9 18.1 3.2.6 8.4 1.3 13.6 1.3 45.4 0 102.5-30.4 135.5-71.3z"/>
                  </svg>
                  <span className="text-[10px] sm:text-[11px] font-black tracking-widest uppercase" style={{ color: "#8543C0" }}>Apple</span>
                </span>
              ) : (
                <span className="text-[10px] sm:text-[11px] font-black tracking-widest uppercase px-2.5 py-1 rounded-full" style={{ backgroundColor: "rgba(133,67,192,0.1)", color: "#8543C0" }}>
                  {brand}
                </span>
              )
            )}
            <span className={`inline-flex items-center gap-1.5 text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full ${inStock ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${inStock ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`} />
              {inStock ? "متوفر" : "غير متوفر"}
            </span>
          </div>
          <h2 className="lg:hidden text-sm sm:text-lg font-black leading-snug" style={{ color: "#1F2C3E" }}>{name}</h2>
        </div>

        {/* ── Color Selector ── */}
        {hasVariants && (
          <div className="px-4 sm:px-5 py-3 sm:py-4" style={{ borderBottom: "1px solid #f0ebe4" }}>
            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-2.5" style={{ color: "#611FA0" }}>
              اللون — {selectedColor}
            </p>
            <div className="flex gap-2.5 sm:gap-3 flex-wrap">
              {product.variants!.map((v, i) => (
                <motion.button
                  key={`${i}-${v.color}`}
                  title={v.color}
                  whileTap={{ scale: 0.85 }}
                  onClick={() => onColorChange(v.color)}
                  className="relative w-7 h-7 sm:w-8 sm:h-8 rounded-full cursor-pointer"
                  style={{
                    backgroundColor: v.colorCode,
                    boxShadow: selectedColor === v.color
                      ? "0 0 0 2px #fff, 0 0 0 4px #8543C0"
                      : "0 2px 8px rgba(0,0,0,0.15)",
                  }}
                >
                  {selectedColor === v.color && (
                    <span className="absolute inset-0 flex items-center justify-center">
                      <IoCheckmarkCircle size={13} className="text-white drop-shadow" />
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        )}

        {/* ── Storage Selector ── */}
        {storageOpts.length > 1 && (
          <div className="px-4 sm:px-5 py-3 sm:py-4" style={{ borderBottom: "1px solid #f0ebe4" }}>
            <p className="text-[10px] sm:text-[11px] font-black uppercase tracking-widest mb-2.5" style={{ color: "#611FA0" }}>السعة</p>
            <div className="flex gap-2 flex-wrap">
              {storageOpts.map((opt) => {
                const key = toKey(opt);
                const isActive = selectedStorage === key;
                return (
                  <motion.button
                    key={key}
                    whileTap={{ scale: 0.93 }}
                    onClick={() => onStorageChange(key)}
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[11px] sm:text-xs font-black border cursor-pointer transition-all duration-200"
                    style={{
                      backgroundColor: isActive ? "#8543C0" : "#faf7f2",
                      color: isActive ? "#fff" : "#1F2C3E",
                      borderColor: isActive ? "#8543C0" : "#EBE6E2",
                      boxShadow: isActive ? "0 4px 14px rgba(133,67,192,0.3)" : "none",
                    }}
                  >
                    {opt.storage}
                    {opt.ram && <span className="block text-[9px] mt-0.5 opacity-70">{opt.ram}</span>}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── Price — animated on variant/storage change ── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${selectedStorage}-${selectedColor}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="px-4 sm:px-5 py-4 sm:py-5"
            style={{ borderBottom: "1px solid #f0ebe4", background: "linear-gradient(135deg, rgba(133,67,192,0.04), rgba(255,255,255,0))" }}
          >
            {hasDiscount ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black" style={{ color: "#8543C0" }}>{fmt(salePrice!)}</span>
                    <span className="text-sm font-medium whitespace-nowrap">ج.م</span>
                    <PriceEquivalent amount={salePrice!} rate={product.exchangeRate} />
                  </div>
                  {taxIncluded && <p className="text-[10px] mt-1" style={{ color: "#611FA0" }}>شامل ضريبة القيمة المضافة</p>}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black" style={{ color: "#8543C0" }}>{fmt(originalPrice)}</span>
                  <span className="text-sm font-medium whitespace-nowrap">ج.م</span>
                  <PriceEquivalent amount={originalPrice} rate={product.exchangeRate} />
                </div>
                {taxIncluded && <p className="text-[10px] mt-1" style={{ color: "#611FA0" }}>شامل ضريبة القيمة المضافة</p>}
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* ── Installment Calculator ── */}
        {installment?.available && (
          <InstallmentCalc price={salePrice ?? originalPrice} />
        )}

        {/* ── Installment ── */}
        {installment?.available && (
          <div className="px-4 sm:px-5 py-3 flex items-center gap-3" style={{ borderBottom: "1px solid #f0ebe4", background: "rgba(133,67,192,0.04)" }}>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(133,67,192,0.12)" }}>
              <IoFlash size={14} style={{ color: "#8543C0" }} />
            </div>
            <div>
              <p className="text-[11px] sm:text-xs font-bold flex items-center gap-1 flex-wrap" style={{ color: "#1F2C3E" }}>
                tقسيط متاح {installment.downPayment ? <><span>• مقدم {fmt(installment.downPayment)}</span><span className="text-sm font-medium whitespace-nowrap">ج.م</span></> : ""}
              </p>
              {installment.note && <p className="text-[10px] mt-0.5" style={{ color: "#611FA0" }}>{installment.note}</p>}
            </div>
          </div>
        )}

        {/* ── Trust badges ── */}
        <div className="grid grid-cols-2 gap-px" style={{ background: "#f0ebe4" }}>
          {[
            { icon: IoCarOutline, label: freeDelivery ? "توصيل مجاني" : "توصيل مدفوع", sub: null },
            { icon: IoShieldCheckmark, label: "ضمان سنتين", sub: null },
          ].map((f, i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-2.5 px-3 sm:px-4 py-3" style={{ background: "#fff" }}>
              <f.icon size={15} style={{ color: "#8543C0", flexShrink: 0 }} />
              <div className="min-w-0">
                <p className="text-[10px] sm:text-[11px] font-bold truncate" style={{ color: "#1F2C3E" }}>{f.label}</p>
                {f.sub && <p className="text-[9px] sm:text-[10px] truncate" style={{ color: "#611FA0" }}>{f.sub}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* ── CTA ── */}
        <div className="p-3 sm:p-4">
          {!addedToCart ? (
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onAddToCart}
              className="group w-full relative overflow-hidden font-black text-sm sm:text-base py-3.5 sm:py-4 rounded-2xl flex items-center justify-center gap-2.5 text-white"
              style={{ background: "linear-gradient(135deg, #8543C0, #611FA0)", boxShadow: "0 6px 24px rgba(133,67,192,0.35)" }}
            >
              <span className="absolute inset-0 bg-gradient-to-l from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
              <IoCartOutline size={18} className="relative" />
              <span className="relative">أضف للسلة</span>
            </motion.button>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-center gap-2 py-2.5 rounded-2xl" style={{ backgroundColor: "rgba(16,185,129,0.08)", color: "#059669" }}>
                <IoCheckmarkDoneCircle size={17} />
                <span className="text-xs sm:text-sm font-bold">تمت الإضافة للسلة</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => router.back()} className="font-bold text-xs sm:text-sm py-2.5 sm:py-3 rounded-xl" style={{ backgroundColor: "#faf7f2", color: "#1F2C3E", border: "1px solid #EBE6E2" }}>
                  متابعة التسوق
                </button>
                <button onClick={() => router.push("/cart")} className="text-white font-bold text-xs sm:text-sm py-2.5 sm:py-3 rounded-xl flex items-center justify-center gap-2" style={{ background: "linear-gradient(135deg, #8543C0, #611FA0)" }}>
                  <IoBagCheckOutline size={14} />
                  عرض السلة
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
