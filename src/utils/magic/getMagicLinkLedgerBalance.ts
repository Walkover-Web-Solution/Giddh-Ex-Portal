import axios from "axios";
import { getConfig } from "@/config";
import { GIDDH_MAGIC_LINK_PATHS } from "@/constants/apiPaths";
import type { LedgerTransactionType } from "@/constants/ledger";

/** Balance amount with type (DEBIT/CREDIT) and optional description */
export interface BalanceAmount {
  amount: number;
  type: LedgerTransactionType;
  description?: string;
}

export interface MagicLinkLedgerBalanceBody {
  forwardedBalance: BalanceAmount;
  convertedForwardedBalance: BalanceAmount;
  creditTotal: number;
  convertedCreditTotal: number;
  debitTotal: number;
  convertedDebitTotal: number;
  closingBalance: BalanceAmount;
  convertedClosingBalance: BalanceAmount;
  name: string;
  uniqueName: string;
  currencyCode: string;
  convertedCurrencyCode: string;
  currencySymbol: string;
  convertedCurrencySymbol: string;
}

export interface MagicLinkLedgerBalanceResponse {
  status: "success" | "error";
  body?: MagicLinkLedgerBalanceBody;
  message?: string;
}

export interface GetMagicLinkLedgerBalanceRequest {
  linkId: string;
  q?: string;
  from?: string;
  to?: string;
  accountCurrency?: boolean;
}

/**
 * Fetches ledger balance summary for a magic link.
 * API path: GET {GIDDH_API_URL}/magic-link-ledger-balance/{linkId}
 */
export const getMagicLinkLedgerBalance = async (
  request: GetMagicLinkLedgerBalanceRequest
): Promise<MagicLinkLedgerBalanceResponse> => {
  try {
    const config = getConfig();
    const baseUrl = `${config.GIDDH_API_URL}${GIDDH_MAGIC_LINK_PATHS.ledgerBalance(request.linkId)}`;
    const queryParts: string[] = [];
    if (request.q != null && request.q !== "") {
      queryParts.push(`q=${encodeURIComponent(request.q)}`);
    }
    if (request.from) {
      queryParts.push(`from=${encodeURIComponent(request.from)}`);
    }
    if (request.to) {
      queryParts.push(`to=${encodeURIComponent(request.to)}`);
    }
    if (request.accountCurrency === true) {
      queryParts.push("accountCurrency=true");
    }
    const url = queryParts.length > 0 ? `${baseUrl}?${queryParts.join("&")}` : baseUrl;

    const origin = typeof window !== "undefined" ? window.location.origin : "";

    const response = await axios.get(url, {
      headers: {
        accept: "application/json, text/plain, */*",
        "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
        origin,
        referer: origin ? `${origin}/` : "",
      },
    });

    return response.data as MagicLinkLedgerBalanceResponse;
  } catch (error: any) {
    const data = error.response?.data;
    const code = data?.code;
    const apiMessage = data?.message;
    const message =
      code === "NOT_FOUND"
        ? "Magic link not found. The link may be invalid or expired."
        : apiMessage || "Failed to fetch ledger balance";
    return {
      status: "error",
      message,
    };
  }
};
