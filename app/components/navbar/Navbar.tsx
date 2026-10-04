"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { navItems } from "./data";
import { SearchIcon, CartIcon, MenuIcon, CloseIcon } from "./icons";
import DesktopNav from "./DesktopNav";
import MobileMenu from "./MobileMenu";
import { useCartStore } from "../../store/cartStore";
import { useCompanyStore } from "../../store/companyStore";
import PriceEquivalent from "../PriceEquivalent";

// Computed once at module load — stable for the lifetime of the app.
const API_IMG = process.env.NEXT_PUBLIC_API_URL || "https://burj-phone-backend.vercel.app";

// Defined at module level so it is never re-created on render.
// Navbar renders on every navigation change (sticky header); keeping
// this function outside the component avoids allocating a new closure
// on every render.
const resolveImg = (src: string) =>
  src.startsWith("http") ? src : `${API_IMG}${src.startsWith("/") ? src : "/" + src}`;

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<{ _id: string; name: string; images?: string[]; image?: string; salePrice?: number; originalPrice?: number; price?: number }[]>([]);
  const [searching, setSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  // WHY: useSyncExternalStore was used solely to detect client-side mount
  // (to avoid a hydration mismatch on the cart badge). That API is designed
  // for subscribing to external stores, not for a simple "am I mounted?" check.
  // A plain useState(false) flipped to true in useEffect achieves the same
  // result with less overhead and is the idiomatic React pattern.
  const [clientReady, setClientReady] = useState(false);
  const itemCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.qty, 0));
  const logo = useCompanyStore(s => s.logo);
  const fetchCompany = useCompanyStore(s => s.fetchCompany);

  // Flip clientReady after first paint so the cart badge is only rendered
  // on the client, preventing a hydration mismatch with the SSR snapshot
  // (which has no localStorage cart data).
  useEffect(() => { setClientReady(true); }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target as Node)) {
        setResults([]);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const fetchResults = useCallback(async (q: string) => {
    const trimmed = q.trim();
    if (!trimmed || trimmed.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`/api/products?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(Array.isArray(data) ? data : []);
    } finally {
      setSearching(false);
    }
  // fetchResults is stable — depends only on setters which are stable in React 18+
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => fetchResults(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchResults]);

  useEffect(() => { fetchCompany(); }, [fetchCompany]);

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 1024) setMobileOpen(false); };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <nav className="shadow-md sticky top-0 z-50" style={{ background: '#ffffff' }} dir="rtl">
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* Row 1: Logo + Icons (mobile: same row with hamburger) */}
        <div className="flex items-center justify-between h-12 sm:h-14 lg:h-20">
          {/* Logo + Hamburger */}
          <div className="flex items-center gap-1">
            <button
              aria-label="القائمة"
              className="lg:hidden p-1 sm:p-2 text-[#7A2FCC] hover:text-[#A842E4] rounded-full transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <CloseIcon /> : <MenuIcon />}
            </button>
            <Link href="/" className="shrink-0" aria-label="الصفحة الرئيسية - برج المبدع للتقنية">
              {logo && (
                <Image
                  src={logo}
                  alt="برج المبدع للتقنية"
                  width={180}
                  height={80}
                  className="h-14 sm:h-14 lg:h-20 w-auto"
                  priority
                  sizes="(max-width:1024px) 140px, 180px"
                />
              )}
            </Link>
          </div>

          {/* Desktop nav hidden here, shown in row 2 */}
          <div className="hidden lg:block" />

          {/* Icons */}
          <div className="flex items-center gap-0.5 sm:gap-2 md:gap-3">
            <button
              aria-label="بحث"
              className="p-1.5 sm:p-2 text-[#7A2FCC] hover:text-[#A842E4] hover:bg-[#f3eafc] rounded-full transition-colors"
              onClick={() => setSearchOpen((v) => !v)}
            >
              <SearchIcon />
            </button>
            <Link href="/cart" aria-label="السلة" className="p-1.5 sm:p-2 text-[#7A2FCC] hover:text-[#A842E4] hover:bg-[#f3eafc] rounded-full transition-colors relative">
              <CartIcon />
              {clientReady && itemCount > 0 && (
                <span className="absolute -top-0.5 -left-0.5 bg-red-500 text-white text-[11px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-0.5">
                  {itemCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Row 2: Desktop nav links (desktop only) */}
        <div className="hidden lg:flex justify-center border-t border-gray-100 py-1">
          <DesktopNav items={navItems} />
        </div>
      </div>

      {searchOpen && (
        <div ref={searchWrapRef} className="border-t border-gray-100 px-4 py-2 relative" dir="rtl">
          <div className="flex gap-2">
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن منتج..."
              className="flex-1 border border-[#8543C0] rounded-full px-4 py-1.5 text-sm outline-none focus:border-[#A842E4]"
            />
            {searching && (
              <div className="absolute left-6 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-[#A842E4] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>

          {results.length > 0 && (
            <ul className="absolute right-4 left-4 bg-white border border-gray-200 rounded-xl shadow-lg mt-1 z-50 max-h-72 overflow-y-auto">
              {results.map((p) => {
                const img = p.images?.[0] || p.image;
                const price = p.salePrice ?? p.originalPrice ?? p.price ?? 0;
                return (
                  <li key={p._id}>
                    <Link
                      href={`/product/${p._id}`}
                      onClick={() => { setSearchOpen(false); setSearchQuery(""); setResults([]); }}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-[#f3eafc] transition-colors"
                    >
                      {img && (
                        <Image src={resolveImg(img)} alt={p.name} width={40} height={40} className="object-contain rounded" unoptimized />
                      )}
                      <span className="flex-1 text-sm text-gray-800 line-clamp-1">{p.name}</span>
                      <span className="text-sm font-bold text-red-600 shrink-0">{price.toLocaleString("en-US")} ج.م <PriceEquivalent amount={price} /></span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}

          {!searching && searchQuery.trim() && results.length === 0 && (
            <p className="text-center text-sm text-gray-400 py-3">لا توجد نتائج</p>
          )}
        </div>
      )}

      <MobileMenu items={navItems} isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </nav>
  );
}
