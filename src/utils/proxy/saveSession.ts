import axios from "axios";
import { PROXY_API_PATHS } from "@/constants/apiPaths";
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

  const url = `${baseUrl}/${PROXY_API_PATHS.SAVE_SESSION}`;
  const response = await axios.post<SaveSessionResponse>(url, requestBody);
  return response.data;
};
