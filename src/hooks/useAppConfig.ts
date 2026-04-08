import { useConfig } from "@/contexts/ConfigContext";

export function useAppConfig() {
  const { config, isLoading, error } = useConfig();

  return {
    config,
    isLoading,
    error,
    referenceId: config.REFERENCE_ID,
    giddhApiUrl: config.GIDDH_API_URL,
    proxyUrl: config.PROXY_URL,
    apiUrl: config.API_URL,
    paypalUrl: config.PAYPAL_URL,
    referenceIdUk: config.REFERENCE_ID_UK,
    apiUrlUk: config.API_URL_UK,
    switchAccountAuthErrorMessage: config.SWITCH_ACCOUNT_AUTH_ERROR_MESSAGE,
  };
}
