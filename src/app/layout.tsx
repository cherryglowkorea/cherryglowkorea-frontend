import { Inter, Playfair_Display, Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const hindSiliguri = Hind_Siliguri({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["bengali", "latin"],
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
