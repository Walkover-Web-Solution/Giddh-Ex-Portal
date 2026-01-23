import axios from "axios";
import { config } from "@/config";

interface ProxyDetailsResponse {
  status: string;
  data: Array<{
    email: string;
  }>;
}

export const getDetails = async (proxyAuthToken: string): Promise<ProxyDetailsResponse> => {
  const baseUrl = config.NEXT_PUBLIC_PROXY_URL.replace(/\/$/, "");

  const response = await axios.get<ProxyDetailsResponse>(`${baseUrl}/api/c/getDetails`, {
    headers: {
      proxy_auth_token: proxyAuthToken,
    },
  });

  return response.data;
};
