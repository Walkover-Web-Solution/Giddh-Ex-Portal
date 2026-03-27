"use client";

import { useEffect } from "react";
import { useConfig } from "@/contexts/ConfigContext";

export default function FaviconUpdater() {
  const { config, isLoading } = useConfig();

  useEffect(() => {
    if (isLoading) return;
    const favicon = config.LOGOS?.favicon;
    if (!favicon) return;

    const selectors = [
      "link[rel='icon']",
      "link[rel='shortcut icon']",
      "link[rel='apple-touch-icon']",
    ];
    selectors.forEach((selector) => {
      const link = document.querySelector<HTMLLinkElement>(selector);
      if (link) {
        link.href = favicon;
      }
    });
  }, [config.LOGOS?.favicon, isLoading]);

  return null;
}
