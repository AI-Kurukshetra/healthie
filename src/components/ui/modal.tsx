"use client";

import type { PropsWithChildren } from "react";

import { cn } from "@/lib/utils";

export function Modal({
  open,
  title,
  description,
  onClose,
  children
}: PropsWithChildren<{
  open: boolean;
  title: string;
  description?: string;
  onClose?: () => void;
}>) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-card border border-border bg-white p-6 shadow-card">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-2xl font-semibold text-ink">{title}</h3>
            {description ? <p className="mt-2 text-sm text-muted">{description}</p> : null}
          </div>
          {onClose ? (
            <button className="rounded-full border border-border px-3 py-1 text-sm text-muted hover:text-ink" onClick={onClose} type="button">
              Close
            </button>
          ) : null}
        </div>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}

export function ModalTrigger({ children, className }: PropsWithChildren<{ className?: string }>) {
  return <div className={cn(className)}>{children}</div>;
}
