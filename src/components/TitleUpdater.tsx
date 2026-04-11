"use client";

import { useEffect } from "react";
import { useConfig } from "@/contexts/ConfigContext";

export default function TitleUpdater() {
  const { config, isLoading } = useConfig();

  useEffect(() => {
    if (isLoading) return;
    if (config.BRAND_NAME) {
      document.title = `${config.BRAND_NAME} Portal`;
    }
  }, [config.BRAND_NAME, isLoading]);

  return null;
}
