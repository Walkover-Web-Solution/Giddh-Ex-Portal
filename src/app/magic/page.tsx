"use client";

import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  Header,
  MagicSearchAndFilters,
  MagicTransactionTable,
  Footer,
  Transaction,
  Currency,
  ViewMode,
  SummaryData,
} from "@/components/magic";
import { getMagicLinkLedger } from "@/utils/magic/getMagicLinkLedger";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ErrorMessage } from "@/components/ErrorMessage";

export default function Magic() {
  const searchParams = useSearchParams();
  const linkId = searchParams.get("linkId") || searchParams.get("id") || "";

  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("INR");
  const [viewMode, setViewMode] = useState<ViewMode>("statement");
  const [searchQuery, setSearchQuery] = useState("");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [companyName, setCompanyName] = useState("Piyussshhh Company");
  const [accountName, setAccountName] = useState("Sales Account");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Date range state
  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);
  const [fromDate, setFromDate] = useState<Date>(thirtyDaysAgo);
  const [toDate, setToDate] = useState<Date>(today);
  const magicLinkId = "1768918035086yi0xfjm4vxa3c2ihd52g";

  useEffect(() => {
    const fetchMagicLinkData = async () => {
      console.log("Fetching data for linkId:", linkId);
      setLoading(true);
      setError(null);

      try {
        const response = await getMagicLinkLedger({ linkId: magicLinkId, sort: "asc" });
        console.log("API Response:", response);

        if (response.status === "success" && response.body?.ledgersTransactions) {
          const { debitTransactions, creditTransactions } = response.body.ledgersTransactions;

          // Combine and sort all transactions by date
          const allTransactions: Array<{
            date: string;
            particular: string;
            debit: number | null;
            credit: number | null;
            type: "DEBIT" | "CREDIT";
            convertedCurrency?: string;
          }> = [];

          // Add debit transactions
          debitTransactions.forEach((tx) => {
            allTransactions.push({
              date: tx.entryDate,
              particular: tx.particular.name,
              debit: tx.amount,
              credit: null,
              type: "DEBIT",
              convertedCurrency:
                tx.convertedCurrencyCode && tx.convertedCurrencyCode !== tx.currencyCode
                  ? `${tx.convertedCurrencySymbol || ""} ${tx.convertedAmount || tx.amount}`
                  : undefined,
            });
          });

          // Add credit transactions
          creditTransactions.forEach((tx) => {
            allTransactions.push({
              date: tx.entryDate,
              particular: tx.particular.name,
              debit: null,
              credit: tx.amount,
              type: "CREDIT",
              convertedCurrency:
                tx.convertedCurrencyCode && tx.convertedCurrencyCode !== tx.currencyCode
                  ? `${tx.convertedCurrencySymbol || ""} ${tx.convertedAmount || tx.amount}`
                  : undefined,
            });
          });

          // Sort by date
          allTransactions.sort((a, b) => {
            const dateA = new Date(a.date.split("-").reverse().join("-"));
            const dateB = new Date(b.date.split("-").reverse().join("-"));
            return dateA.getTime() - dateB.getTime();
          });

          // Calculate closing balances
          let runningBalance = 0;
          const apiTransactions: Transaction[] = allTransactions.map((tx) => {
            if (tx.debit !== null) {
              runningBalance += tx.debit;
            } else if (tx.credit !== null) {
              runningBalance += tx.credit;
            }

            return {
              date: tx.date,
              particular: tx.particular,
              debit: tx.debit,
              credit: tx.credit,
              closingBalance: runningBalance,
              balanceType: runningBalance >= 0 ? "Dr" : "Cr",
              creditCurrency: tx.convertedCurrency,
            };
          });

          // Add opening balance entry if needed
          if (apiTransactions.length > 0) {
            const firstTx = apiTransactions[0];
            const openingBalance =
              firstTx.closingBalance - (firstTx.credit ?? 0) + (firstTx.debit ?? 0);

            if (openingBalance !== 0 || firstTx.particular.toLowerCase().includes("balance")) {
              apiTransactions.unshift({
                date: response.body.ledgersTransactions.from || firstTx.date,
                particular: "To Balance b/d",
                debit: null,
                credit: null,
                closingBalance: openingBalance,
                balanceType: openingBalance >= 0 ? "Dr" : "Cr",
              });
            }
          }

          // Add closing balance entry
          if (apiTransactions.length > 0) {
            const lastTx = apiTransactions[apiTransactions.length - 1];
            apiTransactions.push({
              date: response.body.ledgersTransactions.to || lastTx.date,
              particular: "To Balance c/d",
              debit: null,
              credit: null,
              closingBalance: lastTx.closingBalance,
              balanceType: lastTx.balanceType,
            });
          }

          console.log("Transformed transactions:", apiTransactions);
          setTransactions(apiTransactions);

          // Update company and account names
          if (response.body.companyName) {
            setCompanyName(response.body.companyName);
          }
          if (response.body.account?.name) {
            setAccountName(response.body.account.name);
          }
        } else {
          console.error("API response error:", response);
          setError(response.message || "Failed to load ledger data");
          setTransactions([]);
        }
      } catch (err) {
        console.error("Error fetching magic link ledger:", err);
        setError("Failed to load ledger data");
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchMagicLinkData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkId]);

  // Helper function to parse transaction date string (DD-MM-YY or DD-MM-YYYY) to Date
  const parseTransactionDate = (dateString: string): Date => {
    const parts = dateString.split("-");
    if (parts.length !== 3) return new Date(dateString);

    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
    let year = parseInt(parts[2], 10);

    // Handle 2-digit years (assume 2000-2099)
    if (year < 100) {
      year += 2000;
    }

    return new Date(year, month, day);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Filter by search query
      const matchesSearch = t.particular.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by date range
      const transactionDate = parseTransactionDate(t.date);
      // Normalize transaction date to start of day for comparison
      const normalizedTransactionDate = new Date(transactionDate);
      normalizedTransactionDate.setHours(0, 0, 0, 0);

      const startOfFromDate = new Date(fromDate);
      startOfFromDate.setHours(0, 0, 0, 0);
      const endOfToDate = new Date(toDate);
      endOfToDate.setHours(23, 59, 59, 999);

      const matchesDateRange =
        normalizedTransactionDate >= startOfFromDate && normalizedTransactionDate <= endOfToDate;

      return matchesSearch && matchesDateRange;
    });
  }, [transactions, searchQuery, fromDate, toDate]);

  // Calculate summary based on filtered transactions
  const summary = useMemo<SummaryData>(() => {
    const totalDebit = filteredTransactions.reduce((sum, tx) => sum + (tx.debit ?? 0), 0);
    const totalCredit = filteredTransactions.reduce((sum, tx) => sum + (tx.credit ?? 0), 0);
    const debitCount = filteredTransactions.filter((tx) => tx.debit !== null).length;
    const creditCount = filteredTransactions.filter((tx) => tx.credit !== null).length;

    // Get opening balance from first transaction
    // If first transaction is "Balance b/d", its closing balance is the opening balance
    // Otherwise, calculate backwards from first transaction
    const openingBalance =
      filteredTransactions.length > 0
        ? filteredTransactions[0].particular.toLowerCase().includes("balance b/d")
          ? filteredTransactions[0].closingBalance
          : filteredTransactions[0].closingBalance -
            (filteredTransactions[0].credit ?? 0) +
            (filteredTransactions[0].debit ?? 0)
        : 0;

    // Get opening balance type from first transaction
    const openingBalanceType =
      filteredTransactions.length > 0 ? filteredTransactions[0].balanceType : "Dr";

    // Get closing balance from last transaction (if exists)
    const closingBalance =
      filteredTransactions.length > 0
        ? filteredTransactions[filteredTransactions.length - 1].closingBalance
        : 0;

    // Get closing balance type from last transaction
    const closingBalanceType =
      filteredTransactions.length > 0
        ? filteredTransactions[filteredTransactions.length - 1].balanceType
        : "Dr";

    // Net total credit is the closing balance
    const netTotalCredit = closingBalance;

    return {
      totalDebit,
      totalCredit,
      totalTransactions: filteredTransactions.length,
      debitCount,
      creditCount,
      openingBalance,
      openingBalanceType,
      netTotalCredit,
      closingBalance,
      closingBalanceType,
    };
  }, [filteredTransactions]);

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
      {/* FULL WIDTH HEADER */}
      <Header
        companyName={companyName}
        accountName={accountName}
        fromDate={fromDate}
        toDate={toDate}
        onFromDateChange={handleFromDateChange}
        onToDateChange={handleToDateChange}
        onPrint={handlePrint}
      />

      {/* CENTERED CONTENT */}
      <main className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 rounded-md border border-yellow-200 bg-yellow-50 p-3 text-xs text-yellow-800 sm:p-4 sm:text-sm">
            {error}
          </div>
        )}

        {/* Search + Filters */}
        <section className="mb-4 sm:mb-6">
          <MagicSearchAndFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedCurrency={selectedCurrency}
            onCurrencyChange={setSelectedCurrency}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
          />
        </section>

        {/* Table */}
        <section className="mb-4 sm:mb-6">
          <MagicTransactionTable
            transactions={filteredTransactions}
            selectedCurrency={selectedCurrency}
            totalDebit={summary.totalDebit}
            totalCredit={summary.totalCredit}
            viewMode={viewMode}
          />
        </section>

        {/* Summary Footer */}
        <section className="mb-6 pb-6 sm:mb-8 sm:pb-12">
          <Footer summary={summary} selectedCurrency={selectedCurrency} />
        </section>
      </main>
    </div>
  );
}
