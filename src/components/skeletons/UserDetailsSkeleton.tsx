import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function UserDetailsSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="h-6 w-24 animate-pulse rounded bg-gray-200"></div>
        <div className="h-4 w-20 animate-pulse rounded bg-gray-200"></div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="mt-1 h-5 w-5 animate-pulse rounded bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
              <div className="h-3 w-3/4 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 h-5 w-5 animate-pulse rounded bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
              <div className="h-3 w-2/3 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="mt-1 h-5 w-5 animate-pulse rounded bg-gray-200"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
              <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200"></div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
