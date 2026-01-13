import { apiClient } from "@/lib/apiClient";

export interface CompanyInfo {
  name: string;
  uniqueName: string;
}

export interface UserCompanyData {
  name: string;
  id: string;
  email: string;
  companies: CompanyInfo[];
  currentCompany: CompanyInfo;
}

export interface CompanyDetailsResponse {
  status: string;
  body: UserCompanyData[];
}

export default async function getCompanyDetails(
  companyUniqueName: string,
  accountUniqueName: string
): Promise<CompanyDetailsResponse> {
  const response = await apiClient.get(
    `/portal/company/${companyUniqueName}/accounts/${accountUniqueName}/get-company-details`
  );
  return response.data;
}
