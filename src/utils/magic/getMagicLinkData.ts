import {
  BALANCE_TYPE_CR,
  BALANCE_TYPE_DR,
  LEDGER_TYPE_DEBIT,
  LedgerEntryType,
  LedgerView,
} from "@/constants/ledger";
import { parseDateToTimestamp } from "@/utils/dateUtils";
import {
  getMagicLinkLedger,
  GetMagicLinkLedgerRequest,
  LedgerTransaction,
} from "./getMagicLinkLedger";
import { Transaction, CurrencyData, CurrencyInfo } from "@/components/magic/types";
import {
  transformLedgerTransactionToDisplay,
  formatParticularWithPrefix,
} from "./transformLedgerTransaction";
import { getForwardedBalanceParticular, BalanceSide } from "./forwardedBalanceLabels";

export interface MagicLinkData {
  transactions: Transaction[];
  debitCreditTransactions?: LedgerTransaction[];
  debitTransactions?: LedgerTransaction[];
  creditTransactions?: LedgerTransaction[];
  forwardedBalance?: {
    amount: number;
    type: "DEBIT" | "CREDIT";
    description?: string;
  };
  companyName: string;
  accountName: string;
  currencyData: CurrencyData;
  defaultCurrency: string;
  dateRange: {
    from: string;
    to: string;
  };
  apiTotalItems?: number;
  apiTotalPages?: number;
  apiPage?: number;
  apiCount?: number;
  apiDebitTransactionsCount?: number;
  apiCreditTransactionsCount?: number;
  apiPrevToken?: string | null;
  apiNextToken?: string | null;
  inferredView?: LedgerView;
}

export interface GetMagicLinkDataResult {
  success: boolean;
  data?: MagicLinkData;
  error?: string;
}

/**
 * Fetches and transforms magic link ledger data into a structured format
 * @param request - Request parameters for fetching the magic link ledger
 * @param viewMode - View mode: "statement" uses debitCreditTransactions, "t" uses separate debit/credit arrays
 * @returns Structured data ready to use in the magic page
 */
