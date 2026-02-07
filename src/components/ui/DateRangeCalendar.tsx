"use client";

import { useState, useRef, useEffect } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
  subYears,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  isBefore,
  isAfter,
} from "date-fns";
import { ChevronLeftIcon, ChevronRightIcon, CalendarIcon } from "@heroicons/react/20/solid";

export interface DateRangeCalendarProps {
  fromDate: Date;
  toDate: Date;
  onFromDateChange: (date: Date) => void;
  onToDateChange: (date: Date) => void;
  className?: string;
  /**
   * Show quick action buttons (Last 7 days, Last 30 days, This month)
   * @default true
   */
  showQuickActions?: boolean;
  /**
   * Custom quick action buttons
   */
  quickActions?: Array<{
    label: string;
    getDates: () => { from: Date; to: Date };
  }>;
  /**
   * Date format for display in button
   * @default "dd MMM yyyy" for desktop, "dd/MM" for mobile
   */
  dateFormat?: {
    desktop?: string;
    mobile?: string;
  };
  /**
   * Custom button content renderer
   */
  renderButton?: (props: { fromDate: Date; toDate: Date; onClick: () => void }) => React.ReactNode;
  /**
   * Minimum selectable date
   */
  minDate?: Date;
  /**
   * Maximum selectable date
   */
  maxDate?: Date;
  /**
   * Calendar popover position
   * @default "right"
   */
  position?: "left" | "right" | "center";
  /**
   * Custom calendar width
   * @default "w-[320px] sm:w-[360px]"
   */
  calendarWidth?: string;
}

