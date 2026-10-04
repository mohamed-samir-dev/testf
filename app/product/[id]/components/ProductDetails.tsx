"use client";

import { useState, useRef, useEffect } from "react";
import { IoCheckmarkCircle, IoListOutline, IoCardOutline } from "react-icons/io5";
import type { Product } from "../../../components/products/types";

const fmt = (n: number) => n.toLocaleString("ar-SA");

const specLabels: [keyof NonNullable<Product["specs"]>, string, string][] = [
  ["screen", "الشاشة", "📱"],
  ["processor", "المعالج", "⚡"],
  ["ram", "الرام", "🧠"],
  ["storage", "التخزين", "💾"],
  ["rearCamera", "الكاميرا الخلفية", "📸"],
  ["frontCamera", "الكاميرا الأمامية", "🤳"],
  ["battery", "البطارية", "🔋"],
  ["batteryLife", "عمر البطارية", "⏱️"],
  ["charging", "الشحن", "🔌"],
  ["os", "نظام التشغيل", "💻"],
  ["extras", "مميزات إضافية", "✨"],
];

interface ProductDetailsProps {
  installment?: Product["installment"];
  description?: string;
  specs?: Product["specs"];
  specGroups?: { group: string; items: { key: string; value: string }[] }[];
}

type Tab = "specs" | "installment";

const tabMeta: Record<Tab, { icon: typeof IoListOutline; label: string }> = {
  specs: { icon: IoListOutline, label: "المواصفات" },
  installment: { icon: IoCardOutline, label: "التقسيط" },
};

