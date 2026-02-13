import { LedgerView } from "@/constants/ledger";
import { Transaction, Currency, ViewMode, CurrencyInfo, ForwardedBalanceShape } from "./types";
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
  forwardedBalance?: ForwardedBalanceShape;
  convertedForwardedBalance?: ForwardedBalanceShape;
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
  convertedForwardedBalance,
  pagination,
}: LedgerTableProps) {
  if (viewMode === LedgerView.STATEMENT_VIEW) {
    return (
      <StatementViewTable
        selectedCurrency={selectedCurrency}
        debitCreditTransactions={debitCreditTransactions}
        forwardedBalance={forwardedBalance}
        convertedForwardedBalance={convertedForwardedBalance}
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
        forwardedBalance={forwardedBalance}
        convertedForwardedBalance={convertedForwardedBalance}
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
