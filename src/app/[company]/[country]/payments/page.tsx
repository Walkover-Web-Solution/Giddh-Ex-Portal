"use client";

import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchAllPayments,
  selectAllPayments,
  selectAllPaymentsLoading,
  selectAllPaymentsError,
  selectCompanyUniqueName,
  selectAccountUniqueName,
} from "@/store/slices/companySlice";
import { TableSkeleton } from "@/components/skeletons/TableSkeleton";

interface Payment {
  id: string;
  paymentId: string;
  date: string;
  amount: string;
  paymentAccount: string;
  unusedAmount: string;
}

export default function PaymentsPage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const [sortFilter, setSortFilter] = useState("Amount");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const companyName = params?.company as string;
  const companyUniqueNameFromRedux = useAppSelector(selectCompanyUniqueName(companyName));
  const accountUniqueNameFromRedux = useAppSelector(selectAccountUniqueName(companyName));

  const allPayments = useAppSelector(selectAllPayments(companyName));
  const loading = useAppSelector(selectAllPaymentsLoading(companyName));
  const error = useAppSelector(selectAllPaymentsError(companyName));

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

    if (companyName && companyUniqueName && accountUniqueName) {
      dispatch(fetchAllPayments({ companyName, companyUniqueName, accountUniqueName }));
    }
  }, [dispatch, companyName, companyUniqueNameFromRedux, accountUniqueNameFromRedux]);

  const paymentsData: Payment[] = (allPayments || []).map((payment) => ({
    id: payment.uniqueName,
    paymentId: payment.voucherNumber,
    date: payment.voucherDate,
    amount: `${payment.companyCurrencySymbol || "₹"} ${(payment.grandTotal?.amountForAccount || 0).toLocaleString()}`,
    paymentAccount: payment.account?.name || "N/A",
    unusedAmount: "₹ -",
  }));

  const columns = [
    { header: "Payment#", accessor: "paymentId" as keyof Payment },
    { header: "Date", accessor: "date" as keyof Payment },
    { header: "Amount ₹", accessor: "amount" as keyof Payment },
    { header: "Payment Account", accessor: "paymentAccount" as keyof Payment },
    { header: "Unused Amount", accessor: "unusedAmount" as keyof Payment },
  ];

  return (
    <>
      <header className="border-b bg-white px-6 py-4">
        <h1 className="text-xl font-semibold">Payments Made</h1>
      </header>

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6 flex gap-4">
            <div className="w-48">
              <label className="mb-2 block text-sm font-medium text-gray-700">Sort by</label>
              <select
                value={sortFilter}
                onChange={(e) => setSortFilter(e.target.value)}
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

          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(paymentsData.length / itemsPerPage)}
            totalItems={paymentsData.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
          />
        </div>
      </div>
    </>
  );
}
