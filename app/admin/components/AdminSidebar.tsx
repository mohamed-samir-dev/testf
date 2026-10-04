"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { memo } from "react";

// ---------------------------------------------------------------------------
// Icon components — defined ONCE at module level as stable function references.
//
// WHY: The previous approach stored JSX elements (<svg ...>) directly inside
// the `links` array literal. JSX is syntactic sugar for React.createElement()
// calls, which allocate new React element objects. Storing a JSX *element*
// (not a component) in a constant means the object is created once at module
// load — that part is fine. However, passing that element into the render tree
// means React has no way to bail out of reconciling its children on re-renders
// because it has no component identity to track.
//
// By using function components React can apply its normal reconciliation rules:
// if the component reference and props are the same, the subtree is skipped.
// memo() makes this explicit and prevents any re-render of the icon nodes when
// the sidebar's open state or active pathname changes.
// ---------------------------------------------------------------------------

const IconDashboard = memo(function IconDashboard() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" strokeWidth={2} />
      <rect x="14" y="3" width="7" height="7" rx="1" strokeWidth={2} />
      <rect x="3" y="14" width="7" height="7" rx="1" strokeWidth={2} />
      <rect x="14" y="14" width="7" height="7" rx="1" strokeWidth={2} />
    </svg>
  );
});

const IconUsers = memo(function IconUsers() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-5-3.87M9 20H4v-2a4 4 0 015-3.87M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
});

const IconCompany = memo(function IconCompany() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0H5m14 0h2M5 21H3M9 7h1m5 0h1M9 11h1m5 0h1M9 15h6" />
    </svg>
  );
});

const IconFiles = memo(function IconFiles() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  );
});

const IconBanners = memo(function IconBanners() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="5" width="18" height="14" rx="2" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18" />
    </svg>
  );
});

const IconCategoryBanners = memo(function IconCategoryBanners() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth={2} />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9h18M9 21V9" />
    </svg>
  );
});

const IconReviews = memo(function IconReviews() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  );
});

const IconMainCategories = memo(function IconMainCategories() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
});

const IconSubCategories = memo(function IconSubCategories() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
});

const IconCategoryItems = memo(function IconCategoryItems() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h7" />
    </svg>
  );
});

const IconProducts = memo(function IconProducts() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
    </svg>
  );
});

const IconOrders = memo(function IconOrders() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  );
});

// ---------------------------------------------------------------------------
// Nav links configuration — IconComponent is a stable function reference,
// NOT a pre-rendered element. React will call it during render but can track
// its identity for bailout purposes.
// ---------------------------------------------------------------------------
type NavLink = { href: string; label: string; Icon: React.ComponentType };

const LINKS: NavLink[] = [
  { href: "/admin/dashboard",        label: "الرئيسية",                Icon: IconDashboard },
  { href: "/admin/users",            label: "إدارة المستخدمين",        Icon: IconUsers },
  { href: "/admin/company",          label: "بيانات الشركة",           Icon: IconCompany },
  { href: "/admin/files",            label: "الملفات",                 Icon: IconFiles },
  { href: "/admin/banners",          label: "البانرات",                Icon: IconBanners },
  { href: "/admin/category-banners", label: "بانرات التصنيفات",        Icon: IconCategoryBanners },
  { href: "/admin/reviews",          label: "آراء العملاء",            Icon: IconReviews },
  { href: "/admin/main-categories",  label: "التصنيفات الرئيسية",      Icon: IconMainCategories },
  { href: "/admin/sub-categories",   label: "التصنيفات الفرعية",       Icon: IconSubCategories },
  { href: "/admin/category-items",   label: "التصنيفات في الرئيسية",   Icon: IconCategoryItems },
  { href: "/admin/products",         label: "الأصناف",                 Icon: IconProducts },
  { href: "/admin/orders",           label: "الطلبات",                 Icon: IconOrders },
];

// ---------------------------------------------------------------------------
// Single nav link row — memoised so it only re-renders when `active` changes.
// Without memo, every keystroke or sidebar-toggle re-renders all 12 rows.
// ---------------------------------------------------------------------------
const SidebarLink = memo(function SidebarLink({
  href, label, Icon, active, onClose,
}: NavLink & { active: boolean; onClose: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClose}
      className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors
        ${active ? "bg-blue-50 text-blue-700" : "text-gray-700 hover:bg-gray-100"}`}
    >
      <span className={active ? "text-blue-600" : "text-gray-400"}>
        <Icon />
      </span>
      {label}
    </Link>
  );
});

export default function AdminSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname();

  return (
    <aside
      className={`fixed top-0 right-0 z-40 h-full w-64 bg-white border-l border-gray-200 pt-16 transition-transform duration-200
        ${open ? "translate-x-0" : "translate-x-full"} md:translate-x-0`}
    >
      <nav className="flex flex-col gap-1 p-5">
        {LINKS.map(({ href, label, Icon }) => (
          <SidebarLink
            key={href}
            href={href}
            label={label}
            Icon={Icon}
            active={pathname.startsWith(href)}
            onClose={onClose}
          />
        ))}
      </nav>
    </aside>
  );
}
