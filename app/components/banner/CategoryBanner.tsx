"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

import { useVisiblePlayback } from "../../hooks/useVisiblePlayback";

const AUTO_PLAY_MS = 4500;
const SWIPE_THRESHOLD = 50;
const resolveBannerUrl = (url: string) => {
  if (!url) return url;
  if (url.includes("cloudinary.com") && !url.includes("/f_auto,q_auto/")) {
    return url.replace("/image/upload/", "/image/upload/f_auto,q_auto/");
  }
  return url;
};

function CategoryBannerSlider({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  const [progressKey, setProgressKey] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const touchStart = useRef(0);
  const { ref, active } = useVisiblePlayback<HTMLDivElement>();
  const playing = active && images.length > 1 && !isHovered;

  const goTo = useCallback(
    (i: number, dir?: number) => {
      const next = (i + images.length) % images.length;
      setDirection(dir ?? (next > current ? 1 : -1));
      setCurrent(next);
      setProgressKey((k) => k + 1);
    },
    [images.length, current]
  );

  useEffect(() => {
    if (!playing) return;
    const timer = setTimeout(() => goTo(current + 1, 1), AUTO_PLAY_MS);
    return () => clearTimeout(timer);
  }, [playing, current, goTo, progressKey]);

  const variants = {
    enter: (d: number) => ({ x: `${d * 100}%`, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: `${-d * 100}%`, opacity: 0 }),
  };

  return (
    <div ref={ref} className="w-full px-3 sm:px-4">
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const diff = touchStart.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > SWIPE_THRESHOLD) goTo(current + (diff > 0 ? 1 : -1), diff > 0 ? 1 : -1);
        }}
      >
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={current}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            className="w-full"
          >
            <Image
              src={resolveBannerUrl(images[current])}
              alt={`banner ${current + 1}`}
              width={1200}
              height={600}
              className="w-full h-auto block"
              sizes="100vw"
              quality={85}
              loading="lazy"
            />
          </motion.div>
        </AnimatePresence>

        {/* Navigation arrows */}
        {images.length > 1 && (
          <div className="absolute inset-0 z-20 pointer-events-none">
            <motion.button
              onClick={() => goTo(current + 1, 1)}
              aria-label="التالي"
              className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : -8 }}
              whileHover={{ scale: 1.15, background: "rgba(124,192,67,0.5)" }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </motion.button>
            <motion.button
              onClick={() => goTo(current - 1, -1)}
              aria-label="السابق"
              className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center cursor-pointer pointer-events-auto"
              style={{
                background: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: isHovered ? 1 : 0, x: isHovered ? 0 : 8 }}
              whileHover={{ scale: 1.15, background: "rgba(124,192,67,0.5)" }}
              whileTap={{ scale: 0.9 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        )}

        {/* Progress bar */}
        {images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 z-20 h-[3px] bg-white/10">
            <div
              key={progressKey}
              className="h-full rounded-full banner-progress"
              style={{
                animationDuration: `${AUTO_PLAY_MS}ms`,
                animationPlayState: playing ? "running" : "paused",
                background: "linear-gradient(90deg, #7CC043, #5FA32E)",
              }}
            />
          </div>
        )}
      </div>

      {/* Dots */}
      {images.length > 1 && (
        <div className="flex items-center justify-center gap-1.5 mt-2.5">
          {images.map((_, i) => (
            <motion.button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`الانتقال للشريحة ${i + 1}`}
              className="rounded-full cursor-pointer"
              animate={{
                width: i === current ? 20 : 7,
                height: 7,
                backgroundColor: i === current ? "#1F6F8B" : "#d1d5db",
              }}
              whileHover={{ backgroundColor: "#7CC043" }}
              transition={{ duration: 0.3 }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function CategoryBanner({ images: propImages }: { images?: string[] }) {
  const images = propImages ?? [];
  if (!images.length) return null;
  return <CategoryBannerSlider images={images} />;
}
