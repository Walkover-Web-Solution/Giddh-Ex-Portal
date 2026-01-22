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
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  isBefore,
  isAfter,
} from "date-fns";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";

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
  calendarWidth = "w-[320px] sm:w-[360px]",
}: DateRangeCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(fromDate);
  const [selecting, setSelecting] = useState<"from" | "to">("from");
  const [tempFromDate, setTempFromDate] = useState<Date | null>(null);
  const [tempToDate, setTempToDate] = useState<Date | null>(null);
  const calendarRef = useRef<HTMLDivElement>(null);

  // Reset temporary dates when calendar opens
  useEffect(() => {
    if (isOpen) {
      setTempFromDate(fromDate);
      setTempToDate(toDate);
      setSelecting("from");
    }
  }, [isOpen, fromDate, toDate]);

  // Update current month when fromDate changes and calendar is closed
  useEffect(() => {
    if (!isOpen) {
      setCurrentMonth(fromDate);
    }
  }, [fromDate, isOpen]);

  // Close calendar when clicking outside
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

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  // Get calendar days for current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart);
  const calendarEnd = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const handleDateClick = (day: Date) => {
    // Check min/max date constraints
    if (minDate && isBefore(day, minDate)) return;
    if (maxDate && isAfter(day, maxDate)) return;

    if (selecting === "from") {
      // If selecting from date and the day is after tempToDate, reset both
      if (tempToDate && isAfter(day, tempToDate)) {
        setTempFromDate(day);
        setTempToDate(day);
        setSelecting("to");
      } else {
        setTempFromDate(day);
        setSelecting("to");
      }
    } else {
      // If selecting to date and the day is before tempFromDate, set it as new fromDate
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
    if (isSameDay(day, tempFromDate) || isSameDay(day, tempToDate)) {
      return false; // Start and end dates are handled separately
    }
    return isWithinInterval(day, { start: tempFromDate, end: tempToDate });
  };

  const isDateStart = (day: Date) => (tempFromDate ? isSameDay(day, tempFromDate) : false);
  const isDateEnd = (day: Date) => (tempToDate ? isSameDay(day, tempToDate) : false);

  const isBothDatesSelected = tempFromDate !== null && tempToDate !== null;

  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const formatDateRange = () => {
    const desktopFormat = dateFormat?.desktop || "dd MMM yyyy";
    const mobileFormat = dateFormat?.mobile || "dd/MM";
    return {
      desktop: `${format(fromDate, desktopFormat)} - ${format(toDate, desktopFormat)}`,
      mobile: `${format(fromDate, mobileFormat)} - ${format(toDate, mobileFormat)}`,
    };
  };

  const defaultQuickActions = [
    {
      label: "Last 7 days",
      getDates: () => {
        const today = new Date();
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        return { from: sevenDaysAgo, to: today };
      },
    },
    {
      label: "Last 30 days",
      getDates: () => {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);
        return { from: thirtyDaysAgo, to: today };
      },
    },
    {
      label: "This month",
      getDates: () => {
        const today = new Date();
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        return { from: startOfMonth, to: today };
      },
    },
  ];

  const quickActionButtons = quickActions || (showQuickActions ? defaultQuickActions : []);

  const isDateDisabled = (day: Date) => {
    if (minDate && isBefore(day, minDate)) return true;
    if (maxDate && isAfter(day, maxDate)) return true;
    return false;
  };

  const positionClasses = {
    left: "left-0",
    right: "right-0",
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
            setIsOpen(!isOpen);
            if (!isOpen) {
              setCurrentMonth(fromDate);
              setSelecting("from");
            }
          },
        })
      ) : (
        <button
          onClick={() => {
            setIsOpen(!isOpen);
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
          className={`absolute ${positionClasses[position]} top-full z-50 mt-2 ${calendarWidth} rounded-lg border border-blue-900/20 bg-white shadow-lg`}
        >
          <div className="p-4">
            <div className="mb-4 flex items-center justify-between">
              <button
                onClick={goToPreviousMonth}
                className="flex h-8 w-8 items-center justify-center rounded-md text-blue-900 transition-colors hover:bg-blue-50"
                aria-label="Previous month"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <h3 className="text-sm font-semibold text-blue-900 sm:text-base">
                {format(currentMonth, "MMMM yyyy")}
              </h3>
              <button
                onClick={goToNextMonth}
                className="flex h-8 w-8 items-center justify-center rounded-md text-blue-900 transition-colors hover:bg-blue-50"
                aria-label="Next month"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="mb-2 grid grid-cols-7 gap-1">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="flex items-center justify-center py-1 text-xs font-medium text-blue-900/60"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((day, dayIdx) => {
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const isInRange = isDateInRange(day);
                const isStart = isDateStart(day);
                const isEnd = isDateEnd(day);
                const isToday = isSameDay(day, new Date());
                const isDisabled = isDateDisabled(day);

                return (
                  <button
                    key={dayIdx}
                    onClick={() => handleDateClick(day)}
                    disabled={!isCurrentMonth || isDisabled}
                    className={`relative flex h-9 items-center justify-center rounded-md text-xs transition-colors ${
                      !isCurrentMonth || isDisabled
                        ? "cursor-not-allowed text-blue-900/20"
                        : "cursor-pointer text-blue-900"
                    } ${isInRange ? "bg-blue-50" : ""} ${
                      isStart || isEnd ? "bg-blue-900 font-semibold text-white" : ""
                    } ${
                      isCurrentMonth && !isStart && !isEnd && !isDisabled ? "hover:bg-blue-100" : ""
                    } ${isToday && !isStart && !isEnd ? "ring-2 ring-blue-900/30" : ""}`}
                  >
                    {format(day, "d")}
                    {(isStart || isEnd) && (
                      <span className="absolute inset-0 flex items-center justify-center">
                        {format(day, "d")}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {quickActionButtons.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-blue-900/10 pt-3">
                {quickActionButtons.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const { from, to } = action.getDates();
                      setTempFromDate(from);
                      setTempToDate(to);
                      setSelecting("from");
                    }}
                    className="rounded-md border border-blue-900/20 px-2 py-1 text-xs text-blue-900 transition-colors hover:bg-blue-50"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-3 flex justify-end border-t border-blue-900/10 pt-3">
              <button
                onClick={handleApply}
                disabled={!isBothDatesSelected}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
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
