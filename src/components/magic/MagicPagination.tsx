"use client";

export interface MagicPaginationProps {
  /** Current page number (from API) */
  currentPage: number;
  /** Next page token from API; empty string disables Next */
  nextPageToken: string;
  /** Previous page token from API; empty string disables Previous */
  previousPageToken: string;
  /** Called when user clicks Next or Previous; receives token and direction */
  onPageChange: (token: string, isNext: boolean) => void;
  /** Items per page (optional; for "Showing X to Y of Z") */
  itemsPerPage?: number;
  /** Total items (optional; for "of Z" when API provides it) */
  totalItems?: number;
  /** Number of items on current page (optional; for "Showing X to Y") */
  currentPageItemCount?: number;
}

const navButtonClass =
  "relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 transition-colors";

const pageSpanClass =
  "pointer-events-none inline-flex items-center rounded-md border border-transparent bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300";

export function MagicPagination({
  currentPage,
  nextPageToken,
  previousPageToken,
  onPageChange,
  itemsPerPage = 0,
  totalItems,
  currentPageItemCount = 0,
}: MagicPaginationProps) {
  const canGoPrevious = !!previousPageToken;
  const canGoNext = !!nextPageToken;

  const startItem = itemsPerPage > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem =
    itemsPerPage > 0 && currentPageItemCount >= 0
      ? (currentPage - 1) * itemsPerPage + currentPageItemCount
      : 0;
  const showRange = startItem > 0 || endItem > 0;

  const rangeText = showRange ? (
    <>
      Showing <span className="font-medium">{startItem}</span> to{" "}
      <span className="font-medium">{endItem}</span>
      {totalItems != null && totalItems >= 0 && (
        <>
          {" "}
          of <span className="font-medium">{totalItems}</span> results
        </>
      )}
    </>
  ) : (
    <>
      Page <span className="font-medium">{currentPage}</span>
    </>
  );

  return (
    <nav
      aria-label="Pagination"
      className="flex flex-col gap-3 border-t border-gray-200 bg-white py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4"
    >
      <div className="flex w-full items-center sm:w-auto sm:flex-1 sm:basis-0 sm:justify-start">
        <p className="text-sm text-gray-700">{rangeText}</p>
      </div>

      <div className="flex flex-1 items-center gap-3 sm:justify-end sm:gap-0">
        <button
          type="button"
          onClick={() => onPageChange(previousPageToken, false)}
          disabled={!canGoPrevious}
          className={navButtonClass}
          aria-label="Goto previous page"
        >
          Previous
        </button>
        <span className={`${pageSpanClass} sm:ml-3`} aria-label="Current Page">
          {currentPage}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(nextPageToken, true)}
          disabled={!canGoNext}
          className={`${navButtonClass} sm:ml-3`}
          aria-label="Goto next page"
        >
          Next
        </button>
      </div>
    </nav>
  );
}
