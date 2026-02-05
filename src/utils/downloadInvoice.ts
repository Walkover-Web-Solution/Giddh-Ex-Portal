import { apiClient } from "@/lib/apiClient";
import { API_PATHS } from "@/constants/apiPaths";

export interface DownloadInvoiceResponse {
  status: string;
  body: string;
}

export default async function downloadInvoice(
  companyUniqueName: string,
  accountUniqueName: string,
  voucherUniqueName: string
): Promise<DownloadInvoiceResponse> {
  const response = await apiClient.post(
    API_PATHS.downloadFileBase(companyUniqueName, accountUniqueName),
    [voucherUniqueName],
    {
      params: {
        voucherVersion: 2,
        fileType: "base64",
      },
    }
  );
  return response.data;
}
