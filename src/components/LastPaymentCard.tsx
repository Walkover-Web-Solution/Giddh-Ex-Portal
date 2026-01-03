import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface LastPaymentCardProps {
  amount: number;
  paidFor: string;
  paidOn: string;
  paymentNumber: string;
}

export function LastPaymentCard({ amount, paidFor, paidOn, paymentNumber }: LastPaymentCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Last Payment</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Amount</span>
            <span className="text-xl font-bold">₹ {amount.toLocaleString()}</span>
          </div>
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-sm text-gray-600">Paid For</span>
            <span className="text-sm font-medium">{paidFor}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Paid On</span>
            <span className="text-sm font-medium">{paidOn}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Payment Number</span>
            <span className="text-sm font-medium">{paymentNumber}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
