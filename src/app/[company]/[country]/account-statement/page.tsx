"use client";

import { useState, useEffect } from "react";
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
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import { Pagination } from "@/components/Pagination";
import { SidebarToggleButton } from "@/components/SidebarToggleButton";
import { SwitchAccountButton } from "@/components/SwitchAccountButton";
import { DateRangeCalendar } from "@/components/ui/DateRangeCalendar";
import { LEDGER_TYPE_CREDIT, LEDGER_TYPE_DEBIT } from "@/constants/ledger";
import { PAGINATION_LIMIT, PAGE_SIZE_OPTIONS } from "@/constants";
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

  const handleExport = async () => {
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

      const response = await downloadAccountStatement(request);

      if (response.status === "success" && response.body) {
        const blob = new Blob([atob(response.body.data)], { type: response.body.type });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download =
          response.body.name ||
          `Account-statement-${convertDateToAPIFormat(fromDate)}-${convertDateToAPIFormat(toDate)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Error exporting statement:", err);
      showToast("Failed to export statement", "error");
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
            <div className="rounded-lg border bg-white">
              <div className="border-b p-4 md:p-8">
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
                              {summary.openingBalance.type === LEDGER_TYPE_CREDIT && "-"}
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
                              {summary.closingBalance.type === LEDGER_TYPE_CREDIT && "-"}
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
              </div>

              <div className="p-4 md:p-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <DateRangeCalendar
                    fromDate={fromDate}
                    toDate={toDate}
                    onFromDateChange={handleFromDateChange}
                    onToDateChange={handleToDateChange}
                  />
                  <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="w-full rounded-md border border-blue-600 bg-white px-6 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                  >
                    {isExporting ? "Exporting..." : "Export"}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-full table-fixed border-collapse">
                    <thead>
                      <tr className="border-b bg-gray-800 text-left text-sm text-white">
                        <th className="min-w-[110px] whitespace-nowrap px-2 py-3 font-medium sm:px-3 md:px-4">
                          Date
                        </th>
                        <th className="min-w-[140px] whitespace-nowrap px-2 py-3 font-medium sm:px-3 md:px-4">
                          Transaction
                        </th>
                        <th className="hidden min-w-[160px] whitespace-nowrap px-3 py-3 font-medium md:table-cell md:px-4">
                          Details
                        </th>
                        <th className="min-w-[120px] whitespace-nowrap px-2 py-3 text-right font-medium sm:px-3 md:px-4">
                          Amount
                        </th>
                        <th className="hidden min-w-[120px] whitespace-nowrap px-3 py-3 text-right font-medium sm:table-cell md:px-4">
                          Payments
                        </th>
                        <th className="min-w-[140px] whitespace-nowrap px-2 py-3 text-right font-medium sm:px-3 md:px-4">
                          Balance
                        </th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                            No transactions found
                          </td>
                        </tr>
                      ) : (
                        transactions.map((transaction, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="min-w-[110px] whitespace-nowrap px-2 py-3 sm:px-3 md:px-4">
                              {transaction.date}
                            </td>
                            <td className="min-w-[140px] whitespace-nowrap px-2 py-3 font-medium sm:px-3 md:px-4">
                              {transaction.voucherType}
                            </td>
                            <td className="hidden min-w-[160px] whitespace-nowrap px-3 py-3 text-gray-600 md:table-cell md:px-4">
                              {transaction.voucherNumber}
                            </td>
                            <td className="min-w-[120px] whitespace-nowrap px-2 py-3 text-right sm:px-3 md:px-4">
                              {transaction.voucherAmount.type === LEDGER_TYPE_DEBIT
                                ? formatCurrency(
                                    transaction.voucherAmount.amount,
                                    accountAddress?.currency?.symbol
                                  )
                                : "-"}
                            </td>
                            <td className="hidden min-w-[120px] whitespace-nowrap px-3 py-3 text-right sm:table-cell md:px-4">
                              {transaction.voucherAmount.type === LEDGER_TYPE_CREDIT
                                ? formatCurrency(
                                    transaction.voucherAmount.amount,
                                    accountAddress?.currency?.symbol
                                  )
                                : "-"}
                            </td>
                            <td className="min-w-[140px] whitespace-nowrap px-2 py-3 text-right font-medium sm:px-3 md:px-4">
                              {transaction.closingBalance.type === LEDGER_TYPE_CREDIT && "-"}
                              {formatCurrency(
                                transaction.closingBalance.amount,
                                accountAddress?.currency?.symbol
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={Math.max(1, Math.ceil(totalItems / itemsPerPage))}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    pageSizeOptions={PAGE_SIZE_OPTIONS}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={(newSize) => {
                      setItemsPerPage(newSize);
                      setCurrentPage(1);
                    }}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
