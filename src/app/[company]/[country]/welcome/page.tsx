"use client";

import { Sidebar } from "@/components/Sidebar";
import { BalanceSummaryCard } from "@/components/BalanceSummaryCard";
import { UserDetailsCard } from "@/components/UserDetailsCard";
import { Footer } from "@/components/Footer";
import { LastPaymentCard } from "@/components/LastPaymentCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectAllCompanies,
  selectCompanyUniqueName,
  selectAccountUniqueName,
  selectBalanceSummary,
  selectAllPayments,
  selectUserDetails,
  selectAccountDetails,
  selectUser,
  fetchBalanceSummary,
  fetchAllPayments,
  fetchUserDetails,
  fetchAccountDetails,
  fetchCompanyDetails,
} from "@/store/slices/companySlice";
import { useParams } from "next/navigation";
import { useEffect } from "react";

export default function WelcomePage() {
  const params = useParams();
  const dispatch = useAppDispatch();

  const companyName = params?.company as string;
  const companyUniqueNameFromRedux = useAppSelector(selectCompanyUniqueName(companyName));
  const accountUniqueNameFromRedux = useAppSelector(selectAccountUniqueName(companyName));

  const balanceSummary = useAppSelector(selectBalanceSummary(companyName));
  const allPayments = useAppSelector(selectAllPayments(companyName));
  const userDetails = useAppSelector(selectUserDetails(companyName));
  const accountDetails = useAppSelector(selectAccountDetails(companyName));
  const user = useAppSelector(selectUser(companyName));

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
      if (!balanceSummary) {
        dispatch(
          fetchBalanceSummary({ companyName, companyUniqueName, uniqueName: accountUniqueName })
        );
      }
      if (!allPayments || allPayments.length === 0) {
        dispatch(fetchAllPayments({ companyName, companyUniqueName, accountUniqueName }));
      }
      if (!userDetails) {
        dispatch(fetchUserDetails({ companyName, companyUniqueName, accountUniqueName }));
      }
      if (!accountDetails) {
        dispatch(fetchAccountDetails({ companyName, companyUniqueName, accountUniqueName }));
      }
      if (!user) {
        dispatch(fetchCompanyDetails({ companyName, companyUniqueName, accountUniqueName }));
      }
    }
  }, [
    dispatch,
    companyName,
    companyUniqueNameFromRedux,
    accountUniqueNameFromRedux,
    balanceSummary,
    allPayments,
    userDetails,
    accountDetails,
    user,
  ]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="ml-64 flex flex-1 flex-col">
        <header className="border-b bg-white px-6 py-4">
          <h1 className="text-xl font-semibold">Hello!</h1>
        </header>

        <div className="flex-1 p-6">
          <div className="mx-auto max-w-5xl space-y-6">
            <BalanceSummaryCard />

            <LastPaymentCard />

            <UserDetailsCard />
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
