import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface BalanceSummaryCardProps {
  currency: string;
  balancePayable: number;
  numberOfInvoices: number;
}

export function BalanceSummaryCard({
  currency,
  balancePayable,
  numberOfInvoices,
}: BalanceSummaryCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Balance Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between border-b pb-3">
          <span className="text-sm text-gray-600">Currency</span>
          <span className="text-sm font-medium text-orange-500">Balance Payable</span>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-base font-semibold">{currency}</span>
          <div className="text-right">
            <div className="text-xl font-bold">₹ {balancePayable.toLocaleString()}</div>
            <div className="text-xs text-gray-500">Number of Invoices: {numberOfInvoices}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
