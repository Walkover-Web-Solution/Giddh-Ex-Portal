import { apiClient } from "@/lib/apiClient";

export default async function getBalanceSummary(companyUniqueName: string, uniqueName: string) {
  const response = await apiClient.get(
    `/portal/company/${companyUniqueName}/accounts/${uniqueName}/vouchers/balance-summary`,
    {
      params: {
        voucherVersion: 2,
      },
    }
  );
  return response.data;
}
