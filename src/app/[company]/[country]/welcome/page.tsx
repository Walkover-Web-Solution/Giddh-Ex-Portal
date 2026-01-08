"use client";

import { Sidebar } from "@/components/Sidebar";
import { BalanceSummaryCard } from "@/components/BalanceSummaryCard";
import { UserDetailsCard } from "@/components/UserDetailsCard";
import { Footer } from "@/components/Footer";
import { LastPaymentCard } from "@/components/LastPaymentCard";
import { useAppSelector } from "@/store/hooks";
import { selectAllCompanies } from "@/store/slices/companySlice";
import { useEffect } from "react";

export default function WelcomePage() {
  const allCompanies = useAppSelector(selectAllCompanies);

  useEffect(() => {
    console.log("=== WELCOME PAGE ===");
    console.log("Redux allCompanies:", allCompanies);
    console.log("localStorage persist:companies:", localStorage.getItem("persist:companies"));
    console.log("sessionStorage companyName:", sessionStorage.getItem("companyName"));
    console.log("sessionStorage country:", sessionStorage.getItem("country"));
    console.log("localStorage token:", localStorage.getItem("token"));
    console.log("localStorage userEmail:", localStorage.getItem("userEmail"));
    console.log("localStorage userData:", localStorage.getItem("userData"));
  }, [allCompanies]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="ml-64 flex flex-1 flex-col">
        <header className="border-b bg-white px-6 py-4">
          <h1 className="text-xl font-semibold">Hello!</h1>
          {/* Debug info */}
          <div className="mt-2 rounded bg-gray-100 p-2 text-xs">
            <p>
              <strong>Redux Companies:</strong> {JSON.stringify(allCompanies)}
            </p>
            <p>
              <strong>Session Storage:</strong> {sessionStorage.getItem("companyName")} /{" "}
              {sessionStorage.getItem("country")}
            </p>
          </div>
        </header>

        <div className="flex-1 p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            <BalanceSummaryCard currency="INR - ₹" balancePayable={94270} numberOfInvoices={7} />

            <LastPaymentCard
              amount={1000}
              paidFor="2361367"
              paidOn="24-10-2024"
              paymentNumber="RCPT-241024-1"
            />

            <UserDetailsCard name="sheba ji" contactPersons={1} />
          </div>
        </div>

        <Footer
          companyName="KJ-NV-1 - Trigger"
          gstin="23MNBH2323A1Z4"
          supportEmail="support@giddh.com"
          variant="full"
        />
      </main>
    </div>
  );
}
