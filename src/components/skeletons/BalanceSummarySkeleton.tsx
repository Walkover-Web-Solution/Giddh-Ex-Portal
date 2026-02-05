import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function BalanceSummarySkeleton() {
  return (
    <Card>
      <CardHeader>
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200"></div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between border-b pb-3">
          <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
          <div className="h-4 w-32 animate-pulse rounded bg-gray-200"></div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="h-6 w-24 animate-pulse rounded bg-gray-200"></div>
          <div className="text-right">
            <div className="mb-2 h-8 w-32 animate-pulse rounded bg-gray-200"></div>
            <div className="h-3 w-28 animate-pulse rounded bg-gray-200"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
