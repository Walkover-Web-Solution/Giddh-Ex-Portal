import { apiClient } from "@/lib/apiClient";
import { API_PATHS } from "@/constants/apiPaths";
import { DEFAULT_PAGE, PAGINATION_LIMIT } from "@/constants";

export interface InvoiceVoucher {
  uniqueName: string;
  voucherNumber: string;
  voucherDate: string;
  grandTotal: {
    amountForAccount: number;
  };
  balanceStatus: string;
  dueDate?: string;
  overdueDays?: string;
  paymentInfo?: {
    paymentStatus: string;
  };
  companyCurrencySymbol?: string;
}

export interface InvoiceListResponse {
  status: string;
  body: {
    items: InvoiceVoucher[];
    totalItems: number;
    page: number;
    count: number;
  };
}

export interface GetInvoiceListParams {
  companyUniqueName: string;
  accountUniqueName: string;
  type?: string;
  page?: number;
  count?: number;
  sort?: "" | "asc" | "desc";
  sortBy?: string;
  balanceStatus?: string[];
  uniqueNames?: string[];
}

export default async function getInvoiceList({
  companyUniqueName,
  accountUniqueName,
  type = "sales",
  page = DEFAULT_PAGE,
  count = PAGINATION_LIMIT,
  sort = "",
  sortBy = "voucherDate",
  balanceStatus = [],
  uniqueNames = [],
}: GetInvoiceListParams): Promise<InvoiceListResponse> {
  const response = await apiClient.post(
    API_PATHS.vouchersGetAll(companyUniqueName, accountUniqueName),
    {
      companyUniqueName,
      accountUniqueName,
      balanceStatus,
      uniqueNames,
    },
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
