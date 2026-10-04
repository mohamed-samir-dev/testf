import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "عرض الملف",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ViewFileLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
