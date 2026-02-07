export function CardSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden bg-white shadow-sm sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-gray-200"></div>
          <div className="h-4 w-3/4 rounded bg-gray-200"></div>
          <div className="h-4 w-5/6 rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );
}
