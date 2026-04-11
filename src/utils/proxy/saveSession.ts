import axios from "axios";
import { PROXY_API_PATHS } from "@/constants/apiPaths";
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
  subDomain: string,
  country?: string
): Promise<SaveSessionResponse> => {
  const config = getConfig();
  const rawUrl = country === "uk" ? config.API_URL_UK : config.API_URL;
  const baseUrl = rawUrl.replace(/\/$/, "");

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
