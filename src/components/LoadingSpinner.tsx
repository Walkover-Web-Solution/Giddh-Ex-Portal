interface LoadingSpinnerProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "brand";
  fullScreen?: boolean;
}

export function LoadingSpinner({
  message = "Loading...",
  size = "md",
  variant = "default",
  fullScreen = true,
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-6 w-6 border-2",
    md: "h-8 w-8 border-4",
    lg: "h-12 w-12 border-4",
  };

  const colorClasses = {
    default: "border-gray-200 border-t-blue-600",
    brand: "border-giddh-primary/20 border-t-giddh-primary",
  };

  const content = (
    <div className="text-center">
      <div
        className={`inline-block animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[variant]}`}
      />
      {message && <p className="mt-3 text-sm text-gray-600">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-gray-50">{content}</div>
    );
  }

  return content;
}
