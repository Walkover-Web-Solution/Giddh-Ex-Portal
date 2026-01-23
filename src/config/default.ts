export interface AppConfig {
  disableWhiteLabel: boolean;
  NEXT_PUBLIC_REFERENCE_ID: string;
  NEXT_PUBLIC_GIDDH_API_URL: string;
  NEXT_PUBLIC_PROXY_URL: string;
  NEXT_PUBLIC_API_URL: string;
  NEXT_PUBLIC_PAYPAL_URL: string;
  NEXT_PUBLIC_REFERENCE_ID_UK: string;
  NEXT_PUBLIC_API_URL_UK: string;
}

export const DEFAULT_CONFIG: AppConfig = {
  disableWhiteLabel: true,
  NEXT_PUBLIC_REFERENCE_ID: "1362783l1767680954695cabba5ada1",
  NEXT_PUBLIC_GIDDH_API_URL: "https://apitest.giddh.com",
  NEXT_PUBLIC_PROXY_URL: "https://routes.msg91.com",
  NEXT_PUBLIC_API_URL: "https://routes.msg91.com/api/proxy/117230/24lvqun1",
  NEXT_PUBLIC_PAYPAL_URL: "https://www.sandbox.paypal.com/cgi-bin/webscr",
  NEXT_PUBLIC_REFERENCE_ID_UK: "117230d172709659666f16714325b0",
  NEXT_PUBLIC_API_URL_UK: "https://routes.msg91.com/api/proxy/117230/34ytsup2",
};
