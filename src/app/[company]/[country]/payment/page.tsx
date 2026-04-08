"use client";

import { DataTable } from "@/components/DataTable";
import { Dropdown } from "@/components/Dropdown";
import { Pagination } from "@/components/Pagination";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllPayments,
  invoiceSortBy,
  selectAllPayments,
  selectAllPaymentsLoading,
  selectAllPaymentsError,
  selectAllPaymentsTotalItems,
  selectAllPaymentsTotalPages,
  selectCompanyUniqueName,
  selectAccountUniqueName,
} from "@/store/slices/companySlice";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import { formatCurrencyAmount } from "@/utils/currency";
import { getCompanyAndAccountNames } from "@/utils/getUserDataFromStorage";
import { SidebarToggleButton } from "@/components/SidebarToggleButton";
import { SwitchAccountButton } from "@/components/SwitchAccountButton";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { SortOrder } from "@/constants/sort";
import { PAGINATION_LIMIT } from "@/constants";
import type { Payment, PaymentSortColumn } from "./types";

export default function PaymentsPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [sortFilter, setSortFilter] = useState<PaymentSortColumn>("Date");
  const [sortDirection, setSortDirection] = useState<SortOrder>(SortOrder.DESC);
  const [currentPage, setCurrentPage] = useState(1);

  const companyName = params?.company as string;
  const country = params?.country as string;
  const companyUniqueNameFromRedux = useAppSelector(selectCompanyUniqueName(companyName));
  const accountUniqueNameFromRedux = useAppSelector(selectAccountUniqueName(companyName));

  const allPayments = useAppSelector(selectAllPayments(companyName));
  const loading = useAppSelector(selectAllPaymentsLoading(companyName));
  const error = useAppSelector(selectAllPaymentsError(companyName));
  const totalItems = useAppSelector(selectAllPaymentsTotalItems(companyName));
  const totalPages = useAppSelector(selectAllPaymentsTotalPages(companyName));

  const apiSortBy = sortFilter === "Date" ? invoiceSortBy.voucherDate : invoiceSortBy.grandTotal;

  useEffect(() => {
    const { companyUniqueName, accountUniqueName } = getCompanyAndAccountNames(
      companyName,
      companyUniqueNameFromRedux,
      accountUniqueNameFromRedux
    );

    if (companyName && companyUniqueName && accountUniqueName) {
      dispatch(
        fetchAllPayments({
          companyName,
          companyUniqueName,
          accountUniqueName,
          sort: sortDirection,
          sortBy: apiSortBy,
          page: currentPage,
          count: PAGINATION_LIMIT,
        })
      );
    }
  }, [
    dispatch,
    companyName,
    companyUniqueNameFromRedux,
    accountUniqueNameFromRedux,
    currentPage,
    sortDirection,
    apiSortBy,
  ]);

  const handlePaymentClick = (voucherUniqueName: string) => {
    const { companyUniqueName, accountUniqueName } = getCompanyAndAccountNames(
      companyName,
      companyUniqueNameFromRedux,
      accountUniqueNameFromRedux
    );
    const params = new URLSearchParams({ voucher: voucherUniqueName });
    if (companyUniqueName) params.set("companyUniqueName", companyUniqueName);
    if (accountUniqueName) params.set("accountUniqueName", accountUniqueName);
    router.push(`/${companyName}/${country}/payment/preview?${params.toString()}`);
  };

  const handleClearFilters = () => {
    setSortFilter("Date");
    setSortDirection(SortOrder.DESC);
    setCurrentPage(1);
  };

  const hasActiveFilters = sortFilter !== "Date" || sortDirection !== SortOrder.DESC;

  const handleSort = (column: PaymentSortColumn) => {
    if (sortFilter === column) {
      setSortDirection(sortDirection === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC);
    } else {
      setSortFilter(column);
      setSortDirection(column === "Date" ? SortOrder.DESC : SortOrder.ASC);
    }
    setCurrentPage(1);
  };

  const paymentsData: Payment[] = useMemo(
    () =>
      (allPayments || []).map((payment) => ({
        id: payment.uniqueName,
        paymentId: payment.voucherNumber,
        date: payment.voucherDate,
        amount: formatCurrencyAmount(
          payment.grandTotal?.amountForAccount,
          payment.accountCurrencySymbol
        ),
        paymentMode: payment.paymentMode?.name ?? "",
        unusedAmount: formatCurrencyAmount(
          payment.balanceDue?.amountForAccount ?? 0,
          payment.accountCurrencySymbol
        ),
      })),
    [allPayments]
  );

  const columns = useMemo(
    () => [
      {
        header: "Payment#",
        accessor: (row: Payment) => (
          <Button variant="link" size="sm" onClick={() => handlePaymentClick(row.id)}>
            {row.paymentId}
          </Button>
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
            Amount
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
      { header: "Payment Mode", accessor: "paymentMode" as keyof Payment },
      { header: "Unused Amount", accessor: "unusedAmount" as keyof Payment },
    ],
    [sortFilter, sortDirection]
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
              <Dropdown
                trigger={
                  <>
                    <span className="block truncate text-left">{sortFilter}</span>
                    <ChevronDownIcon aria-hidden className="-mr-1 size-5 shrink-0 text-gray-400" />
                  </>
                }
                buttonClassName="w-full justify-between"
                panelClassName="w-48 min-w-full"
                fullWidth
              >
                <Dropdown.Item
                  onClick={() => {
                    setSortFilter("Amount");
                    setSortDirection(SortOrder.ASC);
                    setCurrentPage(1);
                  }}
                >
                  Amount
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setSortFilter("Date");
                    setSortDirection(SortOrder.DESC);
                    setCurrentPage(1);
                  }}
                >
                  Date
                </Dropdown.Item>
              </Dropdown>
            </div>
            {hasActiveFilters && (
              <div className="flex items-end">
                <Button variant="outline" size="md" onClick={handleClearFilters}>
                  <X className="h-4 w-4" />
                  Clear Filters
                </Button>
              </div>
            )}
          </div>

          {loading ? (
            <TableSkeleton rows={10} />
          ) : error ? (
            <div className="py-12 text-center text-red-500">{error}</div>
          ) : paymentsData.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No payments found</div>
          ) : (
            <DataTable columns={columns} data={paymentsData} keyExtractor={(row) => row.id} />
          )}

          {!loading && !error && totalItems > PAGINATION_LIMIT && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              itemsPerPage={PAGINATION_LIMIT}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>
    </>
  );
}
