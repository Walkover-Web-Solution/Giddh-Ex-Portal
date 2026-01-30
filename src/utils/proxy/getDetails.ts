import axios from "axios";
import { PROXY_API_PATHS } from "@/constants/apiPaths";
import { getConfig } from "@/config";

interface ProxyDetailsResponse {
  status: string;
  data: Array<{
    email: string;
  }>;
}

export const getDetails = async (proxyAuthToken: string): Promise<ProxyDetailsResponse> => {
  const config = getConfig();
  const baseUrl = config.PROXY_URL.replace(/\/$/, "");
  const url = `${baseUrl}/${PROXY_API_PATHS.GET_DETAILS}`;

  const response = await axios.get<ProxyDetailsResponse>(url, {
    headers: {
      proxy_auth_token: proxyAuthToken,
    },
  });

  return response.data;
};
