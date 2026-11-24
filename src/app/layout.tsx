import localFont from "next/font/local";
import "./globals.css";
import { Providers } from "./providers";

const inter = localFont({
  src: "../fonts/inter-latin.woff2",
  variable: "--font-inter",
  display: "swap",
});

const playfair = localFont({
  src: "../fonts/playfair-latin.woff2",
  variable: "--font-playfair",
  display: "swap",
});

const hindSiliguri = localFont({
  src: [
    {
      path: "../fonts/hind-siliguri-300-bengali.woff2",
      weight: "300",
      style: "normal",
    },
    {
      path: "../fonts/hind-siliguri-400-bengali.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/hind-siliguri-500-bengali.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/hind-siliguri-600-bengali.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/hind-siliguri-700-bengali.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-hind-siliguri",
  display: "swap",
});

export const metadata = {
  title: "Cherry Glow Korea",
  description: "Beauty & skincare products store",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} ${hindSiliguri.variable}`}
    >
      <body suppressHydrationWarning className="font-sans antialiased overflow-x-hidden">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
