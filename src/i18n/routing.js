import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["bn", "en", "ko"],
  defaultLocale: "bn",
  localePrefix: "always",
});
