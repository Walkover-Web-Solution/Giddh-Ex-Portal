"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import {
  selectBalanceSummary,
  selectBalanceSummaryLoading,
  selectBalanceSummaryError,
} from "@/store/slices/companySlice";
import { BalanceSummarySkeleton } from "@/components/skeletons/BalanceSummarySkeleton";

export function BalanceSummaryCard() {
  const params = useParams();

  const companyName = params?.company as string;

  const data = useAppSelector(selectBalanceSummary(companyName));
  const loading = useAppSelector(selectBalanceSummaryLoading(companyName));
  const error = useAppSelector(selectBalanceSummaryError(companyName));

  if (loading) {
    return <BalanceSummarySkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Balance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="py-4 text-center text-sm text-red-500">{error}</div>
        ) : (
          <>
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-sm text-gray-600">Currency</span>
              <span className="text-sm font-medium text-orange-500">Balance Payable</span>
            </div>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-base font-semibold">
                {data?.currency?.code || "INR"} - {data?.currency?.symbol || "₹"}
              </span>
              <div className="text-right">
                <div className="text-xl font-bold">
                  {data?.currency?.symbol || "₹"} {(data?.balancePayable || 0).toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">
                  Number of Invoices: {data?.noOfInvoices || 0}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
