import { logger } from "./logger";

interface StoredUserData {
  companyUniqueName?: string;
  account?: {
    uniqueName: string;
    name: string;
  };
  email?: string;
  vendorContactUniqueName?: string;
}

export function getUserDataFromStorage(): StoredUserData | null {
  if (typeof window === "undefined") return null;

  try {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    logger.error("Error parsing userData from localStorage", error);
    return null;
  }
}

export function getCompanyAndAccountNames(
  companyUniqueNameFromRedux?: string | null,
  accountUniqueNameFromRedux?: string | null
): {
  companyUniqueName: string | undefined;
  accountUniqueName: string | undefined;
} {
  let companyUniqueName = companyUniqueNameFromRedux || undefined;
  let accountUniqueName = accountUniqueNameFromRedux || undefined;

  if (!companyUniqueName || !accountUniqueName) {
    const userData = getUserDataFromStorage();
    if (userData) {
      companyUniqueName = companyUniqueName || userData.companyUniqueName;
      accountUniqueName = accountUniqueName || userData.account?.uniqueName;
    }
  }

  return { companyUniqueName, accountUniqueName };
}
