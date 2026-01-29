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
} from "@/components/magic";
import { MagicLinkViewMode } from "@/constants/ledger";
import { SortOrder } from "@/constants/sort";
import { isValid } from "date-fns";
import { formatDateToAPI, parseDateFromAPI, parseTransactionDate } from "@/utils/dateUtils";
import { getMagicLinkData } from "@/utils/magic/getMagicLinkData";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";
import { LedgerTransaction } from "@/utils/magic/getMagicLinkLedger";

export default function Magic() {
  const searchParams = useSearchParams();
  const linkId = searchParams.get("id") || "";

  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("INR");
  const [viewMode, setViewMode] = useState<ViewMode>(MagicLinkViewMode.STATEMENT);
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
        type: "DEBIT" | "CREDIT";
        description?: string;
      }
    | undefined
  >(undefined);

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
        const result = await getMagicLinkData(
          {
            linkId,
            sort: SortOrder.ASC,
            from: formatDateToAPI(fromDate),
            to: formatDateToAPI(toDate),
          },
          viewMode
        );

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
          } = result.data;

          setTransactions(transformedTransactions);
          setCurrencyData(extractedCurrencyData);
          setCompanyName(apiCompanyName);
          setAccountName(apiAccountName);
          setDebitCreditTransactions(apiDebitCreditTransactions || []);
          setDebitTransactions(apiDebitTransactions || []);
          setCreditTransactions(apiCreditTransactions || []);
          setForwardedBalance(apiForwardedBalance);

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
        }
      } catch (err) {
        setError("Failed to load ledger data");
        setTransactions([]);
        setDebitCreditTransactions([]);
        setDebitTransactions([]);
        setCreditTransactions([]);
        setForwardedBalance(undefined);
      } finally {
        setLoading(false);
      }
    };

    fetchMagicLinkData();
  }, [linkId, viewMode, fromDate.getTime(), toDate.getTime()]);

  const filteredTransactions = useMemo(() => {
    const searchValue = searchQuery.toLowerCase().trim();
    const hasSearchQuery = searchValue.length > 0;

    return transactions.filter((t) => {
      // Filter by search query
      if (hasSearchQuery) {
        const matchesParticular = t.particular?.toLowerCase().includes(searchValue);
        const matchesAmount =
          String(t.debit ?? "").includes(searchValue) ||
          String(t.credit ?? "").includes(searchValue);
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
      const matchesAmount = String(tx.amount ?? "").includes(searchValue);
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
      const matchesAmount = String(tx.amount ?? "").includes(searchValue);
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
      const matchesAmount = String(tx.amount ?? "").includes(searchValue);
      return matchesParticular || matchesAmount;
    });
  }, [creditTransactions, searchQuery]);

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
            transactions={filteredTransactions}
            selectedCurrency={selectedCurrency}
            viewMode={viewMode}
            transactionCurrency={currencyData?.transactionCurrency}
            convertedCurrency={currencyData?.convertedCurrency}
            linkId={linkId}
            debitCreditTransactions={
              filteredDebitCreditTransactions && filteredDebitCreditTransactions.length > 0
                ? filteredDebitCreditTransactions
                : undefined
            }
            debitTransactions={
              filteredDebitTransactions && filteredDebitTransactions.length > 0
                ? filteredDebitTransactions
                : undefined
            }
            creditTransactions={
              filteredCreditTransactions && filteredCreditTransactions.length > 0
                ? filteredCreditTransactions
                : undefined
            }
            forwardedBalance={forwardedBalance}
          />
        </section>
      </main>
    </div>
  );
}
