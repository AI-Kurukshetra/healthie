import type { ReactNode } from "react";

import { Menu } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";

export function Header({
  title,
  description,
  actions,
  userName,
  onMenuToggle
}: {
  title: string;
  description: string;
  actions?: ReactNode;
  userName?: string | null;
  onMenuToggle?: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {onMenuToggle ? (
          <Button className="lg:hidden" onClick={onMenuToggle} size="sm" variant="ghost">
            <Menu className="h-5 w-5" />
          </Button>
        ) : null}
        <div>
          <h1 className="text-lg font-bold tracking-tight text-ink sm:text-xl">{title}</h1>
          <p className="hidden text-sm text-muted sm:block">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <div className="hidden items-center gap-2 rounded-full border border-border bg-surface-muted py-1.5 pl-1.5 pr-3 sm:flex">
          <Avatar className="h-7 w-7" name={userName} />
          <span className="text-sm font-medium text-ink">{userName ?? "User"}</span>
        </div>
      </div>
    </div>
  );
}
