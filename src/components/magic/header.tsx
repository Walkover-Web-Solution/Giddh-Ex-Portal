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
          <div>
            <h1 className="text-xl font-semibold text-blue-900 sm:text-2xl">{companyName}</h1>
            <p className="text-sm text-blue-900/70 sm:text-base">{accountName}</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
            <div className="flex items-center gap-1.5 rounded-md border border-blue-900/30 px-2 py-1.5 text-xs text-blue-900 sm:gap-2 sm:px-3 sm:py-2 sm:text-sm">
              <input
                type="date"
                value={fromDate.toISOString().split("T")[0]}
                onChange={(e) => {
                  const dateValue = e.target.value;
                  if (dateValue) {
                    // Parse date in local timezone to avoid UTC issues
                    const [year, month, day] = dateValue.split("-").map(Number);
                    onFromDateChange(new Date(year, month - 1, day));
                  }
                }}
                className="w-[100px] border-none bg-transparent text-xs text-blue-900 focus:outline-none sm:w-auto sm:text-sm"
              />
              <span className="text-blue-900/70">-</span>
              <input
                type="date"
                value={toDate.toISOString().split("T")[0]}
                onChange={(e) => {
                  const dateValue = e.target.value;
                  if (dateValue) {
                    // Parse date in local timezone to avoid UTC issues
                    const [year, month, day] = dateValue.split("-").map(Number);
                    onToDateChange(new Date(year, month - 1, day));
                  }
                }}
                className="w-[100px] border-none bg-transparent text-xs text-blue-900 focus:outline-none sm:w-auto sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
