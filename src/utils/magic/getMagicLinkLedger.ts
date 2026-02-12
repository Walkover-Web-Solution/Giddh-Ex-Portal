import axios from "axios";
import { getConfig } from "@/config";
import { GIDDH_MAGIC_LINK_PATHS } from "@/constants/apiPaths";
import { LedgerView, LedgerTransactionType } from "@/constants/ledger";
import { SortOrder } from "@/constants/sort";

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
  inventory?: {
    stock?: {
      name: string;
    };
  };
  attachedFileName?: string;
  attachedFileUniqueName?: string;
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
      totalItems?: number;
      totalPages?: number;
      page?: number;
      count?: number;
      creditTransactionsCount?: number;
      debitTransactionsCount?: number;
    };
  };
  message?: string;
}

export interface GetMagicLinkLedgerRequest {
  linkId: string;
  sort?: SortOrder;
  viewMode?: LedgerView;
  from?: string;
  to?: string;
  page?: number;
  count?: number;
}

export const getMagicLinkLedger = async (
  request: GetMagicLinkLedgerRequest
): Promise<MagicLinkLedgerResponse> => {
  try {
    const config = getConfig();
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    const queryParts: string[] = [
      `sort=${encodeURIComponent(request.sort ?? SortOrder.ASC)}`,
      `ledgerView=${encodeURIComponent(
        request.viewMode === LedgerView.T_VIEW ? LedgerView.T_VIEW : LedgerView.STATEMENT_VIEW
      )}`,
    ];
    if (request.from) {
      queryParts.push(`from=${encodeURIComponent(request.from)}`);
    }
    if (request.to) {
      queryParts.push(`to=${encodeURIComponent(request.to)}`);
    }
    if (request.page != null) {
      queryParts.push(`page=${request.page}`);
    }
    if (request.count != null) {
      queryParts.push(`count=${request.count}`);
    }
    const url = `${config.GIDDH_API_URL}${GIDDH_MAGIC_LINK_PATHS.ledger(request.linkId)}?${queryParts.join("&")}`;

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
    const data = error.response?.data;
    const code = data?.code;
    const apiMessage = data?.message;
    const message =
      code === "NOT_FOUND"
        ? "Magic link not found. The link may be invalid or expired. Please request a new statement link from the account owner."
        : apiMessage || "Failed to fetch ledger data";
    return {
      status: "error",
      message,
    };
  }
};
