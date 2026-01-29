import axios from "axios";
import { LedgerView, LedgerTransactionType, MagicLinkViewMode } from "@/constants/ledger";
import { SortOrder } from "@/constants/sort";
import { config } from "@/config";

export interface LedgerTransaction {
  particular: {
    name: string;
    uniqueName: string;
  };
  amount: number;
  type: LedgerTransactionType;
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
    type: LedgerTransactionType;
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
        type: LedgerTransactionType;
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
  sort?: SortOrder;
  viewMode?: MagicLinkViewMode;
  from?: string;
  to?: string;
}

export const getMagicLinkLedger = async (
  request: GetMagicLinkLedgerRequest
): Promise<MagicLinkLedgerResponse> => {
  try {
    const baseURL = config.NEXT_PUBLIC_GIDDH_API_URL;

    const pathLinkId = encodeURIComponent(request.linkId);
    const basePath = `${baseURL}/magic-link-ledger/${pathLinkId}`;
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    const queryParts: string[] = [
      `sort=${encodeURIComponent(request.sort ?? SortOrder.ASC)}`,
      `ledgerView=${encodeURIComponent(
        request.viewMode === MagicLinkViewMode.T ? LedgerView.T_VIEW : LedgerView.STATEMENT_VIEW
      )}`,
    ];
    if (request.from) {
      queryParts.push(`from=${encodeURIComponent(request.from)}`);
    }
    if (request.to) {
      queryParts.push(`to=${encodeURIComponent(request.to)}`);
    }
    const url = `${basePath}?${queryParts.join("&")}`;

    const response = await axios.get(url, {
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
