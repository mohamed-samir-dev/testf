"use client";
import { useEffect, useRef, useState } from "react";
import { Package, Clock, Ban, XCircle, MessageCircle, FileText, CheckCircle, RotateCcw } from "lucide-react";
import ContactSection from "../components/ContactSection";

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return (
    <div ref={ref} style={{ opacity: vis ? 1 : 0, transform: vis ? "translateY(0)" : "translateY(24px)", transition: `opacity 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms` }}>
      {children}
    </div>
  );
}

const policies = [
  {
    Icon: Package,
    title: "حالة المنتج",
    text: "يشترط أن يكون المنتج في حالته الأصلية وغير مستخدم، مع الحفاظ على التغليف والملحقات والفاتورة إن وجدت.",
  },
  {
    Icon: Clock,
    title: "مدة طلب الاسترجاع",
    text: "يتم تقديم طلبات الاستبدال أو الاسترجاع خلال المدة المحددة حسب سياسة المتجر، وبعد مراجعة حالة الطلب والمنتج.",
  },
  {
    Icon: Ban,
    title: "المنتجات غير القابلة للاسترجاع",
    text: "بعض المنتجات قد لا تكون قابلة للاسترجاع بعد فتحها أو استخدامها، وخاصة المنتجات الشخصية أو الرقمية أو التي تم تجهيزها بطلب خاص.",
  },
  {
    Icon: XCircle,
    title: "إلغاء الطلبات",
    text: "يمكن إلغاء الطلب قبل التجهيز أو الشحن، أما إذا تم شحن الطلب فيتم التعامل معه وفق سياسة الاسترجاع المعتمدة.",
  },
];

const steps = [
  { Icon: MessageCircle, text: "تواصل معنا عبر الواتساب أو البريد" },
  { Icon: FileText, text: "أرسل رقم الطلب وسبب الاسترجاع" },
  { Icon: CheckCircle, text: "انتظر موافقة الفريق خلال ٢٤ ساعة" },
  { Icon: RotateCcw, text: "أعد المنتج بحالته الأصلية واستلم المبلغ" },
];

type Company = { whatsapp?: string; email?: string; phone?: string; [k: string]: unknown };

export default function ReturnPolicyClient({ initialCompany }: { initialCompany?: Company | null }) {
  const [heroVisible] = useState(true);
  const [company, setCompany] = useState<Company | null>(initialCompany || null);

  useEffect(() => {
    if (!company) {
      fetch("/api/company/public").then(r => r.json()).then(setCompany).catch(() => {});
    }
  }, [company]);

  const anim = (delay: number) => ({
    style: {
      opacity: heroVisible ? 1 : 0,
      transform: heroVisible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    },
  } as React.HTMLAttributes<HTMLElement>);

  return (
    <main className="min-h-screen overflow-x-hidden" dir="rtl" style={{ background: "linear-gradient(180deg, #f9f7fc 0%, #f3eef9 50%, #f9f7fc 100%)" }}>

      {/* ── Hero ── */}
      <section className="relative w-full overflow-hidden cat-hero">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 -right-32 w-72 h-72 sm:w-[550px] sm:h-[550px] rounded-full bg-[#A842E4]/10 blur-[80px]" />
          <div className="absolute top-10 left-10 w-48 h-48 sm:w-72 sm:h-72 rounded-full bg-[#8543C0]/8 blur-[60px]" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-80 sm:w-[700px] h-28 sm:h-44 bg-[#090D54]/20 blur-[60px]" />
        </div>
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        <div className="relative w-full px-5 sm:px-12 lg:px-20 py-16 sm:py-28 lg:py-36 text-center text-white">
          <div {...anim(80)} className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/15 rounded-full px-4 py-1.5 text-[11px] sm:text-sm font-medium text-purple-100 mb-5 sm:mb-7">
            <span className="w-2 h-2 rounded-full bg-[#A842E4] animate-pulse shadow-[0_0_8px_#A842E4]" />
            الشروط والسياسات
          </div>
          <h1 {...anim(200)} className="text-3xl sm:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight tracking-tight">
            سياسة الاستبدال
            <span className="block mt-1 text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #d8b4fe, #ffffff, #c084fc)" }}>
              والاسترجاع
            </span>
          </h1>
          <p {...anim(340)} className="text-purple-100/80 text-sm sm:text-lg max-w-xl mx-auto leading-relaxed">
            نحرص على حقوقك — تعرّف على شروط الاسترجاع والاستبدال
          </p>
        </div>

        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 80" className="w-full h-10 sm:h-16" preserveAspectRatio="none">
            <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z" fill="#f9f7fc" />
          </svg>
        </div>
      </section>

      {/* ── Policy Cards ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 pt-10 sm:pt-14 pb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {policies.map((p, i) => (
            <FadeUp key={p.title} delay={i * 80}>
              <div className="group relative bg-white rounded-2xl sm:rounded-3xl border border-purple-50 overflow-hidden hover:shadow-[0_6px_32px_rgba(133,67,192,0.1)] transition-all duration-300 h-full">
                <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#A842E4] via-[#8543C0] to-[#611FA0] opacity-40 group-hover:opacity-100 transition-opacity" />
                <div className="p-5 sm:p-7">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-[#8543C0] to-[#7A2FCC] flex items-center justify-center text-white shrink-0 shadow-[0_4px_16px_rgba(133,67,192,0.25)] group-hover:scale-105 transition-transform duration-300">
                      <p.Icon className="w-5 h-5" strokeWidth={2} />
                    </div>
                    <h2 className="text-sm sm:text-base font-extrabold text-gray-800">{p.title}</h2>
                  </div>
                  <p className="text-gray-500 leading-relaxed text-xs sm:text-sm pr-1">{p.text}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      {/* ── Steps ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        <FadeUp>
          <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden" style={{ background: "linear-gradient(135deg, #090D54 0%, #611FA0 50%, #7A2FCC 100%)" }}>
            <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
            <div className="relative p-7 sm:p-10">
              <p className="text-center text-[11px] sm:text-xs font-semibold text-purple-300 uppercase tracking-widest mb-2">كيف تسترجع؟</p>
              <h3 className="text-xl sm:text-2xl font-black text-white text-center mb-8">خطوات الاسترجاع</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {steps.map((s, i) => (
                  <div key={i} className="relative bg-white/[0.07] border border-white/10 rounded-2xl p-5 text-center hover:bg-white/[0.12] transition-colors duration-300">
                    <div className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full bg-[#A842E4] flex items-center justify-center text-white text-[11px] font-black shadow-md">
                      {i + 1}
                    </div>
                    <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-white/10 flex items-center justify-center">
                      <s.Icon className="w-5 h-5 text-purple-200" strokeWidth={2} />
                    </div>
                    <p className="text-white/85 text-xs sm:text-sm font-medium leading-relaxed">{s.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </FadeUp>
      </section>

      {/* ── Contact ── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-8 pb-16">
        <ContactSection
          title="التواصل بخصوص الطلبات"
          phone={company?.phone || company?.whatsapp}
          whatsapp={company?.whatsapp}
          email={company?.email}
          fadeDelay={200}
        />
      </section>

    </main>
  );
}
