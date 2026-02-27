"use client";

import { BalanceSummaryCard } from "@/components/BalanceSummaryCard";
import { UserDetailsCard } from "@/components/UserDetailsCard";
import { LastPaymentCard } from "@/components/LastPaymentCard";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  selectCompanyUniqueName,
  selectAccountUniqueName,
  selectAllPayments,
  fetchBalanceSummary,
  fetchAllPayments,
} from "@/store/slices/companySlice";
import { useParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { SidebarToggleButton } from "@/components/SidebarToggleButton";
import { SwitchAccountButton } from "@/components/SwitchAccountButton";

export default function WelcomePage() {
  const params = useParams();
  const dispatch = useAppDispatch();
  const hasCalledApis = useRef(false);

  const companyName = params?.company as string;
  const companyUniqueNameFromRedux = useAppSelector(selectCompanyUniqueName(companyName));
  const accountUniqueNameFromRedux = useAppSelector(selectAccountUniqueName(companyName));

  const allPayments = useAppSelector(selectAllPayments(companyName));

  useEffect(() => {
    if (hasCalledApis.current) return;

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
      hasCalledApis.current = true;
      dispatch(
        fetchBalanceSummary({ companyName, companyUniqueName, uniqueName: accountUniqueName })
      );
      if (!allPayments || allPayments.length === 0) {
        dispatch(fetchAllPayments({ companyName, companyUniqueName, accountUniqueName }));
      }
    }
  }, [dispatch, companyName, companyUniqueNameFromRedux, accountUniqueNameFromRedux, allPayments]);

  return (
    <>
      <header className="border-b bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <SidebarToggleButton />
            <h1 className="text-xl font-semibold">Hello!</h1>
          </div>
          <SwitchAccountButton />
        </div>
      </header>

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-5xl space-y-6">
          <BalanceSummaryCard />
          <LastPaymentCard />
          <UserDetailsCard />
        </div>
      </div>
    </>
  );
}
