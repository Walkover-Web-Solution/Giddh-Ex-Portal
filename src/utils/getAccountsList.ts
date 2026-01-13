import { apiClient } from "@/lib/apiClient";

export interface Account {
  name: string;
  uniqueName: string;
}

export interface AccountsListResponse {
  status: string;
  body: Account[];
}

export default async function getAccountsList(
  companyUniqueName: string,
  accountUniqueName: string
): Promise<AccountsListResponse> {
  const response = await apiClient.get(
    `/portal/company/${companyUniqueName}/accounts/${accountUniqueName}/contacts`
  );
  return response.data;
}
