import { Transaction, Currency, ViewMode } from "./types";
import { StatementViewTable } from "./StatementViewTable";
import { TAccountViewTable } from "./TAccountViewTable";

interface MagicTransactionTableProps {
  transactions: Transaction[];
  selectedCurrency: Currency;
  totalDebit: number;
  totalCredit: number;
  viewMode: ViewMode;
}

export function MagicTransactionTable({
  transactions,
  selectedCurrency,
  totalDebit,
  totalCredit,
  viewMode,
}: MagicTransactionTableProps) {
  if (viewMode === "statement") {
    return (
      <StatementViewTable
        transactions={transactions}
        selectedCurrency={selectedCurrency}
        totalDebit={totalDebit}
        totalCredit={totalCredit}
      />
    );
  }

  return (
    <TAccountViewTable
      transactions={transactions}
      selectedCurrency={selectedCurrency}
      totalDebit={totalDebit}
      totalCredit={totalCredit}
    />
  );
}
