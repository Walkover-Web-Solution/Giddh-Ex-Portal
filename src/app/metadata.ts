import type { Metadata } from "next";
import { DEFAULT_CONFIG } from "@/config/default";

export const metadata: Metadata = {
  title: `${DEFAULT_CONFIG.BRAND_NAME} Portal`,
  description: "Modern Next.js application with TypeScript, TailwindCSS, Redux, and SASS",
  icons: {
    icon: DEFAULT_CONFIG.LOGOS.favicon,
    shortcut: DEFAULT_CONFIG.LOGOS.favicon,
    apple: DEFAULT_CONFIG.LOGOS.favicon,
  },
};
