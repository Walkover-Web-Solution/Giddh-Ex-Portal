"use client";

import { DataTable } from "@/components/DataTable";
import { Dropdown } from "@/components/Dropdown";
import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllInvoices,
  invoiceSortBy,
  selectAllInvoices,
  selectAllInvoicesLoading,
  selectAllInvoicesError,
  selectAllInvoicesTotalItems,
  selectAllInvoicesTotalPages,
  selectCompanyUniqueName,
  selectAccountUniqueName,
  selectCompanyDecimalPlaces,
  selectCompanyBalanceDisplayFormat,
} from "@/store/slices/companySlice";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import { formatCurrencyAmount } from "@/utils/currency";
import { getLocaleFromDisplayFormat } from "@/utils/numberFormat";
import { downloadBase64AsPDF } from "@/utils/fileUtils";
import downloadInvoice from "@/utils/downloadInvoice";
import { getCompanyAndAccountNames } from "@/utils/getUserDataFromStorage";
import { logger } from "@/utils/logger";
import { useToast } from "@/contexts/ToastContext";
import { SidebarToggleButton } from "@/components/SidebarToggleButton";
import { SwitchAccountButton } from "@/components/SwitchAccountButton";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { PAGINATION_LIMIT } from "@/constants";
import { SortOrder } from "@/constants/sort";
import { InvoiceBalanceStatus, INVOICE_BALANCE_STATUS_LABELS } from "@/constants/invoiceStatus";
import type { Invoice, InvoiceSortColumn } from "./types";
import { getPaymentMethods, PAYMENT_METHODS_ENUM } from "@/utils/payment";
import { PayNow } from "@/components/PayNow";

export type StatusFilterValue = "All Invoices" | InvoiceBalanceStatus;
function statusFilterToBalanceStatus(statusFilter: StatusFilterValue): string[] {
  if (statusFilter === "All Invoices") return [];
  return [statusFilter];
}

