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
import { Download, ChevronUp, ChevronDown } from "lucide-react";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import { Pagination } from "@/components/Pagination";

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
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

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
          `account-statement-${convertDateToAPIFormat(fromDate)}-${convertDateToAPIFormat(toDate)}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }
    } catch (err) {
      console.error("Error exporting statement:", err);
      alert("Failed to export statement");
    } finally {
      setIsExporting(false);
    }
  };

  const toggleSort = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromDate(new Date(e.target.value));
    setCurrentPage(1);
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToDate(new Date(e.target.value));
    setCurrentPage(1);
  };

  return (
    <>
      <header className="border-b bg-white px-6 py-4">
        <h1 className="text-xl font-semibold">Account Statement</h1>
      </header>

      <div className="flex-1 overflow-auto p-6">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <TableSkeleton rows={10} />
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-center text-red-600">
              {error}
            </div>
          ) : (
            <div className="rounded-lg border bg-white">
              <div className="border-b p-8">
                <div className="mb-12 flex items-start justify-between">
                  <div className="text-sm text-gray-600">
                    <h2 className="mb-1 font-bold text-black">{accountName}</h2>
                    {accountAddress && (
                      <>
                        <p>{accountAddress.countryName}</p>
                        <p>Email : {accountAddress.email}</p>
                        <p>Mobile No.: {accountAddress.mobileNo}</p>
                      </>
                    )}
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <h2 className="mb-1 font-bold text-black">{companyNameState}</h2>
                    {companyAddress && (
                      <>
                        <p>{companyAddress.countryName}</p>
                        <p>Mobile No. : {companyAddress.mobileNo}</p>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-start justify-between">
                  <div className="w-64"></div>
                  <div className="flex-1">
                    <div className="text-right">
                      <h2 className="text-2xl font-bold underline decoration-2 underline-offset-4">
                        Statement of Accounts
                      </h2>
                      <div className="mt-2 text-sm text-gray-600">
                        {convertDateToAPIFormat(fromDate)} - {convertDateToAPIFormat(toDate)}
                      </div>
                    </div>

                    {summary && (
                      <div className="mt-6">
                        <div className="rounded-lg bg-gray-100">
                          <div className="bg-gray-200 px-4 py-2 text-sm font-semibold text-gray-700">
                            Account Summary
                          </div>
                          <div className="space-y-2 px-4 py-3 text-sm">
                            <div className="flex justify-between text-gray-600">
                              <span>Opening Balance</span>
                              <span className="font-medium">
                                {summary.openingBalance.type === "CREDIT" && "-"}
                                {formatCurrency(
                                  summary.openingBalance.amount,
                                  accountAddress?.currency?.symbol
                                )}
                              </span>
                            </div>
                            <div className="flex justify-between text-gray-600">
                              <span>Invoiced Amount</span>
                              <span className="font-medium">
                                {formatCurrency(
                                  summary.debitTotal,
                                  accountAddress?.currency?.symbol
                                )}
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
                            <div className="border-t-2 border-gray-400 pt-2"></div>
                            <div className="flex justify-between font-semibold text-gray-800">
                              <span>Balance Due</span>
                              <span>
                                {summary.closingBalance.type === "CREDIT" && "-"}
                                {formatCurrency(
                                  summary.closingBalance.amount,
                                  accountAddress?.currency?.symbol
                                )}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 rounded-md border border-gray-300 px-3 py-2">
                    <input
                      type="date"
                      value={fromDate.toISOString().split("T")[0]}
                      onChange={handleFromDateChange}
                      className="border-none text-sm focus:outline-none"
                    />
                    <span className="text-gray-500">-</span>
                    <input
                      type="date"
                      value={toDate.toISOString().split("T")[0]}
                      onChange={handleToDateChange}
                      className="border-none text-sm focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={handleExport}
                    disabled={isExporting}
                    className="rounded-md border border-blue-600 bg-white px-6 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isExporting ? "Exporting..." : "Export"}
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-800 text-left text-sm text-white">
                        <th className="px-4 py-3 font-medium">
                          <button
                            onClick={toggleSort}
                            className="flex items-center gap-1 hover:text-gray-200"
                          >
                            Date
                            {sortDirection === "asc" ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </th>
                        <th className="px-4 py-3 font-medium">Transactions</th>
                        <th className="px-4 py-3 font-medium">Details</th>
                        <th className="px-4 py-3 text-right font-medium">Amount</th>
                        <th className="px-4 py-3 text-right font-medium">Payments</th>
                        <th className="px-4 py-3 text-right font-medium">Balance</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm">
                      {transactions.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                            No transactions found for the selected date range
                          </td>
                        </tr>
                      ) : (
                        transactions.map((transaction, index) => (
                          <tr key={index} className="border-b hover:bg-gray-50">
                            <td className="px-4 py-3">{transaction.date}</td>
                            <td className="px-4 py-3 font-medium">{transaction.voucherType}</td>
                            <td className="px-4 py-3 text-gray-600">{transaction.voucherNumber}</td>
                            <td className="px-4 py-3 text-right">
                              {transaction.voucherAmount.type === "DEBIT"
                                ? formatCurrency(
                                    transaction.voucherAmount.amount,
                                    accountAddress?.currency?.symbol
                                  )
                                : "-"}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {transaction.voucherAmount.type === "CREDIT"
                                ? formatCurrency(
                                    transaction.voucherAmount.amount,
                                    accountAddress?.currency?.symbol
                                  )
                                : "-"}
                            </td>
                            <td className="px-4 py-3 text-right font-medium">
                              {transaction.closingBalance.type === "CREDIT" && "-"}
                              {formatCurrency(
                                transaction.closingBalance.amount,
                                accountAddress?.currency?.symbol
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {transactions.length > 0 && summary && (
                      <tfoot>
                        <tr className="border-t-2 bg-gray-50 font-semibold">
                          <td colSpan={5} className="px-4 py-3 text-right">
                            Balance Due
                          </td>
                          <td className="px-4 py-3 text-right">
                            {summary.closingBalance.type === "CREDIT" && "-"}
                            {formatCurrency(
                              summary.closingBalance.amount,
                              accountAddress?.currency?.symbol
                            )}
                          </td>
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>

                {totalItems > 10 && (
                  <div className="mt-4">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={Math.ceil(totalItems / itemsPerPage)}
                      totalItems={totalItems}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                      onItemsPerPageChange={(newSize) => {
                        setItemsPerPage(newSize);
                        setCurrentPage(1);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
