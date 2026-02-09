"use client";

import { Menu } from "lucide-react";
import { useSidebar } from "@/contexts/SidebarContext";
import { Button } from "@/components/ui/button";
import { mergeClassNames } from "@/lib/utils";

interface SidebarToggleButtonProps {
  className?: string;
}

export function SidebarToggleButton({ className }: SidebarToggleButtonProps) {
  const { isMobileOpen, openMobile } = useSidebar();

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={openMobile}
      className={mergeClassNames("md:hidden", className)}
      aria-controls="app-sidebar"
      aria-expanded={isMobileOpen}
      aria-label="Open sidebar"
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}
