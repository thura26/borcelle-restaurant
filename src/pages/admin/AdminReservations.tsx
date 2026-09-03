import { useState } from "react";
import { useReservations, type ReservationStatus } from "../../context/ReservationContext";
import { DataTable } from "../../components/admin/DataTable";
import { useToast } from "../../context/ToastContext";
import { useAudit } from "../../context/AuditContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { exportCSV } from "../../lib/csv";
import { Trash2, CalendarDays , Loader2 } from "lucide-react";

  const isLoading = false;
export function AdminReservations() {
  const { reservations, updateStatus, deleteReservation } = useReservations();
  const { show } = useToast();
  const { addLog } = useAudit();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [filter, setFilter] = useState<ReservationStatus | "all">("all");
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = filter === "all" ? reservations : reservations.filter((r) => r.status === filter);

  const handleStatus = async (id: string, s: ReservationStatus) => {
    const r = await updateStatus(id, s);
    show(r.msg, r.ok);
    if (r.ok) await addLog("update", "reservation", id, `Status → ${s}`, user?.name || "admin", user?.email || "");
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const r = await deleteReservation(deleteId);
    show(r.msg, r.ok);
    if (r.ok) await addLog("delete", "reservation", deleteId, "Deleted reservation", user?.name || "admin", user?.email || "");
    setDeleteId(null);
  };

  const handleBulkDelete = (ids: string[]) => {
    if (ids.length === 0) return;
    setBulkDeleting(true);
    setTimeout(async () => {
      let count = 0;
      for (const id of ids) {
        const r = await deleteReservation(id);
        if (r.ok) count++;
      }
      await addLog("delete", "reservation", ids.join(","), `Bulk deleted ${count} reservations`, user?.name || "admin", user?.email || "");
      show(`Deleted ${count} reservations`, true);
      setSelectedIds(new Set());
      setBulkDeleting(false);
    }, 800);
  };

  const handleExport = () => {
    exportCSV(`reservations_${new Date().toISOString().slice(0, 10)}`, filtered.map((r) => ({ id: r.id, name: r.name, phone: r.phone, guests: r.guests, date: r.date, time: r.time, status: r.status, createdAt: new Date(r.createdAt).toLocaleString() })));
    show("CSV exported", true);
  };

  const statusColor = (s: string) => {
    if (s === "pending") return "bg-amber-100 text-amber-700 border-amber-200";
    if (s === "confirmed") return "bg-green-100 text-green-700 border-green-200";
    return "bg-red-100 text-red-700 border-red-200";
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className={`font-poppins font-bold text-[20px] flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><CalendarDays size={20} className="text-primary" /> Reservations</h2>
        <p className={`font-poppins text-sm ${isDark ? "text-white/60" : "text-muted"}`}>{reservations.length} total • pending → confirmed → cancelled</p>
      </div>

      <div className="relative">
        {bulkDeleting && (
          <div className={`absolute inset-0 z-10 rounded-2xl flex items-center justify-center gap-2 backdrop-blur-sm ${isDark ? "bg-[#0f0f0f]/80" : "bg-white/80"}`}>
            <Loader2 size={20} className="animate-spin text-primary" />
            <span className={`font-poppins font-semibold text-sm ${isDark ? "text-white" : "text-dark"}`}>Deleting...</span>
          </div>
        )}
        <DataTable
        data={filtered}
        searchKeys={["name", "phone", "id"]}
        searchPlaceholder="Search name, phone or ID..."
        onExport={handleExport}
        selectable
        getRowId={(r: any) => r.id}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        onBulkDelete={handleBulkDelete}
        bulkDeleteLabel="Delete selected"
        isLoading={isLoading}
        filterSlot={
          <div className="flex gap-2">
            {(["all", "pending", "confirmed", "cancelled"] as const).map((s) => (
              <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-full text-xs font-poppins font-semibold border capitalize ${filter === s ? (isDark ? "bg-white text-dark border-white" : "bg-dark text-white border-dark") : isDark ? "bg-white/10 text-white border-white/10" : "bg-white text-dark border-dark/10"}`}>{s}</button>
            ))}
          </div>
        }
        columns={[
          { key: "id", header: "Booking", render: (r: any) => <p className="font-poppins font-bold text-primary text-sm">{r.id}</p> },
          { key: "name", header: "Guest", render: (r: any) => <div><p className={`font-poppins font-semibold text-sm ${isDark ? "text-white" : "text-dark"}`}>{r.name}</p><p className={`font-poppins text-xs ${isDark ? "text-white/60" : "text-muted"}`}>{r.phone}</p></div> },
          { key: "guests", header: "Guests", render: (r: any) => <span className={`px-2.5 py-1 rounded-full border text-xs font-poppins font-semibold ${isDark ? "bg-white/10 border-white/10 text-white" : "bg-surface border-dark/5 text-dark"}`}>{r.guests}</span> },
          { key: "date", header: "Date & Time", render: (r: any) => <div><p className={`font-poppins font-medium text-sm ${isDark ? "text-white" : "text-dark"}`}>{r.date}</p><p className={`font-poppins text-xs ${isDark ? "text-white/60" : "text-muted"}`}>{r.time}</p></div> },
          { key: "status", header: "Status", render: (r: any) => (
            <select value={r.status} onChange={(e) => handleStatus(r.id, e.target.value as ReservationStatus)} className={`px-2.5 py-1.5 rounded-full text-xs font-poppins font-bold border ${statusColor(r.status)}`}>
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="cancelled">cancelled</option>
            </select>
          ) },
          { key: "createdAt", header: "Created", render: (r: any) => <span className={`font-poppins text-xs ${isDark ? "text-white/60" : "text-muted"}`}>{new Date(r.createdAt).toLocaleDateString()}</span> },
          { key: "actions", header: "Actions", render: (r: any) => (
            <button onClick={() => setDeleteId(r.id)} className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white" : "bg-white border-red-200 text-red-600 hover:bg-red-50"}`}><Trash2 size={14} /></button>
          ) },
        ]}
        />
        </div>

      {deleteId && (
        <div className="fixed inset-0 z-[100] bg-dark/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-[360px] w-full p-6 text-center shadow-2xl border ${isDark ? "bg-[#1E1E1E] border-white/10" : "bg-white border-transparent"}`}>
            <h3 className={`font-poppins font-bold text-lg ${isDark ? "text-white" : "text-dark"}`}>Delete reservation?</h3>
            <p className={`font-poppins text-sm mt-2 ${isDark ? "text-white/60" : "text-muted"}`}>{deleteId}</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteId(null)} className={`flex-1 border-2 font-poppins font-semibold py-3 rounded-full ${isDark ? "bg-transparent border-white/20 text-white hover:bg-white/10" : "bg-background border-dark/10"}`}>Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-600 text-white font-poppins font-semibold py-3 rounded-full hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}