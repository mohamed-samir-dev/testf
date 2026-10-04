"use client";

import { useState, useRef, Component, type ReactNode } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";

interface ProductSection {
  _id?: string;
  type: string;
  title: string;
  subtitle?: string;
  content?: Record<string, unknown>;
  media?: { type: string; url: string; alt?: string }[];
  sortOrder: number;
  isActive: boolean;
}

const P = "#8543C0";

// ── Simple Error Boundary ──────────────────────────────────────────────────
class SectionErrorBoundary extends Component<
  { children: ReactNode },
  { error: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { error: false };
  }
  static getDerivedStateFromError() { return { error: true }; }
  render() {
    if (this.state.error) return null; // silently hide broken sections
    return this.props.children;
  }
}

// ── Scroll-triggered fade-in (single IntersectionObserver per section) ────
function Visible({ children }: { children: ReactNode }) {
  const ref = useRef(null);
  const ok = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={ok ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

function More({ text, limit = 130, className }: { text: string; limit?: number; className?: string }) {
  const [open, setOpen] = useState(false);
  const long = text.length > limit;
  return (
    <div>
      <p className={className}>{long && !open ? text.slice(0, limit) + "…" : text}</p>
      {long && (
        <button
          onClick={() => setOpen(!open)}
          className="mt-2 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
          style={{ color: `${P}99` }}
        >
          {open ? "أقل ▲" : "عرض المزيد ▼"}
        </button>
      )}
    </div>
  );
}

function ScrollTabs({ items, active, onChange }: { items: string[]; active: number; onChange: (i: number) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1" style={{ WebkitOverflowScrolling: "touch" }}>
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className="shrink-0 px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap"
          style={{
            backgroundColor: active === i ? "#fff" : "rgba(255,255,255,0.12)",
            color: active === i ? "#111" : "rgba(255,255,255,0.65)",
            border: active === i ? "none" : "1px solid rgba(255,255,255,0.18)",
          }}
        >
          {item}
        </button>
      ))}
    </div>
  );
}

function Dots({ count, active, onChange }: { count: number; active: number; onChange: (i: number) => void }) {
  return (
    <div className="flex gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <button
          key={i}
          onClick={() => onChange(i)}
          className="rounded-full transition-all duration-300 cursor-pointer"
          style={{ width: active === i ? 20 : 7, height: 7, backgroundColor: active === i ? P : "rgba(255,255,255,0.3)" }}
        />
      ))}
    </div>
  );
}

/* full-bleed card — images are below the fold, so loading="lazy" */
function Card({ image, height = "clamp(380px, 58vw, 580px)", children }: { image: string; height?: string; children: ReactNode }) {
  return (
    <div className="relative w-full rounded-2xl overflow-hidden" style={{ height }}>
      <Image src={image} alt="" fill loading="lazy" className="object-cover" sizes="(max-width: 768px) 100vw, 80vw" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 55%, transparent 100%)" }} />
      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">{children}</div>
    </div>
  );
}

/* half card — images are below the fold, so loading="lazy" */
function Half({ image, children, flip }: { image: string; children: ReactNode; flip?: boolean }) {
  return (
    <div className="rounded-2xl overflow-hidden grid sm:grid-cols-2" style={{ minHeight: "clamp(300px, 46vw, 480px)" }}>
      <div className={`relative ${flip ? "sm:order-2" : ""}`}>
        <Image src={image} alt="" fill loading="lazy" className="object-cover" sizes="50vw" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 60%)" }} />
      </div>
      <div className={`bg-black flex flex-col justify-center p-5 sm:p-8 ${flip ? "sm:order-1" : ""}`}>{children}</div>
    </div>
  );
}

function SLabel({ children }: { children: ReactNode }) {
  return <p className="text-[10px] font-black tracking-[0.18em] uppercase mb-2" style={{ color: `${P}bb` }}>{children}</p>;
}

