import { DEFAULT_CONFIG, type AppConfig } from "@/config/default";

const WHITELABEL_API_TIMEOUT = 10000;

interface WhitelabelResponse {
  NEXT_PUBLIC_REFERENCE_ID?: string;
  NEXT_PUBLIC_GIDDH_API_URL?: string;
  NEXT_PUBLIC_PROXY_URL?: string;
  NEXT_PUBLIC_API_URL?: string;
  NEXT_PUBLIC_PAYPAL_URL?: string;
  NEXT_PUBLIC_REFERENCE_ID_UK?: string;
  NEXT_PUBLIC_API_URL_UK?: string;
}

export async function fetchWhitelabelConfig(): Promise<AppConfig> {
  try {
    const whitelabelApiUrl = process.env.NEXT_PUBLIC_WHITELABEL_API_URL;

    if (!whitelabelApiUrl) {
      console.warn("NEXT_PUBLIC_WHITELABEL_API_URL not configured, using default config");
      return DEFAULT_CONFIG;
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), WHITELABEL_API_TIMEOUT);

    const response = await fetch(whitelabelApiUrl, {
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn("Whitelabel API returned error, using default config");
      return DEFAULT_CONFIG;
    }

    const data: WhitelabelResponse = await response.json();

    return {
      disableWhiteLabel: DEFAULT_CONFIG.disableWhiteLabel,
      NEXT_PUBLIC_REFERENCE_ID:
        data.NEXT_PUBLIC_REFERENCE_ID || DEFAULT_CONFIG.NEXT_PUBLIC_REFERENCE_ID,
      NEXT_PUBLIC_GIDDH_API_URL:
        data.NEXT_PUBLIC_GIDDH_API_URL || DEFAULT_CONFIG.NEXT_PUBLIC_GIDDH_API_URL,
      NEXT_PUBLIC_PROXY_URL: data.NEXT_PUBLIC_PROXY_URL || DEFAULT_CONFIG.NEXT_PUBLIC_PROXY_URL,
      NEXT_PUBLIC_API_URL: data.NEXT_PUBLIC_API_URL || DEFAULT_CONFIG.NEXT_PUBLIC_API_URL,
      NEXT_PUBLIC_PAYPAL_URL: data.NEXT_PUBLIC_PAYPAL_URL || DEFAULT_CONFIG.NEXT_PUBLIC_PAYPAL_URL,
      NEXT_PUBLIC_REFERENCE_ID_UK:
        data.NEXT_PUBLIC_REFERENCE_ID_UK || DEFAULT_CONFIG.NEXT_PUBLIC_REFERENCE_ID_UK,
      NEXT_PUBLIC_API_URL_UK: data.NEXT_PUBLIC_API_URL_UK || DEFAULT_CONFIG.NEXT_PUBLIC_API_URL_UK,
    };
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("Whitelabel API timeout (10s), using default config");
    } else {
      console.error("Failed to fetch whitelabel config:", error);
    }
    return DEFAULT_CONFIG;
  }
}
