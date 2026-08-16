"use client";

import { Suspense } from "react";
import { ThemeProvider } from "next-themes";
import { GoogleOAuthProvider } from "@react-oauth/google";
import ReduxProvider from "@/providers/ReduxProvider";
import MetaPixel from "@/components/analytics/MetaPixel";

export function Providers({ children }) {
  const googleClientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "536070341056-cr3k780vq706kifkovcsdds34cp7pirv.apps.googleusercontent.com";

  return (
    <ReduxProvider>
      <GoogleOAuthProvider clientId={googleClientId}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Suspense fallback={null}>
            <MetaPixel />
          </Suspense>
          {children}
        </ThemeProvider>
      </GoogleOAuthProvider>
    </ReduxProvider>
  );
}


