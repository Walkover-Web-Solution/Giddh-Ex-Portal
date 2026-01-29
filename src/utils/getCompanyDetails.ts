import { apiClient } from "@/lib/apiClient";
import { API_PATHS } from "@/constants/apiPaths";

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
    API_PATHS.companyDetails(companyUniqueName, accountUniqueName)
  );
  return response.data;
}
