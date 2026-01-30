import { apiClient } from "@/lib/apiClient";
import { API_PATHS } from "@/constants/apiPaths";
import { SortOrder } from "@/constants/sort";
import { formatDateToAPI as formatDateToAPIUtil, formatDateDisplay } from "@/utils/dateUtils";

export interface BalanceAmount {
  amount: number;
  type: "DEBIT" | "CREDIT";
}

export interface Address {
  address: string;
  stateName: string;
  countryName: string;
  pinCode: string;
  taxType: string;
  taxNumber: string;
  email: string;
  mobileNo: string;
}

export interface Currency {
  code: string;
  symbol: string;
}

export interface AccountAddress extends Address {
  currency: Currency;
}

export interface AccountSummary {
  openingBalance: BalanceAmount;
  debitTotal: number;
  creditTotal: number;
  closingBalance: BalanceAmount;
}

export interface Transaction {
  date: string;
  voucherType: string;
  voucherNumber: string;
  voucherAmount: BalanceAmount;
  closingBalance: BalanceAmount;
}

export interface AccountStatementResponse {
  status: string;
  body: {
    accountName: string;
    companyName: string;
    fromDate: string;
    toDate: string;
    accountAddress: AccountAddress;
    companyGstAddress: Address;
    accountSummary: AccountSummary;
    transactionDetailList: Transaction[];
    totalItems: number;
  };
}

export interface AccountStatementRequest {
  companyUniqueName: string;
  accountUniqueName: string;
  page: number;
  count: number;
  from: string;
  to: string;
  sort: SortOrder;
}

export async function getAccountStatement(
  request: AccountStatementRequest
): Promise<AccountStatementResponse> {
  const response = await apiClient.get(
    API_PATHS.viewStatement(
      request.companyUniqueName,
      request.accountUniqueName,
      request.page,
      request.count,
      request.from,
      request.to,
      request.sort
    )
  );
  return response.data;
}

export type ExportFormat = "pdf" | "xls";

export async function downloadAccountStatement(
  request: AccountStatementRequest,
  fileType: ExportFormat = "pdf"
): Promise<{ status: string; body: { data: string; type: string; name: string } }> {
  const response = await apiClient.get(
    API_PATHS.exportAccountStatement(
      request.companyUniqueName,
      request.accountUniqueName,
      request.page,
      request.count,
      request.from,
      request.to,
      request.sort,
      fileType
    )
  );
  return response.data;
}

export function formatCurrency(amount: number, currencySymbol: string = "₹"): string {
  return `${currencySymbol}${Math.abs(amount).toLocaleString("en-IN")}`;
}

/** Format date string for display (dd-MM-yyyy). Re-exported from dateUtils. */
export const formatDate = formatDateDisplay;

/** Format Date for API (dd-MM-yyyy). Re-exported from dateUtils. */
export const convertDateToAPIFormat = formatDateToAPIUtil;
