"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Messenger() {
  const pathname = usePathname();

  // Do not render Messenger icon on Admin Dashboard pages
  if (pathname?.includes("/admin") || pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <Link
      href="https://m.me/cherryglow786"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on Messenger"
      className="fixed bottom-6 right-4 sm:bottom-7 sm:right-6 z-40 flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center
                 rounded-full bg-[#0084FF] shadow-lg shadow-blue-500/25
                 messenger-float
                 transition-transform hover:scale-105 active:scale-95"
    >
      <Image
        src="/icons/messenger.svg"
        alt="Messenger"
        width={26}
        height={26}
        priority
      />
    </Link>
  );
}
