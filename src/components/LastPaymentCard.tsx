"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import {
  selectAllPayments,
  selectAllPaymentsLoading,
  selectAllPaymentsError,
} from "@/store/slices/companySlice";
import { PaymentCardSkeleton } from "@/components/skeletons/PaymentCardSkeleton";

export function LastPaymentCard() {
  const params = useParams();

  const companyName = params?.company as string;

  const allPayments = useAppSelector(selectAllPayments(companyName));
  const data = allPayments?.[0] || null;
  const loading = useAppSelector(selectAllPaymentsLoading(companyName));
  const error = useAppSelector(selectAllPaymentsError(companyName));

  if (loading) {
    return <PaymentCardSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Last Payment</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="py-4 text-center text-sm text-red-500">{error}</div>
        ) : data ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Amount</span>
              <span className="text-xl font-bold">
                {data?.companyCurrencySymbol}{" "}
                {(data.grandTotal?.amountForAccount || 0).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between border-t pt-3">
              <span className="text-sm text-gray-600">Payment Number</span>
              <span className="text-sm font-medium">{data.voucherNumber || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Paid On</span>
              <span className="text-sm font-medium">{data.voucherDate || "N/A"}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Paid For</span>
              <span className="text-sm font-medium">{data.account?.name || "N/A"}</span>
            </div>
          </div>
        ) : (
          <div className="py-4 text-center text-sm text-gray-500">No payment data available</div>
        )}
      </CardContent>
    </Card>
  );
}
