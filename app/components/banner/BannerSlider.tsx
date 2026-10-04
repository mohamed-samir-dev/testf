"use client";
import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { useVisiblePlayback } from "../../hooks/useVisiblePlayback";

const AUTO_PLAY_MS = 5000;
const SWIPE_THRESHOLD = 50;

export default function BannerSlider({ images }: { images: string[] }) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState(1);
  // progressKey increments on each slide change — CSS animation restarts via key prop.
  const [progressKey, setProgressKey] = useState(0);
  const touchStart = useRef(0);
  const { ref, active } = useVisiblePlayback<HTMLDivElement>();
  const playing = active && images.length > 1;

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

  const onTouchStart = (e: React.TouchEvent) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > SWIPE_THRESHOLD) goTo(current + (diff > 0 ? 1 : -1), diff > 0 ? 1 : -1);
  };

  const variants = {
    enter: (d: number) => ({ x: `${d * 100}%`, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: `${-d * 100}%`, opacity: 0 }),
  };

  return (
    <section className="w-full flex justify-center pt-4 sm:pt-5 pb-1 sm:pb-2 px-2 sm:px-4 md:px-6">
      <div ref={ref} className="relative w-full" style={{ maxWidth: 2048 }}>
        <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl">
          <div
            className="relative w-full"
            style={{ aspectRatio: "2048/700" }}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={current}
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={images[current]}
                  alt={`banner ${current + 1}`}
                  fill
                  className="object-contain"
                  priority={current === 0}
                  sizes="(max-width: 1280px) 100vw, 1280px"
                  quality={75}
                />
              </motion.div>
            </AnimatePresence>

            {/* Progress bar — pure CSS animation, zero JS per-frame cost */}
            {images.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 z-20 h-[3px] bg-black/10">
                <div
                  key={progressKey}
                  className="h-full banner-progress"
                  style={{
                    animationDuration: `${AUTO_PLAY_MS}ms`,
                    animationPlayState: playing ? "running" : "paused",
                    background: "linear-gradient(90deg, #A842E4, #7A2FCC)",
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Dots */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 mt-3 sm:mt-4">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`الانتقال للشريحة ${i + 1}`}
                className="transition-all duration-300 rounded-full cursor-pointer"
                style={{
                  width: i === current ? 28 : 10,
                  height: 10,
                  borderRadius: 5,
                  backgroundColor: i === current ? "#8543C0" : "#d1d5db",
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
