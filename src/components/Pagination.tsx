"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import { PAGE_SIZE_OPTIONS } from "@/constants";
import { mergeClassNames } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (items: number) => void;
  pageSizeOptions?: number[];
}

function getPageNumbers(totalPages: number): (number | "ellipsis")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  return [1, 2, 3, "ellipsis", totalPages - 2, totalPages - 1, totalPages];
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
}: PaginationProps) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  const hasPages = totalPages > 0;
  const pageNumbers = getPageNumbers(totalPages);

  const navLinkBase =
    "relative inline-flex items-center border border-gray-300 bg-white text-blue-900 text-sm font-medium hover:text-blue-900 hover:bg-gray-50  disabled:pointer-events-none disabled:opacity-50";
  const navLinkRoundedL = "rounded-l-md";
  const navLinkRoundedR = "rounded-r-md";
  const pageLinkBase =
    "relative inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50-0 -ml-px";
  const pageLinkCurrent =
    "z-10 border-blue-900 bg-blue-900 text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-900";

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPages || currentPage === 1}
          className={mergeClassNames(navLinkBase, "rounded-md px-4 py-2")}
          aria-label="Previous"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasPages || currentPage === totalPages}
          className={mergeClassNames(navLinkBase, "ml-3 rounded-md px-4 py-2")}
          aria-label="Next"
        >
          Next
        </button>
      </div>

      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{startItem}</span> to{" "}
            <span className="font-medium">{endItem}</span> of{" "}
            <span className="font-medium">{totalItems}</span> results
          </p>
        </div>

        <nav
          aria-label="Pagination"
          className="isolate inline-flex -space-x-px rounded-md shadow-sm"
        >
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={!hasPages || currentPage === 1}
            className={mergeClassNames(
              pageLinkBase,
              navLinkRoundedL,
              "px-2 py-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            )}
            aria-label="Previous"
          >
            <span className="sr-only">Previous</span>
            <ChevronLeftIcon aria-hidden className="size-5" />
          </button>

          {pageNumbers.map((page, idx) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${idx}`}
                className="relative -ml-px inline-flex items-center border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                disabled={!hasPages}
                aria-current={currentPage === page ? "page" : undefined}
                className={mergeClassNames(
                  pageLinkBase,
                  currentPage === page ? pageLinkCurrent : ""
                )}
              >
                {page}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={!hasPages || currentPage === totalPages}
            className={mergeClassNames(
              pageLinkBase,
              navLinkRoundedR,
              "px-2 py-2 text-gray-400 hover:bg-gray-50 hover:text-gray-600"
            )}
            aria-label="Next"
          >
            <span className="sr-only">Next</span>
            <ChevronRightIcon aria-hidden className="size-5" />
          </button>
        </nav>
      </div>
    </div>
  );
}
