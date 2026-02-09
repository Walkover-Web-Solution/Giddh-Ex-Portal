"use client";

import { ReactNode } from "react";
import { mergeClassNames } from "@/lib/utils";

export interface Column<T> {
  header: string | ReactNode;
  accessor: keyof T | ((row: T, index: number) => ReactNode);
  className?: string;
  headerClassName?: string;
  cellClassName?: string;
}

export interface DataTableProps<T = unknown> {
  /** Optional title above the table (Tailwind Premium header) */
  title?: string;
  /** Optional description below title */
  description?: string;
  /** Optional action node (e.g. "Add user" button) - rendered top right */
  action?: ReactNode;
  /** Optional class for the root wrapper */
  className?: string;
  /**
   * Custom table content. When provided, renders this inside the Premium table wrapper instead of columns/data.
   * Use for custom thead/tbody/tfoot (e.g. StatementViewTable).
   */
  children?: ReactNode;
  /** Column definitions (ignored when children is provided) */
  columns?: Column<T>[];
  /** Row data (ignored when children is provided) */
  data?: T[];
  /** Key for each row (ignored when children is provided) */
  keyExtractor?: (row: T) => string | number;
}

const TableWrapper = ({
  children,
  className,
  hasHeader,
}: {
  children: ReactNode;
  className?: string;
  hasHeader?: boolean;
}) => (
  <div className={mergeClassNames(hasHeader ? "mt-8" : "", "flow-root", className)}>
    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
        <div className="overflow-hidden shadow-sm outline-1 outline-black/5 sm:rounded-lg">
          {children}
        </div>
      </div>
    </div>
  </div>
);

export function DataTable<T>({
  title,
  description,
  action,
  className = "",
  children,
  columns = [],
  data = [],
  keyExtractor,
}: DataTableProps<T>) {
  const hasHeader = Boolean(title ?? description ?? action);
  const useCustomContent = children != null;

  return (
    <div className={className}>
      {hasHeader && (
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            {title != null && <h1 className="text-base font-semibold text-gray-900">{title}</h1>}
            {description != null && <p className="mt-2 text-sm text-gray-700">{description}</p>}
          </div>
          {action != null && <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">{action}</div>}
        </div>
      )}

      <TableWrapper hasHeader={hasHeader}>
        {useCustomContent ? (
          children
        ) : (
          <table className="relative min-w-full divide-y divide-gray-300">
            <thead className="bg-white">
              <tr>
                {columns.map((column, index) => {
                  const isFirst = index === 0;
                  const isLast = index === columns.length - 1;
                  return (
                    <th
                      key={index}
                      scope="col"
                      className={mergeClassNames(
                        "whitespace-nowrap py-3.5 text-left text-sm font-semibold text-gray-900",
                        isFirst && "pl-4 pr-3 sm:pl-6",
                        !isFirst && !isLast && "px-3 py-3.5",
                        isLast && "py-3.5 pl-3 pr-4 text-center sm:pr-6",
                        column.headerClassName
                      )}
                    >
                      {column.header}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {data.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-8 text-center text-sm text-gray-500 sm:pl-6"
                  >
                    No data available
                  </td>
                </tr>
              ) : (
                data.map((row, rowIndex) => (
                  <tr key={keyExtractor!(row)}>
                    {columns.map((column, colIndex) => {
                      const isFirst = colIndex === 0;
                      const isLast = colIndex === columns.length - 1;
                      const cellContent =
                        typeof column.accessor === "function"
                          ? column.accessor(row, rowIndex)
                          : String((row as Record<string, unknown>)[column.accessor as string]);
                      return (
                        <td
                          key={colIndex}
                          className={mergeClassNames(
                            "whitespace-nowrap py-4 text-sm",
                            isFirst && "py-4 pl-4 pr-3 font-medium text-gray-900 sm:pl-6",
                            !isFirst && !isLast && "px-3 py-4 text-gray-500",
                            isLast && "py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6",
                            column.className,
                            column.cellClassName
                          )}
                        >
                          {cellContent}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </TableWrapper>
    </div>
  );
}
