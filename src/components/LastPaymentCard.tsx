"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useAppSelector } from "@/store/hooks";
import {
  selectAllPayments,
  selectAllPaymentsLoading,
  selectBalanceSummary,
} from "@/store/slices/companySlice";
import { PaymentCardSkeleton } from "@/components/skeletons/PaymentCardSkeleton";
import { formatCurrencyAmount } from "@/utils/currency";
import { LastPaymentStatusLabel, PaymentVoucherBalanceStatus } from "@/constants/invoiceStatus";

export function LastPaymentCard() {
  const params = useParams();

  const companyName = params?.company as string;
  const country = params?.country as string;

  const allPayments = useAppSelector(selectAllPayments(companyName));
  const lastPaymentItem = allPayments?.[0] ?? null;
  const loading = useAppSelector(selectAllPaymentsLoading(companyName));
  const balanceSummary = useAppSelector(selectBalanceSummary(companyName));

  const balanceStatus = lastPaymentItem?.balanceStatus?.trim().toUpperCase();
  const isAdjusted = balanceStatus === PaymentVoucherBalanceStatus.ADJUSTED;
  const isPartialAdjusted = balanceStatus === PaymentVoucherBalanceStatus.PARTIAL_ADJUSTED;
  const showCard = lastPaymentItem && (isAdjusted || isPartialAdjusted);

  if (loading) {
    return <PaymentCardSkeleton />;
  }

  if (!showCard) {
    return null;
  }

  const data = lastPaymentItem;
  const amountCurrency =
    data.accountCurrencySymbol ?? data.companyCurrencySymbol ?? balanceSummary?.currency;
  const paymentStatusLabel = isAdjusted
    ? LastPaymentStatusLabel.PAID
    : LastPaymentStatusLabel.UNPAID;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Last Payment Made</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-b py-1">
          <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
            <span className="text-sm font-medium text-gray-600">Amount</span>
            <span className="break-all text-xl font-bold md:break-normal md:text-right">
              {formatCurrencyAmount(data.grandTotal?.amountForAccount, amountCurrency, {
                decimals: 0,
              })}
            </span>
          </div>
        </div>
        <div className="py-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <span className="text-sm font-medium text-gray-600">Status</span>
            <span className="text-sm font-medium md:text-right">{paymentStatusLabel}</span>
          </div>
        </div>
        <div className="py-1">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <span className="text-sm font-medium text-gray-600">Payment</span>
            {companyName && country && data?.uniqueName ? (
              <Link
                href={`/${companyName}/${country}/payment/preview?voucher=${encodeURIComponent(data.uniqueName)}`}
                className="text-sm font-medium text-blue-900 underline underline-offset-2 hover:text-blue-900/90 md:text-right"
              >
                {data.voucherNumber}
              </Link>
            ) : (
              <span className="text-sm font-medium md:text-right">{data?.voucherNumber}</span>
            )}
          </div>
        </div>

        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <span className="text-sm font-medium text-gray-600">Paid On</span>
            <span className="text-sm font-medium md:text-right">{data?.voucherDate}</span>
          </div>
        </div>
        <div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <span className="text-sm font-medium text-gray-600">Paid For</span>
            {companyName && country && data?.invoiceUniqueName ? (
              <Link
                href={`/${companyName}/${country}/invoice/preview?voucher=${encodeURIComponent(data.invoiceUniqueName)}${data?.account?.uniqueName ? `&accountUniqueName=${encodeURIComponent(data.account.uniqueName)}` : ""}`}
                className="break-words text-sm font-medium text-blue-900 underline underline-offset-2 hover:text-giddh-primary/90 md:text-right"
              >
                {data?.invoiceNumber ?? data?.account?.name}
              </Link>
            ) : (
              <span className="break-words text-sm font-medium md:text-right">
                {data?.invoiceNumber ?? data?.account?.name}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
