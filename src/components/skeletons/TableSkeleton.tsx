export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-white">
      <div className="border-b bg-gray-50 p-4">
        <div className="flex gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
          ))}
        </div>
      </div>
      <div className="divide-y">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex gap-4 p-4">
            {[1, 2, 3, 4, 5].map((j) => (
              <div key={j} className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
