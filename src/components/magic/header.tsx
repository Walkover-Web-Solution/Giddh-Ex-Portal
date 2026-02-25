import { DateRangeCalendar } from "@/components/ui/DateRangeCalendar";

interface HeaderProps {
  companyName: string;
  accountName: string;
  fromDate: Date;
  toDate: Date;
  onFromDateChange: (date: Date) => void;
  onToDateChange: (date: Date) => void;
}

export function Header({
  companyName,
  accountName,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
}: HeaderProps) {
  return (
    <header className="w-full border-b-2 border-blue-900/20 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col items-start gap-2">
            <h1 className="text-xl font-semibold text-blue-900 sm:text-2xl">{companyName}</h1>
            <p className="text-sm text-blue-900/70 sm:text-base">{accountName} A/C</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <DateRangeCalendar
              fromDate={fromDate}
              toDate={toDate}
              onFromDateChange={onFromDateChange}
              onToDateChange={onToDateChange}
              position="left"
              openDirection="auto"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
