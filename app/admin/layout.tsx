// Server Component — no "use client" here intentionally.
//
// All interactive chrome (navbar, sidebar, toaster, pathname checks) lives in
// AdminShell which is a thin "use client" wrapper. Keeping this file as a
// Server Component means individual admin pages that are also Server Components
// can stream their RSC payload without being forced client-side by the layout.
import AdminShell from "./components/AdminShell";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}
