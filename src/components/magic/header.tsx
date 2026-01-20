import { Printer } from "lucide-react";

interface HeaderProps {
  companyName: string;
  accountName: string;
  fromDate: Date;
  toDate: Date;
  onFromDateChange: (date: Date) => void;
  onToDateChange: (date: Date) => void;
  onPrint?: () => void;
}

export function Header({
  companyName,
  accountName,
  fromDate,
  toDate,
  onFromDateChange,
  onToDateChange,
  onPrint,
}: HeaderProps) {
  return (
    <header className="w-full border-b-2 border-blue-900/20 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold text-blue-900 sm:text-2xl">{companyName}</h1>
            <p className="text-sm text-blue-900/70 sm:text-base">{accountName}</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex items-center gap-1.5 rounded-md border border-blue-900/30 px-2 py-1.5 text-xs text-blue-900 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm">
              <input
                type="date"
                value={fromDate.toISOString().split("T")[0]}
                onChange={(e) => onFromDateChange(new Date(e.target.value))}
                className="w-[100px] border-none bg-transparent text-xs text-blue-900 focus:outline-none sm:w-auto sm:text-sm"
              />
              <span className="text-blue-900/70">-</span>
              <input
                type="date"
                value={toDate.toISOString().split("T")[0]}
                onChange={(e) => onToDateChange(new Date(e.target.value))}
                className="w-[100px] border-none bg-transparent text-xs text-blue-900 focus:outline-none sm:w-auto sm:text-sm"
              />
            </div>

            <button
              onClick={onPrint}
              className="inline-flex items-center justify-center gap-1.5 rounded-md bg-blue-900 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-blue-800 sm:gap-2 sm:px-4 sm:py-2 sm:text-sm"
            >
              <Printer className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              <span className="xs:inline hidden">Print</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
