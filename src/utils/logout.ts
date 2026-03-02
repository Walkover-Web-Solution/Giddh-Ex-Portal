import { deleteSessionCookie } from "./cookies";

/** Keys cleared on logout so session-expired modal and re-login flow behave correctly. */
const AUTH_STORAGE_KEYS = ["proxy_auth_token", "userEmail", "userData"] as const;

export const logoutCompany = (companyUniqueName: string) => {
  if (companyUniqueName) {
    deleteSessionCookie(companyUniqueName);
  }
  if (typeof window !== "undefined") {
    AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  }
};
