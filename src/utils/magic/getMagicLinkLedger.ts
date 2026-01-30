import axios from "axios";
import { getConfig } from "@/config";

export interface LedgerTransaction {
  particular: {
    name: string;
    uniqueName: string;
  };
  amount: number;
  type: "DEBIT" | "CREDIT";
  entryDate: string;
  voucherNumber?: string;
  voucherName?: string;
  voucherUniqueName?: string;
  voucherGenerated?: boolean;
  entryUniqueName?: string;
  currencyCode?: string;
  currencySymbol?: string;
  convertedCurrencyCode?: string;
  convertedCurrencySymbol?: string;
  convertedAmount?: number;
  companyCurrencyCode?: string;
  companyCurrencySymbol?: string;
  closing?: {
    amount: number;
    convertedAmount?: number;
    type: "DEBIT" | "CREDIT";
  };
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
      forwardedBalance?: {
        amount: number;
        type: "DEBIT" | "CREDIT";
        description?: string;
      };
      debitTransactions: LedgerTransaction[];
      creditTransactions: LedgerTransaction[];
      debitCreditTransactions?: LedgerTransaction[];
      from: string;
      to: string;
    };
  };
  message?: string;
}

export interface GetMagicLinkLedgerRequest {
  linkId: string;
  sort?: "asc" | "desc";
  viewMode?: "statement" | "t";
  from?: string;
  to?: string;
}

export const getMagicLinkLedger = async (
  request: GetMagicLinkLedgerRequest
): Promise<MagicLinkLedgerResponse> => {
  try {
    const config = getConfig();
    const baseURL = config.GIDDH_API_URL;

    const url = `${baseURL}/magic-link-ledger/${request.linkId}`;
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    const params: Record<string, string> = {
      sort: request.sort || "asc",
      ledgerView: request.viewMode === "t" ? "T_VIEW" : "STATEMENT_VIEW",
    };

    // Add date parameters if provided
    if (request.from) {
      params.from = request.from;
    }
    if (request.to) {
      params.to = request.to;
    }

    const response = await axios.get(url, {
      params,
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        origin,
        referer: origin ? `${origin}/` : "",
      },
    });

    return response.data as MagicLinkLedgerResponse;
  } catch (error: any) {
    return {
      status: "error",
      message: error.response?.data?.message || "Failed to fetch ledger data",
    };
  }
};
