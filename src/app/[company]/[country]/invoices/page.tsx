"use client";

import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { DataTable } from "@/components/DataTable";
import { Pagination } from "@/components/Pagination";
import { useState } from "react";

interface Invoice {
  id: number;
  invoiceNo: string;
  date: string;
  total: string;
  status: string;
  overdue: string;
}

const invoicesData: Invoice[] = [
  {
    id: 1,
    invoiceNo: "2365524",
    date: "22-05-2023",
    total: "₹ 94",
    status: "UNPAID",
    overdue: "Overdue by: 585 days",
  },
  {
    id: 2,
    invoiceNo: "2365142",
    date: "3-05-2023",
    total: "₹ 128",
    status: "UNPAID",
    overdue: "Overdue by: 604 days",
  },
  {
    id: 3,
    invoiceNo: "2365054",
    date: "12-05-2023",
    total: "₹ 128",
    status: "UNPAID",
    overdue: "Overdue by: 595 days",
  },
  {
    id: 4,
    invoiceNo: "2361527",
    date: "24-05-2023",
    total: "₹ -100",
    status: "PAID",
    overdue: "",
  },
  {
    id: 5,
    invoiceNo: "2360152",
    date: "1-06-2025",
    total: "₹ -100",
    status: "UNPAID",
    overdue: "Overdue by: 217 days",
  },
  {
    id: 6,
    invoiceNo: "2361524",
    date: "24-05-2023",
    total: "₹ 2,100",
    status: "UNPAID",
    overdue: "Overdue by: 1,05 days",
  },
  {
    id: 7,
    invoiceNo: "2465062",
    date: "25-05-2025",
    total: "₹ 2,100",
    status: "UNPAID",
    overdue: "Overdue by: 492 days",
  },
  {
    id: 8,
    invoiceNo: "2462642",
    date: "23-02-2025",
    total: "₹ 4,2100",
    status: "UNPAID",
    overdue: "Overdue by: 492 days",
  },
];

export default function InvoicesPage() {
  const [statusFilter, setStatusFilter] = useState("Total");
  const [typeFilter, setTypeFilter] = useState("All Invoices");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const columns = [
    { header: "S.no", accessor: (row: Invoice) => row.id },
    { header: "Invoice No", accessor: "invoiceNo" as keyof Invoice },
    { header: "Date", accessor: "date" as keyof Invoice },
    { header: "Total ₹", accessor: "total" as keyof Invoice },
    {
      header: "Status",
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
      header: "Overdue",
      accessor: (row: Invoice) => <span className="text-orange-600">{row.overdue}</span>,
    },
    {
      header: "Action",
      accessor: () => (
        <button className="text-blue-600 hover:text-blue-800 hover:underline">Download PDF</button>
      ),
    },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="ml-64 flex flex-1 flex-col">
        <header className="border-b bg-white px-6 py-4">
          <h1 className="text-xl font-semibold">Invoices</h1>
        </header>

        <div className="flex-1 p-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex gap-4">
              <div className="w-48">
                <label className="mb-2 block text-sm font-medium text-gray-700">Status</label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 pr-8 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                    backgroundPosition: "right 0.5rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.5em 1.5em",
                  }}
                >
                  <option>All Invoices</option>
                  <option>Paid Invoices</option>
                  <option>Unpaid Invoices</option>
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
                  <option>Total</option>
                  <option>Paid</option>
                  <option>Unpaid</option>
                </select>
              </div>
            </div>

            <DataTable columns={columns} data={invoicesData} keyExtractor={(row) => row.id} />

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

        <Footer
          companyName="KJ-NV-1 - Trigger"
          gstin="23MNBH2323A1Z4"
          supportEmail="support@giddh.com"
        />
      </main>
    </div>
  );
}
