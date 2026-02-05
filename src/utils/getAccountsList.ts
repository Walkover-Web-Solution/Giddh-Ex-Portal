import { apiClient } from "@/lib/apiClient";
import { API_PATHS } from "@/constants/apiPaths";

export interface Account {
  name: string;
  uniqueName: string;
  email?: string;
}

export interface AccountsListResponse {
  status: string;
  body: Account[];
}

export default async function getAccountsList(
  companyUniqueName: string,
  accountUniqueName: string
): Promise<AccountsListResponse> {
  const response = await apiClient.get(API_PATHS.contacts(companyUniqueName, accountUniqueName));
  return response.data;
}
