import { setSessionCookie } from "@/utils/cookies";
import { userDataStorageKey, userEmailStorageKey } from "@/utils/getUserDataFromStorage";
import { setUserData, setAccount } from "@/store/slices/companySlice";
import type { Account, UserData } from "@/types/auth";
import type { AppDispatch } from "@/store/store";

interface SetupSessionParams {
  company: string;
  country: string;
  email: string;
  account: Account["account"];
  vendorContactUniqueName: string;
  companyUniqueName: string;
  sessionId: string;
  dispatch: AppDispatch;
}

export async function setupUserSession({
  company,
  country,
  email,
  account,
  vendorContactUniqueName,
  companyUniqueName,
  sessionId,
  dispatch,
}: SetupSessionParams) {
  const fullUserData: UserData = {
    email,
    account,
    vendorContactUniqueName,
  };

  setSessionCookie(company, sessionId);

  dispatch(
    setUserData({
      companyName: company,
      userData: fullUserData,
      companyUniqueName,
    })
  );

  dispatch(
    setAccount({
      companyName: company,
      accountUniqueName: account.uniqueName,
    })
  );

  localStorage.setItem(userEmailStorageKey(company), email);
  localStorage.setItem(
    userDataStorageKey(company),
    JSON.stringify({
      ...fullUserData,
      companyUniqueName,
      company,
      country,
    })
  );

  localStorage.removeItem("userData");
  localStorage.removeItem("userEmail");
}
