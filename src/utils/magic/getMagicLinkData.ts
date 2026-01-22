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

export interface MagicLinkData {
  transactions: Transaction[];
  // Raw API response arrays for direct use in components
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
  viewMode: "statement" | "t" = "statement"
): Promise<GetMagicLinkDataResult> => {
  try {
    const response = await getMagicLinkLedger({ ...request, viewMode });

    if (response.status !== "success" || !response.body?.ledgersTransactions) {
      return {
        success: false,
        error: response.message || "Failed to load ledger data",
      };
    }

    const { debitTransactions, creditTransactions, debitCreditTransactions } =
      response.body.ledgersTransactions;

    const firstTransaction =
      (viewMode === "statement" && debitCreditTransactions?.[0]) ||
      debitTransactions?.[0] ||
      creditTransactions?.[0];

    const transactionCurrency: CurrencyInfo = {
      code: firstTransaction?.currencyCode || "INR",
      symbol: firstTransaction?.currencySymbol || "₹",
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

    if (viewMode === "statement" && debitCreditTransactions && debitCreditTransactions.length > 0) {
      // Transform with original tx reference included for download functionality
      apiTransactions = debitCreditTransactions.map((tx: LedgerTransaction) =>
        transformLedgerTransactionToDisplay(tx, true)
      );

      const forwardedBalance = response.body.ledgersTransactions.forwardedBalance;
      if (forwardedBalance) {
        apiTransactions.unshift({
          date: response.body.ledgersTransactions.from || apiTransactions[0]?.date || "",
          particular: forwardedBalance.description || "To Balance b/d",
          debit: null,
          debitConverted: null,
          credit: null,
          creditConverted: null,
          closingBalance: forwardedBalance.amount,
          closingBalanceConverted: forwardedBalance.amount,
          balanceType: forwardedBalance.type === "DEBIT" ? "Dr" : "Cr",
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
        const parseDate = (dateStr: string) => {
          const [d, m, y] = dateStr.split("-");
          return new Date(`${y}-${m}-${d}`).getTime();
        };
        return parseDate(a.date!) - parseDate(b.date!);
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
          balanceType: (runningBalance >= 0 ? "Dr" : "Cr") as "Dr" | "Cr",
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
            balanceType: (openingBalance >= 0 ? "Dr" : "Cr") as "Dr" | "Cr",
          });
        }
      }
    }

    const result: MagicLinkData = {
      transactions: apiTransactions,
      // Include raw API response arrays
      debitCreditTransactions: viewMode === "statement" ? debitCreditTransactions : undefined,
      debitTransactions: viewMode === "t" ? debitTransactions : undefined,
      creditTransactions: viewMode === "t" ? creditTransactions : undefined,
      forwardedBalance: response.body.ledgersTransactions.forwardedBalance,
      companyName: response.body.companyName || "",
      accountName: response.body.account?.name || "",
      currencyData,
      defaultCurrency: transactionCurrency.code,
      dateRange: {
        from: response.body.ledgersTransactions.from,
        to: response.body.ledgersTransactions.to,
      },
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
