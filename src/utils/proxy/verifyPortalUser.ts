import axios from "axios";
import { PROXY_API_PATHS } from "@/constants/apiPaths";
import type { VerifyPortalUserResponse } from "./types";

export const verifyPortalUser = async (
  emailId: string,
  subDomain: string,
  token: string
): Promise<VerifyPortalUserResponse> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";
  const url = `${baseUrl}/${PROXY_API_PATHS.VERIFY_PORTAL_USER}`;

  const response = await axios.post<VerifyPortalUserResponse>(
    url,
    {
      emailId,
      subDomain,
    },
    {
      headers: {
        proxy_auth_token: token,
      },
    }
  );

  console.log("⚡️ ~ verifyPortalUser ~ response:", response.data);

  return response.data;
};
