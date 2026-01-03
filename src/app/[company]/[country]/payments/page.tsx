"use client";

import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { useState } from "react";

interface Payment {
  id: number;
  paymentId: string;
  date: string;
  amount: string;
  paymentAccount: string;
  unusedAmount: string;
}

const paymentsData: Payment[] = [
  {
    id: 1,
    paymentId: "RCPT-241024-1",
    date: "24-10-24",
    amount: "₹ 1,000",
    paymentAccount: "CASH",
    unusedAmount: "₹ -",
  },
];

export default function PaymentsPage() {
  const [sortFilter, setSortFilter] = useState("Amount");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const columns = [
    { header: "Payment#", accessor: "paymentId" as keyof Payment },
    { header: "Date", accessor: "date" as keyof Payment },
    { header: "Amount ₹", accessor: "amount" as keyof Payment },
    { header: "Payment Account", accessor: "paymentAccount" as keyof Payment },
    { header: "Unused Amount", accessor: "unusedAmount" as keyof Payment },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="ml-64 flex flex-1 flex-col">
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

            <DataTable columns={columns} data={paymentsData} keyExtractor={(row) => row.id} />

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

        <Footer
          companyName="KJ-NV-1 - Trigger"
          gstin="23MNBH2323A1Z4"
          supportEmail="support@giddh.com"
        />
      </main>
    </div>
  );
}
