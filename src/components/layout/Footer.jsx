"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Facebook, Instagram } from "lucide-react";

export default function Footer() {
  const tFooter = useTranslations("footer");
  const tNav = useTranslations("nav");

  return (
    <footer className="border-t bg-stone-50/50 dark:bg-[#1C1417] dark:border-white/10 transition-colors">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Cherry Glow Korea" width={36} height={36} />
              <div className="flex items-baseline gap-1 font-serif">
                <span className="text-lg font-bold text-stone-900 dark:text-white">Cherry Glow</span>
                <span className="text-lg italic font-semibold text-rose-500">Korea</span>
              </div>
            </Link>

            <p className="mt-4 max-w-xs text-sm leading-relaxed text-stone-600 dark:text-rose-100/70">
              {tFooter("tagline")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">
              {tFooter("quickLinks")}
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-600 dark:text-rose-100/70">
              <li>
                <Link href="/" className="transition-colors hover:text-rose-500 dark:hover:text-rose-300">
                  {tNav("home")}
                </Link>
              </li>
              <li>
                <Link href="/products" className="transition-colors hover:text-rose-500 dark:hover:text-rose-300">
                  {tNav("products")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:text-rose-500 dark:hover:text-rose-300">
                  {tNav("about")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-rose-500 dark:hover:text-rose-300">
                  {tNav("contact")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-4 text-xs font-bold uppercase tracking-wider text-rose-500 dark:text-rose-400">
              {tFooter("supportLegal")}
            </h4>
            <ul className="space-y-2.5 text-sm text-stone-600 dark:text-rose-100/70">
              <li>
                <Link href="/faq" className="transition-colors hover:text-rose-500 dark:hover:text-rose-300">
                  {tFooter("faq")}
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="transition-colors hover:text-rose-500 dark:hover:text-rose-300">
                  {tFooter("shipping")}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-rose-500 dark:hover:text-rose-300">
                  {tFooter("support")}
                </Link>
              </li>
              <li>
                <Link href="/privacy-policy" className="transition-colors hover:text-rose-500 dark:hover:text-rose-300">
                  {tFooter("privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="transition-colors hover:text-rose-500 dark:hover:text-rose-300">
                  {tFooter("terms")}
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 flex flex-col items-center justify-between gap-6 border-t border-stone-200/60 dark:border-white/10 pt-6 sm:flex-row">
          <p className="text-xs text-stone-500 dark:text-rose-100/50">
            © {new Date().getFullYear()} Cherry Glow Korea. {tFooter("rights")}
          </p>

          {/* Social Icons */}
          <div className="flex gap-4">
            <Link
              href="https://www.facebook.com/profile.php?id=61584259252264"
              aria-label="Facebook"
              target="_blank"
              className="text-stone-500 hover:text-rose-500 dark:text-rose-100/60 dark:hover:text-rose-300 transition-colors"
            >
              <Facebook className="h-5 w-5" />
            </Link>
            <Link
              href="#"
              aria-label="Instagram"
              className="text-stone-500 hover:text-rose-500 dark:text-rose-100/60 dark:hover:text-rose-300 transition-colors"
            >
              <Instagram className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
