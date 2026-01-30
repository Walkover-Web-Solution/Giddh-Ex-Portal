import axios from "axios";
import { getConfig } from "@/config";

interface VerifyPortalUserResponse {
  status: string;
  body: Array<{
    email: string;
    account: {
      name: string;
      uniqueName: string;
    };
    vendorContactUniqueName: string;
    companyUniqueName: string;
    session?: {
      id: string;
    };
  }>;
}

export const verifyPortalUser = async (
  emailId: string,
  subDomain: string,
  token: string
): Promise<VerifyPortalUserResponse> => {
  const config = getConfig();
  const baseUrl = config.API_URL.replace(/\/$/, "");

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
