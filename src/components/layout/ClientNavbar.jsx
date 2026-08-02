"use client";

import dynamic from "next/dynamic";

const Navbar = dynamic(() => import("@/components/layout/Navbar"), {
  ssr: false,
  loading: () => (
    <div className="h-16 w-full sticky top-0 z-50 bg-white/80 dark:bg-[#1C1417]/85 backdrop-blur-md border-b border-rose-100/60 dark:border-white/10" />
  ),
});

export default function ClientNavbar() {
  return <Navbar />;
}
