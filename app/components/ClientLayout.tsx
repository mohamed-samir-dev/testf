"use client";
import { usePathname } from "next/navigation";
import { Navbar } from "./navbar";
import WhatsappButton from "./WhatsappButton";

// WHY ClientLayout (not ConditionalLayout):
// ConditionalLayout is a Server Component that reads `x-pathname` from
// request headers to decide whether to show the Navbar. However, Next.js
// does not inject `x-pathname` automatically — it would require a custom
// middleware to add it on every request. No such middleware exists in this
// project, so ConditionalLayout always receives an empty string and would
// show the Navbar on every route including /admin.
//
// ClientLayout uses usePathname() on the client instead. The hook is
// synchronous, zero-cost, and only re-runs when the URL changes — not on
// every render. This is the correct approach here.

export default function ClientLayout({ children, footer }: { children: React.ReactNode; footer: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin") || pathname.startsWith("/view-file");

  return (
    <>
      {!isAdmin && <Navbar />}
      {children}
      {!isAdmin && footer}
      {!isAdmin && <WhatsappButton />}
    </>
  );
}
