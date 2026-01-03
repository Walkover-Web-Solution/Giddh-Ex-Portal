"use client";

import { Sidebar } from "@/components/Sidebar";
import { Footer } from "@/components/Footer";
import { FileSpreadsheet, Clock } from "lucide-react";

export default function AccountStatementPage() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="ml-64 flex flex-1 flex-col">
        <header className="border-b bg-white px-6 py-4">
          <h1 className="text-xl font-semibold">Account Statement</h1>
        </header>

        <div className="flex flex-1 items-center justify-center p-6">
          <div className="text-center">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <FileSpreadsheet className="h-24 w-24 text-gray-300" />
                <div className="absolute -bottom-2 -right-2 rounded-full bg-blue-600 p-2">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
            <h2 className="mb-3 text-3xl font-bold text-gray-900">Coming Soon</h2>
            <p className="mb-2 text-lg text-gray-600">
              Account Statement feature is under development
            </p>
            <p className="text-sm text-gray-500">
              We&apos;re working hard to bring you detailed account statements. Stay tuned!
            </p>
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
