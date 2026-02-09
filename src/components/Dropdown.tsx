"use client";

import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { ReactNode, ButtonHTMLAttributes } from "react";
import { mergeClassNames } from "@/lib/utils";

const defaultButtonClasses =
  "inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50";

const menuItemsClasses =
  "absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 transition focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0 data-[enter]:duration-100 data-[enter]:ease-out data-[leave]:duration-75 data-[leave]:ease-in";

const itemClasses =
  "block w-full px-4 py-2 text-left text-sm text-gray-700 data-[focus]:bg-gray-100 data-[focus]:text-gray-900 data-[focus]:outline-none";

export interface DropdownProps {
  /** Button content (label or custom ReactNode). If string, ChevronDownIcon is appended. */
  trigger: ReactNode;
  children: ReactNode;
  /** Optional class for the trigger button (e.g. border-blue-600 for Export style). */
  buttonClassName?: string;
  /** Optional class for the panel (MenuItems). */
  panelClassName?: string;
  /** Passed to MenuButton (e.g. disabled when exporting). */
  disabled?: boolean;
  /** Alignment: "left" | "right". Default "right". */
  align?: "left" | "right";
  /** Use full width for trigger. Default false. */
  fullWidth?: boolean;
}

function DropdownRoot({
  trigger,
  children,
  buttonClassName,
  panelClassName,
  disabled = false,
  align = "right",
  fullWidth = false,
}: DropdownProps) {
  return (
    <Menu as="div" className={mergeClassNames("relative inline-block", fullWidth && "w-full")}>
      <MenuButton
        disabled={disabled}
        className={mergeClassNames(
          defaultButtonClasses,
          fullWidth && "w-full",
          align === "left" && "justify-start",
          buttonClassName
        )}
      >
        {typeof trigger === "string" ? (
          <>
            {trigger}
            <ChevronDownIcon aria-hidden className="-mr-1 size-5 text-gray-400" />
          </>
        ) : (
          trigger
        )}
      </MenuButton>
      <MenuItems
        transition
        className={mergeClassNames(
          menuItemsClasses,
          align === "left" && "left-0 right-auto origin-top-left",
          panelClassName
        )}
      >
        <div className="py-1">{children}</div>
      </MenuItems>
    </Menu>
  );
}

export interface DropdownItemProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  /** Render as link. */
  href?: string;
  /** Use for form submit inside dropdown. */
  as?: "button" | "a";
}

function DropdownItem({
  children,
  href,
  as: As = "button",
  className,
  ...rest
}: DropdownItemProps) {
  const classes = mergeClassNames(itemClasses, className);
  return (
    <MenuItem>
      {As === "a" && href !== undefined ? (
        <a href={href} className={classes}>
          {children}
        </a>
      ) : (
        <button type="button" className={classes} {...rest}>
          {children}
        </button>
      )}
    </MenuItem>
  );
}

export const Dropdown = Object.assign(DropdownRoot, { Item: DropdownItem });