export const getMagicLinkData = async (
  request: GetMagicLinkLedgerRequest,
  viewMode?: LedgerView
): Promise<GetMagicLinkDataResult> => {
  try {
    const response = await getMagicLinkLedger({ ...request, viewMode });

    if (response.status !== "success" || !response.body?.ledgersTransactions) {
      return {
        success: false,
        error: response.message || "Failed to load ledger data",
      };
    }

    const lt = response.body.ledgersTransactions;
    const { debitTransactions, creditTransactions, debitCreditTransactions } = lt;
    const bodyWithView = response.body as typeof response.body & { ledgerView?: string | null };
    const ltWithView = lt as typeof lt & { ledgerView?: string | null };

    const apiLedgerView =
      (bodyWithView.ledgerView ?? ltWithView.ledgerView)?.trim().toUpperCase() || null;
    const viewFromApi =
      apiLedgerView === LedgerView.STATEMENT_VIEW
        ? LedgerView.STATEMENT_VIEW
        : apiLedgerView === LedgerView.T_VIEW
          ? LedgerView.T_VIEW
          : undefined;

    const hasStatementData = (debitCreditTransactions?.length ?? 0) > 0;
    const hasTViewData =
      (debitTransactions?.length ?? 0) > 0 || (creditTransactions?.length ?? 0) > 0;
    const inferredViewFromData = hasStatementData
      ? LedgerView.STATEMENT_VIEW
      : hasTViewData
        ? LedgerView.T_VIEW
        : undefined;

    const inferredView = viewMode == null ? (viewFromApi ?? inferredViewFromData) : undefined;
    const effectiveViewMode = viewMode ?? inferredView;

    const firstTransaction =
      (effectiveViewMode === LedgerView.STATEMENT_VIEW && debitCreditTransactions?.[0]) ||
      debitTransactions?.[0] ||
      creditTransactions?.[0];

    const transactionCurrency: CurrencyInfo = {
      code: firstTransaction?.currencyCode ?? "",
      symbol: firstTransaction?.currencySymbol ?? "",
    };

    const convertedCurrency: CurrencyInfo = {
      code: firstTransaction?.convertedCurrencyCode || firstTransaction?.currencyCode || "INR",
      symbol: firstTransaction?.convertedCurrencySymbol || firstTransaction?.currencySymbol || "₹",
    };

    const companyCurrency: CurrencyInfo = {
      code: firstTransaction?.companyCurrencyCode || firstTransaction?.currencyCode || "INR",
      symbol: firstTransaction?.companyCurrencySymbol || firstTransaction?.currencySymbol || "₹",
    };

    const currencyData: CurrencyData = {
      transactionCurrency,
      convertedCurrency,
      companyCurrency,
    };

    let apiTransactions: Transaction[] = [];

    if (
      effectiveViewMode === LedgerView.STATEMENT_VIEW &&
      debitCreditTransactions &&
      debitCreditTransactions.length > 0
    ) {
      // Transform with original tx reference included for download functionality
      apiTransactions = debitCreditTransactions.map((tx: LedgerTransaction) =>
        transformLedgerTransactionToDisplay(tx, true)
      );

      const forwardedBalance = response.body.ledgersTransactions.forwardedBalance;
      const convertedForwarded = response.body.ledgersTransactions.convertedForwardedBalance;
      if (forwardedBalance) {
        const isCredit = forwardedBalance.type === LedgerEntryType.CREDIT;
        const convertedAmount = convertedForwarded?.amount ?? forwardedBalance.amount;
        apiTransactions.unshift({
          date: response.body.ledgersTransactions.from || apiTransactions[0]?.date || "",
          particular: getForwardedBalanceParticular(
            forwardedBalance.description,
            BalanceSide.DEBIT
          ),
          debit: isCredit ? null : forwardedBalance.amount,
          debitConverted: isCredit ? null : convertedAmount,
          credit: isCredit ? forwardedBalance.amount : null,
          creditConverted: isCredit ? convertedAmount : null,
          closingBalance: forwardedBalance.amount,
          closingBalanceConverted: convertedAmount,
          balanceType:
            forwardedBalance.type === LEDGER_TYPE_DEBIT ? BALANCE_TYPE_DR : BALANCE_TYPE_CR,
        });
      }
    } else {
      const getConvertedAmount = (tx: any) =>
        tx.convertedCurrencyCode && tx.convertedCurrencyCode !== tx.currencyCode
          ? (tx.convertedAmount ?? null)
          : null;

      const allTransactions: Partial<Transaction>[] = [
        ...(debitTransactions || []).map((tx) => ({
          date: tx.entryDate,
          particular: formatParticularWithPrefix(tx.particular.name, tx.type),
          debit: tx.amount,
          debitConverted: getConvertedAmount(tx),
          credit: null,
          creditConverted: null,
          voucherGenerated: tx.voucherGenerated,
          voucherNumber: tx.voucherNumber,
          voucherName: tx.voucherName,
          voucherUniqueName: tx.voucherUniqueName,
          entryUniqueName: tx.entryUniqueName,
        })),
        ...(creditTransactions || []).map((tx) => ({
          date: tx.entryDate,
          particular: formatParticularWithPrefix(tx.particular.name, tx.type),
          debit: null,
          debitConverted: null,
          credit: tx.amount,
          creditConverted: getConvertedAmount(tx),
          voucherGenerated: tx.voucherGenerated,
          voucherNumber: tx.voucherNumber,
          voucherName: tx.voucherName,
          voucherUniqueName: tx.voucherUniqueName,
          entryUniqueName: tx.entryUniqueName,
        })),
      ];

      allTransactions.sort((a, b) => {
        return parseDateToTimestamp(a.date!) - parseDateToTimestamp(b.date!);
      });

      let runningBalance = 0;
      let runningBalanceConverted = 0;
      apiTransactions = allTransactions.map((tx) => {
        runningBalance += (tx.debit ?? 0) - (tx.credit ?? 0);
        runningBalanceConverted += (tx.debitConverted ?? 0) - (tx.creditConverted ?? 0);

        return {
          ...tx,
          closingBalance: Math.abs(runningBalance),
          closingBalanceConverted: Math.abs(runningBalanceConverted),
          balanceType: runningBalance >= 0 ? BALANCE_TYPE_DR : BALANCE_TYPE_CR,
          voucherGenerated: tx.voucherGenerated ?? false,
        } as Transaction;
      });

      if (apiTransactions.length > 0) {
        const firstTx = apiTransactions[0];
        const openingBalance =
          firstTx.closingBalance - (firstTx.debit ?? 0) + (firstTx.credit ?? 0);
        const openingBalanceConverted =
          firstTx.closingBalanceConverted -
          (firstTx.debitConverted ?? 0) +
          (firstTx.creditConverted ?? 0);

        if (openingBalance !== 0 || firstTx.particular.toLowerCase().includes("balance")) {
          apiTransactions.unshift({
            date: response.body.ledgersTransactions.from || firstTx.date,
            particular: "To Balance b/d",
            debit: null,
            debitConverted: null,
            credit: null,
            creditConverted: null,
            closingBalance: Math.abs(openingBalance),
            closingBalanceConverted: Math.abs(openingBalanceConverted),
            balanceType: openingBalance >= 0 ? BALANCE_TYPE_DR : BALANCE_TYPE_CR,
          });
        }
      }
    }

    const body = response.body as typeof response.body & {
      prev_token?: string | null;
      next_token?: string | null;
    };
    const apiPrevToken = body.prevToken ?? body.prev_token ?? lt.prevToken ?? null;
    const apiNextToken = body.nextToken ?? body.next_token ?? lt.nextToken ?? null;
    const result: MagicLinkData = {
      transactions: apiTransactions,
      debitCreditTransactions:
        effectiveViewMode === LedgerView.STATEMENT_VIEW ? debitCreditTransactions : undefined,
      debitTransactions: effectiveViewMode === LedgerView.T_VIEW ? debitTransactions : undefined,
      creditTransactions: effectiveViewMode === LedgerView.T_VIEW ? creditTransactions : undefined,
      ...(inferredView != null && { inferredView }),
      forwardedBalance: lt.forwardedBalance,
      companyName: body.companyName || "",
      accountName: body.account?.name || "",
      currencyData,
      defaultCurrency: transactionCurrency.code,
      dateRange: {
        from: lt.from,
        to: lt.to,
      },
      apiTotalItems: lt.totalItems ?? body.totalItems,
      apiTotalPages: lt.totalPages ?? body.totalPages,
      apiPage: lt.page ?? body.page,
      apiCount: lt.count ?? body.count,
      apiDebitTransactionsCount: lt.debitTransactionsCount,
      apiCreditTransactionsCount: lt.creditTransactionsCount,
      apiPrevToken,
      apiNextToken,
    };

    return {
      success: true,
      data: result,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || "Failed to load ledger data",
    };
  }
};
