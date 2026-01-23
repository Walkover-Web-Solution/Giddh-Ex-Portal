import { useConfig } from "@/contexts/ConfigContext";

export function useAppConfig() {
  const { config, isLoading, error } = useConfig();

  return {
    config,
    isLoading,
    error,
    referenceId: config.NEXT_PUBLIC_REFERENCE_ID,
    giddhApiUrl: config.NEXT_PUBLIC_GIDDH_API_URL,
    proxyUrl: config.NEXT_PUBLIC_PROXY_URL,
    apiUrl: config.NEXT_PUBLIC_API_URL,
    paypalUrl: config.NEXT_PUBLIC_PAYPAL_URL,
    referenceIdUk: config.NEXT_PUBLIC_REFERENCE_ID_UK,
    apiUrlUk: config.NEXT_PUBLIC_API_URL_UK,
  };
}
