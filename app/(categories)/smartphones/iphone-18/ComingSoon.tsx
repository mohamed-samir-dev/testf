"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { CalendarDays, PackageCheck } from "lucide-react";

const DEFAULT_SLIDES = ["/i-18-1.webp", "/i-18-2.webp", "/i-18-3.webp"];

// ── Countdown hook ────────────────────────────────────────────────────────────
function useCountdown(target: Date, onExpire: () => void) {
  const calledRef = useRef(false);

  const calc = () => {
    const diff = target.getTime() - Date.now();
    if (diff <= 0) return { d: 0, h: 0, m: 0, s: 0 };
    return {
      d: Math.floor(diff / 86400000),
      h: Math.floor((diff % 86400000) / 3600000),
      m: Math.floor((diff % 3600000) / 60000),
      s: Math.floor((diff % 60000) / 1000),
    };
  };

  const [t, setT] = useState(calc);

  useEffect(() => {
    const id = setInterval(() => {
      const diff = target.getTime() - Date.now();
      if (diff <= 0) {
        setT({ d: 0, h: 0, m: 0, s: 0 });
        if (!calledRef.current) {
          calledRef.current = true;
          onExpire();
        }
        return;
      }
      setT(calc());
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return t;
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface ComingSoonProps {
  modelName: string;
  slides?: string[];
  reservationDate: string;
  availabilityDate?: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function ComingSoon({
  modelName,
  slides,
  reservationDate,
  availabilityDate = "22 سبتمبر 2026",
}: ComingSoonProps) {
  const images = slides?.length ? slides : DEFAULT_SLIDES;
  const target = new Date(reservationDate);

  const [active, setActive] = useState(0);
  const [expired, setExpired] = useState(() => Date.now() >= target.getTime());
  const countdown = useCountdown(target, () => setExpired(true));

  // Auto-rotate slides
  useEffect(() => {
    if (expired) return;
    const id = setInterval(() => setActive((p) => (p + 1) % images.length), 5000);
    return () => clearInterval(id);
  }, [images.length, expired]);

  // When timer expires let the parent server component re-render via router refresh
  useEffect(() => {
    if (expired) {
      window.location.reload();
    }
  }, [expired]);

  if (expired) return null;

  const pad = (n: number) => String(n).padStart(2, "0");

  const units = [
    { v: countdown.d, l: "يوم" },
    { v: countdown.h, l: "ساعة" },
    { v: countdown.m, l: "دقيقة" },
    { v: countdown.s, l: "ثانية" },
  ];

  const reservationLabel = (() => {
    try {
      return new Date(reservationDate).toLocaleDateString("ar-SA", {
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Riyadh",
      });
    } catch {
      return reservationDate;
    }
  })();

  return (
    <>
      <style>{`
        @keyframes cs-fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cs-tick {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        .cs-fu      { animation: cs-fadeUp 0.7s cubic-bezier(0.22,1,0.36,1) both; }
        .cs-fu-1    { animation-delay: 0.05s; }
        .cs-fu-2    { animation-delay: 0.15s; }
        .cs-fu-3    { animation-delay: 0.25s; }
        .cs-fu-4    { animation-delay: 0.35s; }
        .cs-fu-5    { animation-delay: 0.45s; }
        .cs-fu-6    { animation-delay: 0.55s; }
        .cs-sep     { animation: cs-tick 2s ease-in-out infinite; }
      `}</style>

      <div className="relative w-full overflow-hidden" dir="rtl" style={{ minHeight: "100svh" }}>

        {/* ── Background Slides ──────────────────────────────────────────── */}
        {images.map((src, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity"
            style={{ opacity: i === active ? 1 : 0, transitionDuration: "1.8s" }}
          >
            <Image
              src={src}
              alt={modelName}
              fill
              className="object-cover object-center"
              priority={i === 0}
              sizes="100vw"
            />
          </div>
        ))}

        {/* ── Dark Overlay — gradient weighted to bottom ─────────────────── */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 35%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.82) 100%)",
          }}
        />

        {/* ── Content ───────────────────────────────────────────────────── */}
        <div
          className="relative z-10 flex flex-col items-center justify-end text-center px-5 sm:px-8 pb-14 sm:pb-20 gap-5 sm:gap-6 w-full"
          style={{ minHeight: "100svh", maxWidth: 480, margin: "0 auto" }}
        >

          {/* Badge */}
          <div className="cs-fu cs-fu-1">
            <span
              className="inline-flex items-center gap-2 font-bold tracking-widest uppercase px-4 py-1.5 rounded-full text-[0.6rem]"
              style={{
                background: "rgba(122,47,204,0.18)",
                border: "1px solid rgba(192,132,252,0.35)",
                color: "#e4c6ff",
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#c084fc] inline-block" />
              حجز مسبق
            </span>
          </div>

          {/* Model Name */}
          <h1
            className="cs-fu cs-fu-2 font-black leading-none tracking-tight"
            style={{
              fontSize: "clamp(2.6rem, 11vw, 4.8rem)",
              color: "#ffffff",
              textShadow: "0 2px 24px rgba(0,0,0,0.4)",
            }}
          >
            {modelName}
          </h1>

          {/* Tagline */}
          <p
            className="cs-fu cs-fu-3 font-medium -mt-2"
            style={{
              fontSize: "clamp(0.78rem, 2.5vw, 0.95rem)",
              color: "rgba(255,255,255,0.5)",
              letterSpacing: "0.02em",
            }}
          >
            التجربة القادمة تستحق الانتظار
          </p>

          {/* Thin Divider */}
          <div
            className="cs-fu cs-fu-3 w-12 rounded-full mx-auto -mt-1"
            style={{
              height: 1,
              background: "linear-gradient(90deg, transparent, rgba(192,132,252,0.5), transparent)",
            }}
          />

          {/* Countdown */}
          <div className="cs-fu cs-fu-4 w-full" dir="ltr">
            <div className="flex items-center justify-center gap-1.5 sm:gap-2">
              {units.map(({ v, l }, idx) => (
                <div key={l} className="flex items-center gap-1.5 sm:gap-2">
                  {/* Unit card */}
                  <div
                    className="flex flex-col items-center justify-center rounded-2xl"
                    style={{
                      width: "clamp(58px, 18vw, 80px)",
                      paddingTop: "clamp(10px, 3vw, 16px)",
                      paddingBottom: "clamp(10px, 3vw, 16px)",
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    <span
                      className="font-black text-white tabular-nums leading-none"
                      style={{ fontSize: "clamp(1.5rem, 6vw, 2.4rem)" }}
                    >
                      {pad(v)}
                    </span>
                    <span
                      className="font-medium mt-1.5"
                      style={{
                        fontSize: "clamp(0.5rem, 1.4vw, 0.6rem)",
                        color: "rgba(216,180,254,0.6)",
                        letterSpacing: "0.04em",
                      }}
                    >
                      {l}
                    </span>
                  </div>
                  {/* Separator — except after last */}
                  {idx < units.length - 1 && (
                    <span
                      className="cs-sep font-black text-white/30 select-none"
                      style={{ fontSize: "clamp(1rem, 4vw, 1.6rem)", marginBottom: 14 }}
                    >
                      :
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Info Cards */}
          <div className="cs-fu cs-fu-5 grid grid-cols-2 gap-2.5 sm:gap-3 w-full">
            {[
              { Icon: CalendarDays, label: "فتح باب الحجز", value: reservationLabel },
              { Icon: PackageCheck, label: "موعد التوفير",  value: availabilityDate  },
            ].map(({ Icon, label, value }) => (
              <div
                key={label}
                className="flex flex-col items-center gap-2 px-3 py-4 rounded-2xl"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.09)",
                }}
              >
                <Icon
                  size={15}
                  strokeWidth={1.8}
                  style={{ color: "rgba(216,180,254,0.7)" }}
                />
                <span
                  className="font-medium text-center leading-tight"
                  style={{
                    fontSize: "clamp(0.5rem, 1.6vw, 0.6rem)",
                    color: "rgba(255,255,255,0.38)",
                    letterSpacing: "0.03em",
                  }}
                >
                  {label}
                </span>
                <span
                  className="font-bold text-white text-center leading-snug"
                  style={{ fontSize: "clamp(0.65rem, 2.2vw, 0.78rem)" }}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>

          {/* Slide Dots */}
          <div className="cs-fu cs-fu-6 flex gap-1.5 items-center justify-center">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                aria-label={`الشريحة ${i + 1}`}
                className="rounded-full transition-all duration-500"
                style={{
                  width:  i === active ? 22 : 6,
                  height: 6,
                  background:
                    i === active
                      ? "linear-gradient(90deg, #A842E4, #7A2FCC)"
                      : "rgba(255,255,255,0.22)",
                }}
              />
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
