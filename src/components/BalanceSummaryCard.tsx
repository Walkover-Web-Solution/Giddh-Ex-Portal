"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchBalanceSummary,
  selectBalanceSummary,
  selectBalanceSummaryLoading,
  selectBalanceSummaryError,
  selectCompanyUniqueName,
} from "@/store/slices/companySlice";

interface BalanceSummaryCardProps {
  uniqueName: string;
}

export function BalanceSummaryCard({ uniqueName }: BalanceSummaryCardProps) {
  const params = useParams();
  const dispatch = useAppDispatch();

  const companyName = params?.company as string;
  const companyUniqueName = useAppSelector(selectCompanyUniqueName(companyName));

  const data = useAppSelector(selectBalanceSummary(companyName));
  const loading = useAppSelector(selectBalanceSummaryLoading(companyName));
  const error = useAppSelector(selectBalanceSummaryError(companyName));

  useEffect(() => {
    if (companyName && companyUniqueName) {
      dispatch(fetchBalanceSummary({ companyName, companyUniqueName, uniqueName }));
    }
  }, [dispatch, companyName, companyUniqueName, uniqueName]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Balance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="py-4 text-center text-sm text-gray-500">Loading...</div>
        ) : error ? (
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
