import axios from "axios";
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

  const response = await axios.get<ProxyDetailsResponse>(`${baseUrl}/api/c/getDetails`, {
    headers: {
      proxy_auth_token: proxyAuthToken,
    },
  });

  return response.data;
};
