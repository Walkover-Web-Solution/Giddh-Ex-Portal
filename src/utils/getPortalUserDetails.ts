import { apiClient } from "@/lib/apiClient";

export interface PortalUserDetailsResponse {
  status: string;
  body: Record<string, any>;
}

export default async function getPortalUserDetails(
  companyUniqueName: string,
  accountUniqueName: string,
  vendorUniqueName: string
): Promise<PortalUserDetailsResponse> {
  const response = await apiClient.get(
    `/portal/company/${companyUniqueName}/accounts/${accountUniqueName}/vendor-contact/${vendorUniqueName}`
  );
  return response.data;
}
