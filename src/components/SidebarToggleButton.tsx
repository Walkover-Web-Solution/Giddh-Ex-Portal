"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import { mergeClassNames } from "@/lib/utils";

interface SidebarToggleButtonProps {
  className?: string;
}

export function SidebarToggleButton({ className }: SidebarToggleButtonProps) {
  const { isMobileOpen, openMobile } = useSidebar();

  return (
    <button
      onClick={openMobile}
      className={mergeClassNames(
        "rounded-md p-2 text-gray-700 transition-colors hover:bg-gray-100 md:hidden",
        className
      )}
      aria-controls="app-sidebar"
      aria-expanded={isMobileOpen}
      aria-label="Open sidebar"
      type="button"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}
