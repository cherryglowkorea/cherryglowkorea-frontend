"use client";

import * as React from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const languages = [
  { code: "bn", label: "বাংলা", name: "বাংলা" },
  { code: "en", label: "English", name: "English" },
  { code: "ko", label: "한국어", name: "한국어" },
];

export function LanguageSwitcher({ variant = "default" }) {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (newLocale) => {
    router.replace(pathname, { locale: newLocale });
  };

  const activeLang = languages.find((l) => l.code === currentLocale) || languages[0];
  const isDarkVar = variant === "dark" || variant === "compact";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Language switcher"
          className={
            isDarkVar
              ? "group relative flex h-8 items-center gap-1.5 rounded-full border border-stone-700 bg-stone-800/90 px-3.5 text-xs font-bold text-rose-300 hover:bg-stone-700 hover:text-white transition cursor-pointer outline-none shrink-0"
              : "group relative flex h-10 items-center gap-2 rounded-full border border-rose-200/80 bg-white px-3.5 text-xs font-bold text-stone-800 shadow-sm backdrop-blur transition-all hover:bg-rose-50 hover:border-rose-300 dark:border-white/10 dark:bg-white/5 dark:text-rose-200 dark:hover:bg-white/10 cursor-pointer outline-none shrink-0"
          }
        >
          <Globe size={isDarkVar ? 13 : 15} className="text-rose-400 shrink-0" />
          <span className="truncate">{activeLang.label}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-36 rounded-2xl p-1.5 shadow-2xl border border-stone-200 dark:border-white/10 dark:bg-[#23181C]">
        {languages.map((lang) => {
          const isSelected = currentLocale === lang.code;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-bold cursor-pointer transition-colors ${
                isSelected
                  ? "bg-rose-500 text-white dark:bg-rose-600 dark:text-white"
                  : "text-stone-700 dark:text-stone-200 hover:bg-rose-50 dark:hover:bg-white/10 hover:text-rose-600"
              }`}
            >
              <span>{lang.name}</span>
              {isSelected && <span className="text-white font-extrabold text-xs">✓</span>}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
