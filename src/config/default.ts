export const APP_ENV = {
  LOCAL: "local",
  TEST: "test",
  PROD: "prod",
} as const;

export type AppEnvType = (typeof APP_ENV)[keyof typeof APP_ENV];

export interface LogoConfig {
  primary: string;
  light: string;
  dark: string;
  icon: string;
  favicon: string;
}

export interface GiddhWhiteLabel {
  uniqueName?: string;
  baseDomain?: string;
  adminDomain?: string;
  apiDomain?: string;
  portalDomain?: string;
  domainName?: string;
  uiDomains?: string[];
  certificateRequired?: boolean;
  certificateStatus?: string;
  logos?: LogoConfig;
  brandName?: string;
}

export interface PortalMessagesConfig {
  switchAccountAuthError?: string;
}

export interface WhiteLabelConfig {
  proxyApiUrl?: string;
  proxyApiUrlUk?: string;
  proxyReferenceId?: string;
  proxyReferenceIdUk?: string;
  proxyUrl?: string;
  websiteDomain?: string;
  giddhWhiteLabel?: GiddhWhiteLabel;
  portalMessages?: PortalMessagesConfig;
}

export interface AppConfig {
  REFERENCE_ID: string;
  GIDDH_API_URL: string;
  REFERENCE_ID_UK: string;
  API_URL_UK: string;
  PROXY_URL: string;
  API_URL: string;
  PAYPAL_URL: string;
  WEBSITE_DOMAIN: string;
  BRAND_NAME: string;
  LOGOS: LogoConfig;
  SWITCH_ACCOUNT_AUTH_ERROR_MESSAGE: string;
}

export const DEFAULT_SWITCH_ACCOUNT_AUTH_ERROR_MESSAGE =
  "Authentication data not found. Please log in again.";

const PROD_CONFIG: AppConfig = {
  REFERENCE_ID: "117230e170290843965805217bfd25",
  API_URL: "https://routes.msg91.com/api/proxy/117230/24yrfox2",
  REFERENCE_ID_UK: "117230d172709659666f16714325b0",
  API_URL_UK: "https://routes.msg91.com/api/proxy/117230/34ytsup2",
  GIDDH_API_URL: "https://api.giddh.com",
  PROXY_URL: "https://routes.msg91.com",
  PAYPAL_URL: "https://www.paypal.com/cgi-bin/webscr",
  WEBSITE_DOMAIN: "https://giddh.com",
  BRAND_NAME: "Giddh",
  SWITCH_ACCOUNT_AUTH_ERROR_MESSAGE: DEFAULT_SWITCH_ACCOUNT_AUTH_ERROR_MESSAGE,
  LOGOS: {
    primary: "/icons/giddh_text_icon.svg",
    light: "giddh-logo-dark.png",
    dark: "giddh-logo-light.png",
    icon: "giddh-square.logo",
    favicon: "favicon.ico",
  },
};

const NON_PROD_CONFIG: AppConfig = {
  REFERENCE_ID: "117230p1697093599652797df30cea",
  API_URL: "https://routes.msg91.com/api/proxy/117230/24lvqun1",
  REFERENCE_ID_UK: "117230d172709659666f16714325b0",
  API_URL_UK: "https://routes.msg91.com/api/proxy/117230/34ytsup2",
  GIDDH_API_URL: "https://apitest.giddh.com",
  PROXY_URL: "https://routes.msg91.com",
  PAYPAL_URL: "https://www.sandbox.paypal.com/cgi-bin/webscr",
  WEBSITE_DOMAIN: "https://web.giddh.com",
  BRAND_NAME: "Giddh",
  SWITCH_ACCOUNT_AUTH_ERROR_MESSAGE: DEFAULT_SWITCH_ACCOUNT_AUTH_ERROR_MESSAGE,
  LOGOS: {
    primary: "/icons/giddh_text_icon.svg",
    light: "giddh-logo-dark.png",
    dark: "giddh-logo-light.png",
    icon: "giddh-square.logo",
    favicon: "favicon.ico",
  },
};

const appEnv = (process.env.APP_ENV ||
  process.env.NEXT_PUBLIC_APP_ENV ||
  APP_ENV.LOCAL) as AppEnvType;
const baseConfig: AppConfig = appEnv === APP_ENV.PROD ? PROD_CONFIG : NON_PROD_CONFIG;

export const DEFAULT_CONFIG: AppConfig = baseConfig;

export function mergeWhiteLabelConfig(whiteLabel: WhiteLabelConfig | null): AppConfig {
  if (!whiteLabel) {
    return DEFAULT_CONFIG;
  }

  const giddhWhiteLabel = whiteLabel.giddhWhiteLabel;

  const apiSwitchAccountMsg = whiteLabel.portalMessages?.switchAccountAuthError?.trim();

  return {
    ...DEFAULT_CONFIG,
    PROXY_URL: whiteLabel.proxyUrl || DEFAULT_CONFIG.PROXY_URL,
    API_URL: whiteLabel.proxyApiUrl || DEFAULT_CONFIG.API_URL,
    API_URL_UK: whiteLabel.proxyApiUrlUk || DEFAULT_CONFIG.API_URL_UK,
    REFERENCE_ID: whiteLabel.proxyReferenceId || DEFAULT_CONFIG.REFERENCE_ID,
    REFERENCE_ID_UK: whiteLabel.proxyReferenceIdUk || DEFAULT_CONFIG.REFERENCE_ID_UK,
    WEBSITE_DOMAIN: whiteLabel.websiteDomain || DEFAULT_CONFIG.WEBSITE_DOMAIN,
    GIDDH_API_URL: giddhWhiteLabel?.apiDomain || DEFAULT_CONFIG.GIDDH_API_URL,
    BRAND_NAME: giddhWhiteLabel?.brandName || DEFAULT_CONFIG.BRAND_NAME,
    LOGOS: giddhWhiteLabel?.logos || DEFAULT_CONFIG.LOGOS,
    SWITCH_ACCOUNT_AUTH_ERROR_MESSAGE:
      apiSwitchAccountMsg || DEFAULT_CONFIG.SWITCH_ACCOUNT_AUTH_ERROR_MESSAGE,
  };
}

export function getConfig(): AppConfig {
  if (typeof window === "undefined") {
    return DEFAULT_CONFIG;
  }

  try {
    const stored = localStorage.getItem("whiteLabel");
    const whiteLabelData = stored && stored !== "null" ? JSON.parse(stored) : null;
    return mergeWhiteLabelConfig(whiteLabelData);
  } catch {
    return DEFAULT_CONFIG;
  }
}
