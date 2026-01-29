import { apiClient } from "@/lib/apiClient";
import { API_PATHS } from "@/constants/apiPaths";
import type { CompanyDetailsResponse, CompanyInfo, UserCompanyData } from "@/types/company";

export type { CompanyDetailsResponse, CompanyInfo, UserCompanyData } from "@/types/company";

export default async function getCompanyDetails(
  companyUniqueName: string,
  accountUniqueName: string
): Promise<CompanyDetailsResponse> {
  const response = await apiClient.get(
    API_PATHS.companyDetails(companyUniqueName, accountUniqueName)
  );
  return response.data;
}
