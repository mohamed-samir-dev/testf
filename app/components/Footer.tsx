import Link from 'next/link';
import Image from 'next/image';
import { FaWhatsapp, FaMobileAlt } from 'react-icons/fa';
import { STORE_INFO, FOOTER_LINKS } from '../lib/store-info';

export default function Footer() {
  return (
    <footer className="relative mt-14 overflow-hidden border-t border-gray-200 bg-[#f7f7f8] text-gray-700 sm:mt-20" dir="rtl">
      <div className="max-w-6xl mx-auto px-5 pt-8 pb-6 sm:px-8 sm:py-12 grid grid-cols-1 md:grid-cols-[1.1fr_1.4fr] gap-6 md:gap-x-16">
        <div className="space-y-3 text-center md:text-right">
          <Link href="/" className="inline-flex items-center gap-3 rounded-lg focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-600">
            <Image src={STORE_INFO.logo} alt={`شعار ${STORE_INFO.name}`} width={56} height={64} className="h-16 w-14 object-contain" />
            <span>
              <span className="block text-xl font-extrabold tracking-tight text-gray-900">{STORE_INFO.name}</span>
              <span className="mt-1 block text-xs font-medium text-violet-700">{STORE_INFO.tagline}</span>
            </span>
          </Link>
          <p className="max-w-md mx-auto md:mx-0 text-xs sm:text-sm leading-7 text-gray-500">{STORE_INFO.description}</p>
        </div>
        <div className="space-y-3">
          <h3 className="text-gray-900 font-bold text-sm">اكتشف المزيد</h3>
          <ul className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
            {FOOTER_LINKS.map(({label,href}) => (
              <li key={href}>
                <Link href={href} className="group flex h-full min-h-14 items-center justify-between gap-2 rounded-xl border border-gray-200/80 bg-white px-3 py-3 text-gray-600 hover:border-violet-200 hover:text-violet-700 hover:shadow-sm transition-all focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600">
                  {label}<span aria-hidden="true" className="shrink-0 text-lg text-gray-400">‹</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="space-y-3 md:col-span-2 border-t border-gray-200 pt-5">
          <h3 className="text-gray-900 font-bold text-sm">تواصل معنا</h3>
          <ul className="flex flex-wrap gap-6 text-sm">
            <li><a href={STORE_INFO.whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-gray-600 hover:text-emerald-700" aria-label={`واتساب ${STORE_INFO.phone}`}>
              <span className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center"><FaWhatsapp className="text-emerald-700" size={18} /></span>
              <span dir="ltr">{STORE_INFO.phone}</span>
            </a></li>
            <li><a href={STORE_INFO.telephoneUrl} className="flex items-center gap-3 text-gray-600 hover:text-blue-700" aria-label={`اتصل على ${STORE_INFO.phone}`}>
              <span className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center"><FaMobileAlt className="text-blue-700" size={18} /></span>
              <span dir="ltr">{STORE_INFO.phone}</span>
            </a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-200/80 bg-white">
        <div className="max-w-6xl mx-auto px-5 py-4 sm:px-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
          <span className="text-xs leading-6 text-center text-gray-500">جميع الحقوق محفوظة © 2026 برج المبدع للتقنية</span>
          <span className="text-xs font-semibold text-gray-600">الدفع عند الاستلام</span>
        </div>
      </div>
    </footer>
  );
}
