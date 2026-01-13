import { apiClient } from "@/lib/apiClient";

export interface AccountAddress {
  gstNumber: string;
  address: string;
  stateCode: string;
  pincode: string;
  state: {
    stateGstCode: string;
    name: string;
    code: string;
  };
}

export interface AccountDetailsResponse {
  status: string;
  body: {
    name: string;
    email: string;
    countryName: string;
    addresses: AccountAddress[];
    attentionTo: string;
    mobileNo: string;
  };
}

export default async function getAccountDetails(
  companyUniqueName: string,
  accountUniqueName: string
): Promise<AccountDetailsResponse> {
  const response = await apiClient.get(
    `/portal/company/${companyUniqueName}/accounts/${accountUniqueName}/details`
  );
  return response.data;
}
