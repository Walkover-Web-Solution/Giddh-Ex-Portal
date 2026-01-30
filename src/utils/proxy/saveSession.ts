import axios from "axios";
import { getConfig } from "@/config";

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
  const config = getConfig();
  const baseUrl = config.API_URL.replace(/\/$/, "");

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
