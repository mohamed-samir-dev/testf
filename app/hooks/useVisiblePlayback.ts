"use client";
import { useEffect, useRef, useState } from "react";

/** Run decorative autoplay only while its surface is visible and active. */
export function useVisiblePlayback<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [active, setActive] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let inView = false;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setActive(inView && !document.hidden && !motion.matches);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    motion.addEventListener("change", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
      motion.removeEventListener("change", update);
    };
  }, []);
  return { ref, active };
}
