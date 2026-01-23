import axios from "axios";
import { config } from "@/config";

interface SaveSessionRequest {
  account: {
    name: string;
    uniqueName: string;
  };
  vendorContactUniqueName: string;
  proxyAuthToken: string;
  subDomain: string;
}

interface SaveSessionResponse {
  status: string;
  body: {
    companyUniqueName: string;
    session: {
      id: string;
      createAt: string;
      expiresAt: string;
    };
  };
}

export const savePortalSession = async (
  account: { name: string; uniqueName: string },
  vendorContactUniqueName: string,
  proxyAuthToken: string,
  subDomain: string
): Promise<SaveSessionResponse> => {
  const baseUrl = config.NEXT_PUBLIC_API_URL.replace(/\/$/, "");

  const requestBody: SaveSessionRequest = {
    account,
    vendorContactUniqueName,
    proxyAuthToken,
    subDomain,
  };

  const response = await axios.post<SaveSessionResponse>(
    `${baseUrl}/v2/portal-user/save-session`,
    requestBody
  );

  console.log("⚡️ ~ savePortalSession ~ response:", response.data);

  return response.data;
};
