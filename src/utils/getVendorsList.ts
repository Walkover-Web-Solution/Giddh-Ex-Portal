import { apiClient } from "@/lib/apiClient";
import { API_PATHS } from "@/constants/apiPaths";
import type { Account } from "@/types/auth";

export interface VendorsListResponse {
  status: string;
  body: Account[];
}

export default async function getVendorsList(companyUniqueName: string,emailId:string,accountUniqueName:string): Promise<VendorsListResponse> {
  const response = await apiClient.get(API_PATHS.vendorsList(companyUniqueName,accountUniqueName),
    {
       params: {
       emailId:emailId
      }
    }
    
    );
  return response.data;
}
