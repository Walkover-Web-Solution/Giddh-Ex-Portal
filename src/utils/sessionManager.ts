import type { Account } from "@/types/auth";
import { logger } from "./logger";

const KEYS = {
  PENDING_ACCOUNTS: "pendingAccounts",
  PENDING_TOKEN: "pendingToken",
  PENDING_EMAIL: "pendingEmail",
  PENDING_TOKEN_TYPE: "pendingTokenType",
  COMPANY_NAME: "companyName",
  COUNTRY: "country",
} as const;

export type PendingAuthTokenType = "proxy" | "accessToken";

function isSSR(): boolean {
  return typeof window === "undefined";
}

export const sessionManager = {
  setPendingAuth(
    accounts: Account[],
    token: string,
    email: string,
    tokenType: PendingAuthTokenType = "proxy"
  ) {
    if (isSSR()) return;

    if (!accounts?.length || !token) {
      logger.error("Invalid auth data provided to setPendingAuth");
      return;
    }

    try {
      sessionStorage.setItem(KEYS.PENDING_ACCOUNTS, JSON.stringify(accounts));
      sessionStorage.setItem(KEYS.PENDING_TOKEN, token);
      sessionStorage.setItem(KEYS.PENDING_EMAIL, email ?? "");
      sessionStorage.setItem(KEYS.PENDING_TOKEN_TYPE, tokenType);
    } catch (error) {
      logger.error("Error setting pending auth in sessionStorage", error);
    }
  },

  getPendingAuth(): {
    accounts: Account[];
    token: string;
    email: string;
    tokenType: PendingAuthTokenType;
  } | null {
    if (isSSR()) return null;

    try {
      const accounts = sessionStorage.getItem(KEYS.PENDING_ACCOUNTS);
      const token = sessionStorage.getItem(KEYS.PENDING_TOKEN);
      const email = sessionStorage.getItem(KEYS.PENDING_EMAIL);
      const tokenType = (sessionStorage.getItem(KEYS.PENDING_TOKEN_TYPE) as PendingAuthTokenType) || "proxy";

      if (!accounts || !token) return null;

      return {
        accounts: JSON.parse(accounts),
        token,
        email: email ?? "",
        tokenType,
      };
    } catch (error) {
      logger.error("Error getting pending auth from sessionStorage", error);
      return null;
    }
  },

  clearPendingAuth() {
    if (isSSR()) return;

    try {
      sessionStorage.removeItem(KEYS.PENDING_ACCOUNTS);
      sessionStorage.removeItem(KEYS.PENDING_TOKEN);
      sessionStorage.removeItem(KEYS.PENDING_EMAIL);
      sessionStorage.removeItem(KEYS.PENDING_TOKEN_TYPE);
    } catch (error) {
      logger.error("Error clearing pending auth from sessionStorage", error);
    }
  },

  setCompanyData(companyName: string, country: string) {
    if (isSSR()) return;

    if (!companyName || !country) {
      logger.error("Invalid company data provided to setCompanyData");
      return;
    }

    try {
      sessionStorage.setItem(KEYS.COMPANY_NAME, companyName);
      sessionStorage.setItem(KEYS.COUNTRY, country);
    } catch (error) {
      logger.error("Error setting company data in sessionStorage", error);
    }
  },

  getCompanyData(): { companyName: string | null; country: string | null } {
    if (isSSR()) return { companyName: null, country: null };

    try {
      return {
        companyName: sessionStorage.getItem(KEYS.COMPANY_NAME),
        country: sessionStorage.getItem(KEYS.COUNTRY),
      };
    } catch (error) {
      logger.error("Error getting company data from sessionStorage", error);
      return { companyName: null, country: null };
    }
  },
};
