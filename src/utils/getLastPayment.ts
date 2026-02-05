import { apiClient } from "@/lib/apiClient";
import { API_PATHS } from "@/constants/apiPaths";
import { DEFAULT_PAGE, PAGINATION_LIMIT } from "@/constants";

export interface PaymentVoucher {
  uniqueName: string;
  voucherNumber: string;
  voucherDate: string;
  grandTotal: {
    amountForAccount: number;
  };
  companyCurrencySymbol?: string;
  account?: {
    name: string;
    uniqueName: string;
  };
}

export interface LastPaymentResponse {
  status: string;
  body: {
    items: PaymentVoucher[];
    totalItems: number;
  };
}

export interface GetLastPaymentParams {
  companyUniqueName: string;
  accountUniqueName: string;
  type?: string;
  page?: number;
  count?: number;
  sort?: "" | "asc" | "desc";
  sortBy?: string;
}

export default async function getLastPayment({
  companyUniqueName,
  accountUniqueName,
  type = "receipt",
  page = DEFAULT_PAGE,
  count = PAGINATION_LIMIT,
  sort = "",
  sortBy = "DESC",
}: GetLastPaymentParams): Promise<LastPaymentResponse> {
  const response = await apiClient.post(
    API_PATHS.vouchersGetAll(companyUniqueName, accountUniqueName),
    {},
    {
      params: {
        voucherVersion: 2,
        type,
        page,
        count,
        sort,
        sortBy,
      },
    }
  );
  return response.data;
}
