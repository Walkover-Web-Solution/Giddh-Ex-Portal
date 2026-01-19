import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { ReduxProvider } from "@/providers/ReduxProvider";
import SessionVerification from "@/components/SessionVerification";

export const metadata: Metadata = {
  title: "Giddh Portal",
  description: "Modern Next.js application with TypeScript, TailwindCSS, Redux, and SASS",
  icons: {
    icon: "/icons/giddh_app_icon.svg",
    shortcut: "/icons/giddh_app_icon.svg",
    apple: "/icons/giddh_app_icon.svg",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://proxy.msg91.com/assets/proxy-auth/proxy-auth.js"
          strategy="afterInteractive"
        />
        <ReduxProvider>
          <SessionVerification>{children}</SessionVerification>
        </ReduxProvider>
      </body>
    </html>
  );
}
