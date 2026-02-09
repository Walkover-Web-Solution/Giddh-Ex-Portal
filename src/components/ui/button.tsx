import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { mergeClassNames } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "rounded-md bg-blue-50 text-blue-600 shadow-sm hover:bg-blue-100",
        outline:
          "rounded-md border border-gray-300 bg-white font-semibold text-gray-700 shadow-sm hover:bg-gray-50",
        ghost:
          "rounded-md bg-transparent text-blue-600 hover:bg-blue-50",
        destructive:
          "rounded-md bg-red-50 text-red-600 shadow-sm hover:bg-red-100",
        link: "text-blue-600 underline-offset-4 hover:underline",
      },
      size: {
        xs: "rounded-sm px-2 py-1 text-xs",
        sm: "rounded-sm px-2 py-1 text-sm",
        md: "rounded-md px-2.5 py-1.5 text-sm",
        lg: "rounded-md px-3 py-2 text-sm",
        xl: "rounded-md px-3.5 py-2.5 text-sm",
        icon: "size-10 rounded-md p-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={mergeClassNames(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
