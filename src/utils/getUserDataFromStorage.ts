import { logger } from "./logger";

const LEGACY_USER_DATA_KEY = "userData";
const LEGACY_USER_EMAIL_KEY = "userEmail";

export function userDataStorageKey(companySlug: string): string {
  return `userData:${companySlug}`;
}

export function userEmailStorageKey(companySlug: string): string {
  return `userEmail:${companySlug}`;
}

interface StoredUserData {
  company?: string;
  country?: string;
  companyUniqueName?: string;
  account?: {
    uniqueName: string;
    name: string;
  };
  email?: string;
  vendorContactUniqueName?: string;
  portalDetails?: {
    name?: string;
    email?: string;
    contactNo?: string;
  };
}

function readLegacyUserDataForCompany(companySlug: string): StoredUserData | null {
  try {
    const legacy = localStorage.getItem(LEGACY_USER_DATA_KEY);
    if (!legacy) return null;
    const parsed = JSON.parse(legacy) as StoredUserData;
    if (parsed?.company === companySlug) return parsed;
  } catch {
    /* ignore */
  }
  return null;
}

export function getUserDataFromStorage(companySlug: string): StoredUserData | null {
  if (typeof window === "undefined" || !companySlug) return null;

  try {
    const namespaced = localStorage.getItem(userDataStorageKey(companySlug));
    if (namespaced) return JSON.parse(namespaced) as StoredUserData;
    return readLegacyUserDataForCompany(companySlug);
  } catch (error) {
    logger.error("Error parsing userData from localStorage", error);
    return null;
  }
}

export function getUserEmailFromStorage(companySlug: string): string | null {
  if (typeof window === "undefined" || !companySlug) return null;
  const scoped = localStorage.getItem(userEmailStorageKey(companySlug));
  if (scoped) return scoped;
  return localStorage.getItem(LEGACY_USER_EMAIL_KEY);
}

export function getCompanyAndAccountNames(
  companySlug: string,
  companyUniqueNameFromRedux?: string | null,
  accountUniqueNameFromRedux?: string | null
): {
  companyUniqueName: string | undefined;
  accountUniqueName: string | undefined;
} {
  let companyUniqueName = companyUniqueNameFromRedux || undefined;
  let accountUniqueName = accountUniqueNameFromRedux || undefined;

  if (!companyUniqueName || !accountUniqueName) {
    const userData = getUserDataFromStorage(companySlug);
    if (userData) {
      companyUniqueName = companyUniqueName || userData.companyUniqueName;
      accountUniqueName = accountUniqueName || userData.account?.uniqueName;
    }
  }

  return { companyUniqueName, accountUniqueName };
}
