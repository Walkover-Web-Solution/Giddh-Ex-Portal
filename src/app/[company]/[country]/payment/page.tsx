"use client";

import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllPayments,
  selectAllPayments,
  selectAllPaymentsLoading,
  selectAllPaymentsError,
  selectCompanyUniqueName,
  selectAccountUniqueName,
  selectIsPaymentsDataStale,
  selectBalanceSummary,
} from "@/store/slices/companySlice";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import { formatCurrencyAmount, getCurrencySymbol, DEFAULT_CURRENCY } from "@/utils/currency";
import { getCompanyAndAccountNames } from "@/utils/getUserDataFromStorage";
import { SidebarToggleButton } from "@/components/SidebarToggleButton";
import { SwitchAccountButton } from "@/components/SwitchAccountButton";
import { X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { SortOrder } from "@/constants/sort";
import type { Payment, PaymentSortColumn } from "./types";

export default function PaymentsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [sortFilter, setSortFilter] = useState<PaymentSortColumn>("Amount");
  const [sortDirection, setSortDirection] = useState<SortOrder>(SortOrder.DESC);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const companyName = params?.company as string;
  const country = params?.country as string;
  const companyUniqueNameFromRedux = useAppSelector(selectCompanyUniqueName(companyName));
  const accountUniqueNameFromRedux = useAppSelector(selectAccountUniqueName(companyName));

  const allPayments = useAppSelector(selectAllPayments(companyName));
  const loading = useAppSelector(selectAllPaymentsLoading(companyName));
  const error = useAppSelector(selectAllPaymentsError(companyName));
  const isDataStale = useAppSelector(selectIsPaymentsDataStale(companyName));
  const balanceSummary = useAppSelector(selectBalanceSummary(companyName));

  useEffect(() => {
    const { companyUniqueName, accountUniqueName } = getCompanyAndAccountNames(
      companyUniqueNameFromRedux,
      accountUniqueNameFromRedux
    );

    if (companyName && companyUniqueName && accountUniqueName && isDataStale) {
      dispatch(fetchAllPayments({ companyName, companyUniqueName, accountUniqueName }));
    }
  }, [dispatch, companyName, companyUniqueNameFromRedux, accountUniqueNameFromRedux, isDataStale]);

  const handlePaymentClick = (voucherUniqueName: string) => {
    router.push(
      `/${companyName}/${country}/payment/preview?voucher=${encodeURIComponent(voucherUniqueName)}`
    );
  };

  const handleClearFilters = () => {
    setSortFilter("Amount");
    setSortDirection(SortOrder.DESC);
    setCurrentPage(1);
  };

  const hasActiveFilters = sortFilter !== "Amount" || sortDirection !== SortOrder.DESC;

  const handleSort = (column: PaymentSortColumn) => {
    if (sortFilter === column) {
      setSortDirection(sortDirection === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC);
    } else {
      setSortFilter(column);
      setSortDirection(SortOrder.DESC);
    }
    setCurrentPage(1);
  };

  const currency = balanceSummary?.currency || DEFAULT_CURRENCY;

  const paymentsData: Payment[] = useMemo(
    () =>
      (allPayments || []).map((payment) => ({
        id: payment.uniqueName,
        paymentId: payment.voucherNumber,
        date: payment.voucherDate,
        amount: formatCurrencyAmount(payment.grandTotal?.amountForAccount, currency, {
          decimals: 0,
        }),
        paymentAccount: payment.account?.name || "N/A",
        unusedAmount: "-",
      })),
    [allPayments, currency]
  );

  const sortedPaymentsData = useMemo(
    () =>
      [...paymentsData].sort((a, b) => {
        let comparison = 0;
        if (sortFilter === "Amount") {
          const amountA = parseFloat(a.amount.replace(/[^0-9.-]+/g, ""));
          const amountB = parseFloat(b.amount.replace(/[^0-9.-]+/g, ""));
          comparison = amountB - amountA;
        } else if (sortFilter === "Date") {
          comparison = new Date(b.date).getTime() - new Date(a.date).getTime();
        } else if (sortFilter === "Payment ID") {
          comparison = a.paymentId.localeCompare(b.paymentId);
        }
        return sortDirection === SortOrder.ASC ? -comparison : comparison;
      }),
    [paymentsData, sortFilter, sortDirection]
  );

  const paginatedData = useMemo(
    () => sortedPaymentsData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [sortedPaymentsData, currentPage, itemsPerPage]
  );

  const columns = useMemo(
    () => [
      {
        header: "Payment#",
        accessor: (row: Payment) => (
          <button
            onClick={() => handlePaymentClick(row.id)}
            className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
          >
            {row.paymentId}
          </button>
        ),
      },
      {
        header: (
          <button
            onClick={() => handleSort("Date")}
            className="flex items-center gap-1 hover:text-gray-700"
          >
            Date
            {sortFilter === "Date" ? (
              sortDirection === SortOrder.ASC ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )
            ) : (
              <ArrowUpDown className="h-4 w-4 opacity-50" />
            )}
          </button>
        ),
        accessor: "date" as keyof Payment,
      },
      {
        header: (
          <button
            onClick={() => handleSort("Amount")}
            className="flex items-center gap-1 hover:text-gray-700"
          >
            Amount {getCurrencySymbol(currency)}
            {sortFilter === "Amount" ? (
              sortDirection === SortOrder.ASC ? (
                <ArrowUp className="h-4 w-4" />
              ) : (
                <ArrowDown className="h-4 w-4" />
              )
            ) : (
              <ArrowUpDown className="h-4 w-4 opacity-50" />
            )}
          </button>
        ),
        accessor: "amount" as keyof Payment,
      },
      { header: "Payment Account", accessor: "paymentAccount" as keyof Payment },
      { header: "Unused Amount", accessor: "unusedAmount" as keyof Payment },
    ],
    [currency]
  );

  return (
    <>
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SidebarToggleButton />
            <h1 className="text-xl font-semibold">Payments Made</h1>
          </div>
          <SwitchAccountButton />
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="w-48">
              <label className="mb-2 block text-sm font-medium text-gray-700">Sort by</label>
              <select
                value={sortFilter}
                onChange={(e) => {
                  setSortFilter(e.target.value as PaymentSortColumn);
                  setCurrentPage(1);
                }}
                className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: "right 0.5rem center",
                  backgroundRepeat: "no-repeat",
                  backgroundSize: "1.5em 1.5em",
                }}
              >
                <option>Amount</option>
                <option>Date</option>
                <option>Payment ID</option>
              </select>
            </div>
            {hasActiveFilters && (
              <div className="flex items-end">
                <button
                  onClick={handleClearFilters}
                  className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <X className="h-4 w-4" />
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <TableSkeleton rows={10} />
          ) : error ? (
            <div className="py-12 text-center text-red-500">{error}</div>
          ) : sortedPaymentsData.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No payments found</div>
          ) : (
            <DataTable columns={columns} data={paginatedData} keyExtractor={(row) => row.id} />
          )}

          {!loading && !error && sortedPaymentsData.length > 10 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(sortedPaymentsData.length / itemsPerPage)}
              totalItems={sortedPaymentsData.length}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          )}
        </div>
      </div>
    </>
  );
}
