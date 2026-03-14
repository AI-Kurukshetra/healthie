"use client";

import { useState, type PropsWithChildren, type ReactNode } from "react";

import { cn } from "@/lib/utils";

type Tab = {
  id: string;
  label: string;
  content: ReactNode;
};

export function Tabs({ tabs, className }: PropsWithChildren<{ tabs: Tab[]; className?: string }>) {
  const [activeTab, setActiveTab] = useState(tabs[0]?.id);
  const panel = tabs.find((tab) => tab.id === activeTab) ?? tabs[0];

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-wrap gap-2 rounded-pill border border-border bg-surface-muted p-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={cn(
              "rounded-pill px-4 py-2 text-sm font-semibold transition",
              tab.id === panel.id ? "bg-white text-ink shadow-sm" : "text-muted hover:text-ink"
            )}
            onClick={() => setActiveTab(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div>{panel.content}</div>
    </div>
  );
}