export default function ProductDetails({ installment, description, specs, specGroups }: ProductDetailsProps) {
  const hasSpecs = (specs && Object.values(specs).some(Boolean)) || (specGroups && specGroups.length > 0);
  const [activeGroup, setActiveGroup] = useState(0);
  const tabs: { key: Tab; show: boolean }[] = [
    { key: "specs", show: !!hasSpecs },
    { key: "installment", show: !!installment?.available },
  ];
  const visibleTabs = tabs.filter((t) => t.show);
  const [active, setActive] = useState<Tab>(visibleTabs[0]?.key || "specs");
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const tabsRef = useRef<(HTMLButtonElement | null)[]>([]);

  useEffect(() => {
    const idx = visibleTabs.findIndex((t) => t.key === active);
    const el = tabsRef.current[idx];
    if (el) setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, visibleTabs.length]);

  if (!visibleTabs.length) return null;

  return (
    <div className="mt-5 sm:mt-8 md:mt-14 relative bg-white rounded-2xl sm:rounded-[24px] md:rounded-[28px] shadow-lg sm:shadow-xl shadow-black/[.03] overflow-hidden" style={{ border: "1px solid #EBE6E2" }}>
      {/* ─── Tabs ─── */}
      <div className="relative border-b overflow-x-auto scrollbar-hide" style={{ borderColor: "#EBE6E2", backgroundColor: "#faf7f2" }}>
        <div className="flex relative">
          <div
            className="absolute bottom-0 h-[2.5px] sm:h-[3px] rounded-t-full transition-all duration-400 ease-out"
            style={{ left: indicator.left, width: indicator.width, background: "linear-gradient(90deg, #8543C0, #A77FD8)" }}
          />
          {visibleTabs.map((t, idx) => {
            const m = tabMeta[t.key];
            const isActive = active === t.key;
            return (
              <button
                key={t.key}
                ref={(el) => { tabsRef.current[idx] = el; }}
                onClick={() => setActive(t.key)}
                className={`flex-1 min-w-[80px] sm:min-w-[110px] flex items-center justify-center gap-1 sm:gap-2.5 py-3 sm:py-5 md:py-6 text-[10px] sm:text-xs md:text-sm font-bold transition-all duration-300 ${
                  isActive ? "bg-white/60" : "hover:bg-white/40"
                }`}
                style={{ color: isActive ? "#1F2C3E" : "#611FA0" }}
              >
                <m.icon size={13} className="transition-colors duration-300 sm:hidden" style={{ color: isActive ? "#8543C0" : undefined }} />
                <m.icon size={17} className="transition-colors duration-300 hidden sm:block" style={{ color: isActive ? "#8543C0" : undefined }} />
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Content ─── */}
      <div className="p-3 sm:p-5 md:p-8">
        {/* Specs */}
        {active === "specs" && hasSpecs && (
          <div>
            {/* specGroups (new format) */}
            {specGroups && specGroups.length > 0 && (
              <div>
                {/* Group tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto scrollbar-hide pb-0.5">
                  {specGroups.map((g, gi) => (
                    <button
                      key={gi}
                      onClick={() => setActiveGroup(gi)}
                      className="px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-black whitespace-nowrap shrink-0 transition-all duration-200 cursor-pointer"
                      style={{
                        backgroundColor: activeGroup === gi ? "#8543C0" : "rgba(133,67,192,0.08)",
                        color: activeGroup === gi ? "#fff" : "#611FA0",
                        border: `1px solid ${activeGroup === gi ? "#8543C0" : "rgba(133,67,192,0.2)"}`,
                      }}
                    >
                      {g.group}
                    </button>
                  ))}
                </div>
                <div className="rounded-xl sm:rounded-2xl overflow-hidden" style={{ border: "1px solid #EBE6E2" }}>
                  {specGroups[activeGroup]?.items.map((item, i) => (
                    <div key={i} className="flex items-start sm:items-center text-[10px] sm:text-xs md:text-sm px-2.5 sm:px-5 md:px-6 py-2.5 sm:py-4 gap-2 sm:gap-4 transition-colors hover:bg-[#8543C0]/[0.03]" style={{ backgroundColor: i % 2 === 0 ? "#faf7f2" : "#fff" }}>
                      <span className="w-24 sm:w-36 shrink-0 font-semibold" style={{ color: "#611FA0" }}>{item.key}</span>
                      <span className="flex-1 min-w-0 break-words font-semibold" style={{ color: "#1F2C3E" }}>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* specs (old format) */}
            {!specGroups?.length && specs && (
              <div className="rounded-xl sm:rounded-2xl overflow-hidden" style={{ border: "1px solid #EBE6E2" }}>
                {specLabels.map(([key, label, emoji], i) =>
                  specs[key] ? (
                    <div key={key} className="flex items-start sm:items-center text-[10px] sm:text-xs md:text-sm px-2.5 sm:px-5 md:px-6 py-2.5 sm:py-4 md:py-[18px] gap-2 sm:gap-4 transition-colors hover:bg-[#8543C0]/[0.03]" style={{ backgroundColor: i % 2 === 0 ? "#faf7f2" : "#fff" }}>
                      <span className="text-xs sm:text-base md:text-lg w-4 sm:w-7 text-center shrink-0">{emoji}</span>
                      <span className="w-16 sm:w-28 md:w-40 shrink-0 font-semibold" style={{ color: "#611FA0" }}>{label}</span>
                      <span className="flex-1 min-w-0 break-words font-semibold" style={{ color: "#1F2C3E" }}>{specs[key]}</span>
                    </div>
                  ) : null
                )}
              </div>
            )}
          </div>
        )}

        {/* Installment */}
        {active === "installment" && installment?.available && (
          <div className="space-y-3 sm:space-y-5 md:space-y-6">
            <div className="rounded-xl sm:rounded-2xl p-3 sm:p-5 md:p-6" style={{ backgroundColor: "#faf7f2", border: "1px solid #EBE6E2" }}>
              <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
                <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: "rgba(133,67,192,0.1)" }}>
                  <IoCardOutline size={14} className="sm:hidden" style={{ color: "#8543C0" }} />
                  <IoCardOutline size={16} className="hidden sm:block md:hidden" style={{ color: "#8543C0" }} />
                  <IoCardOutline size={18} className="hidden md:block" style={{ color: "#8543C0" }} />
                </div>
                <p className="text-[11px] sm:text-xs md:text-sm lg:text-base font-bold" style={{ color: "#1F2C3E" }}>احصل عليه بأقساط شهرية مريحة</p>
              </div>
              {installment.downPayment && (
                <p className="text-[10px] sm:text-[11px] md:text-xs mr-9 sm:mr-12 md:mr-[52px]" style={{ color: "#611FA0" }}>مقدم {fmt(installment.downPayment)} ج.م والباقي أقساط</p>
              )}
              {installment.note && <p className="text-[9px] sm:text-[10px] md:text-xs mt-1 sm:mt-2 mr-9 sm:mr-12 md:mr-[52px]" style={{ color: "rgba(97,31,160,0.7)" }}>{installment.note}</p>}
            </div>

            {installment.policy && (
              <div className="text-center py-1.5 sm:py-2 md:py-3">
                <span className="inline-flex items-center gap-1 sm:gap-2 text-[10px] sm:text-[11px] md:text-xs lg:text-sm font-bold px-3 sm:px-4 md:px-5 py-1.5 sm:py-2 md:py-2.5 rounded-full" style={{ color: "#611FA0", backgroundColor: "rgba(133,67,192,0.08)", border: "1px solid rgba(133,67,192,0.15)" }}>
                  ♕ {installment.policy} ♕
                </span>
              </div>
            )}

            {installment.conditions && installment.conditions.length > 0 && (
              <div>
                <p className="text-[10px] sm:text-[11px] md:text-xs lg:text-sm font-bold mb-2 sm:mb-3 md:mb-4" style={{ color: "#1F2C3E" }}>شروط التقديم</p>
                <div className="flex flex-col gap-1.5 sm:gap-2 md:gap-2.5">
                  {installment.conditions.map((c, i) => (
                    <div key={i} className="flex items-start gap-2 sm:gap-3 md:gap-3.5 text-[10px] sm:text-[11px] md:text-xs lg:text-sm rounded-lg sm:rounded-xl px-3 sm:px-4 md:px-5 py-2.5 sm:py-3 md:py-3.5 transition-colors hover:bg-[#8543C0]/[0.03]" style={{ color: "#1F2C3E", backgroundColor: "#faf7f2", border: "1px solid #EBE6E2" }}>
                      <IoCheckmarkCircle size={14} className="shrink-0 mt-0.5 sm:hidden" style={{ color: "#8543C0" }} />
                      <IoCheckmarkCircle size={16} className="shrink-0 mt-0.5 hidden sm:block" style={{ color: "#8543C0" }} />
                      <span className="font-medium">{c}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
