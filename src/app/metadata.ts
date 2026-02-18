import type { Metadata } from "next";
import { DEFAULT_CONFIG } from "@/config/default";

export const metadata: Metadata = {
  title: `${DEFAULT_CONFIG.BRAND_NAME} Portal`,
  description: "Modern Next.js application with TypeScript, TailwindCSS, Redux, and SASS",
  icons: {
    icon: "/icons/giddh_app_icon.svg",
    shortcut: "/icons/giddh_app_icon.svg",
    apple: "/icons/giddh_app_icon.svg",
  },
};