export function DateRangeCalendar({
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  className = "",
  showQuickActions = true,
  quickActions,
  dateFormat,
  renderButton,
  minDate,
  maxDate,
  position = "right",
  calendarWidth = "w-[calc(100vw-2rem)] max-w-[360px]",
}: DateRangeCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(fromDate);
  const [selecting, setSelecting] = useState<"from" | "to">("from");
  const [tempFromDate, setTempFromDate] = useState<Date | null>(null);
  const [tempToDate, setTempToDate] = useState<Date | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTempFromDate(fromDate);
      setTempToDate(toDate);
      setSelecting("from");
    }
  }, [isOpen, fromDate, toDate]);

  useEffect(() => {
    if (!isOpen) {
      setCurrentMonth(fromDate);
    }
  }, [fromDate, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelecting("from");
        setTempFromDate(null);
        setTempToDate(null);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handleDateClick = (day: Date) => {
    if (minDate && isBefore(day, minDate)) return;
    if (maxDate && isAfter(day, maxDate)) return;

    if (selecting === "from") {
      if (tempToDate && isAfter(day, tempToDate)) {
        setTempFromDate(day);
        setTempToDate(day);
        setSelecting("to");
      } else {
        setTempFromDate(day);
        setSelecting("to");
      }
    } else {
      if (tempFromDate && isBefore(day, tempFromDate)) {
        setTempFromDate(day);
        setTempToDate(day);
        setSelecting("from");
      } else {
        setTempToDate(day);
        setSelecting("from");
      }
    }
  };

  const handleApply = () => {
    if (tempFromDate && tempToDate) {
      onFromDateChange(tempFromDate);
      onToDateChange(tempToDate);
      setIsOpen(false);
      setTempFromDate(null);
      setTempToDate(null);
    }
  };

  const isDateInRange = (day: Date) => {
    if (!tempFromDate || !tempToDate) return false;
    if (isSameDay(day, tempFromDate) || isSameDay(day, tempToDate)) return false;
    return isWithinInterval(day, { start: tempFromDate, end: tempToDate });
  };

  const isDateStart = (day: Date) => (tempFromDate ? isSameDay(day, tempFromDate) : false);
  const isDateEnd = (day: Date) => (tempToDate ? isSameDay(day, tempToDate) : false);
  const isBothDatesSelected = tempFromDate !== null && tempToDate !== null;

  const goToPreviousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const goToNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const formatDateRange = () => {
    const desktopFormat = dateFormat?.desktop ?? "dd MMM yyyy";
    const mobileFormat = dateFormat?.mobile ?? "dd/MM";
    return {
      desktop: `${format(fromDate, desktopFormat)} - ${format(toDate, desktopFormat)}`,
      mobile: `${format(fromDate, mobileFormat)} - ${format(toDate, mobileFormat)}`,
    };
  };

  const defaultQuickActions = [
    {
      label: "Last 7 days",
      getDates: () => {
        const t = new Date();
        const f = new Date(t);
        f.setDate(t.getDate() - 7);
        return { from: f, to: t };
      },
    },
    {
      label: "Last 30 days",
      getDates: () => {
        const t = new Date();
        const f = new Date(t);
        f.setDate(t.getDate() - 30);
        return { from: f, to: t };
      },
    },
    {
      label: "This month",
      getDates: () => {
        const t = new Date();
        const f = new Date(t.getFullYear(), t.getMonth(), 1);
        return { from: f, to: endOfMonth(t) };
      },
    },
    {
      label: "Last 6 months",
      getDates: () => {
        const t = new Date();
        return { from: subMonths(t, 6), to: t };
      },
    },
    {
      label: "Last 1 year",
      getDates: () => {
        const t = new Date();
        return { from: subYears(t, 1), to: t };
      },
    },
  ];

  const quickActionButtons = quickActions ?? (showQuickActions ? defaultQuickActions : []);

  const isQuickActionSelected = (action: { getDates: () => { from: Date; to: Date } }) => {
    if (tempFromDate == null || tempToDate == null) return false;
    const { from, to } = action.getDates();
    return isSameDay(from, tempFromDate) && isSameDay(to, tempToDate);
  };

  const isDateDisabled = (day: Date) => {
    if (minDate && isBefore(day, minDate)) return true;
    if (maxDate && isAfter(day, maxDate)) return true;
    return false;
  };

  const positionClasses = {
    left: "left-0",
    right: "right-0 sm:left-auto sm:right-0 left-1/2 -translate-x-1/2 sm:translate-x-0",
    center: "left-1/2 -translate-x-1/2",
  };

  const dateRangeFormatted = formatDateRange();

  return (
    <div className={`relative ${className}`} ref={calendarRef}>
      {renderButton ? (
        renderButton({
          fromDate,
          toDate,
          onClick: () => {
            setIsOpen((open) => !open);
            if (!isOpen) {
              setCurrentMonth(fromDate);
              setSelecting("from");
            }
          },
        })
      ) : (
        <button
          onClick={() => {
            setIsOpen((open) => !open);
            if (!isOpen) {
              setCurrentMonth(fromDate);
              setSelecting("from");
            }
          }}
          className="flex items-center gap-1.5 rounded-md border border-blue-900/30 px-2 py-1.5 text-xs text-blue-900 transition-colors hover:border-blue-900/50 hover:bg-blue-50 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm"
        >
          <CalendarIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          <span className="hidden sm:inline">{dateRangeFormatted.desktop}</span>
          <span className="sm:hidden">{dateRangeFormatted.mobile}</span>
        </button>
      )}

      {isOpen && (
        <div
          className={`absolute ${positionClasses[position]} top-full z-50 mt-2 ${calendarWidth} rounded-lg bg-white p-4 shadow-lg ring-1 ring-gray-200`}
        >
          <div className="text-center">
            <div className="flex items-center text-gray-900">
              <button
                type="button"
                onClick={goToPreviousMonth}
                className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                aria-label="Previous month"
              >
                <ChevronLeftIcon aria-hidden className="size-5" />
              </button>
              <div className="flex-auto text-sm font-semibold">
                {format(currentMonth, "MMMM yyyy")}
              </div>
              <button
                onClick={goToNextMonth}
                className="-m-1.5 flex flex-none items-center justify-center p-1.5 text-gray-400 hover:text-gray-500"
                aria-label="Next month"
              >
                <ChevronRightIcon aria-hidden className="size-5" />
              </button>
            </div>

            <div className="mt-6 grid grid-cols-7 text-xs font-medium leading-6 text-gray-500">
              <div>S</div>
              <div>M</div>
              <div>T</div>
              <div>W</div>
              <div>T</div>
              <div>F</div>
              <div>S</div>
            </div>

            <div className="mt-2 grid grid-cols-7 bg-gray-200">
              {days.map((day, dayIdx) => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isInRange = isDateInRange(day);
                const isStart = isDateStart(day);
                const isEnd = isDateEnd(day);
                const isDisabled = isDateDisabled(day);

                return (
                  <button
                    key={dayIdx}
                    type="button"
                    onClick={() => handleDateClick(day)}
                    disabled={!isCurrentMonth || isDisabled}
                    className={`relative h-10 bg-white text-sm disabled:cursor-not-allowed disabled:text-gray-400 ${
                      isCurrentMonth && !isDisabled ? "hover:bg-gray-50" : ""
                    }`}
                    aria-label={
                      isStart && isEnd
                        ? `From and to date: ${format(day, "MMMM d, yyyy")}`
                        : isStart
                          ? `From date: ${format(day, "MMMM d, yyyy")}`
                          : isEnd
                            ? `To date: ${format(day, "MMMM d, yyyy")}`
                            : undefined
                    }
                  >
                    {isInRange && (
                      <span className="absolute inset-0 my-1 bg-blue-900/10" aria-hidden />
                    )}
                    {isStart && (
                      <span
                        className="absolute inset-y-0 left-1 right-0 my-1 rounded-l-full bg-blue-900/10"
                        aria-hidden
                      />
                    )}
                    {isEnd && (
                      <span
                        className="absolute inset-y-0 left-0 right-1 my-1 rounded-r-full bg-blue-900/10"
                        aria-hidden
                      />
                    )}
                    <time
                      dateTime={format(day, "yyyy-MM-dd")}
                      className={[
                        "relative z-10 mx-auto flex h-7 w-7 items-center justify-center rounded-full",
                        (isStart || isEnd) && "bg-blue-900 font-semibold text-white",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                    >
                      {format(day, "d")}
                    </time>
                  </button>
                );
              })}
            </div>

            {quickActionButtons.length > 0 && (
              <div className="mt-4 flex max-h-24 flex-wrap gap-2 overflow-y-auto border-t border-gray-100 pt-3">
                {quickActionButtons.map((action, idx) => {
                  const selected = isQuickActionSelected(action);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        const { from, to } = action.getDates();
                        setTempFromDate(from);
                        setTempToDate(to);
                        setSelecting("from");
                      }}
                      className={`rounded-md px-2.5 py-1.5 text-sm font-semibold shadow-sm transition-colors ${
                        selected
                          ? "bg-blue-900 text-white ring-1 ring-blue-900 hover:bg-blue-800"
                          : "bg-white text-blue-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      {action.label}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="mt-3 flex justify-end border-t border-gray-100 pt-3">
              <button
                type="button"
                onClick={handleApply}
                disabled={!isBothDatesSelected}
                className={`rounded-md px-3 py-2 text-sm font-semibold shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 ${
                  isBothDatesSelected
                    ? "bg-blue-900 text-white hover:bg-blue-800"
                    : "cursor-not-allowed bg-gray-200 text-gray-400"
                }`}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
