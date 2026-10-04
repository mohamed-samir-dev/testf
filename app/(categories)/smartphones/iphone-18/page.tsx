import type { Metadata } from "next";
import ComingSoon from "./ComingSoon";
import CategoryPageClient from "../../[slug]/CategoryPageClient";

// Increased from 60s to 3600s: this is a pre-launch/coming-soon page.
// The content changes at most once when the product launches.
// 60s was causing ~1,440 ISR rebuilds/day with no benefit.
export const revalidate = 18000;

// ── Meta ──────────────────────────────────────────────────────────────────────
export const metadata: Metadata = {
  title: "آيفون 18 | برج المبدع للتقنية",
  description:
    "iPhone 18 الجيل القادم من آبل — تصميم ثوري وأداء لا مثيل له مع أحدث معالج A20 وكاميرات من الجيل القادم. احجز الآن في برج المبدع للتقنية.",
  keywords: ["آيفون 18", "iPhone 18", "ايفون 18", "آبل", "برج المبدع للتقنية"],
  openGraph: {
    title: "آيفون 18 | برج المبدع للتقنية",
    description: "الجيل القادم من iPhone — احجز الآن.",
    images: [{ url: "/i-18-2.webp", width: 1200, height: 630, alt: "iPhone 18" }],
  },
};

// ── Reservation date — controlled entirely by env var ─────────────────────────
// Set NEXT_PUBLIC_IPHONE18_RESERVATION_DATE in .env.local to a future date
// to show Coming Soon, or a past date to show the full product page.
const RESERVATION_DATE = new Date(
  process.env.NEXT_PUBLIC_IPHONE18_RESERVATION_DATE ?? "2026-09-22T12:00:00+03:00"
);

const SLIDES = ["/i-18-1.webp", "/i-18-2.webp", "/i-18-3.webp"];

// ── Page ──────────────────────────────────────────────────────────────────────
const isOver = RESERVATION_DATE.getTime() <= Date.now();

export default function IPhone18Page() {

  // ── Coming Soon ─────────────────────────────────────────────────────────────
  if (!isOver) {
    return (
      <ComingSoon
        modelName="iPhone 18"
        slides={SLIDES}
        reservationDate={RESERVATION_DATE.toISOString()}
        availabilityDate="22 سبتمبر 2026"
      />
    );
  }

  // ── Full product page (reuses the existing CategoryPageClient) ───────────────
  return <CategoryPageClient slug="iphone-18" />;
}