/* ── DESIGN ── */
function DesignSection({ section }: { section: ProductSection }) {
  const features: { id: string; label: string; title: string; image: string; colors?: { name: string; colorCode: string; image: string; title?: string }[] }[] =
    ((section.content as Record<string, unknown>)?.features as never[]) ?? [];
  const [active, setActive] = useState(0);
  const [ci, setCi] = useState(0);
  const feat = features[active];
  const img = feat?.id === "colors" && feat.colors?.length ? feat.colors[ci].image : feat?.image;
  const txt = feat?.id === "colors" && feat.colors?.[ci]?.title ? feat.colors[ci].title : feat?.title;

  return (
    <Visible>
      <div className="mt-16" dir="rtl">
        <div className="mb-4">
          <p className="text-[10px] font-black tracking-[0.18em] uppercase mb-1" style={{ color: P }}>التصميم</p>
          <h2 className="text-xl sm:text-2xl font-black" style={{ color: "#1F2C3E" }}>{section.title}</h2>
        </div>
        <Card image={img ?? ""}>
          <AnimatePresence mode="wait">
            <motion.div key={`${active}-${ci}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.28 }} className="mb-3">
              <SLabel>{feat?.label}</SLabel>
              <More text={txt ?? ""} className="text-sm sm:text-lg font-black text-white leading-snug max-w-lg" />
              {feat?.id === "colors" && feat.colors && (
                <div className="flex gap-2.5 mt-3">
                  {feat.colors.map((col, idx) => (
                    <button key={idx} title={col.name} onClick={() => setCi(idx)} className="w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 cursor-pointer transition-transform duration-200"
                      style={{ backgroundColor: col.colorCode, borderColor: ci === idx ? "#fff" : "rgba(255,255,255,0.3)", transform: ci === idx ? "scale(1.2)" : "scale(1)" }} />
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
          <ScrollTabs items={features.map(f => f.label)} active={active} onChange={(i) => { setActive(i); setCi(0); }} />
        </Card>
      </div>
    </Visible>
  );
}

/* ── CAMERA ── */
function CameraSection({ section }: { section: ProductSection }) {
  const c = section.content as Record<string, unknown>;
  const hero = c?.hero as { image?: string; stats: { value: string; label: string }[]; description: string } | undefined;

  return (
    <Visible>
      <div className="mt-16" dir="rtl">
        <div className="mb-4">
          <p className="text-[10px] font-black tracking-[0.18em] uppercase mb-1" style={{ color: P }}>الكاميرا</p>
          <h2 className="text-xl sm:text-2xl font-black" style={{ color: "#1F2C3E" }}>{section.title}</h2>
          {section.subtitle && <p className="text-sm mt-0.5" style={{ color: "#611FA0" }}>{section.subtitle}</p>}
        </div>
        {hero?.image && (
          <Card image={hero.image}>
            <div className="flex gap-6 sm:gap-14 mb-4">
              {(hero.stats ?? []).map((s, i) => (
                <div key={i}>
                  <p className="text-3xl sm:text-5xl font-black text-white leading-none">{s.value}</p>
                  <p className="text-[10px] sm:text-xs mt-1 max-w-[80px] leading-snug" style={{ color: "rgba(255,255,255,0.45)" }}>{s.label}</p>
                </div>
              ))}
            </div>
            <More text={hero.description ?? ""} className="text-xs sm:text-sm text-white/55 leading-relaxed max-w-2xl" />
          </Card>
        )}
      </div>
    </Visible>
  );
}

/* ── PERFORMANCE ── */
function PerformanceSection({ section }: { section: ProductSection }) {
  const c = section.content as Record<string, unknown>;
  const description = c?.description as string | undefined;
  const chips = (c?.chips as { name: string; description: string }[]) ?? [];
  const [active, setActive] = useState(0);

  return (
    <Visible>
      <div className="mt-16" dir="rtl">
        <div className="mb-4">
          <p className="text-[10px] font-black tracking-[0.18em] uppercase mb-1" style={{ color: P }}>الأداء</p>
          <h2 className="text-xl sm:text-2xl font-black" style={{ color: "#1F2C3E" }}>{section.title}</h2>
          {section.subtitle && <p className="text-sm mt-0.5" style={{ color: "#611FA0" }}>{section.subtitle}</p>}
        </div>
        {section.media?.[0]?.url && (
          <Card image={section.media[0].url}>
            {description && <More text={description} className="text-xs sm:text-sm text-white/55 leading-relaxed max-w-2xl mb-4" />}
            {chips.length > 0 && (
              <>
                <AnimatePresence mode="wait">
                  <motion.div key={active} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.22 }} className="mb-3">
                    <p className="text-sm font-black text-white">{chips[active].name}</p>
                    <More text={chips[active].description} className="text-xs sm:text-sm mt-1 leading-relaxed max-w-xl" limit={110} />
                  </motion.div>
                </AnimatePresence>
                <ScrollTabs items={chips.map(ch => ch.name)} active={active} onChange={setActive} />
              </>
            )}
          </Card>
        )}
      </div>
    </Visible>
  );
}

/* ── BATTERY ── */
function BatterySection({ section }: { section: ProductSection }) {
  const c = section.content as Record<string, unknown>;
  const description = c?.description as string | undefined;
  const stats = (c?.stats as { value: string; unit: string; label: string }[]) ?? [];

  return (
    <Visible>
      <div className="mt-16" dir="rtl">
        <div className="mb-4">
          <p className="text-[10px] font-black tracking-[0.18em] uppercase mb-1" style={{ color: P }}>البطارية</p>
          <h2 className="text-xl sm:text-2xl font-black" style={{ color: "#1F2C3E" }}>{section.title}</h2>
          {section.subtitle && <p className="text-sm mt-0.5" style={{ color: "#611FA0" }}>{section.subtitle}</p>}
        </div>
        {section.media?.[0]?.url && (
          <Card image={section.media[0].url}>
            {stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-8 mb-5">
                {stats.map((s, i) => (
                  <div key={i} className={i > 0 ? "border-r border-white/10 pr-4 sm:pr-8" : ""}>
                    <div className="flex items-end gap-1 mb-0.5">
                      <span className="text-2xl sm:text-4xl font-black text-white leading-none">{s.value}</span>
                      <span className="text-xs font-bold mb-0.5" style={{ color: P }}>{s.unit}</span>
                    </div>
                    <p className="text-[10px] leading-snug max-w-[90px]" style={{ color: "rgba(255,255,255,0.4)" }}>{s.label}</p>
                  </div>
                ))}
              </div>
            )}
            {description && <More text={description} className="text-xs sm:text-sm text-white/50 leading-relaxed max-w-2xl" />}
          </Card>
        )}
      </div>
    </Visible>
  );
}

/* ── EXPORT ── */
export default function ProductSections({ sections }: { sections?: ProductSection[] }) {
  if (!sections?.length) return null;
  const active = sections
    .filter((s) => s.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  return (
    <div className="mt-8 pb-16">
      {active.map((s) => {
        const key = s._id ?? s.type;
        if (s.type === "design")      return <SectionErrorBoundary key={key}><DesignSection      section={s} /></SectionErrorBoundary>;
        if (s.type === "camera")      return <SectionErrorBoundary key={key}><CameraSection      section={s} /></SectionErrorBoundary>;
        if (s.type === "performance") return <SectionErrorBoundary key={key}><PerformanceSection section={s} /></SectionErrorBoundary>;
        if (s.type === "battery")     return <SectionErrorBoundary key={key}><BatterySection     section={s} /></SectionErrorBoundary>;
        return null;
      })}
    </div>
  );
}
