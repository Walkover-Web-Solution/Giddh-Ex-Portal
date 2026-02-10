"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import { selectCompanyUniqueName, selectAccountUniqueName } from "@/store/slices/companySlice";
import {
  getAccountStatement,
  downloadAccountStatement,
  formatCurrency,
  convertDateToAPIFormat,
  AccountStatementRequest,
  Transaction,
  AccountSummary,
  AccountAddress,
  Address,
} from "@/utils/accountStatement";
import { base64ToBlob } from "@/utils/invoicePreview";
import { DataTable } from "@/components/DataTable";
import { Dropdown } from "@/components/Dropdown";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import { Pagination } from "@/components/Pagination";
import { SidebarToggleButton } from "@/components/SidebarToggleButton";
import { SwitchAccountButton } from "@/components/SwitchAccountButton";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { DateRangeCalendar } from "@/components/ui/DateRangeCalendar";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { LEDGER_TYPE_CREDIT, LEDGER_TYPE_DEBIT } from "@/constants/ledger";
import { FileType, EXPORT_FILE_CONFIG, PAGINATION_LIMIT, PAGE_SIZE_OPTIONS } from "@/constants";
import { SortOrder } from "@/constants/sort";
import { useToast } from "@/contexts/ToastContext";

export default function AccountStatementPage() {
  const params = useParams();
  const companyName = params?.company as string;

  const companyUniqueNameFromRedux = useAppSelector(selectCompanyUniqueName(companyName));
  const accountUniqueNameFromRedux = useAppSelector(selectAccountUniqueName(companyName));

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [accountAddress, setAccountAddress] = useState<AccountAddress | null>(null);
  const [companyAddress, setCompanyAddress] = useState<Address | null>(null);
  const [accountName, setAccountName] = useState<string>("");
  const [companyNameState, setCompanyNameState] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isExporting, setIsExporting] = useState(false);

  const today = new Date();
  const thirtyDaysAgo = new Date(today);
  thirtyDaysAgo.setDate(today.getDate() - 30);

  const [fromDate, setFromDate] = useState<Date>(thirtyDaysAgo);
  const [toDate, setToDate] = useState<Date>(today);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(PAGINATION_LIMIT);
  const [totalItems, setTotalItems] = useState(0);
  const [sortDirection, setSortDirection] = useState<SortOrder>(SortOrder.ASC);
  const { showToast } = useToast();

  const getCompanyAndAccountNames = () => {
    let companyUniqueName = companyUniqueNameFromRedux;
    let accountUniqueName = accountUniqueNameFromRedux;

    if (!companyUniqueName || !accountUniqueName) {
      if (typeof window !== "undefined") {
        const userData = localStorage.getItem("userData");
        if (userData) {
          try {
            const parsedData = JSON.parse(userData);
            companyUniqueName = companyUniqueName || parsedData.companyUniqueName;
            accountUniqueName = accountUniqueName || parsedData.account?.uniqueName;
          } catch (e) {
            console.error("Error parsing userData:", e);
          }
        }
      }
    }

    return { companyUniqueName, accountUniqueName };
  };

  useEffect(() => {
    fetchAccountStatement();
  }, [fromDate, toDate, currentPage, itemsPerPage, sortDirection]);

  const fetchAccountStatement = async () => {
    const { companyUniqueName, accountUniqueName } = getCompanyAndAccountNames();
    if (!companyUniqueName || !accountUniqueName) {
      setError("Missing company or account information");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const request: AccountStatementRequest = {
        companyUniqueName,
        accountUniqueName,
        page: currentPage,
        count: itemsPerPage,
        from: convertDateToAPIFormat(fromDate),
        to: convertDateToAPIFormat(toDate),
        sort: sortDirection,
      };

      const response = await getAccountStatement(request);

      if (response.status === "success" && response.body) {
        setSummary(response.body.accountSummary);
        setTransactions(response.body.transactionDetailList);
        setAccountAddress(response.body.accountAddress);
        setCompanyAddress(response.body.companyGstAddress);
        setAccountName(response.body.accountName);
        setCompanyNameState(response.body.companyName);
        setTotalItems(response.body.totalItems);
      } else {
        setError("Failed to load account statement");
      }
    } catch (err) {
      console.error("Error fetching account statement:", err);
      setError("Failed to load account statement");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: FileType) => {
    const { companyUniqueName, accountUniqueName } = getCompanyAndAccountNames();
    if (!companyUniqueName || !accountUniqueName) return;

    setIsExporting(true);
    try {
      const request: AccountStatementRequest = {
        companyUniqueName,
        accountUniqueName,
        page: currentPage,
        count: itemsPerPage,
        from: convertDateToAPIFormat(fromDate),
        to: convertDateToAPIFormat(toDate),
        sort: sortDirection,
      };

      const response = await downloadAccountStatement(request, format);

      if (response?.status !== "success") {
        showToast(response?.message || "Export failed.", "error");
        return;
      }

      const body = response.body;

      const base64Data = typeof body === "string" ? body : body?.data;

      if (!base64Data || !base64Data.trim() || base64Data === "null") {
        showToast("No file content found to download.", "error");
        return;
      }

      if (typeof body !== "object" || typeof body.type !== "string") {
        showToast("Invalid export response from server.", "error");
        return;
      }

      const exportConfig = EXPORT_FILE_CONFIG[format];

      if (!exportConfig) {
        showToast("Unsupported export format.", "error");
        return;
      }

      const { mime: exportMime, extension: exportType } = exportConfig;

      const serverType = body.type.toLowerCase();

      if (serverType !== exportType && serverType !== exportMime) {
        showToast(`Export failed: server returned invalid file type (${body.type}).`, "error");
        return;
      }

      const fileName =
        body.name ||
        `Account-statement-${convertDateToAPIFormat(fromDate)}-${convertDateToAPIFormat(toDate)}.${exportType}`;

      const blob = base64ToBlob(base64Data, exportMime);
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error exporting statement:", error);
      showToast("Failed to export statement.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleFromDateChange = (date: Date) => {
    setFromDate(date);
    setCurrentPage(1);
  };

  const handleToDateChange = (date: Date) => {
    setToDate(date);
    setCurrentPage(1);
  };

  const statementColumns = useMemo(
    () => [
      { header: "Date", accessor: (row: Transaction) => row.date },
      {
        header: "Transaction",
        accessor: (row: Transaction) => row.voucherType,
        cellClassName: "font-medium",
      },
      {
        header: "Details",
        accessor: (row: Transaction) => row.voucherNumber,
        headerClassName: "hidden md:table-cell",
        cellClassName: "hidden md:table-cell text-gray-600",
      },
      {
        header: "Amount",
        accessor: (row: Transaction) =>
          row.voucherAmount.type === LEDGER_TYPE_DEBIT
            ? formatCurrency(row.voucherAmount.amount, accountAddress?.currency?.symbol)
            : "",
        headerClassName: "text-right",
        cellClassName: "text-right",
      },
      {
        header: "Payments",
        accessor: (row: Transaction) =>
          row.voucherAmount.type === LEDGER_TYPE_CREDIT
            ? formatCurrency(row.voucherAmount.amount, accountAddress?.currency?.symbol)
            : "",
        headerClassName: "hidden md:table-cell text-right",
        cellClassName: "hidden md:table-cell text-right",
      },
      {
        header: "Balance",
        accessor: (row: Transaction) =>
          formatCurrency(row.closingBalance.amount, accountAddress?.currency?.symbol),
        headerClassName: "text-right",
        cellClassName: "text-right font-medium",
      },
    ],
    [accountAddress?.currency?.symbol]
  );

  const effectiveTotal =
    transactions.length < itemsPerPage && transactions.length > 0
      ? (currentPage - 1) * itemsPerPage + transactions.length
      : totalItems;

  return (
    <>
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SidebarToggleButton />
            <h1 className="text-xl font-semibold">Account Statement</h1>
          </div>
          <SwitchAccountButton />
        </div>
      </header>

      <div className="flex-1 overflow-auto p-4 md:p-6">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <TableSkeleton rows={10} />
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600">
              {error}
            </div>
          ) : (
            <Card>
              <CardHeader className="border-b">
                <div className="flex flex-col gap-6 py-2 md:flex-row md:justify-between">
                  <div className="text-sm text-gray-600">
                    <h2 className="mb-1 font-bold text-black">{accountName}</h2>
                    {accountAddress && (
                      <>
                        <p>{accountAddress.countryName}</p>
                        <p>Email: {accountAddress.email}</p>
                        <p>Mobile No: {accountAddress.mobileNo}</p>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 md:text-right">
                    <h2 className="mb-1 font-bold text-black">{companyNameState}</h2>
                    {companyAddress && (
                      <>
                        <p>{companyAddress.countryName}</p>
                        <p>Mobile No: {companyAddress.mobileNo}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="mt-6 md:text-right">
                  <h2 className="text-xl font-bold underline decoration-2 underline-offset-4 md:text-2xl">
                    Statement of Accounts
                  </h2>
                  <div className="mt-2 text-sm text-gray-600">
                    {convertDateToAPIFormat(fromDate)} – {convertDateToAPIFormat(toDate)}
                  </div>
                </div>

                {summary && (
                  <div className="mt-6 flex md:justify-end">
                    <div className="w-full md:max-w-sm">
                      <div className="rounded-lg bg-gray-100">
                        <div className="bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">
                          Account Summary
                        </div>
                        <div className="space-y-2 px-4 py-3 text-sm">
                          <div className="flex justify-between text-gray-600">
                            <span>Opening Balance</span>
                            <span className="font-medium">
                              {formatCurrency(
                                summary.openingBalance.amount,
                                accountAddress?.currency?.symbol
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Invoiced Amount</span>
                            <span className="font-medium">
                              {formatCurrency(summary.debitTotal, accountAddress?.currency?.symbol)}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Amount Paid</span>
                            <span className="font-medium">
                              {formatCurrency(
                                summary.creditTotal,
                                accountAddress?.currency?.symbol
                              )}
                            </span>
                          </div>
                          <div className="border-t-2 border-gray-400 pt-2" />
                          <div className="flex justify-between font-semibold text-gray-800">
                            <span>Balance Due</span>
                            <span>
                              {formatCurrency(
                                summary.closingBalance.amount,
                                accountAddress?.currency?.symbol
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardHeader>

              <CardContent>
                <div className="mb-4 flex flex-row items-center justify-between gap-3">
                  <DateRangeCalendar
                    fromDate={fromDate}
                    toDate={toDate}
                    onFromDateChange={handleFromDateChange}
                    onToDateChange={handleToDateChange}
                    openDirection="top"
                    position="left"
                    compact
                  />

                  <Dropdown
                    trigger={
                      <>
                        <span>{isExporting ? "Exporting..." : "Export"}</span>
                        <ChevronDownIcon
                          aria-hidden
                          className="-mr-1 size-5 shrink-0 text-gray-400"
                        />
                      </>
                    }
                    buttonClassName="w-auto min-w-0 justify-center px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
                    panelClassName="w-56 min-w-[140px]"
                    disabled={isExporting}
                  >
                    <Dropdown.Item
                      onClick={() => handleExport(FileType.PDF)}
                      disabled={isExporting}
                    >
                      As PDF
                    </Dropdown.Item>
                    <Dropdown.Item
                      onClick={() => handleExport(FileType.XLSX)}
                      disabled={isExporting}
                    >
                      As XLSX
                    </Dropdown.Item>
                  </Dropdown>
                </div>

                <DataTable
                  columns={statementColumns}
                  data={transactions}
                  keyExtractor={(row) => `${row.date}-${row.voucherNumber}-${row.voucherType}`}
                />

                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.max(1, Math.ceil(effectiveTotal / itemsPerPage))}
                    totalItems={effectiveTotal}
                    itemsPerPage={itemsPerPage}
                    pageSizeOptions={PAGE_SIZE_OPTIONS}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(newSize) => {
                      setItemsPerPage(newSize);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
