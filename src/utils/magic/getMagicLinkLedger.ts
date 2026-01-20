import axios from "axios";

export interface LedgerTransaction {
  particular: {
    name: string;
    uniqueName: string;
    parentGroups: any[];
  };
  amount: number;
  type: "DEBIT" | "CREDIT";
  entryDate: string;
  voucherNumber?: string;
  currencyCode?: string;
  currencySymbol?: string;
  convertedCurrencyCode?: string;
  convertedCurrencySymbol?: string;
  convertedAmount?: number;
  [key: string]: any;
}

export interface MagicLinkLedgerResponse {
  status: "success" | "error";
  body?: {
    account: {
      name: string;
      uniqueName: string;
    };
    companyName: string;
    ledgersTransactions: {
      page: number;
      count: number;
      totalPages: number;
      totalItems: number;
      debitTransactionsCount: number;
      creditTransactionsCount: number;
      closingBalanceForBank: {
        amount: number;
        type: "DEBIT" | "CREDIT";
      };
      debitTransactions: LedgerTransaction[];
      creditTransactions: LedgerTransaction[];
      from: string;
      to: string;
    };
  };
  message?: string;
}

export interface GetMagicLinkLedgerRequest {
  linkId: string;
  sort?: "asc" | "desc";
}

export const getMagicLinkLedger = async (
  request: GetMagicLinkLedgerRequest
): Promise<MagicLinkLedgerResponse> => {
  try {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "https://api.giddh.com";
    const url = `${baseURL}/magic-link-ledger/${request.linkId}`;
    const params = request.sort ? { sort: request.sort } : {};

    const response = await axios.get(url, {
      params,
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        origin: typeof window !== "undefined" ? window.location.origin : "",
        referer: typeof window !== "undefined" ? window.location.origin + "/" : "",
      },
    });

    // API already returns { status, body } structure
    // response.data is { status: "success", body: {...} }
    return response.data as MagicLinkLedgerResponse;
  } catch (error: any) {
    console.error("Error fetching magic link ledger:", error);
    return {
      status: "error",
      message: error.response?.data?.message || "Failed to fetch ledger data",
    };
  }
};
