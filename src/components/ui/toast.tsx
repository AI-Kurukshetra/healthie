"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  toast: (type: ToastType, message: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const FLASH_KEY = "hp_toast_flash";

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}

const ICON_MAP = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
} as const;

const STYLE_MAP = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-800",
  error: "border-red-200 bg-red-50 text-red-800",
  info: "border-blue-200 bg-blue-50 text-blue-800",
} as const;

const ICON_STYLE_MAP = {
  success: "text-emerald-500",
  error: "text-red-500",
  info: "text-blue-500",
} as const;

const DURATION = 4000;

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const Icon = ICON_MAP[toast.type];
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    timerRef.current = setTimeout(() => onDismiss(toast.id), DURATION);
    return () => clearTimeout(timerRef.current);
  }, [toast.id, onDismiss]);

  return (
    <div
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border px-4 py-3 shadow-elevated animate-in fade-in slide-in-from-top-2 ${STYLE_MAP[toast.type]}`}
      role="alert"
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${ICON_STYLE_MAP[toast.type]}`} />
      <p className="flex-1 text-sm font-medium leading-snug">{toast.message}</p>
      <button
        className="shrink-0 rounded-lg p-0.5 opacity-60 transition-opacity hover:opacity-100"
        onClick={() => onDismiss(toast.id)}
        type="button"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/**
 * Read and consume the flash toast from sessionStorage.
 * Returns the flash data or null.
 */
function consumeFlash(): { type: ToastType; message: string } | null {
  try {
    const raw = sessionStorage.getItem(FLASH_KEY);
    if (!raw) return null;
    sessionStorage.removeItem(FLASH_KEY);
    const flash = JSON.parse(raw) as { type: ToastType; message: string };
    return flash.type && flash.message ? flash : null;
  } catch {
    return null;
  }
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const pathname = usePathname();
  // Track whether a toast was just pushed via state (so we don't double-show from flash).
  const justPushedRef = useRef(false);

  // On every client-side navigation (pathname change), check for a flash toast
  // that was queued before the navigation started.
  useEffect(() => {
    // Skip the very first render — nothing was queued yet.
    // But DO check if there's a stale flash (e.g. from a hard reload).
    if (justPushedRef.current) {
      // Toast was already shown via state — just clear the flash backup.
      justPushedRef.current = false;
      try { sessionStorage.removeItem(FLASH_KEY); } catch { /* noop */ }
      return;
    }

    const flash = consumeFlash();
    if (flash) {
      setToasts((prev) => [
        ...prev.slice(-4),
        { id: crypto.randomUUID(), type: flash.type, message: flash.message },
      ]);
    }
  }, [pathname]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback((type: ToastType, message: string) => {
    const id = crypto.randomUUID();
    // Store in sessionStorage as a flash backup for hard navigations.
    try {
      sessionStorage.setItem(FLASH_KEY, JSON.stringify({ type, message }));
    } catch {
      // sessionStorage unavailable.
    }
    // Show the toast immediately via state.
    justPushedRef.current = true;
    setToasts((prev) => [...prev.slice(-4), { id, type, message }]);
  }, []);

  const value: ToastContextValue = {
    toast: push,
    success: useCallback((msg: string) => push("success", msg), [push]),
    error: useCallback((msg: string) => push("error", msg), [push]),
    info: useCallback((msg: string) => push("info", msg), [push]),
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast container — top-right, above everything */}
      <div className="pointer-events-none fixed right-4 top-4 z-[9999] flex w-full max-w-sm flex-col gap-2">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
