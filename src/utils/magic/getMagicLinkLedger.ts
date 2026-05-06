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
    balanceDecimalPlaces?: number;
    balanceDisplayFormat?: string;
    currencyDisplayFormat?: string;
    ledgerView?: string | null;
    prevToken?: string | null;
    nextToken?: string | null;
    page?: number;
    totalPages?: number;
    totalItems?: number;
    count?: number;
    ledgersTransactions: {
      forwardedBalance?: {
        amount: number;
        type: LedgerTransactionType;
        description?: string;
      };
      convertedForwardedBalance?: {
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
      prevToken?: string | null;
      nextToken?: string | null;
      creditTransactionsCount?: number;
      debitTransactionsCount?: number;
      ledgerView?: string | null;
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
  paginationToken?: string | null;
  reversePage?: boolean;
  q?: string;
  accountCurrency?: boolean;
}

export const getMagicLinkLedger = async (
  request: GetMagicLinkLedgerRequest
): Promise<MagicLinkLedgerResponse> => {
  try {
    const config = getConfig();
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    const queryParts: string[] = [`sort=${encodeURIComponent(request.sort ?? SortOrder.ASC)}`];
    if (request.viewMode != null) {
      queryParts.push(`ledgerView=${encodeURIComponent(request.viewMode)}`);
    }
    if (request.from) {
      queryParts.push(`from=${encodeURIComponent(request.from)}`);
    }
    if (request.to) {
      queryParts.push(`to=${encodeURIComponent(request.to)}`);
    }
    if (request.paginationToken) {
      queryParts.push(`token=${encodeURIComponent(request.paginationToken)}`);
      if (request.reversePage) {
        queryParts.push("reversePage=true");
      }
    } else if (request.page != null) {
      queryParts.push(`page=${request.page}`);
    }
    if (request.count != null) {
      queryParts.push(`count=${request.count}`);
    }
    if (request.q != null && request.q !== "") {
      queryParts.push(`q=${encodeURIComponent(request.q)}`);
    }
    if (request.accountCurrency !== undefined) {
      queryParts.push(`accountCurrency=${request.accountCurrency}`);
    }
    const url = `${config.GIDDH_API_URL}${GIDDH_MAGIC_LINK_PATHS.ledger(request.linkId)}?${queryParts.join("&")}`;

    const headers: Record<string, string> = {
      accept: "application/json, text/plain, */*",
      "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
      origin,
      referer: origin ? `${origin}/` : "",
    };
    if (request.paginationToken) {
      headers["token"] = request.paginationToken;
    }

    const response = await axios.get(url, { headers });

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
