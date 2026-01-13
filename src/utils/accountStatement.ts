import { apiClient } from "@/lib/apiClient";

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
  sort: "asc" | "desc";
}

export async function getAccountStatement(
  request: AccountStatementRequest
): Promise<AccountStatementResponse> {
  const response = await apiClient.get(
    `/portal/company/${encodeURIComponent(request.companyUniqueName)}/accounts/${encodeURIComponent(request.accountUniqueName)}/view-statement?page=${request.page}&count=${request.count}&from=${request.from}&to=${request.to}&sort=${request.sort}`
  );
  return response.data;
}

export async function downloadAccountStatement(
  request: AccountStatementRequest
): Promise<{ status: string; body: { data: string; type: string; name: string } }> {
  const response = await apiClient.get(
    `/portal/company/${encodeURIComponent(request.companyUniqueName)}/accounts/${encodeURIComponent(request.accountUniqueName)}/export-account-statement?page=${request.page}&count=${request.count}&from=${request.from}&to=${request.to}&sort=${request.sort}`
  );
  return response.data;
}

export function formatCurrency(amount: number, currencySymbol: string = "₹"): string {
  return `${currencySymbol}${Math.abs(amount).toLocaleString("en-IN")}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export function convertDateToAPIFormat(date: Date): string {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}
