import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ReduxProvider } from "@/providers/ReduxProvider";

export const metadata: Metadata = {
  title: "Giddh Portal",
  description: "Modern Next.js application with TypeScript, TailwindCSS, Redux, and SASS",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://proxy.msg91.com/assets/proxy-auth/proxy-auth.js"
          strategy="afterInteractive"
        />
        <ReduxProvider>{children}</ReduxProvider>
      </body>
    </html>
  );
}
