import { deleteSessionCookie } from "./cookies";
import { userDataStorageKey, userEmailStorageKey } from "./getUserDataFromStorage";

export const logoutCompany = (companySlug: string) => {
  if (companySlug) {
    deleteSessionCookie(companySlug);
  }
  if (typeof window !== "undefined" && companySlug) {
    localStorage.removeItem(userDataStorageKey(companySlug));
    localStorage.removeItem(userEmailStorageKey(companySlug));
  }
};
