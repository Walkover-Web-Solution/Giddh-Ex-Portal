"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import {
  selectAllPayments,
  selectAllPaymentsLoading,
  selectAllPaymentsError,
  selectBalanceSummary,
} from "@/store/slices/companySlice";
import { PaymentCardSkeleton } from "@/components/skeletons/PaymentCardSkeleton";
import { formatCurrencyAmount } from "@/utils/currency";

export function LastPaymentCard() {
  const params = useParams();

  const companyName = params?.company as string;

  const allPayments = useAppSelector(selectAllPayments(companyName));
  const data = allPayments?.[0] || null;
  const loading = useAppSelector(selectAllPaymentsLoading(companyName));
  const error = useAppSelector(selectAllPaymentsError(companyName));
  const balanceSummary = useAppSelector(selectBalanceSummary(companyName));

  if (loading) {
    return <PaymentCardSkeleton />;
  }

  if (!data) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Last Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-b py-1">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <span className="text-sm text-gray-600">Amount</span>
            <span className="break-all text-xl font-bold md:break-normal md:text-right">
              {formatCurrencyAmount(data.grandTotal?.amountForAccount, balanceSummary?.currency, {
                decimals: 0,
              })}
            </span>
          </div>
        </div>
        <div className="py-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <span className="text-sm text-gray-600">Payment Number</span>
            <span className="text-sm font-medium md:text-right">{data?.voucherNumber}</span>
          </div>
        </div>

        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <span className="text-sm text-gray-600">Paid On</span>
            <span className="text-sm font-medium md:text-right">{data?.voucherDate}</span>
          </div>
        </div>
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <span className="text-sm text-gray-600">Paid For</span>
            <span className="break-words text-sm font-medium md:text-right">
              {data?.account?.name}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
