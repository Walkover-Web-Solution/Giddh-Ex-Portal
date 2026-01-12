import { deleteSessionCookie } from "./cookies";

export const logoutCompany = (companyUniqueName: string) => {
  if (companyUniqueName) {
    deleteSessionCookie(companyUniqueName);
  }
};
