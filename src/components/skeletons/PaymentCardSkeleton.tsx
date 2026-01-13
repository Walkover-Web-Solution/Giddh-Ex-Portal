import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function PaymentCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-32 animate-pulse rounded bg-gray-200"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
            <div className="h-8 w-28 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="flex items-center justify-between border-t pt-3">
            <div className="h-4 w-28 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="h-4 w-16 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
          </div>
          <div className="flex items-center justify-between">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
