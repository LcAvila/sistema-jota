"use client";
import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

type ToastKind = "success" | "error" | "info";
export type Toast = { id: number; title?: string; message: string; kind: ToastKind; timeout?: number; action?: { label: string; onClick: () => void } };

type Ctx = {
  toasts: Toast[];
  show: (t: Omit<Toast, "id">) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  remove: (id: number) => void;
};

const ToastContext = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const show = useCallback((t: Omit<Toast, "id">) => {
    // Generate a collision-resistant, monotonic ID even for multiple toasts in the same millisecond
    idRef.current = (idRef.current + 1) % 1000;
    const id = Date.now() * 1000 + idRef.current;
    const toast: Toast = { id, timeout: t.action ? 7000 : 3500, ...t };
    setToasts(prev => [toast, ...prev]);
    if (toast.timeout && toast.timeout > 0) {
      setTimeout(() => remove(id), toast.timeout);
    }
  }, [remove]);

  // Stable wrappers so their identities don't change when `toasts` changes
  const success = useCallback((message: string, title?: string) => show({ message, title, kind: "success" }), [show]);
  const error = useCallback((message: string, title?: string) => show({ message, title, kind: "error" }), [show]);
  const info = useCallback((message: string, title?: string) => show({ message, title, kind: "info" }), [show]);

  const api = useMemo<Ctx>(() => ({
    toasts,
    show,
    success,
    error,
    info,
    remove,
  }), [toasts, show, success, error, info, remove]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <ToastContainer toasts={toasts} onClose={remove} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

function ToastContainer({ toasts, onClose }: { toasts: Toast[]; onClose: (id: number)=>void }) {
  return (
    <div className="fixed z-[100] right-4 bottom-4 flex flex-col gap-2 w-[min(92vw,380px)]">
      {toasts.map(t => (
        <div key={t.id} className={`rounded-lg border p-3 shadow-md bg-[var(--card)] text-[var(--foreground)] border-[var(--border)] transition-shadow`}> 
          <div className="flex items-start gap-2">
            <div className={`mt-1 h-2 w-2 rounded-full ${
              t.kind === 'success' ? 'bg-emerald-500' : t.kind === 'error' ? 'bg-red-500' : 'bg-sky-500'
            }`} />
            <div className="flex-1">
              {t.title && <div className="font-semibold text-sm">{t.title}</div>}
              <div className="text-sm">{t.message}</div>
            </div>
            {t.action && (
              <button onClick={() => { t.action!.onClick(); onClose(t.id); }} className="text-xs px-2 py-1 rounded hover:bg-[var(--muted)] text-[var(--brand)] font-medium">{t.action.label}</button>
            )}
            <button onClick={() => onClose(t.id)} className="text-xs px-2 py-1 rounded hover:bg-[var(--muted)]">Fechar</button>
          </div>
        </div>
      ))}
    </div>
  );
}
