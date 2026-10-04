"use client";
import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Keyboard, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import type { Swiper as SwiperInstance } from "swiper";
import { useVisiblePlayback } from "../hooks/useVisiblePlayback";

interface Review {
  _id: string;
  name: string;
  comment: string;
  rating: number;
  gender: string;
  createdAt: string;
}

interface Props {
  /** Pre-fetched reviews from the ISR server wrapper.
   *  When provided the client-side useEffect fetch is skipped entirely,
   *  eliminating the GET /api/reviews Vercel Function invocation per visit. */
  initialReviews?: Review[];
}

export default function CustomerReviews({ initialReviews = [] }: Props) {
  // Reviews come from ISR server-side; no client fetch needed.
  const reviews = initialReviews;
  const { ref, active } = useVisiblePlayback<HTMLElement>();
  const [swiper, setSwiper] = useState<SwiperInstance | null>(null);
  useEffect(() => {
    if (!swiper || swiper.destroyed) return;
    if (active && reviews.length > 1) swiper.autoplay.start();
    else swiper.autoplay.stop();
    return () => { if (!swiper.destroyed) swiper.autoplay.stop(); };
  }, [swiper, active, reviews.length]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", comment: "", rating: 5 });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.comment.trim()) return;
    setSubmitting(true);
    try {
      await fetch(`/api/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      setSubmitted(true);
      setShowForm(false);
      setForm({ name: "", comment: "", rating: 5 });
    } catch {}
    setSubmitting(false);
  }

  const avatarGradient = (gender: string) =>
    gender === "female"
      ? "from-pink-400 to-rose-500"
      : "from-purple-500 to-indigo-500";

  return (
    <section ref={ref} className="w-full py-4" dir="rtl">
    <div className="max-w-6xl mx-auto px-3 sm:px-4">
      <div className="flex items-center gap-2 sm:gap-3 mb-6">
        <div className="flex-1 h-px bg-[#8543C0]/20" />
        <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-[#7A2FCC] whitespace-nowrap px-2 sm:px-3">
          آراء العملاء
        </h2>
        <div className="flex-1 h-px bg-[#8543C0]/20" />
      </div>

      {reviews.length > 0 ? (
        <div className="mb-10">
          <Swiper
            modules={[Autoplay, Keyboard, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2 },
              1024: { slidesPerView: 3 },
            }}
            autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
            keyboard={{ enabled: true }}
            pagination={{ clickable: true }}
            loop={reviews.length > 3}
            className="pb-10!"
          >
            {reviews.map((r) => (
              <SwiperSlide key={r._id}>
                <div
                  onClick={() => setSelectedReview(r)}
                  className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-md border border-white/60 p-5 flex flex-col gap-3 hover:shadow-lg hover:bg-white transition-all duration-200 h-full cursor-pointer"
                >
                  <div className="absolute top-4 left-4 text-[#f3eafc] text-5xl font-serif leading-none select-none">❝</div>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <span key={s} className={`text-lg ${s <= r.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
                    ))}
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed flex-1 relative z-10 line-clamp-3">{r.comment}</p>
                  {r.comment.length > 120 && (
                    <span className="text-[#8543C0] text-xs font-medium">اضغط لقراءة المزيد...</span>
                  )}
                  <div className="h-px bg-gray-100" />
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-full bg-linear-to-br ${avatarGradient(r.gender)} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                      {r.name.trim().charAt(0).toUpperCase()}
                    </div>
                    <span className="font-semibold text-gray-800 text-sm">{r.name}</span>
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      ) : (
        <p className="text-center text-gray-400 text-sm mb-6">لا توجد آراء بعد، كن أول من يعلق!</p>
      )}

      {selectedReview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setSelectedReview(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl p-6 max-w-md w-full flex flex-col gap-4 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedReview(null)}
              className="absolute top-3 left-3 text-gray-400 hover:text-gray-600 text-xl leading-none"
            >✕</button>
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((s) => (
                <span key={s} className={`text-xl ${s <= selectedReview.rating ? "text-yellow-400" : "text-gray-200"}`}>★</span>
              ))}
            </div>
            <p className="text-gray-700 text-sm leading-relaxed">{selectedReview.comment}</p>
            <div className="h-px bg-gray-100" />
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full bg-linear-to-br ${avatarGradient(selectedReview.gender)} flex items-center justify-center text-white font-bold shrink-0`}>
                {selectedReview.name.trim().charAt(0).toUpperCase()}
              </div>
              <span className="font-semibold text-gray-800">{selectedReview.name}</span>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#8543C0]/15" />
        {submitted ? (
          <span className="text-xs sm:text-sm text-[#611FA0] font-semibold px-3 py-1.5 rounded-full border border-[#A842E4] bg-[#f9f5ff]">
            ✓ تم إرسال تعليقك وسيظهر بعد المراجعة
          </span>
        ) : (
          <button
            onClick={() => setShowForm((v) => !v)}
            className="text-xs sm:text-sm font-semibold text-[#8543C0] hover:text-[#7A2FCC] whitespace-nowrap px-3 py-1.5 rounded-full border border-[#8543C0] hover:bg-[#f3eafc] transition-colors"
          >
            {showForm ? "إلغاء" : "+ أضف تعليقك"}
          </button>
        )}
        <div className="flex-1 h-px bg-[#8543C0]/15" />
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/60 shadow-sm p-4 flex flex-col gap-3">
          <input
            type="text"
            placeholder="اسمك"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A842E4]"
            required
          />
          <textarea
            placeholder="اكتب تعليقك..."
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            rows={3}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-[#A842E4] resize-none"
            required
          />
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">التقييم:</span>
            {[1, 2, 3, 4, 5].map((s) => (
              <button key={s} type="button" onClick={() => setForm({ ...form, rating: s })}
                className={`text-xl ${s <= form.rating ? "text-yellow-400" : "text-gray-300"}`}>★</button>
            ))}
          </div>
          <button type="submit" disabled={submitting}
            className="bg-[#A842E4] hover:bg-[#611FA0] text-white text-sm font-semibold py-2 rounded-lg transition-colors disabled:opacity-60">
            {submitting ? "جاري الإرسال..." : "إرسال التعليق"}
          </button>
        </form>
      )}
    </div>
    </section>
  );
}


