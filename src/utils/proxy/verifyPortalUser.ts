import axios from "axios";
import type { VerifyPortalUserResponse } from "./types";

export const verifyPortalUser = async (
  emailId: string,
  subDomain: string,
  token: string
): Promise<VerifyPortalUserResponse> => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || "";

  const response = await axios.post<VerifyPortalUserResponse>(
    `${baseUrl}/v2/verify-portal-user`,
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
