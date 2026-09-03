import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type AuditLog = {
  id: string;
  action: string;
  target: string;
  targetId: string;
  by: string;
  byEmail: string;
  detail: string;
  at: number;
};

type AuditContextType = {
  logs: AuditLog[];
  addLog: (action: string, target: string, targetId: string, detail: string, byName: string, byEmail: string) => void;
  clearLogs: () => void;
};

const AuditContext = createContext<AuditContextType | null>(null);

function load(): AuditLog[] {
  try {
    const legacy = localStorage.getItem("seoulk_audit");
    const cur = localStorage.getItem("borcelle_audit");
    const s = cur || legacy;
    if (legacy && !cur) { try { localStorage.setItem("borcelle_audit", legacy); localStorage.removeItem("seoulk_audit"); } catch {} }
    return s ? JSON.parse(s) : [];
  } catch {
    return [];
  }
}

export function AuditProvider({ children }: { children: ReactNode }) {
  const [logs, setLogs] = useState<AuditLog[]>(() => load());

  useEffect(() => {
    localStorage.setItem("borcelle_audit", JSON.stringify(logs.slice(0, 200)));
    try { localStorage.removeItem("seoulk_audit"); } catch {}
  }, [logs]);

  const addLog = (action: string, target: string, targetId: string, detail: string, byName: string, byEmail: string) => {
    const entry: AuditLog = {
      id: "AL" + Date.now() + Math.random().toString().slice(2, 6),
      action,
      target,
      targetId,
      by: byName,
      byEmail,
      detail,
      at: Date.now(),
    };
    setLogs((prev) => [entry, ...prev].slice(0, 200));
  };

  const clearLogs = () => setLogs([]);

  return <AuditContext.Provider value={{ logs, addLog, clearLogs }}>{children}</AuditContext.Provider>;
}

export function useAudit() {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error("useAudit must be within AuditProvider");
  return ctx;
}