export default function InvoicesPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("All Invoices");
  const [sortBy, setSortBy] = useState<InvoiceSortColumn>("Date");
  const [sortDirection, setSortDirection] = useState<SortOrder>(SortOrder.DESC);
  const [currentPage, setCurrentPage] = useState(1);
  const [downloadingInvoice, setDownloadingInvoice] = useState<string | null>(null);
  const [directPayInvoiceId, setDirectPayInvoiceId] = useState<string | null>(null);
  const [checkingPayMethods, setCheckingPayMethods] = useState<string | null>(null);

  const companyName = params?.company as string;
  const country = params?.country as string;
  const companyUniqueNameFromRedux = useAppSelector(selectCompanyUniqueName(companyName));
  const accountUniqueNameFromRedux = useAppSelector(selectAccountUniqueName(companyName));

  const allInvoices = useAppSelector(selectAllInvoices(companyName));
  const loading = useAppSelector(selectAllInvoicesLoading(companyName));
  const error = useAppSelector(selectAllInvoicesError(companyName));
  const totalItems = useAppSelector(selectAllInvoicesTotalItems(companyName));
  const totalPages = useAppSelector(selectAllInvoicesTotalPages(companyName));
  const companyDecimalPlaces = useAppSelector(selectCompanyDecimalPlaces(companyName));
  const balanceDisplayFormat = useAppSelector(selectCompanyBalanceDisplayFormat(companyName));
  const amountFormatLocale = useMemo(
    () => getLocaleFromDisplayFormat(balanceDisplayFormat),
    [balanceDisplayFormat]
  );

  const apiSortBy = sortBy === "Date" ? invoiceSortBy.voucherDate : invoiceSortBy.grandTotal;
  const lastKeyRef = useRef("");

  useEffect(() => {
    if (loading) {
      setDirectPayInvoiceId(null);
    }
  }, [loading]);

  useEffect(() => {
    const { companyUniqueName, accountUniqueName } = getCompanyAndAccountNames(
      companyName,
      companyUniqueNameFromRedux,
      accountUniqueNameFromRedux
    );
    if (!companyName || !companyUniqueName || !accountUniqueName) return;
    const key = `${companyUniqueName}|${accountUniqueName}|${currentPage}|${sortDirection}|${apiSortBy}|${statusFilter}`;
    if (lastKeyRef.current === key) return;
    lastKeyRef.current = key;
    dispatch(
      fetchAllInvoices({
        companyName,
        companyUniqueName,
        accountUniqueName,
        sort: sortDirection,
        sortBy: apiSortBy,
        balanceStatus: statusFilterToBalanceStatus(statusFilter),
        page: currentPage,
        count: PAGINATION_LIMIT,
      })
    );
  }, [
    dispatch,
    companyName,
    companyUniqueNameFromRedux,
    accountUniqueNameFromRedux,
    currentPage,
    sortDirection,
    apiSortBy,
    statusFilter,
  ]);

  const handleInvoiceClick = (invoiceUniqueName: string) => {
    const { companyUniqueName, accountUniqueName } = getCompanyAndAccountNames(
      companyName,
      companyUniqueNameFromRedux,
      accountUniqueNameFromRedux
    );
    const params = new URLSearchParams();
    params.set("voucher", invoiceUniqueName);
    if (companyUniqueName) params.set("companyUniqueName", companyUniqueName);
    if (accountUniqueName) params.set("accountUniqueName", accountUniqueName);
    const path = `/${encodeURIComponent(companyName)}/${encodeURIComponent(country)}/invoice/preview`;
    router.push(`${path}?${params.toString()}`);
  };

  const navigateToInvoicePay = useCallback(
    (invoiceUniqueName: string) => {
      const { companyUniqueName, accountUniqueName } = getCompanyAndAccountNames(
        companyName,
        companyUniqueNameFromRedux,
        accountUniqueNameFromRedux
      );
      if (!accountUniqueName) {
        showToast("Account information is missing. Please refresh or log in again.", "error");
        return;
      }
      const search = new URLSearchParams();
      if (companyUniqueName) search.set("companyUniqueName", companyUniqueName);
      const path = `/${encodeURIComponent(companyName)}/${encodeURIComponent(country)}/invoice-pay/account/${encodeURIComponent(accountUniqueName)}/voucher/${encodeURIComponent(invoiceUniqueName)}`;
      router.push(search.toString() ? `${path}?${search.toString()}` : path);
    },
    [
      companyUniqueNameFromRedux,
      accountUniqueNameFromRedux,
      companyName,
      country,
      router,
      showToast,
    ]
  );

  const handlePayNowClick = async (e: React.MouseEvent, invoiceUniqueName: string) => {
    e.preventDefault();
    e.stopPropagation();

    const { companyUniqueName, accountUniqueName } = getCompanyAndAccountNames(
      companyName,
      companyUniqueNameFromRedux,
      accountUniqueNameFromRedux
    );
    if (!accountUniqueName) {
      return;
    }
    if (!companyUniqueName) {
      navigateToInvoicePay(invoiceUniqueName);
      return;
    }

    setCheckingPayMethods(invoiceUniqueName);
    try {
      const sessionId = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await getPaymentMethods({
        companyUniqueName,
        accountUniqueName,
        sessionId: sessionId || undefined,
      });

      const body = (response?.body ?? {}) as Record<string, unknown>;
      const isEnabled = (val: unknown) =>
        val === true ||
        (val && typeof val === "object" && (val as { enabled?: boolean }).enabled !== false);
      const enabledMethods = [
        PAYMENT_METHODS_ENUM.RAZORPAY,
        PAYMENT_METHODS_ENUM.PAYPAL,
        PAYMENT_METHODS_ENUM.PAYU,
      ].filter((key) => {
        const variants = [
          key,
          key.toLowerCase(),
          key.charAt(0).toUpperCase() + key.slice(1).toLowerCase(),
        ];
        return variants.some((v) => isEnabled(body[v]));
      });

      if (enabledMethods.length === 1) {
        setDirectPayInvoiceId(invoiceUniqueName);
      } else {
        navigateToInvoicePay(invoiceUniqueName);
      }
    } catch {
      navigateToInvoicePay(invoiceUniqueName);
    } finally {
      setCheckingPayMethods(null);
    }
  };

  const handleClearFilters = () => {
    setStatusFilter("All Invoices");
    setSortBy("Date");
    setSortDirection(SortOrder.DESC);
    setCurrentPage(1);
    refetchInvoicesWithSort("Date", SortOrder.DESC, []);
  };

  const refetchInvoicesWithSort = (
    newSortBy: InvoiceSortColumn,
    newSortDirection: SortOrder,
    balanceStatusOverride?: string[]
  ) => {
    const { companyUniqueName, accountUniqueName } = getCompanyAndAccountNames(
      companyName,
      companyUniqueNameFromRedux,
      accountUniqueNameFromRedux
    );
    if (companyName && companyUniqueName && accountUniqueName) {
      dispatch(
        fetchAllInvoices({
          companyName,
          companyUniqueName,
          accountUniqueName,
          sort: newSortDirection,
          sortBy: newSortBy === "Date" ? invoiceSortBy.voucherDate : invoiceSortBy.grandTotal,
          balanceStatus:
            balanceStatusOverride !== undefined
              ? balanceStatusOverride
              : statusFilterToBalanceStatus(statusFilter),
          page: 1,
          count: PAGINATION_LIMIT,
        })
      );
    }
  };

  const refetchInvoicesWithStatus = (newStatusFilter: StatusFilterValue) => {
    const { companyUniqueName, accountUniqueName } = getCompanyAndAccountNames(
      companyName,
      companyUniqueNameFromRedux,
      accountUniqueNameFromRedux
    );
    if (companyName && companyUniqueName && accountUniqueName) {
      dispatch(
        fetchAllInvoices({
          companyName,
          companyUniqueName,
          accountUniqueName,
          sort: sortDirection,
          sortBy: apiSortBy,
          balanceStatus: statusFilterToBalanceStatus(newStatusFilter),
          page: 1,
          count: PAGINATION_LIMIT,
        })
      );
    }
  };

  const handleSort = (column: InvoiceSortColumn) => {
    const newSortDirection =
      sortBy === column
        ? sortDirection === SortOrder.ASC
          ? SortOrder.DESC
          : SortOrder.ASC
        : column === "Date"
          ? SortOrder.DESC
          : SortOrder.ASC;
    const newSortBy = column;
    setSortBy(newSortBy);
    setSortDirection(newSortDirection);
    setCurrentPage(1);
    refetchInvoicesWithSort(newSortBy, newSortDirection);
  };

  const hasActiveFilters =
    statusFilter !== "All Invoices" || sortBy !== "Date" || sortDirection !== SortOrder.DESC;

  const handleDownloadInvoice = async (invoiceUniqueName: string, invoiceNumber: string) => {
    const { companyUniqueName, accountUniqueName } = getCompanyAndAccountNames(
      companyName,
      companyUniqueNameFromRedux,
      accountUniqueNameFromRedux
    );

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

  const validBalanceStatuses = useMemo(() => new Set(Object.values(InvoiceBalanceStatus)), []);

  const getInvoiceBalanceStatus = (invoice: { balanceStatus?: string }) =>
    (invoice.balanceStatus || "").toUpperCase().replace(/\s+/g, "-");

  const allInvoicesData: Invoice[] = useMemo(
    () =>
      (allInvoices || [])
        .filter((invoice) => {
          const status = getInvoiceBalanceStatus(invoice);
          return validBalanceStatuses.has(status as InvoiceBalanceStatus);
        })
        .map((invoice) => {
          const status = getInvoiceBalanceStatus(invoice);
          const isPayableStatus =
            status === InvoiceBalanceStatus.UNPAID || status === InvoiceBalanceStatus.PARTIAL_PAID;
          const isHoldOrCancel =
            status === InvoiceBalanceStatus.HOLD || status === InvoiceBalanceStatus.CANCEL;
          const showPayNow = isPayableStatus && !isHoldOrCancel;
          const rawOverdue = invoice.overdueDays ?? "";
          const overdueFormatted =
            rawOverdue && /\b1\s+days\b/i.test(rawOverdue)
              ? rawOverdue.replace(/\b1\s+days\b/i, "1 day")
              : rawOverdue;
          const totalCurrency = invoice.accountCurrencySymbol ?? "";
          return {
            id: invoice.uniqueName ?? "",
            invoiceNo: invoice.voucherNumber ?? "",
            date: invoice.voucherDate ?? "",
            total: formatCurrencyAmount(invoice.grandTotal?.amountForAccount, totalCurrency, {
              decimals: companyDecimalPlaces,
              locale: amountFormatLocale,
            }),
            status: status || InvoiceBalanceStatus.UNKNOWN,
            overdue:
              status === InvoiceBalanceStatus.PAID ||
                status === InvoiceBalanceStatus.HOLD ||
                status === InvoiceBalanceStatus.CANCEL
                ? "-"
                : overdueFormatted,
            showPayNow,
          };
        }),
    [allInvoices, validBalanceStatuses, companyDecimalPlaces, amountFormatLocale]
  );

  const invoicesData = allInvoicesData;
  const paginatedData = invoicesData;

  const columns = [
    {
      header: "S. No.",
      accessor: (row: Invoice, index: number) => index + 1 + (currentPage - 1) * PAGINATION_LIMIT,
    },
    {
      header: "Invoice No.",
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
          Date
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
          Total
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
      header: "Status",
      accessor: (row: Invoice) => (
        <span
          className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${row.status === "PENDING"
            ? "bg-amber-100 text-amber-800"
            : row.status === InvoiceBalanceStatus.PAID
              ? "bg-green-100 text-green-800"
              : "bg-orange-100 text-orange-800"
            }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      header: "Over Due",
      accessor: (row: Invoice) => <span className="text-orange-">{row.overdue}</span>,
    },
    {
      header: "Action",
      accessor: (row: Invoice) => (
        <div className="flex gap-2">
          {row.showPayNow && (
            <>
              {directPayInvoiceId === row.id ? (
                <PayNow
                  invoiceUniqueName={row.id}
                  invoiceNumber={row.invoiceNo}
                  canPay
                  autoTrigger
                  variant="button"
                  buttonVariant="outline"
                  size="sm"
                  className="shrink-0"
                  onSuccess={() => setDirectPayInvoiceId(null)}
                  onAutoTriggerDone={() => setDirectPayInvoiceId(null)}
                />
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={(e) => handlePayNowClick(e, row.id)}
                  disabled={checkingPayMethods === row.id}
                  className="shrink-0"
                >
                  {checkingPayMethods === row.id ? "Loading..." : "Pay Now"}
                </Button>
              )}
            </>
          )}
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
              <Dropdown
                trigger={
                  <>
                    <span className="block truncate text-left">
                      {statusFilter === "All Invoices"
                        ? "All Invoices"
                        : INVOICE_BALANCE_STATUS_LABELS[statusFilter]}
                    </span>
                    <ChevronDownIcon aria-hidden className="-mr-1 size-5 shrink-0 text-gray-400" />
                  </>
                }
                buttonClassName="w-full justify-between"
                panelClassName="w-48 min-w-full"
                fullWidth
              >
                <Dropdown.Item
                  onClick={() => {
                    setStatusFilter("All Invoices");
                    setCurrentPage(1);
                    refetchInvoicesWithStatus("All Invoices");
                  }}
                >
                  All Invoices
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setStatusFilter(InvoiceBalanceStatus.PAID);
                    setCurrentPage(1);
                    refetchInvoicesWithStatus(InvoiceBalanceStatus.PAID);
                  }}
                >
                  {INVOICE_BALANCE_STATUS_LABELS[InvoiceBalanceStatus.PAID]}
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setStatusFilter(InvoiceBalanceStatus.PARTIAL_PAID);
                    setCurrentPage(1);
                    refetchInvoicesWithStatus(InvoiceBalanceStatus.PARTIAL_PAID);
                  }}
                >
                  {INVOICE_BALANCE_STATUS_LABELS[InvoiceBalanceStatus.PARTIAL_PAID]}
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setStatusFilter(InvoiceBalanceStatus.UNPAID);
                    setCurrentPage(1);
                    refetchInvoicesWithStatus(InvoiceBalanceStatus.UNPAID);
                  }}
                >
                  {INVOICE_BALANCE_STATUS_LABELS[InvoiceBalanceStatus.UNPAID]}
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setStatusFilter(InvoiceBalanceStatus.HOLD);
                    setCurrentPage(1);
                    refetchInvoicesWithStatus(InvoiceBalanceStatus.HOLD);
                  }}
                >
                  {INVOICE_BALANCE_STATUS_LABELS[InvoiceBalanceStatus.HOLD]}
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setStatusFilter(InvoiceBalanceStatus.CANCEL);
                    setCurrentPage(1);
                    refetchInvoicesWithStatus(InvoiceBalanceStatus.CANCEL);
                  }}
                >
                  {INVOICE_BALANCE_STATUS_LABELS[InvoiceBalanceStatus.CANCEL]}
                </Dropdown.Item>
              </Dropdown>
            </div>
            <div className="w-48">
              <label className="mb-2 block text-sm font-medium text-gray-700">Sort By</label>
              <Dropdown
                trigger={
                  <>
                    <span className="block truncate text-left">{sortBy}</span>
                    <ChevronDownIcon aria-hidden className="-mr-1 size-5 shrink-0 text-gray-400" />
                  </>
                }
                buttonClassName="w-full justify-between"
                panelClassName="w-48 min-w-full"
                fullWidth
              >
                <Dropdown.Item
                  onClick={() => {
                    setSortBy("Total");
                    setSortDirection(SortOrder.ASC);
                    setCurrentPage(1);
                    refetchInvoicesWithSort("Total", SortOrder.ASC);
                  }}
                >
                  Total
                </Dropdown.Item>
                <Dropdown.Item
                  onClick={() => {
                    setSortBy("Date");
                    setSortDirection(SortOrder.DESC);
                    setCurrentPage(1);
                    refetchInvoicesWithSort("Date", SortOrder.DESC);
                  }}
                >
                  Date
                </Dropdown.Item>
              </Dropdown>
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
            <TableSkeleton rows={PAGINATION_LIMIT} />
          ) : error ? (
            <div className="py-12 text-center text-red-500">{error}</div>
          ) : invoicesData.length === 0 ? (
            <div className="py-12 text-center text-gray-500">No invoices found</div>
          ) : (
            <DataTable columns={columns} data={paginatedData} keyExtractor={(row) => row.id} />
          )}

          {totalPages > 1 && (
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
