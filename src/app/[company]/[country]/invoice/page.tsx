"use client";

import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { PayNow } from "@/components/PayNow";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllInvoices,
  selectAllInvoices,
  selectAllInvoicesLoading,
  selectAllInvoicesError,
  selectCompanyUniqueName,
  selectAccountUniqueName,
  selectIsInvoicesDataStale,
  selectBalanceSummary,
} from "@/store/slices/companySlice";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import { formatCurrencyAmount, getCurrencySymbol, DEFAULT_CURRENCY } from "@/utils/currency";
import { downloadBase64AsPDF } from "@/utils/fileUtils";
import downloadInvoice from "@/utils/downloadInvoice";
import { getCompanyAndAccountNames } from "@/utils/getUserDataFromStorage";
import { logger } from "@/utils/logger";
import { SidebarToggleButton } from "@/components/SidebarToggleButton";
import { SwitchAccountButton } from "@/components/SwitchAccountButton";
import { X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { SortOrder } from "@/constants/sort";
import type { Invoice, InvoiceSortColumn } from "./types";

export default function InvoicesPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [statusFilter, setStatusFilter] = useState("All Invoices");
  const [sortBy, setSortBy] = useState<InvoiceSortColumn>("Total");
  const [sortDirection, setSortDirection] = useState<SortOrder>(SortOrder.DESC);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);

  const companyName = params?.company as string;
  const country = params?.country as string;
  const companyUniqueNameFromRedux = useAppSelector(selectCompanyUniqueName(companyName));
  const accountUniqueNameFromRedux = useAppSelector(selectAccountUniqueName(companyName));

  const allInvoices = useAppSelector(selectAllInvoices(companyName));
  const loading = useAppSelector(selectAllInvoicesLoading(companyName));
  const error = useAppSelector(selectAllInvoicesError(companyName));
  const isDataStale = useAppSelector(selectIsInvoicesDataStale(companyName));
  const balanceSummary = useAppSelector(selectBalanceSummary(companyName));

  useEffect(() => {
    const { companyUniqueName, accountUniqueName } = getCompanyAndAccountNames(
      companyUniqueNameFromRedux,
      accountUniqueNameFromRedux
    );

    if (companyName && companyUniqueName && accountUniqueName && isDataStale) {
      dispatch(fetchAllInvoices({ companyName, companyUniqueName, accountUniqueName }));
    }
  }, [dispatch, companyName, companyUniqueNameFromRedux, accountUniqueNameFromRedux, isDataStale]);

  const calculateOverdue = (dueDate: string): string => {
    if (!dueDate) return "";
    const due = new Date(dueDate);
    const today = new Date();
    const diffTime = today.getTime() - due.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? `Overdue by: ${diffDays} days` : "-";
  };

  const handleInvoiceClick = (invoiceUniqueName: string) => {
    router.push(
      `/${companyName}/${country}/invoice/preview?voucher=${encodeURIComponent(invoiceUniqueName)}`
    );
  };

  const handleClearFilters = () => {
    setStatusFilter("All Invoices");
    setSortBy("Total");
    setSortDirection(SortOrder.DESC);
    setCurrentPage(1);
  };

  const handleSort = (column: InvoiceSortColumn) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === SortOrder.ASC ? SortOrder.DESC : SortOrder.ASC);
    } else {
      setSortBy(column);
      setSortDirection(SortOrder.DESC);
    }
    setCurrentPage(1);
  };

  const hasActiveFilters = statusFilter !== "All Invoices" || sortBy !== "Total";

  const handleDownloadInvoice = async (invoiceUniqueName: string, invoiceNumber: string) => {
    let companyUniqueName = companyUniqueNameFromRedux;
    let accountUniqueName = accountUniqueNameFromRedux;

    if (!companyUniqueName && typeof window !== "undefined") {
      const userData = localStorage.getItem("userData");
      if (userData) {
        try {
          const parsedData = JSON.parse(userData);
          companyUniqueName = parsedData.companyUniqueName;
          accountUniqueName = parsedData.account?.uniqueName;
        } catch (e) {
          console.error("Error parsing userData:", e);
        }
      }
    }

    if (!companyUniqueName || !accountUniqueName) {
      console.error("Missing company or account unique name");
      return;
    }

    try {
      setDownloadingInvoice(invoiceUniqueName);
      const response = await downloadInvoice(
        companyUniqueName,
        accountUniqueName,
        invoiceUniqueName
      );
      if (response.status === "success" && response.body) {
        downloadBase64AsPDF(response.body, `Invoice_${invoiceNumber}.pdf`);
      }
    } catch (error) {
      logger.error("Error downloading invoice", error);
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const currency = balanceSummary?.currency || DEFAULT_CURRENCY;

  const allInvoicesData: Invoice[] = useMemo(
    () =>
      (allInvoices || []).map((invoice) => ({
        id: invoice.uniqueName,
        invoiceNo: invoice.voucherNumber,
        date: invoice.voucherDate,
        total: formatCurrencyAmount(invoice.grandTotal?.amountForAccount, currency, {
          decimals: 0,
        }),
        status: invoice.balanceStatus?.toUpperCase() || "UNPAID",
        overdue: invoice.balanceStatus !== "paid" ? calculateOverdue(invoice.dueDate) : "",
      })),
    [allInvoices, currency]
  );

  const filteredInvoices = useMemo(
    () =>
      allInvoicesData.filter((invoice) => {
        if (statusFilter === "All Invoices") return true;
        if (statusFilter === "Paid" && invoice.status !== "PAID") return false;
        if (statusFilter === "Partial Paid" && invoice.status !== "PARTIAL-PAID") return false;
        if (statusFilter === "Unpaid" && invoice.status !== "UNPAID") return false;
        if (statusFilter === "Hold" && invoice.status !== "HOLD") return false;
        if (statusFilter === "Cancel" && invoice.status !== "CANCEL") return false;
        return true;
      }),
    [allInvoicesData, statusFilter]
  );

  const invoicesData = useMemo(
    () =>
      [...filteredInvoices].sort((a, b) => {
        let comparison = 0;
        if (sortBy === "Total") {
          const amountA = parseFloat(a.total.replace(/[^0-9.-]+/g, ""));
          const amountB = parseFloat(b.total.replace(/[^0-9.-]+/g, ""));
          comparison = amountB - amountA;
        } else if (sortBy === "Date") {
          const dateA = new Date(a.date.split("-").reverse().join("-")).getTime();
          const dateB = new Date(b.date.split("-").reverse().join("-")).getTime();
          comparison = dateB - dateA;
        }
        return sortDirection === SortOrder.ASC ? -comparison : comparison;
      }),
    [filteredInvoices, sortBy, sortDirection]
  );

  const paginatedData = useMemo(
    () => invoicesData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage),
    [invoicesData, currentPage, itemsPerPage]
  );

  const columns = [
    {
      header: "S.NO",
      accessor: (row: Invoice, index: number) => index + 1 + (currentPage - 1) * itemsPerPage,
    },
    {
      header: "INVOICE NO",
      accessor: (row: Invoice) => (
        <button
          onClick={() => handleInvoiceClick(row.id)}
          className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
        >
          {row.invoiceNo}
        </button>
      ),
    },
    {
      header: (
        <button
          onClick={() => handleSort("Date")}
          className="flex items-center gap-1 hover:text-gray-700"
        >
          DATE
          {sortBy === "Date" ? (
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
      accessor: "date" as keyof Invoice,
    },
    {
      header: (
        <button
          onClick={() => handleSort("Total")}
          className="flex items-center gap-1 hover:text-gray-700"
        >
          TOTAL
          {sortBy === "Total" ? (
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
      accessor: "total" as keyof Invoice,
    },
    {
      header: "STATUS",
      accessor: (row: Invoice) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
            row.status === "PAID" ? "bg-green-100 text-green-800" : "bg-orange-100 text-orange-800"
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "OVERDUE",
      accessor: (row: Invoice) => <span className="text-orange-600">{row.overdue}</span>,
    },
    {
      header: "ACTION",
      accessor: (row: Invoice) => (
        <div className="flex gap-2">
          <PayNow
            invoiceUniqueName={row.id}
            invoiceNumber={row.invoiceNo}
            canPay={row.status !== "PAID"}
            size="sm"
          />
          <button
            onClick={() => handleDownloadInvoice(row.id, row.invoiceNo)}
            disabled={downloadingInvoice === row.id}
            className="text-blue-600 hover:text-blue-800 hover:underline disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloadingInvoice === row.id ? "Downloading..." : "Download PDF"}
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SidebarToggleButton />
            <h1 className="text-xl font-semibold">Invoices</h1>
          </div>
          <SwitchAccountButton />
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="w-48">
              <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
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
                <option>All Invoices</option>
                <option>Paid</option>
                <option>Partial Paid</option>
                <option>Unpaid</option>
                <option>Hold</option>
                <option>Cancel</option>
              </select>
            </div>
            <div className="w-48">
              <label className="mb-2 block text-sm font-medium text-gray-700">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as InvoiceSortColumn);
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
                <option>Total</option>
                <option>Date</option>
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
          ) : invoicesData.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No invoices found</div>
          ) : (
            <DataTable columns={columns} data={invoicesData} keyExtractor={(row) => row.id} />
          )}

          {invoicesData.length > 10 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(invoicesData.length / itemsPerPage)}
              totalItems={invoicesData.length}
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
