import Script from "next/script";
import "./globals.css";
import { ReduxProvider } from "@/providers/ReduxProvider";
import { ToastProvider } from "@/contexts/ToastContext";
import SessionVerification from "@/components/SessionVerification";
import { metadata } from "./metadata";

export { metadata };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://proxy.msg91.com/assets/proxy-auth/proxy-auth.js"
          strategy="afterInteractive"
        />
        <ReduxProvider>
          <ToastProvider>
            <SessionVerification>{children}</SessionVerification>
          </ToastProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
