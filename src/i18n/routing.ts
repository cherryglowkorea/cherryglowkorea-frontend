import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["en", "bn", "ko"],
  defaultLocale: "en",
  localePrefix: "always",
});
