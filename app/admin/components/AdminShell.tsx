"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { Toaster } from "react-hot-toast";
import AdminNavbar from "./AdminNavbar";
import AdminSidebar from "./AdminSidebar";

/**
 * AdminShell — the interactive wrapper for the admin panel.
 *
 * WHY this component exists:
 * Next.js layouts are Server Components by default. Putting "use client" on
 * layout.tsx forces the ENTIRE admin subtree into the client bundle, which
 * means every admin page loses Server Component benefits (no RSC payload
 * streaming, no static optimisation) just to manage two booleans.
 *
 * Moving the interactive parts (pathname check, sidebar open state, Toaster)
 * into this thin client wrapper means layout.tsx stays a Server Component.
 * Each individual admin page can still opt into "use client" independently
 * when it needs interactivity — the layout no longer forces their hand.
 */
export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isLogin = pathname === "/admin/login";
  const isPrint =
    pathname.endsWith("/print") ||
    pathname.endsWith("/receipt") ||
    pathname.endsWith("/invoice") ||
    pathname.endsWith("/contract") ||
    pathname.endsWith("/cancellation");

  // Login and print pages render without the chrome (navbar / sidebar).
  if (isLogin || isPrint) return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <AdminNavbar onMenuClick={() => setSidebarOpen(true)} />
      <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontSize: "14px",
            padding: "12px 16px",
            maxWidth: "320px",
            fontWeight: "600",
          },
        }}
      />
      <main className="md:mr-64 pt-20 min-h-screen overflow-x-hidden">
        <div className="px-3 pb-4 sm:px-5 sm:pb-5 md:px-6 md:pb-6">
          {children}
        </div>
      </main>
    </div>
  );
}
