"use client";

export interface MagicPaginationProps {
  /** Current page number (from API) */
  currentPage: number;
  /** Total pages (optional; used for page-based mode and "Showing X to Y of Z") */
  totalPages?: number;
  /** Total items (optional; for "Showing X to Y of Z") */
  totalItems?: number;
  /** Items per page (optional; for "Showing X to Y of Z") */
  itemsPerPage?: number;
  /** Token-based: disable Previous when no prevToken */
  hasPrevious?: boolean;
  /** Token-based: disable Next when no nextToken */
  hasNext?: boolean;
  /** Token-based: called when user clicks Previous (parent sends prevToken to API) */
  onPrevious?: () => void;
  /** Token-based: called when user clicks Next (parent sends nextToken to API) */
  onNext?: () => void;
  /** Page-based: called when user changes page by number (optional if using token-based) */
  onPageChange?: (page: number) => void;
}

const navButtonClass =
  "relative inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 transition-colors";

export function MagicPagination({
  currentPage,
  totalPages = 1,
  totalItems = 0,
  itemsPerPage = 50,
  hasPrevious = false,
  hasNext = false,
  onPrevious,
  onNext,
  onPageChange,
}: MagicPaginationProps) {
  const isTokenBased = typeof onPrevious === "function" && typeof onNext === "function";
  const canGoPrevious = isTokenBased ? hasPrevious : totalPages > 1 && currentPage > 1;
  const canGoNext = isTokenBased ? hasNext : totalPages > 1 && currentPage < totalPages;

  const handlePrevious = () => {
    if (isTokenBased) onPrevious?.();
    else onPageChange?.(currentPage - 1);
  };

  const handleNext = () => {
    if (isTokenBased) onNext?.();
    else onPageChange?.(currentPage + 1);
  };

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const showCount = totalItems > 0 && totalPages > 0;

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
    >
      <div className="hidden sm:block">
        {showCount ? (
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{" "}
            <span className="font-medium">{endItem}</span> of{" "}
            <span className="font-medium">{totalItems}</span> results
          </p>
        ) : (
          <p className="text-sm text-gray-700">
            Page <span className="font-medium">{currentPage}</span>
          </p>
        )}
      </div>
      <div className="flex flex-1 items-center justify-center gap-0 sm:justify-end">
        <button
          type="button"
          onClick={handlePrevious}
          disabled={!canGoPrevious}
          className={navButtonClass}
          aria-label="Goto previous page"
        >
          Previous
        </button>
        <span
          className="pointer-events-none inline-flex items-center rounded-md border border-transparent bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 ring-1 ring-inset ring-gray-300 sm:ml-3"
          aria-label="Current Page"
        >
          {currentPage}
        </span>
        <button
          type="button"
          onClick={handleNext}
          disabled={!canGoNext}
          className={`${navButtonClass} ml-3`}
          aria-label="Goto next page"
        >
          Next
        </button>
      </div>
    </nav>
  );
}
