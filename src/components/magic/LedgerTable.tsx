import { MagicLinkViewMode } from "@/constants/ledger";
import { Transaction, Currency, ViewMode, CurrencyInfo } from "./types";
import { StatementViewTable } from "./StatementViewTable";
import { TAccountViewTable } from "./TAccountViewTable";
import { LedgerTransaction } from "@/utils/magic/getMagicLinkLedger";

interface LedgerTableProps {
  transactions: Transaction[];
  selectedCurrency: Currency;
  viewMode: ViewMode;
  transactionCurrency?: CurrencyInfo;
  convertedCurrency?: CurrencyInfo;
  linkId: string;
  debitCreditTransactions?: LedgerTransaction[];
  debitTransactions?: LedgerTransaction[];
  creditTransactions?: LedgerTransaction[];
  forwardedBalance?: {
    amount: number;
    type: "DEBIT" | "CREDIT";
    description?: string;
  };
}

export function LedgerTable({
  transactions,
  selectedCurrency,
  viewMode,
  transactionCurrency,
  convertedCurrency,
  linkId,
  debitCreditTransactions,
  debitTransactions,
  creditTransactions,
  forwardedBalance,
}: LedgerTableProps) {
  if (viewMode === MagicLinkViewMode.STATEMENT) {
    return (
      <StatementViewTable
        selectedCurrency={selectedCurrency}
        debitCreditTransactions={debitCreditTransactions}
        forwardedBalance={forwardedBalance}
        transactionCurrency={transactionCurrency}
        convertedCurrency={convertedCurrency}
        linkId={linkId}
      />
    );
  }

  return (
    <TAccountViewTable
      transactions={transactions}
      selectedCurrency={selectedCurrency}
      debitTransactions={debitTransactions}
      creditTransactions={creditTransactions}
      transactionCurrency={transactionCurrency}
      convertedCurrency={convertedCurrency}
      linkId={linkId}
    />
  );
}
