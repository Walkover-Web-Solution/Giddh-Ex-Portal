import axios from "axios";
import { PROXY_API_PATHS } from "@/constants/apiPaths";
import type { VerifyPortalUserResponse } from "./types";
import { getConfig } from "@/config";

export const verifyPortalUser = async (
  emailId: string,
  subDomain: string,
  token: string,
  country?: string
): Promise<VerifyPortalUserResponse> => {
  const config = getConfig();
  const rawUrl = country === "uk" ? config.API_URL_UK : config.API_URL;
  const baseUrl = rawUrl.replace(/\/$/, "");
  const url = `${baseUrl}/${PROXY_API_PATHS.VERIFY_PORTAL_USER}`;

  const response = await axios.post<VerifyPortalUserResponse>(
    url,
    {
      emailId,
      subDomain,
    },
    {
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        proxy_auth_token: token,
      },
    }
  );

  return response.data;
};
