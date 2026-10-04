"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCompanyStore } from "../../store/companyStore";

// Polling interval in ms — 45s is optimal for badge updates when active.
const POLL_INTERVAL_MS = 45_000;

export default function AdminNavbar({ onMenuClick }: { onMenuClick: () => void }) {
  const router = useRouter();
  // Re-use the same company store that Navbar.tsx uses — zero extra network
  // request because the store caches the result for 1 hour in localStorage.
  const { logo, fetchCompany } = useCompanyStore();
  const [orderCount, setOrderCount] = useState(0);

  // Fetch company data once; store handles TTL so this is a no-op on re-mounts
  // within the cache window.
  useEffect(() => {
    fetchCompany();
  }, [fetchCompany]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const loadCount = () => {
      // Don't poll if document is hidden to save client & server resources
      if (typeof document !== "undefined" && document.hidden) return;
      fetch("/api/admin/orders/count")
        .then((r) => {
          // 401 means the session expired — stop polling silently
          if (r.status === 401) { stopPolling(); return null; }
          return r.json();
        })
        .then((d) => d && setOrderCount(typeof d.count === "number" ? d.count : 0))
        .catch(() => {});
    };

    const startPolling = () => {
      if (!interval) {
        interval = setInterval(loadCount, POLL_INTERVAL_MS);
      }
    };

    const stopPolling = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else {
        loadCount();
        startPolling();
      }
    };

    // Initial load
    loadCount();
    startPolling();

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    router.push("/admin/login");
  }

  return (
    <header className="fixed top-0 right-0 left-0 z-40 h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      {/* Right: hamburger + logo */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          onClick={onMenuClick}
          aria-label="فتح القائمة"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        {logo ? (
          <Image src={logo} alt="شعار الشركة" width={120} height={40} className="h-10 w-auto object-contain" unoptimized />
        ) : (
          <span className="font-bold text-gray-800 text-lg">لوحة التحكم</span>
        )}
      </div>

      {/* Left: notifications + logout */}
      <div className="flex items-center gap-2">
        {/* Notifications */}
        <button
          onClick={() => router.push("/admin/orders")}
          className="relative p-2 rounded-full text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="الطلبات"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
          {orderCount > 0 && (
            <span className="absolute -top-0.5 -left-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
              {orderCount > 99 ? "99+" : orderCount}
            </span>
          )}
        </button>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          خروج
        </button>
      </div>
    </header>
  );
}
