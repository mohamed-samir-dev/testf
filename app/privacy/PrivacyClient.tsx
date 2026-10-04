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

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
    <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7L12 2z" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconLock = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
    <rect x="3" y="11" width="18" height="11" rx="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M7 11V7a5 5 0 0110 0v4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconInfo = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="8.01" strokeLinecap="round"/>
    <line x1="12" y1="12" x2="12" y2="16" strokeLinecap="round"/>
  </svg>
);
const IconChat = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const IconDoc = () => (
  <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7" stroke="currentColor" strokeWidth={1.8}>
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
    <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
    <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round"/>
    <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round"/>
  </svg>
);

const sections = [
  {
    Icon: IconDoc,
    title: "استخدام الموقع",
    content: ["باستخدامك لهذا الموقع فإنك توافق على الالتزام بالشروط والأحكام والسياسات المعمول بها داخل برج المبدع للتقنية."],
  },
  {
    Icon: IconShield,
    title: "الخصوصية وحماية البيانات",
    content: ["نلتزم بالحفاظ على خصوصية بيانات العملاء وعدم استخدامها إلا في حدود معالجة الطلبات وتحسين الخدمة والتواصل عند الحاجة."],
  },
  {
    Icon: IconInfo,
    title: "دقة المعلومات",
    content: ["نحرص على عرض المعلومات والمنتجات والأسعار بأكبر قدر ممكن من الدقة، ومع ذلك قد تحدث تحديثات أو تعديلات دون إشعار مسبق."],
  },
  {
    Icon: IconChat,
    title: "الطلبات والتواصل",
    content: ["يحق للمتجر مراجعة أو تأكيد الطلبات والتواصل مع العميل عند الحاجة لإتمام البيانات أو تأكيد تفاصيل الشحن والدفع."],
  },
];

type Company = { nameAr?: string; addressAr?: string; phone?: string; whatsapp?: string; email?: string; taxNumber?: string; [k: string]: unknown };

export default function PrivacyClient({ initialCompany }: { initialCompany?: Company | null }) {
  const [heroVisible] = useState(true);
  const [company, setCompany] = useState<Company | null>(initialCompany || null);

  useEffect(() => {
    if (!company) {
      fetch("/api/company/public").then((r) => r.json()).then(setCompany).catch(() => {});
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
            سياسة الخصوصية
            <span className="block mt-1 text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg, #d8b4fe, #ffffff, #c084fc)" }}>
              واتفاقية الاستخدام
            </span>
          </h1>
          <p {...anim(340)} className="text-purple-100/80 text-sm sm:text-lg lg:text-xl max-w-2xl mx-auto leading-relaxed">
            الشروط العامة المنظمة لاستخدام موقع برج المبدع للتقنية
          </p>
        </div>
        <div className="absolute bottom-0 left-0 w-full">
          <svg viewBox="0 0 1440 80" className="w-full h-10 sm:h-16" preserveAspectRatio="none">
            <path d="M0,40 C360,80 720,0 1080,40 C1260,60 1380,50 1440,40 L1440,80 L0,80 Z" fill="#f9f7fc" />
          </svg>
        </div>
      </section>

      <section className="w-full max-w-5xl mx-auto px-4 sm:px-8 lg:px-10 py-8 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          {sections.map((s, i) => (
            <FadeUp key={s.title} delay={i * 100}>
              <div className="group relative bg-white rounded-2xl sm:rounded-3xl border border-purple-50 overflow-hidden hover:shadow-[0_6px_32px_rgba(133,67,192,0.1)] transition-all duration-300 h-full">
                <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#A842E4] via-[#8543C0] to-[#611FA0] rounded-l-full opacity-40 group-hover:opacity-100 transition-opacity" />
                <div className="p-5 sm:p-7">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#8543C0] to-[#7A2FCC] flex items-center justify-center text-white shrink-0 shadow-[0_4px_16px_rgba(133,67,192,0.25)] group-hover:scale-105 transition-transform duration-300">
                      <s.Icon />
                    </div>
                    <h2 className="text-sm sm:text-lg font-extrabold text-gray-800">{s.title}</h2>
                  </div>
                  <div className="space-y-2 pr-1">
                    {s.content.map((p, j) => (
                      <p key={j} className="text-gray-600 leading-relaxed text-xs sm:text-sm">{p}</p>
                    ))}
                  </div>
                </div>
              </div>
            </FadeUp>
          ))}
        </div>

        {company && (
          <FadeUp delay={sections.length * 100}>
            <div className="group relative bg-white rounded-2xl sm:rounded-3xl border border-purple-50 overflow-hidden hover:shadow-[0_6px_32px_rgba(133,67,192,0.1)] transition-all duration-300 mt-5">
              <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-[#A842E4] via-[#8543C0] to-[#611FA0] rounded-l-full opacity-40 group-hover:opacity-100 transition-opacity" />
              <div className="p-5 sm:p-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-[#611FA0] to-[#090D54] flex items-center justify-center text-white shrink-0 shadow-[0_4px_16px_rgba(97,31,160,0.25)] group-hover:scale-105 transition-transform duration-300">
                    <IconLock />
                  </div>
                  <h2 className="text-sm sm:text-lg font-extrabold text-gray-800">معلومات المتجر</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  {company.nameAr    && <p className="text-gray-600 text-xs sm:text-sm"><span className="font-semibold text-gray-700">اسم الجهة:</span> {company.nameAr}</p>}
                  {company.addressAr && <p className="text-gray-600 text-xs sm:text-sm"><span className="font-semibold text-gray-700">العنوان:</span> {company.addressAr}</p>}
                  {company.phone     && <p className="text-gray-600 text-xs sm:text-sm"><span className="font-semibold text-gray-700">الهاتف:</span> {company.phone}</p>}
                  {company.email     && <p className="text-gray-600 text-xs sm:text-sm break-all"><span className="font-semibold text-gray-700">البريد الإلكتروني:</span> {company.email}</p>}
                  {company.taxNumber && <p className="text-gray-600 text-xs sm:text-sm"><span className="font-semibold text-gray-700">الرقم الضريبي:</span> {company.taxNumber}</p>}
                </div>
              </div>
            </div>
          </FadeUp>
        )}

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
