"use client";
import { useEffect, useRef, useState } from "react";
import ContactSection from "../components/ContactSection";

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: `opacity 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms, transform 0.6s cubic-bezier(.22,1,.36,1) ${delay}ms`,
    }}>
      {children}
    </div>
  );
}

const sections = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" strokeLinecap="round" strokeLinejoin="round"/>
        <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "من نحن",
    text: "نحن متجر متخصص في توفير أجهزة الآيفون والأجهزة الإلكترونية الأصلية بنظام الأقساط الميسرة، ونسعى إلى تقديم تجربة شراء موثوقة وآمنة تتيح لعملائنا الحصول على أحدث الأجهزة بأسعار مناسبة وخيارات دفع مرنة تتناسب مع مختلف الاحتياجات.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
        <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "الشفافية والمصداقية",
    text: "نعتمد على الوضوح والمصداقية في جميع عمليات البيع، حيث يتم توضيح جميع تفاصيل الطلب من سعر الجهاز والدفعة الأولى وقيمة الأقساط الشهرية ومدة التقسيط بشكل كامل قبل إتمام الشراء، لضمان الشفافية الكاملة وراحة العميل.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
        <rect x="2" y="5" width="20" height="14" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="2" y1="10" x2="22" y2="10" strokeLinecap="round"/>
      </svg>
    ),
    title: "خيارات الدفع",
    text: "نوفر خيارات متعددة للدفع تشمل البطاقات البنكية المعتمدة والشراء بنظام التقسيط بإجراءات سهلة وواضحة، مع الحرص على أن تكون جميع أجهزتنا أصلية وجديدة.",
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
        <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    title: "خدمة العملاء",
    text: "نقدم خدمة عملاء مميزة لمتابعة جميع الاستفسارات والطلبات حتى استلام الجهاز، ونسعى دائماً لبناء علاقة ثقة طويلة الأمد مع عملائنا. نعتز بثقتكم ونتطلع لأن نكون خياركم الأول.",
  },
];

interface AboutCompany {
  nameAr?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  [k: string]: unknown;
}

export default function AboutClient({ initialCompany }: { initialCompany?: AboutCompany | null }) {
  const [heroVisible, setHeroVisible] = useState(true);
  const [company, setCompany] = useState<AboutCompany | null>(initialCompany || null);

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
            تعرّف علينا
          </div>
          <h1 {...anim(200)} className="text-3xl sm:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 leading-tight tracking-tight">
            مؤسسة برج المبدع
            <span className="block mt-1 text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #d8b4fe, #ffffff, #c084fc)" }}>
              للتقنية
            </span>
          </h1>
          <p {...anim(340)} className="text-purple-100/80 text-sm sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            نؤمن بأن الشفافية والجودة وخيارات الدفع المرنة هي طريقك للحصول على أحدث الأجهزة بأفضل تجربة.
          </p>
        </div>

        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 80" className="w-full h-10 sm:h-16" preserveAspectRatio="none">
            <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z" fill="#f9f7fc" />
          </svg>
        </div>
      </section>

      {/* ── Cards ── */}
      <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-10 py-8 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {sections.map((s, i) => (
            <FadeUp key={s.title} delay={i * 100}>
              <div className="group relative bg-white rounded-2xl sm:rounded-3xl border border-purple-50 overflow-hidden hover:shadow-[0_6px_32px_rgba(133,67,192,0.1)] transition-all duration-300 h-full">
                <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#A842E4] via-[#8543C0] to-[#611FA0] rounded-l-full opacity-40 group-hover:opacity-100 transition-opacity" />
                <div className="p-5 sm:p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#8543C0] to-[#7A2FCC] flex items-center justify-center text-white shrink-0 shadow-[0_4px_16px_rgba(133,67,192,0.25)] group-hover:scale-105 transition-transform duration-300">
                      {s.icon}
                    </div>
                    <h2 className="text-sm sm:text-lg font-extrabold text-gray-800">{s.title}</h2>
                  </div>
                  <p className="text-gray-600 leading-relaxed text-xs sm:text-sm">{s.text}</p>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>

        <div className="mt-8 sm:mt-12">
          <ContactSection
            title="وسائل التواصل"
            phone={company?.phone || company?.whatsapp}
            whatsapp={company?.whatsapp}
            email={company?.email}
            fadeDelay={300}
          />
        </div>
      </section>

      <div className="h-10 sm:h-16" />
    </main>
  );
}
