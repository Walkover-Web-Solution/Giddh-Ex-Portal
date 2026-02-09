import { LedgerView } from "@/constants/ledger";
import { Transaction, Currency, ViewMode, CurrencyInfo } from "./types";
import { StatementViewTable } from "./StatementViewTable";
import { TAccountViewTable } from "./TAccountViewTable";
import { LedgerTransaction } from "@/utils/magic/getMagicLinkLedger";
import { Pagination } from "@/components/Pagination";

export interface LedgerTablePaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (size: number) => void;
  pageSizeOptions?: number[];
}

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
  pagination?: LedgerTablePaginationProps;
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
  pagination,
}: LedgerTableProps) {
  if (viewMode === LedgerView.STATEMENT_VIEW) {
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
    <div className="flow-root">
      <TAccountViewTable
        transactions={transactions}
        selectedCurrency={selectedCurrency}
        debitTransactions={debitTransactions}
        creditTransactions={creditTransactions}
        transactionCurrency={transactionCurrency}
        convertedCurrency={convertedCurrency}
        linkId={linkId}
      />
      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
          onPageChange={pagination.onPageChange}
          onItemsPerPageChange={pagination.onItemsPerPageChange}
          pageSizeOptions={pagination.pageSizeOptions}
        />
      )}
    </div>
  );
}
