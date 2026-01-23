"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { DEFAULT_CONFIG, type AppConfig } from "@/config/default";
import { fetchWhitelabelConfig } from "@/services/whitelabel";

interface ConfigContextType {
  config: AppConfig;
  isLoading: boolean;
  error: Error | null;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadConfig() {
      if (DEFAULT_CONFIG.disableWhiteLabel) {
        if (isMounted) {
          setConfig(DEFAULT_CONFIG);
          setIsLoading(false);
        }
        return;
      }

      try {
        const whitelabelConfig = await fetchWhitelabelConfig();
        if (isMounted) {
          setConfig(whitelabelConfig);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Failed to load config"));
          setConfig(DEFAULT_CONFIG);
          setIsLoading(false);
        }
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
