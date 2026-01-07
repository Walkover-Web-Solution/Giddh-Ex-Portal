import axios from "axios";

interface ProxyDetailsResponse {
  status: string;
  data: Array<{
    email: string;
  }>;
}

export const getDetails = async (proxyAuthToken: string): Promise<ProxyDetailsResponse> => {
  const baseUrl = process.env.NEXT_PUBLIC_PROXY_URL?.replace(/\/$/, "") || "";

  const response = await axios.get<ProxyDetailsResponse>(`${baseUrl}/api/c/getDetails`, {
    headers: {
      proxy_auth_token: proxyAuthToken,
    },
  });
  console.log("⚡️ ~ :18 ~ getDetails ~ response:", response);

  return response.data;
};
