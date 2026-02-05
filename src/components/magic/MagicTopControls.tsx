interface MagicTopControlsProps {
  dateRange: string;
  onPrint?: () => void;
}

export function MagicTopControls({ dateRange, onPrint }: MagicTopControlsProps) {
  return (
    <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700">
          <span>{dateRange}</span>
        </div>
        <button
          onClick={onPrint}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Print
        </button>
      </div>
    </div>
  );
}
