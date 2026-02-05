interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  variant?: "inline" | "page";
}

export function ErrorMessage({ message, onRetry, variant = "inline" }: ErrorMessageProps) {
  if (variant === "page") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 rounded-md bg-giddh-primary px-4 py-2 text-white transition-colors hover:bg-giddh-primary/90"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 ring-1 ring-red-200">
      {message}
    </div>
  );
}
