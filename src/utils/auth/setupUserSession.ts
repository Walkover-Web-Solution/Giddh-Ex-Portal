import { setSessionCookie } from "@/utils/cookies";
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

  localStorage.setItem("userEmail", email);
  localStorage.setItem(
    "userData",
    JSON.stringify({
      ...fullUserData,
      companyUniqueName,
      company,
      country,
    })
  );
}
