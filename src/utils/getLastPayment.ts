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
  accountCurrencySymbol?: string;
  account?: {
    name: string;
    uniqueName: string;
  };
  invoiceNumber?: string;
  invoiceUniqueName?: string;
  balanceStatus?: string;
}

export interface LastPaymentResponse {
  status: string;
  body: {
    items: PaymentVoucher[];
    totalItems: number;
    totalPages?: number;
    page?: number;
    count?: number;
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
  balanceStatus?: string[];
  uniqueNames?: string[];
}

export default async function getLastPayment({
  companyUniqueName,
  accountUniqueName,
  type = "receipt",
  page = DEFAULT_PAGE,
  count = PAGINATION_LIMIT,
  sort = "desc",
  sortBy = "grandTotal",
  balanceStatus = [],
  uniqueNames = [],
}: GetLastPaymentParams): Promise<LastPaymentResponse> {
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
  const body = response.data?.body;
  const rawItems = (body?.items ?? []) as (PaymentVoucher & {
    referenceVouchers?: Array<{ uniqueName?: string; voucherNumber?: string }>;
    linkedInvoice?: { uniqueName?: string; voucherNumber?: string };
    adjustments?: Array<{ voucherNumber?: string; uniqueName?: string }>;
  })[];
  const items: PaymentVoucher[] = rawItems.map((item) => {
    const ref = item.referenceVouchers?.[0];
    const linked = item.linkedInvoice;
    const firstAdjustment = item.adjustments?.[0];
    return {
      ...item,
      invoiceNumber:
        item.invoiceNumber ??
        ref?.voucherNumber ??
        linked?.voucherNumber ??
        firstAdjustment?.voucherNumber,
      invoiceUniqueName:
        item.invoiceUniqueName ??
        ref?.uniqueName ??
        linked?.uniqueName ??
        firstAdjustment?.uniqueName,
    };
  });
  return {
    ...response.data,
    body: {
      ...body,
      items,
      totalItems: body?.totalItems ?? 0,
      totalPages: body?.totalPages,
      page: body?.page,
      count: body?.count,
    },
  };
}
