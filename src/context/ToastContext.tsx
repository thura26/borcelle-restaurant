import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

type Toast = { id: number; text: string; ok: boolean };

type ToastContextType = {
  toasts: Toast[];
  show: (text: string, ok?: boolean) => void;
  remove: (id: number) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

let counter = 0;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (text: string, ok = true) => {
      const id = ++counter + Date.now();
      setToasts((prev) => [...prev, { id, text, ok }]);
      setTimeout(() => remove(id), 3000);
    },
    [remove]
  );

  return <ToastContext.Provider value={{ toasts, show, remove }}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be within ToastProvider");
  return ctx;
}

export function ToastContainer() {
  const { toasts, remove } = useToast();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-6 right-6 z-[80] flex flex-col gap-2 max-w-[360px] pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => remove(t.id)}
          className={`pointer-events-auto px-5 py-3.5 rounded-2xl text-sm font-poppins border shadow-xl cursor-pointer transition-all ${
            t.ok ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-800 border-amber-200"
          }`}
        >
          {t.text}
        </div>
      ))}
    </div>
  );
}