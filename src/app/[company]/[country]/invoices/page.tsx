"use client";

import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { PayNow } from "@/components/PayNow";
import { useState, useEffect } from "react";
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
} from "@/store/slices/companySlice";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";
import downloadInvoice, { downloadBase64AsPDF } from "@/utils/downloadInvoice";

interface Invoice {
  id: string;
  invoiceNo: string;
  date: string;
  total: string;
  status: string;
  overdue: string;
}

export default function InvoicesPage() {
  const params = useParams();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [statusFilter, setStatusFilter] = useState("All Invoices");
  const [sortBy, setSortBy] = useState("Total");
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

  useEffect(() => {
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

    // Only fetch if data is stale or doesn't exist
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
    return diffDays > 0 ? `Overdue by: ${diffDays} days` : "";
  };

  const handleInvoiceClick = (invoiceUniqueName: string) => {
    router.push(`/${companyName}/${country}/invoice/preview?voucher=${invoiceUniqueName}`);
  };

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
      console.error("Error downloading invoice:", error);
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const allInvoicesData: Invoice[] = (allInvoices || []).map((invoice) => ({
    id: invoice.uniqueName,
    invoiceNo: invoice.voucherNumber,
    date: invoice.voucherDate,
    total: `${invoice.companyCurrencySymbol || "₹"} ${(invoice.grandTotal?.amountForAccount || 0).toLocaleString()}`,
    status: invoice.balanceStatus?.toUpperCase() || "UNPAID",
    overdue: invoice.balanceStatus !== "paid" ? calculateOverdue(invoice.dueDate) : "",
  }));

  // Apply filters
  const filteredInvoices = allInvoicesData.filter((invoice) => {
    // Filter by status
    if (statusFilter === "All Invoices") return true;
    if (statusFilter === "Paid" && invoice.status !== "PAID") return false;
    if (statusFilter === "Partial Paid" && invoice.status !== "PARTIAL-PAID") return false;
    if (statusFilter === "Unpaid" && invoice.status !== "UNPAID") return false;
    if (statusFilter === "Hold" && invoice.status !== "HOLD") return false;
    if (statusFilter === "Cancel" && invoice.status !== "CANCEL") return false;

    return true;
  });

  // Apply sorting
  const invoicesData = [...filteredInvoices].sort((a, b) => {
    if (sortBy === "Total") {
      // Extract numeric value from total string (e.g., "₹ 33,324" -> 33324)
      const amountA = parseFloat(a.total.replace(/[^0-9.-]+/g, ""));
      const amountB = parseFloat(b.total.replace(/[^0-9.-]+/g, ""));
      return amountB - amountA; // Descending order
    } else if (sortBy === "Date") {
      // Sort by date (newest first)
      const dateA = new Date(a.date.split("-").reverse().join("-")).getTime();
      const dateB = new Date(b.date.split("-").reverse().join("-")).getTime();
      return dateB - dateA; // Descending order
    }
    return 0;
  });

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
    { header: "DATE", accessor: "date" as keyof Invoice },
    { header: "TOTAL ₹", accessor: "total" as keyof Invoice },
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
        <h1 className="text-xl font-semibold">Invoices</h1>
      </header>

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex gap-4">
            <div className="w-48">
              <label className="mb-2 block text-sm font-medium text-gray-700">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
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

            <div className="w-48">
              <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
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

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(invoicesData.length / itemsPerPage)}
            totalItems={invoicesData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </div>
    </>
  );
}
