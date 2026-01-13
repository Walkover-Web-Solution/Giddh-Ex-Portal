export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border bg-white p-6">
      <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
      <div className="space-y-3">
        <div className="h-4 w-full rounded bg-gray-200"></div>
        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
        <div className="h-4 w-5/6 rounded bg-gray-200"></div>
      </div>
    </div>
  );
}
