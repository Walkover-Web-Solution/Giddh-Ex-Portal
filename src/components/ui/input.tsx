"use client";

import { forwardRef, ReactNode, cloneElement, isValidElement } from "react";
import { mergeClassNames } from "@/lib/utils";

export interface InputGroupProps {
  /** Leading icon (e.g. MagnifyingGlassIcon) */
  children: ReactNode;
  /** Optional icon node - when provided, child Input gets left padding for the icon */
  icon?: ReactNode;
  className?: string;
}

export function InputGroup({ children, icon, className }: InputGroupProps) {
  const child = Array.isArray(children) ? children[0] : children;
  const withPadding =
    icon != null && isValidElement(child)
      ? cloneElement(child as React.ReactElement<{ className?: string }>, {
          className: mergeClassNames(
            "pl-8 sm:pl-9",
            (child as React.ReactElement<{ className?: string }>).props.className
          ),
        })
      : child;

  return (
    <div className={mergeClassNames("relative", className)}>
      {icon != null && (
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-blue-900/60 sm:pl-3">
          {icon}
        </div>
      )}
      {withPadding}
    </div>
  );
}

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "className"> {
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", ...props }, ref) => (
    <input
      ref={ref}
      type="text"
      className={mergeClassNames(
        "w-full rounded-md border border-blue-900/30 bg-white py-1.5 pr-3 text-xs text-blue-900 placeholder-gray-500 focus:border-blue-900 focus:outline-none focus:ring-1 focus:ring-blue-900 sm:py-2 sm:text-sm",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
