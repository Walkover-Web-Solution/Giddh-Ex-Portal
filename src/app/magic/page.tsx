"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import {
  Header,
  SearchAndViewControls,
  LedgerTable,
  Transaction,
  Currency,
  ViewMode,
  CurrencyData,
  Footer,
} from "@/components/magic";
import { LedgerView, type LedgerTransactionType } from "@/constants/ledger";
import { SortOrder } from "@/constants/sort";
import { isValid } from "date-fns";
import { formatDateToAPI, parseDateFromAPI, parseTransactionDate } from "@/utils/dateUtils";
import { buildFooterSummary } from "@/utils/magic/buildFooterSummary";
import { getMagicLinkData } from "@/utils/magic/getMagicLinkData";
import { getMagicLinkLedgerBalance } from "@/utils/magic/getMagicLinkLedgerBalance";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { Pagination } from "@/components/Pagination";
import { PAGINATION_LIMIT, PAGE_SIZE_OPTIONS } from "@/constants";
import { LedgerTransaction } from "@/utils/magic/getMagicLinkLedger";

export default function Magic() {
  const searchParams = useSearchParams();
  const linkId = searchParams.get("id") || "";

  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("INR");
  const [viewMode, setViewMode] = useState<ViewMode>(LedgerView.STATEMENT_VIEW);
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currencyData, setCurrencyData] = useState<CurrencyData | null>(null);
  const [debitCreditTransactions, setDebitCreditTransactions] = useState<LedgerTransaction[]>([]);
  const [debitTransactions, setDebitTransactions] = useState<LedgerTransaction[]>([]);
  const [creditTransactions, setCreditTransactions] = useState<LedgerTransaction[]>([]);
  const [forwardedBalance, setForwardedBalance] = useState<
    | {
        amount: number;
        type: LedgerTransactionType;
        description?: string;
      }
    | undefined
  >(undefined);
  const [ledgerBalance, setLedgerBalance] =
    useState<Awaited<ReturnType<typeof getMagicLinkLedgerBalance>>["body"]>(undefined);

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(PAGINATION_LIMIT);
  const [apiTotalItems, setApiTotalItems] = useState<number | undefined>(undefined);
  const [apiTotalPages, setApiTotalPages] = useState<number | undefined>(undefined);

  // Date range state
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const [fromDate, setFromDate] = useState<Date>(thirtyDaysAgo);
  const [toDate, setToDate] = useState<Date>(today);
  const hasSetDatesFromAPI = useRef(false);
  const isUpdatingDatesFromAPI = useRef(false);
  const isInitialMount = useRef(true);
  const prevFromDateRef = useRef<Date>(thirtyDaysAgo);
  const prevToDateRef = useRef<Date>(today);

  useEffect(() => {
    if (isUpdatingDatesFromAPI.current) {
      queueMicrotask(() => {
        isUpdatingDatesFromAPI.current = false;
      });
      return;
    }

    if (!linkId) {
      setError(
        "A valid link ID is required to view this account’s transactions. Please check your link and try again."
      );
      setLoading(false);
      return;
    }

    const fetchMagicLinkData = async () => {
      setLoading(true);
      setError(null);

      try {
        const request: Parameters<typeof getMagicLinkData>[0] = {
          linkId,
          sort: SortOrder.ASC,
          from: formatDateToAPI(fromDate),
          to: formatDateToAPI(toDate),
        };
        if (viewMode === LedgerView.STATEMENT_VIEW || viewMode === LedgerView.T_VIEW) {
          request.page = currentPage;
          request.count = itemsPerPage;
        }
        const result = await getMagicLinkData(request, viewMode);

        if (result.success && result.data) {
          const {
            transactions: transformedTransactions,
            currencyData: extractedCurrencyData,
            companyName: apiCompanyName,
            accountName: apiAccountName,
            dateRange,
            debitCreditTransactions: apiDebitCreditTransactions,
            debitTransactions: apiDebitTransactions,
            creditTransactions: apiCreditTransactions,
            forwardedBalance: apiForwardedBalance,
            apiTotalItems: responseApiTotalItems,
            apiTotalPages: responseApiTotalPages,
          } = result.data;

          setApiTotalItems(responseApiTotalItems);
          setApiTotalPages(responseApiTotalPages);

          setTransactions(transformedTransactions);
          setCurrencyData(extractedCurrencyData);
          setCompanyName(apiCompanyName);
          setAccountName(apiAccountName);
          setDebitCreditTransactions(apiDebitCreditTransactions || []);
          setDebitTransactions(apiDebitTransactions || []);
          setCreditTransactions(apiCreditTransactions || []);
          setForwardedBalance(apiForwardedBalance);

          const balanceRes = await getMagicLinkLedgerBalance({ linkId });
          if (balanceRes.status === "success" && balanceRes.body) {
            setLedgerBalance(balanceRes.body);
          } else {
            setLedgerBalance(undefined);
          }

          // Set initial selected currency to transaction currency
          if (extractedCurrencyData.transactionCurrency) {
            setSelectedCurrency(extractedCurrencyData.transactionCurrency.code);
          }

          // Only update dates from API on initial load
          if (
            dateRange?.from &&
            dateRange?.to &&
            !hasSetDatesFromAPI.current &&
            isInitialMount.current
          ) {
            const apiFromDate = parseDateFromAPI(dateRange.from);
            const apiToDate = parseDateFromAPI(dateRange.to);

            if (isValid(apiFromDate) && isValid(apiToDate)) {
              isUpdatingDatesFromAPI.current = true;
              hasSetDatesFromAPI.current = true;
              setFromDate(apiFromDate);
              setToDate(apiToDate);
            }
          }

          if (isInitialMount.current) {
            isInitialMount.current = false;
          }
        } else {
          setError(result.error || "Failed to load ledger data");
          setTransactions([]);
          setDebitCreditTransactions([]);
          setDebitTransactions([]);
          setCreditTransactions([]);
          setForwardedBalance(undefined);
          setLedgerBalance(undefined);
          setApiTotalItems(undefined);
          setApiTotalPages(undefined);
        }
      } catch (err) {
        setError("Failed to load ledger data");
        setTransactions([]);
        setDebitCreditTransactions([]);
        setDebitTransactions([]);
        setCreditTransactions([]);
        setForwardedBalance(undefined);
        setLedgerBalance(undefined);
        setApiTotalItems(undefined);
        setApiTotalPages(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchMagicLinkData();
  }, [linkId, viewMode, fromDate.getTime(), toDate.getTime(), currentPage, itemsPerPage]);

  const normalizeSearchForAmount = (s: string) => {
    const noCommas = s.replace(/,/g, "");
    const commaAsDot = s.replace(/,/g, ".");
    return { noCommas, commaAsDot };
  };

  const amountMatchesSearch = (amount: number | null | undefined, searchValue: string) => {
    if (amount == null || !searchValue) return false;
    const { noCommas, commaAsDot } = normalizeSearchForAmount(searchValue);
    const amountStr = String(amount);
    const amountRounded = Number(amount).toFixed(2);
    const matches = (s: string) => s.includes(noCommas) || s.includes(commaAsDot);
    return matches(amountStr) || matches(amountRounded);
  };

  const filteredTransactions = useMemo(() => {
    const searchValue = searchQuery.toLowerCase().trim();
    const hasSearchQuery = searchValue.length > 0;

    return transactions.filter((t) => {
      // Filter by search query
      if (hasSearchQuery) {
        const matchesParticular = t.particular?.toLowerCase().includes(searchValue);
        const matchesAmount =
          amountMatchesSearch(t.debit ?? null, searchValue) ||
          amountMatchesSearch(t.credit ?? null, searchValue);
        if (!matchesParticular && !matchesAmount) return false;
      }

      // Filter by date range
      const transactionDate = parseTransactionDate(t.date);
      const normalizedTransactionDate = new Date(
        transactionDate.getFullYear(),
        transactionDate.getMonth(),
        transactionDate.getDate()
      );
      const startOfFromDate = new Date(
        fromDate.getFullYear(),
        fromDate.getMonth(),
        fromDate.getDate()
      );
      const endOfToDate = new Date(
        toDate.getFullYear(),
        toDate.getMonth(),
        toDate.getDate(),
        23,
        59,
        59,
        999
      );

      return (
        normalizedTransactionDate >= startOfFromDate && normalizedTransactionDate <= endOfToDate
      );
    });
  }, [transactions, searchQuery, fromDate, toDate]);

  // Filter LedgerTransaction arrays based on search query (particular and amount)
  const filteredDebitCreditTransactions = useMemo(() => {
    const searchValue = searchQuery.toLowerCase().trim();
    const hasSearchQuery = searchValue.length > 0;

    if (!debitCreditTransactions || debitCreditTransactions.length === 0) {
      return debitCreditTransactions;
    }

    if (!hasSearchQuery) {
      return debitCreditTransactions;
    }

    return debitCreditTransactions.filter((tx) => {
      const matchesParticular = tx.particular?.name?.toLowerCase().includes(searchValue) ?? false;
      const matchesAmount = amountMatchesSearch(tx.amount, searchValue);
      return matchesParticular || matchesAmount;
    });
  }, [debitCreditTransactions, searchQuery]);

  const filteredDebitTransactions = useMemo(() => {
    const searchValue = searchQuery.toLowerCase().trim();
    const hasSearchQuery = searchValue.length > 0;

    if (!debitTransactions || debitTransactions.length === 0) {
      return debitTransactions;
    }

    if (!hasSearchQuery) {
      return debitTransactions;
    }

    return debitTransactions.filter((tx) => {
      const matchesParticular = tx.particular?.name?.toLowerCase().includes(searchValue) ?? false;
      const matchesAmount = amountMatchesSearch(tx.amount, searchValue);
      return matchesParticular || matchesAmount;
    });
  }, [debitTransactions, searchQuery]);

  const filteredCreditTransactions = useMemo(() => {
    const searchValue = searchQuery.toLowerCase().trim();
    const hasSearchQuery = searchValue.length > 0;

    if (!creditTransactions || creditTransactions.length === 0) {
      return creditTransactions;
    }

    if (!hasSearchQuery) {
      return creditTransactions;
    }

    return creditTransactions.filter((tx) => {
      const matchesParticular = tx.particular?.name?.toLowerCase().includes(searchValue) ?? false;
      const matchesAmount = amountMatchesSearch(tx.amount, searchValue);
      return matchesParticular || matchesAmount;
    });
  }, [creditTransactions, searchQuery]);

  // Reset to first page when filters or view change
  useEffect(() => {
    setCurrentPage(1);
  }, [linkId, viewMode, searchQuery, fromDate.getTime(), toDate.getTime()]);

  const totalEntries = useMemo(() => {
    if (apiTotalItems != null) {
      return apiTotalItems;
    }
    if (viewMode === LedgerView.STATEMENT_VIEW) {
      const count = filteredDebitCreditTransactions?.length ?? 0;
      return (forwardedBalance ? 1 : 0) + count;
    }
    const debitLength = filteredDebitTransactions?.length ?? 0;
    const creditLength = filteredCreditTransactions?.length ?? 0;
    const txLength = filteredTransactions?.length ?? 0;
    return Math.max(debitLength, creditLength, txLength);
  }, [
    viewMode,
    apiTotalItems,
    forwardedBalance,
    filteredDebitCreditTransactions?.length,
    filteredDebitTransactions?.length,
    filteredCreditTransactions?.length,
    filteredTransactions?.length,
  ]);

  const paginatedStatementData = useMemo(() => {
    if (viewMode !== LedgerView.STATEMENT_VIEW || !filteredDebitCreditTransactions) return null;
    if (apiTotalPages != null && apiTotalPages > 1) {
      return filteredDebitCreditTransactions;
    }
    const list = filteredDebitCreditTransactions;
    const hasForwarded = Boolean(forwardedBalance);
    const start = currentPage === 1 ? 0 : (currentPage - 1) * itemsPerPage - (hasForwarded ? 1 : 0);
    const end =
      currentPage === 1
        ? itemsPerPage - (hasForwarded ? 1 : 0)
        : currentPage * itemsPerPage - (hasForwarded ? 1 : 0);
    return list.slice(start, end);
  }, [
    viewMode,
    filteredDebitCreditTransactions,
    forwardedBalance,
    currentPage,
    itemsPerPage,
    apiTotalPages,
  ]);

  const paginatedTViewData = useMemo(() => {
    if (viewMode !== LedgerView.T_VIEW) return null;
    if (apiTotalPages != null && apiTotalPages > 1) {
      return {
        transactions: filteredTransactions,
        debitTransactions: filteredDebitTransactions ?? [],
        creditTransactions: filteredCreditTransactions ?? [],
      };
    }
    const start = (currentPage - 1) * itemsPerPage;
    const end = currentPage * itemsPerPage;
    return {
      transactions: filteredTransactions.slice(start, end),
      debitTransactions: (filteredDebitTransactions ?? []).slice(start, end),
      creditTransactions: (filteredCreditTransactions ?? []).slice(start, end),
    };
  }, [
    viewMode,
    filteredTransactions,
    filteredDebitTransactions,
    filteredCreditTransactions,
    currentPage,
    itemsPerPage,
    apiTotalPages,
  ]);

  const totalPages =
    apiTotalPages != null
      ? Math.max(1, apiTotalPages)
      : Math.max(1, Math.ceil(totalEntries / itemsPerPage));
  const hasMultiplePages = totalPages > 1;

  const summary = useMemo(
    () =>
      buildFooterSummary({
        ledgerBalance,
        forwardedBalance,
        viewMode,
        filteredDebitCreditTransactions,
        filteredDebitTransactions,
        filteredCreditTransactions,
        apiTotalTransactions: viewMode === LedgerView.STATEMENT_VIEW ? apiTotalItems : undefined,
      }),
    [
      ledgerBalance,
      forwardedBalance,
      viewMode,
      filteredDebitCreditTransactions,
      filteredDebitTransactions,
      filteredCreditTransactions,
      apiTotalItems,
    ]
  );

  const handlePrint = () => {
    window.print();
  };

  const handleFromDateChange = (date: Date) => {
    setFromDate(date);
  };

  const handleToDateChange = (date: Date) => {
    setToDate(date);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner message="Loading ledger data..." variant="brand" />
      </div>
    );
  }

  if (error && transactions.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <ErrorMessage message={error} onRetry={() => window.location.reload()} variant="page" />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header
        companyName={companyName}
        accountName={accountName}
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={handleFromDateChange}
        onToDateChange={handleToDateChange}
      />

      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800 sm:p-4 sm:text-sm">
            {error}
          </div>
        )}

        <section className="mb-4 sm:mb-6">
          <SearchAndViewControls
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCurrency={selectedCurrency}
            onCurrencyChange={setSelectedCurrency}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            transactionCurrency={currencyData?.transactionCurrency}
            convertedCurrency={currencyData?.convertedCurrency}
          />
        </section>

        <section className="mb-4 sm:mb-6">
          <LedgerTable
            transactions={
              viewMode === LedgerView.T_VIEW && hasMultiplePages && paginatedTViewData
                ? paginatedTViewData.transactions
                : filteredTransactions
            }
            selectedCurrency={selectedCurrency}
            viewMode={viewMode}
            transactionCurrency={currencyData?.transactionCurrency}
            convertedCurrency={currencyData?.convertedCurrency}
            linkId={linkId}
            debitCreditTransactions={
              viewMode === LedgerView.STATEMENT_VIEW && hasMultiplePages
                ? (paginatedStatementData ?? undefined)
                : filteredDebitCreditTransactions && filteredDebitCreditTransactions.length > 0
                  ? filteredDebitCreditTransactions
                  : undefined
            }
            debitTransactions={
              viewMode === LedgerView.T_VIEW && hasMultiplePages && paginatedTViewData
                ? paginatedTViewData.debitTransactions
                : filteredDebitTransactions && filteredDebitTransactions.length > 0
                  ? filteredDebitTransactions
                  : undefined
            }
            creditTransactions={
              viewMode === LedgerView.T_VIEW && hasMultiplePages && paginatedTViewData
                ? paginatedTViewData.creditTransactions
                : filteredCreditTransactions && filteredCreditTransactions.length > 0
                  ? filteredCreditTransactions
                  : undefined
            }
            forwardedBalance={
              viewMode === LedgerView.STATEMENT_VIEW && (!hasMultiplePages || currentPage === 1)
                ? forwardedBalance
                : undefined
            }
            pagination={
              viewMode === LedgerView.T_VIEW && hasMultiplePages
                ? {
                    currentPage,
                    totalPages,
                    totalItems: totalEntries,
                    itemsPerPage,
                    onPageChange: setCurrentPage,
                    onItemsPerPageChange: (size) => {
                      setItemsPerPage(size);
                      setCurrentPage(1);
                    },
                    pageSizeOptions: PAGE_SIZE_OPTIONS,
                  }
                : undefined
            }
          />
          {viewMode === LedgerView.STATEMENT_VIEW && hasMultiplePages && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalEntries}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={(size) => {
                setItemsPerPage(size);
                setCurrentPage(1);
              }}
              pageSizeOptions={PAGE_SIZE_OPTIONS}
            />
          )}
          <Footer summary={summary} companyCurrency={currencyData?.transactionCurrency} />
        </section>
      </main>
    </div>
  );
}
