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
  { code: "bn", label: "বাং", name: "বাংলা" },
  { code: "en", label: "EN", name: "English" },
  { code: "ko", label: "한국어", name: "한국어" },
];

export function LanguageSwitcher() {
  const currentLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const handleLanguageChange = (newLocale) => {
    router.replace(pathname, { locale: newLocale });
  };

  const activeLang = languages.find((l) => l.code === currentLocale) || languages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          aria-label="Language switcher"
          className="group relative flex h-10 items-center gap-1.5 rounded-full border border-rose-200/60 bg-white/70 px-3 text-xs font-semibold text-rose-500 shadow-sm backdrop-blur transition-colors hover:bg-rose-50 dark:border-white/10 dark:bg-white/5 dark:text-rose-300 dark:hover:bg-white/10 cursor-pointer outline-none shrink-0"
        >
          <Globe size={15} />
          <span>{activeLang.label}</span>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-32 rounded-xl p-1 shadow-xl border border-stone-200 dark:border-white/10 dark:bg-[#23181C]">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium cursor-pointer ${
              currentLocale === lang.code
                ? "bg-rose-50 text-rose-600 font-semibold dark:bg-rose-950/40 dark:text-rose-300"
                : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-white/10"
            }`}
          >
            <span>{lang.name}</span>
            <span className="text-[10px] text-stone-400 dark:text-stone-500 uppercase">{lang.code}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
