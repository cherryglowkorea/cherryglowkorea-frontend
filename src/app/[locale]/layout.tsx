import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { notFound } from "next/navigation";
import ClientNavbar from "@/components/layout/ClientNavbar";
import Footer from "@/components/layout/Footer";
import Messenger from "@/components/shared/Messenger";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";
import { Toaster } from "sonner";
import PromoPopup from "@/components/popup/PromoPopup";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;

  if (!routing.locales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <AuthProvider>
        <WishlistProvider>
          <CartProvider>
            <ClientNavbar />
            <PromoPopup />
            {children}
            <Toaster richColors position="top-right" />
            <Messenger />
          </CartProvider>
          <Footer />
        </WishlistProvider>
      </AuthProvider>
    </NextIntlClientProvider>
  );
}
