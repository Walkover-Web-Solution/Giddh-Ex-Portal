"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  DEFAULT_CONFIG,
  mergeWhiteLabelConfig,
  type AppConfig,
  type WhiteLabelConfig,
} from "@/config/default";

interface ConfigContextType {
  config: AppConfig;
  isLoading: boolean;
  error: Error | null;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

function getStoredWhiteLabel(): WhiteLabelConfig | null {
  try {
    const stored = localStorage.getItem("whiteLabel");
    return stored && stored !== "null" ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
}

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(() => {
    if (typeof window === "undefined") return DEFAULT_CONFIG;
    return mergeWhiteLabelConfig(getStoredWhiteLabel());
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadConfig() {
      let whiteLabelData = getStoredWhiteLabel();

      const pathname = window.location.pathname;
      const pathSegments = pathname.split("/").filter(Boolean);
      const country = pathSegments[1]?.toLowerCase();
      const apiBaseUrl =
        country === "uk" ? DEFAULT_CONFIG.GIDDH_API_URL_UK : DEFAULT_CONFIG.GIDDH_API_URL;

      if (pathname !== "/magic" && pathname !== "/magic.html") {
        try {
          const response = await fetch(`${apiBaseUrl}/white-label`);
          const data = await response.json();

          if (data?.body) {
            whiteLabelData = data.body;
            localStorage.setItem("whiteLabel", JSON.stringify(whiteLabelData));
          }
        } catch (err) {
          if (isMounted) {
            setError(err instanceof Error ? err : new Error("Failed to load config"));
          }
        }
      }

      if (isMounted) {
        setConfig(mergeWhiteLabelConfig(whiteLabelData));
        setIsLoading(false);
      }
    }

    loadConfig();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <ConfigContext.Provider value={{ config, isLoading, error }}>{children}</ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
}
