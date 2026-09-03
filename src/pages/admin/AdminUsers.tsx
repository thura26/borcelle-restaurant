import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { DataTable } from "../../components/admin/DataTable";
import { useToast } from "../../context/ToastContext";
import { useAudit } from "../../context/AuditContext";
import { exportCSV } from "../../lib/csv";
import { Users, Shield, Loader2 } from "lucide-react";

export function AdminUsers() {
  const { users, updateUserRole, toggleUserActive, user: current } = useAuth();
  const { isDark } = useTheme();
  const { show } = useToast();
  const { addLog } = useAudit();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const handleRole = async (id: string, role: "admin" | "user") => {
    const r = await updateUserRole(id, role);
    show(r.msg, r.ok);
    if (r.ok) await addLog("update", "user", id, `Role → ${role}`, current?.name || "admin", current?.email || "");
  };
  const handleToggle = async (id: string) => {
    const r = await toggleUserActive(id);
    show(r.msg, r.ok);
    if (r.ok) await addLog("update", "user", id, r.msg, current?.name || "admin", current?.email || "");
  };
  const handleExport = () => {
    exportCSV(`users_${new Date().toISOString().slice(0, 10)}`, users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, active: u.isActive ? "active" : "inactive", provider: u.provider, createdAt: new Date(u.createdAt).toLocaleDateString() })));
    show("CSV exported", true);
  };

  const handleBulkDelete = (ids: string[]) => {
    if (ids.length === 0) return;
    setBulkDeleting(true);
    setTimeout(async () => {
      let count = 0;
      for (const id of ids) {
        const r = await toggleUserActive(id);
        if (r.ok) count++;
      }
      await addLog("update", "user", ids.join(","), `Bulk toggled ${count} users`, current?.name || "admin", current?.email || "");
      show(`Toggled ${count} users`, true);
      setSelectedIds(new Set());
      setBulkDeleting(false);
    }, 800);
  };
return (
    <div className="space-y-4">
      <div>
        <h2 className={`font-poppins font-bold text-[20px] flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><Users size={20} className="text-primary" /> Users & Roles</h2>
        <p className={`font-poppins text-sm ${isDark ? "text-white/60" : "text-muted"}`}>Admin can promote/demote, activate/deactivate • Primary admin protected • {users.length} users</p>
      </div>

      <div className="relative">
        {bulkDeleting && (
          <div className={`absolute inset-0 z-10 rounded-2xl flex items-center justify-center gap-2 backdrop-blur-sm ${isDark ? "bg-[#0f0f0f]/80" : "bg-white/80"}`}>
            <Loader2 size={20} className="animate-spin text-primary" />
            <span className={`font-poppins font-semibold text-sm ${isDark ? "text-white" : "text-dark"}`}>Processing...</span>
          </div>
        )}
        <DataTable
          data={users}
          searchKeys={["name", "email"]}
          searchPlaceholder="Search name or email..."
          onExport={handleExport}
          selectable
          getRowId={(r: any) => r.id}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onBulkDelete={handleBulkDelete}
          bulkDeleteLabel="Deactivate selected"
          columns={[
            {
              key: "user", header: "User", render: (r: any) => (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-poppins font-bold text-xs overflow-hidden">
                    {r.avatar ? <img src={r.avatar} alt="" className="w-full h-full object-cover" /> : r.name[0].toUpperCase()}
                  </div>
                  <div>
                    <p className={`font-poppins font-semibold text-sm flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}>{r.name} {r.id === current?.id && <span className={`px-2 py-0.5 rounded-full text-[10px] ${isDark ? "bg-white text-dark" : "bg-dark text-white"}`}>You</span>}</p>
                    <p className={`font-poppins text-xs ${isDark ? "text-white/60" : "text-muted"}`}>{r.email}</p>
                  </div>
                </div>
              )
            },
            {
              key: "role", header: "Role", render: (r: any) => (
                <select value={r.role} onChange={(e) => handleRole(r.id, e.target.value as any)} disabled={r.id === current?.id} className={`px-3 py-1.5 rounded-full text-xs font-poppins font-bold border disabled:opacity-60 ${r.role === "admin" ? (isDark ? "bg-white text-dark border-white" : "bg-dark text-white border-dark") : isDark ? "bg-white/10 text-white border-white/10" : "bg-white text-dark border-dark/10"}`}>
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              )
            },
            {
              key: "isActive", header: "Status", render: (r: any) => (
                <button onClick={() => handleToggle(r.id)} disabled={r.id === current?.id} className={`px-3 py-1 rounded-full text-xs font-poppins font-bold border disabled:opacity-60 ${r.isActive ? (isDark ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-green-50 text-green-700 border-green-200") : (isDark ? "bg-red-500/15 text-red-400 border-red-500/20" : "bg-red-50 text-red-700 border-red-200")}`}>{r.isActive ? "Active" : "Inactive"}</button>
              )
            },
            { key: "provider", header: "Provider", render: (r: any) => <span className={`px-2.5 py-1 rounded-full border text-xs font-poppins ${isDark ? "bg-white/10 border-white/10 text-white" : "bg-background border-dark/5"}`}>{r.provider}</span> },
            { key: "createdAt", header: "Joined", render: (r: any) => <span className={`font-poppins text-xs ${isDark ? "text-white/60" : "text-muted"}`}>{new Date(r.createdAt).toLocaleDateString()}</span> },
          ]}
        />
      </div>

      <div className={`rounded-2xl p-4 border ${isDark ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-200"}`}>
        <p className={`font-poppins font-semibold text-sm flex items-center gap-2 ${isDark ? "text-amber-400" : "text-amber-800"}`}><Shield size={16} /> Rules</p>
        <ul className={`font-poppins text-xs mt-1 list-disc ml-4 space-y-1 ${isDark ? "text-amber-300/80" : "text-amber-700"}`}>
          <li>Primary admin <span className="font-bold">borcelle.admin@gmail.com</span> cannot be demoted or deactivated</li>
          <li>At least one active admin must remain</li>
          <li>Inactive users cannot login</li>
          <li>Changing email to admin email auto-promotes to admin</li>
        </ul>
      </div>
    </div>
  );
}