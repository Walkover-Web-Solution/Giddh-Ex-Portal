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
  MagicPagination,
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
import { PAGINATION_LIMIT, PAGE_SIZE_OPTIONS } from "@/constants";
import { LedgerTransaction } from "@/utils/magic/getMagicLinkLedger";

export default function Magic() {
  const searchParams = useSearchParams();
  const linkId = searchParams.get("id") || "";

  const [viewMode, setViewMode] = useState<ViewMode>();
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("INR");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
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
  const [apiDebitTransactionsCount, setApiDebitTransactionsCount] = useState<number | undefined>(
    undefined
  );
  const [apiCreditTransactionsCount, setApiCreditTransactionsCount] = useState<number | undefined>(
    undefined
  );
  const [fetchTrigger, setFetchTrigger] = useState(0);
  const [prevToken, setPrevToken] = useState<string | null>(null);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [requestPaginationToken, setRequestPaginationToken] = useState<string | null>(null);
  const [requestReversePage, setRequestReversePage] = useState(false);
  const prevTokenRef = useRef<string | null>(null);
  const nextTokenRef = useRef<string | null>(null);
  prevTokenRef.current = prevToken;
  nextTokenRef.current = nextToken;

  const today = new Date();
  const startOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfThisMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const [fromDate, setFromDate] = useState<Date>(startOfThisMonth);
  const [toDate, setToDate] = useState<Date>(endOfThisMonth);
  const hasSetDatesFromAPI = useRef(false);
  const isUpdatingDatesFromAPI = useRef(false);
  const isInitialMount = useRef(true);
  const prevFromDateRef = useRef<Date>(startOfThisMonth);
  const prevToDateRef = useRef<Date>(endOfThisMonth);
  /** Only show full-page loader on first load for current link; skip for refetches (search, pagination, etc.) */
  const loadedLinkIdRef = useRef<string | null>(null);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    return () => window.clearTimeout(timeoutId);
  }, [searchQuery]);

  // Same as old magic-link: getMagicLinkData(id, from?, to?) → magic-link-ledger + magic-link-ledger-balance.
  // Search does NOT trigger this effect; it only filters already-loaded data client-side.
  useEffect(() => {
    if (isUpdatingDatesFromAPI.current) {
      isUpdatingDatesFromAPI.current = false;
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
      const isFirstLoadForLink = loadedLinkIdRef.current !== linkId;
      if (isFirstLoadForLink) {
        setLoading(true);
      }
      setError(null);

      try {
        const request: Parameters<typeof getMagicLinkData>[0] = {
          linkId,
          sort: SortOrder.ASC,
        };
        if (hasSetDatesFromAPI.current) {
          request.from = formatDateToAPI(fromDate);
          request.to = formatDateToAPI(toDate);
        }
        const searchValue = debouncedSearchQuery.trim();
        if (searchValue) {
          request.q = searchValue;
        }
        // Workaround: when viewMode is undefined (backend not yet sending it), still send pagination
        // and default to T_VIEW so the first request returns paginated data with prev/next tokens.
        const effectiveViewForRequest =
          viewMode === LedgerView.STATEMENT_VIEW || viewMode === LedgerView.T_VIEW
            ? viewMode
            : LedgerView.T_VIEW;
        if (
          viewMode === LedgerView.STATEMENT_VIEW ||
          viewMode === LedgerView.T_VIEW ||
          viewMode === undefined
        ) {
          request.viewMode = effectiveViewForRequest;
          request.count = itemsPerPage;
          if (requestPaginationToken) {
            request.paginationToken = requestPaginationToken;
            request.reversePage = requestReversePage;
          } else {
            request.page = 1;
          }
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
            apiDebitTransactionsCount: responseApiDebitTransactionsCount,
            apiCreditTransactionsCount: responseApiCreditTransactionsCount,
            apiPrevToken: responseApiPrevToken,
            apiNextToken: responseApiNextToken,
            apiPage: responseApiPage,
          } = result.data;

          setApiTotalItems(responseApiTotalItems);
          setApiTotalPages(responseApiTotalPages);
          setApiDebitTransactionsCount(responseApiDebitTransactionsCount);
          setApiCreditTransactionsCount(responseApiCreditTransactionsCount);
          setCurrentPage(responseApiPage ?? 1);
          setPrevToken(responseApiPrevToken ?? null);
          setNextToken(responseApiNextToken ?? null);

          setTransactions(transformedTransactions);
          // Preserve currency when API returns no data (no transactions → empty currency); keep toggle visible
          const hasValidExtractedCurrency =
            !!extractedCurrencyData.transactionCurrency?.code?.trim();
          if (hasValidExtractedCurrency) {
            setCurrencyData(extractedCurrencyData);
          }
          setCompanyName(apiCompanyName);
          setAccountName(apiAccountName);
          setDebitCreditTransactions(apiDebitCreditTransactions || []);
          setDebitTransactions(apiDebitTransactions || []);
          setCreditTransactions(apiCreditTransactions || []);
          setForwardedBalance(apiForwardedBalance);

          const balanceRes = await getMagicLinkLedgerBalance({
            linkId,
            accountCurrency: true,
            ...(searchValue ? { q: searchValue } : {}),
            ...(hasSetDatesFromAPI.current
              ? { from: formatDateToAPI(fromDate), to: formatDateToAPI(toDate) }
              : {}),
          });
          if (balanceRes.status === "success" && balanceRes.body) {
            setLedgerBalance(balanceRes.body);
          } else {
            setLedgerBalance(undefined);
          }

          // Set selected currency from API: initial load uses transaction currency; refetch keeps user choice if still valid
          // Only when we have valid extracted currency (skip when no data so we don't set selectedCurrency to "")
          if (hasValidExtractedCurrency) {
            const tCode = extractedCurrencyData.transactionCurrency?.code?.trim().toUpperCase();
            const cCode = extractedCurrencyData.convertedCurrency?.code?.trim().toUpperCase();
            const selectedNorm = (selectedCurrency ?? "").trim().toUpperCase();
            const isValidSelection = selectedNorm === tCode || selectedNorm === cCode;
            if (isInitialMount.current && extractedCurrencyData.transactionCurrency) {
              setSelectedCurrency(extractedCurrencyData.transactionCurrency.code);
            } else if (!isValidSelection && extractedCurrencyData.transactionCurrency) {
              setSelectedCurrency(extractedCurrencyData.transactionCurrency.code);
            }
          }

          // Initial state from API: set from/to and view from response
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
          loadedLinkIdRef.current = linkId;

          // Initial state from API: set view from response.ledgerView (or infer from data if backend doesn't send it yet)
          if (viewMode === undefined && result.data.inferredView != null) {
            setViewMode(result.data.inferredView);
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
          setApiDebitTransactionsCount(undefined);
          setApiCreditTransactionsCount(undefined);
          setPrevToken(null);
          setNextToken(null);
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
        setApiDebitTransactionsCount(undefined);
        setApiCreditTransactionsCount(undefined);
        setPrevToken(null);
        setNextToken(null);
        loadedLinkIdRef.current = null;
      } finally {
        setLoading(false);
      }
    };

    fetchMagicLinkData();
  }, [
    linkId,
    viewMode,
    fromDate.getTime(),
    toDate.getTime(),
    itemsPerPage,
    requestPaginationToken,
    requestReversePage,
    fetchTrigger,
    debouncedSearchQuery,
  ]);

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

  // Search is client-side only (no API call on type), matching old magic-link behavior:
  // input → searchQuery → filter already-loaded transactions by particular + amount.
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

  // Reset to first page and clear token when filters or view change (token-based pagination)
  useEffect(() => {
    setCurrentPage(1);
    setPrevToken(null);
    setNextToken(null);
    setRequestPaginationToken(null);
    setRequestReversePage(false);
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
    const list = filteredDebitCreditTransactions;
    const hasForwarded = Boolean(forwardedBalance);
    if (apiTotalPages != null && apiTotalPages > 1) {
      return list;
    }
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
        apiTotalTransactions: apiTotalItems,
        apiDebitCount: apiDebitTransactionsCount,
        apiCreditCount: apiCreditTransactionsCount,
      }),
    [
      ledgerBalance,
      forwardedBalance,
      viewMode,
      filteredDebitCreditTransactions,
      filteredDebitTransactions,
      filteredCreditTransactions,
      apiTotalItems,
      apiDebitTransactionsCount,
      apiCreditTransactionsCount,
    ]
  );

  const handlePrint = () => {
    window.print();
  };

  const handleFromDateChange = (date: Date) => {
    setFromDate(date);
    setRequestPaginationToken(null);
    setPrevToken(null);
    setNextToken(null);
    setCurrentPage(1);
    setFetchTrigger((t) => t + 1);
  };

  const handleToDateChange = (date: Date) => {
    setToDate(date);
    setRequestPaginationToken(null);
    setPrevToken(null);
    setNextToken(null);
    setCurrentPage(1);
    setFetchTrigger((t) => t + 1);
  };

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode);
    setRequestPaginationToken(null);
    setPrevToken(null);
    setNextToken(null);
    setCurrentPage(1);
    setFetchTrigger((t) => t + 1);
  };

  const handleCurrencyChange = (currency: Currency) => {
    setSelectedCurrency(currency);
    setRequestPaginationToken(null);
    setPrevToken(null);
    setNextToken(null);
    setCurrentPage(1);
    setFetchTrigger((t) => t + 1);
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
            onCurrencyChange={handleCurrencyChange}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            transactionCurrency={currencyData?.transactionCurrency}
            convertedCurrency={currencyData?.convertedCurrency}
          />
        </section>

        {viewMode == null ? (
          <section className="mb-4 flex min-h-[200px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50/80 p-6 text-center sm:mb-6">
            <p className="text-sm text-gray-600 sm:text-base">
              Choose <strong>Statement View</strong> or <strong>T View</strong> above to display the
              ledger.
            </p>
          </section>
        ) : (
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
                !hasMultiplePages || currentPage === 1
                  ? (ledgerBalance?.forwardedBalance ?? forwardedBalance)
                  : undefined
              }
              convertedForwardedBalance={
                (!hasMultiplePages || currentPage === 1) && ledgerBalance?.convertedForwardedBalance
                  ? ledgerBalance.convertedForwardedBalance
                  : undefined
              }
              ledgerTotals={
                ledgerBalance
                  ? {
                      totalDebit: ledgerBalance.debitTotal,
                      totalCredit: ledgerBalance.creditTotal,
                      convertedTotalDebit: ledgerBalance.convertedDebitTotal,
                      convertedTotalCredit: ledgerBalance.convertedCreditTotal,
                    }
                  : undefined
              }
              pagination={undefined}
            />
            {hasMultiplePages &&
              (viewMode === LedgerView.STATEMENT_VIEW || viewMode === LedgerView.T_VIEW) && (
                <MagicPagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  totalItems={totalEntries}
                  itemsPerPage={itemsPerPage}
                  hasPrevious={!!prevToken}
                  hasNext={!!nextToken}
                  onPrevious={() => {
                    const token = prevTokenRef.current;
                    if (token != null && token !== "") {
                      setRequestReversePage(true);
                      setRequestPaginationToken(token);
                    }
                  }}
                  onNext={() => {
                    const token = nextTokenRef.current;
                    if (token != null && token !== "") {
                      setRequestReversePage(false);
                      setRequestPaginationToken(token);
                    }
                  }}
                />
              )}
            <Footer
              summary={summary}
              companyCurrency={currencyData?.transactionCurrency}
              convertedCurrency={currencyData?.convertedCurrency}
              hideOpeningClosingBalance={!!debouncedSearchQuery.trim()}
            />
          </section>
        )}
      </main>
    </div>
  );
}
