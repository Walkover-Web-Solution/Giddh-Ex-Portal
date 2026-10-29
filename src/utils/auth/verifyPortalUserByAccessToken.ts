import axios from "axios";
import { PROXY_API_PATHS } from "@/constants/apiPaths";
import { getConfig } from "@/config";
import type { VerifyPortalUserResponse } from "@/utils/proxy/types";

export type VerifyPortalUserProvider = "google" | "otp";

export const verifyPortalUserByAccessToken = async (
  accessToken: string,
  subDomain: string,
  provider: VerifyPortalUserProvider,
  country?: string,
  emailId?: string
): Promise<VerifyPortalUserResponse> => {
  const config = getConfig();
  const rawUrl = country === "uk" ? config.API_URL_UK : config.API_URL;
  const baseUrl = rawUrl.replace(/\/$/, "");
  const url = `${baseUrl}/${PROXY_API_PATHS.VERIFY_PORTAL_USER}`;

  const response = await axios.post<VerifyPortalUserResponse>(
    url,
    {
      ...(provider === "otp" ? { otpAccessToken: accessToken } : { accessToken }),
      subDomain,
      ...(emailId ? { emailId } : {}),
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  return response.data;
};
