import { useState } from "react";
import { useAudit } from "../../context/AuditContext";
import { DataTable } from "../../components/admin/DataTable";
import { exportCSV } from "../../lib/csv";
import { useToast } from "../../context/ToastContext";
import { useTheme } from "../../context/ThemeContext";
import { FileText, History, Trash2, Loader2 } from "lucide-react";

export function AdminAudit() {
  const { logs, clearLogs } = useAudit();
  const { show } = useToast();
  const { isDark } = useTheme();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const handleExport = () => {
    exportCSV(`audit_${new Date().toISOString().slice(0, 10)}`, logs.map((l) => ({ id: l.id, action: l.action, target: l.target, targetId: l.targetId, by: l.by, email: l.byEmail, detail: l.detail, at: new Date(l.at).toLocaleString() })));
    show("CSV exported", true);
  };

  const handleBulkDelete = (ids: string[]) => {
    if (ids.length === 0) return;
    setBulkDeleting(true);
    setTimeout(() => {
      show(`Bulk delete ${ids.length} logs - use Clear to remove all`, true);
      setSelectedIds(new Set());
      setBulkDeleting(false);
    }, 800);
  };
return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={`font-poppins font-bold text-[20px] flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><FileText size={20} className="text-primary" /> Audit Log</h2>
          <p className={`font-poppins text-sm flex items-center gap-1.5 ${isDark ? "text-white/60" : "text-muted"}`}><History size={14} /> Last 200 actions • who did what • {logs.length} entries</p>
        </div>
        <button onClick={async () => { await clearLogs(); show("Logs cleared", true); }} className={`px-5 py-2.5 rounded-full border-2 font-poppins font-semibold text-sm flex items-center gap-2 ${isDark ? "bg-white/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white" : "bg-white border-red-200 text-red-600 hover:bg-red-50"}`}><Trash2 size={16} /> Clear Logs</button>
      </div>

      <div className="relative">
        {bulkDeleting && (
          <div className={`absolute inset-0 z-10 rounded-2xl flex items-center justify-center gap-2 backdrop-blur-sm ${isDark ? "bg-[#0f0f0f]/80" : "bg-white/80"}`}>
            <Loader2 size={20} className="animate-spin text-primary" />
            <span className={`font-poppins font-semibold text-sm ${isDark ? "text-white" : "text-dark"}`}>Processing...</span>
          </div>
        )}
        <DataTable
          data={logs}
          searchKeys={["action", "target", "by", "byEmail", "detail"]}
          searchPlaceholder="Search action, user or detail..."
          onExport={logs.length ? handleExport : undefined}
          selectable
          getRowId={(r: any) => r.id}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onBulkDelete={handleBulkDelete}
          bulkDeleteLabel="Delete selected"
          columns={[
            { key: "at", header: "Time", render: (r: any) => <span className={`font-poppins text-xs ${isDark ? "text-white/60" : "text-muted"}`}>{new Date(r.at).toLocaleString()}</span> },
            { key: "action", header: "Action", render: (r: any) => <span className={`px-2.5 py-1 rounded-full text-xs font-poppins font-bold border capitalize ${r.action === "create" ? (isDark ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-green-50 text-green-700 border-green-200") : r.action === "delete" ? (isDark ? "bg-red-500/15 text-red-400 border-red-500/20" : "bg-red-50 text-red-700 border-red-200") : r.action === "print" ? (isDark ? "bg-blue-500/15 text-blue-400 border-blue-500/20" : "bg-blue-50 text-blue-700 border-blue-200") : (isDark ? "bg-amber-500/15 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-700 border-amber-200")}`}>{r.action}</span> },
            { key: "target", header: "Target", render: (r: any) => <span className={`font-poppins font-semibold text-sm ${isDark ? "text-white" : "text-dark"}`}>{r.target} <span className="text-primary">#{r.targetId}</span></span> },
            { key: "by", header: "By", render: (r: any) => <div><p className={`font-poppins font-semibold text-sm ${isDark ? "text-white" : "text-dark"}`}>{r.by}</p><p className={`font-poppins text-xs ${isDark ? "text-white/60" : "text-muted"}`}>{r.byEmail}</p></div> },
            { key: "detail", header: "Detail", render: (r: any) => <span className={`font-poppins text-xs line-clamp-1 max-w-[280px] ${isDark ? "text-white/60" : "text-muted"}`}>{r.detail}</span> },
          ]}
        />
      </div>
    </div>
  );
}