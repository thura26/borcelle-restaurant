import { useState } from "react";
import { usePromos, type Promo } from "../../context/PromoContext";
import { DataTable } from "../../components/admin/DataTable";
import { useToast } from "../../context/ToastContext";
import { useAudit } from "../../context/AuditContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { exportCSV } from "../../lib/csv";
import { Plus, Pencil, Trash2, X, Ticket, Sparkles , Loader2 } from "lucide-react";

  const isLoading = false;
export function AdminPromos() {
  const { promos, addPromo, updatePromo, deletePromo, toggleActive } = usePromos();
  const { show } = useToast();
  const { addLog } = useAudit();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [modal, setModal] = useState<null | { mode: "add" | "edit"; promo?: Promo }>(null);
  const [form, setForm] = useState({ code: "", label: "", desc: "", type: "percent" as "percent" | "fixed" | "freeship", value: 10, maxDiscount: 0, minOrder: 0, usageLimit: 0, expiresAt: "", isActive: true });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const openAdd = () => {
    setForm({ code: "", label: "", desc: "", type: "percent", value: 10, maxDiscount: 0, minOrder: 0, usageLimit: 0, expiresAt: "", isActive: true });
    setErrors({});
    setModal({ mode: "add" });
  };
  const openEdit = (p: Promo) => {
    setForm({ code: p.code, label: p.label, desc: p.desc, type: p.type, value: p.value, maxDiscount: p.maxDiscount || 0, minOrder: p.minOrder || 0, usageLimit: p.usageLimit || 0, expiresAt: p.expiresAt ? p.expiresAt.slice(0, 10) : "", isActive: p.isActive });
    setErrors({});
    setModal({ mode: "edit", promo: p });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.code.trim()) e.code = "Code required";
    else if (!/^[A-Z0-9]{3,12}$/.test(form.code.trim().toUpperCase())) e.code = "3-12 alphanumeric";
    if (!form.label.trim()) e.label = "Label required";
    if (form.type === "percent" && (form.value <= 0 || form.value > 100)) e.value = "Percent 1-100";
    if (form.type === "fixed" && form.value < 1000) e.value = "Fixed >=1000";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const payload: any = {
      code: form.code.trim().toUpperCase(),
      label: form.label.trim(),
      desc: form.desc.trim(),
      type: form.type,
      value: Number(form.value),
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      minOrder: form.minOrder ? Number(form.minOrder) : undefined,
      usageLimit: form.usageLimit ? Number(form.usageLimit) : undefined,
      expiresAt: form.expiresAt ? new Date(form.expiresAt).toISOString() : undefined,
      isActive: form.isActive,
    };
    if (modal?.mode === "add") {
      const r = await addPromo(payload);
      show(r.msg, r.ok);
      if (r.ok) { await addLog("create", "promo", payload.code, `Created ${payload.code}`, user?.name || "admin", user?.email || ""); setModal(null); }
    } else if (modal?.mode === "edit" && modal.promo) {
      const r = await updatePromo(modal.promo.id, payload);
      show(r.msg, r.ok);
      if (r.ok) { await addLog("update", "promo", modal.promo.id, `Updated ${payload.code}`, user?.name || "admin", user?.email || ""); setModal(null); }
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const p = promos.find((x) => x.id === deleteId);
    const r = await deletePromo(deleteId);
    show(r.msg, r.ok);
    if (r.ok) await addLog("delete", "promo", deleteId, `Deleted ${p?.code}`, user?.name || "admin", user?.email || "");
    setDeleteId(null);
  };

  const handleBulkDelete = (ids: string[]) => {
    if (ids.length === 0) return;
    setBulkDeleting(true);
    setTimeout(async () => {
      let count = 0;
      for (const id of ids) {
        const r = await deletePromo(id);
        if (r.ok) count++;
      }
      await addLog("delete", "promo", ids.join(","), `Bulk deleted ${count} promos`, user?.name || "admin", user?.email || "");
      show(`Deleted ${count} promos`, true);
      setSelectedIds(new Set());
      setBulkDeleting(false);
    }, 800);
  };

  const handleExport = () => {
    exportCSV(`promos_${new Date().toISOString().slice(0, 10)}`, promos.map((p) => ({ code: p.code, label: p.label, type: p.type, value: p.value, used: p.usedCount, active: p.isActive, expiresAt: p.expiresAt || "" })));
    show("CSV exported", true);
  };

  const inputCls = isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50" : "bg-background border-dark/10 text-dark focus:border-primary/40";
  const labelCls = isDark ? "text-white" : "text-dark";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={`font-poppins font-bold text-[20px] flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><Ticket size={20} className="text-primary" /> Promo Codes</h2>
          <p className={`font-poppins text-sm flex items-center gap-1.5 ${isDark ? "text-white/60" : "text-muted"}`}><Sparkles size={14} /> CRUD connected to Checkout • percent/fixed/freeship</p>
        </div>
        <button onClick={openAdd} className="bg-primary text-white font-poppins font-semibold px-5 py-3 rounded-full flex items-center gap-2 hover:bg-primary-hover shadow-md"><Plus size={16} /> Add Promo</button>
      </div>

      <div className="relative">
        {bulkDeleting && (
          <div className={`absolute inset-0 z-10 rounded-2xl flex items-center justify-center gap-2 backdrop-blur-sm ${isDark ? "bg-[#0f0f0f]/80" : "bg-white/80"}`}>
            <Loader2 size={20} className="animate-spin text-primary" />
            <span className={`font-poppins font-semibold text-sm ${isDark ? "text-white" : "text-dark"}`}>Deleting...</span>
          </div>
        )}
        <DataTable
          data={promos}
          searchKeys={["code", "label"]}
          searchPlaceholder="Search code or label..."
          onExport={handleExport}
          selectable
          getRowId={(r: any) => r.id}
          selectedIds={selectedIds}
          onSelectionChange={setSelectedIds}
          onBulkDelete={handleBulkDelete}
          bulkDeleteLabel="Delete selected"
          isLoading={isLoading}
          columns={[
          { key: "code", header: "Code", render: (r: Promo) => <span className="font-poppins font-bold text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full text-xs">{r.code}</span> },
          { key: "label", header: "Label", render: (r: Promo) => <div><p className={`font-poppins font-semibold text-sm ${isDark ? "text-white" : "text-dark"}`}>{r.label}</p><p className={`font-poppins text-xs line-clamp-1 max-w-[200px] ${isDark ? "text-white/60" : "text-muted"}`}>{r.desc}</p></div> },
          { key: "type", header: "Type", render: (r: Promo) => <span className={`px-2.5 py-1 rounded-full border text-xs font-poppins font-semibold capitalize ${isDark ? "bg-white/10 border-white/10 text-white" : "bg-surface border-dark/5 text-dark"}`}>{r.type} {r.type === "percent" ? `${r.value}%` : r.type === "fixed" ? `${r.value} MMK` : ""}</span> },
          { key: "usage", header: "Usage", render: (r: Promo) => <span className={`font-poppins text-sm ${isDark ? "text-white" : "text-dark"}`}>{r.usedCount}{r.usageLimit ? ` / ${r.usageLimit}` : " / ∞"}</span> },
          { key: "minOrder", header: "Min Order", render: (r: Promo) => <span className={`font-poppins text-sm ${isDark ? "text-white/70" : ""}`}>{r.minOrder ? `${r.minOrder} MMK` : "-"}</span> },
          { key: "active", header: "Active", render: (r: Promo) => <button onClick={async () => { await toggleActive(r.id); await addLog("update", "promo", r.id, `Toggled ${r.code} active`, user?.name || "admin", user?.email || ""); }} className={`px-3 py-1 rounded-full text-xs font-poppins font-bold border ${r.isActive ? "bg-green-500 text-white border-green-500" : isDark ? "bg-white/10 text-white/60 border-white/10" : "bg-dark/5 text-muted border-dark/10"}`}>{r.isActive ? "Active" : "Inactive"}</button> },
          { key: "actions", header: "Actions", render: (r: Promo) => (
            <div className="flex gap-2">
              <button onClick={() => openEdit(r)} className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? "bg-white/10 border-white/10 text-white hover:bg-white hover:text-dark" : "bg-white border-dark/10 hover:border-primary/30"}`}><Pencil size={14} /></button>
              <button onClick={() => setDeleteId(r.id)} className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white" : "bg-white border-red-200 text-red-600 hover:bg-red-50"}`}><Trash2 size={14} /></button>
            </div>
          ) },
        ]}
      />
      </div>

      {modal && (
        <div className="fixed inset-0 z-[100] bg-dark/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-[560px] w-full max-h-[90vh] overflow-y-auto shadow-2xl border ${isDark ? "bg-[#1E1E1E] border-white/10" : "bg-white"}`}>
            <div className={`sticky top-0 p-6 border-b flex items-center justify-between rounded-t-3xl ${isDark ? "bg-[#1E1E1E] border-white/10" : "bg-white border-dark/5"}`}>
              <h3 className={`font-poppins font-bold text-lg flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><Ticket size={18} className="text-primary" /> {modal.mode === "add" ? "Add Promo" : "Edit Promo"}</h3>
              <button onClick={() => setModal(null)} className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-white/10 text-white" : "bg-dark/5"}`}><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`font-poppins font-medium text-[13px] ${labelCls}`}>Code *</label>
                  <input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="ZEN10" className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins uppercase outline-none ${inputCls} ${errors.code ? "border-red-400" : ""}`} />
                  {errors.code && <p className="font-poppins text-red-400 text-xs mt-1">{errors.code}</p>}
                </div>
                <div>
                  <label className={`font-poppins font-medium text-[13px] ${labelCls}`}>Type *</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls}`}>
                    <option value="percent">Percent</option>
                    <option value="fixed">Fixed</option>
                    <option value="freeship">Free Ship</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={`font-poppins font-medium text-[13px] ${labelCls}`}>Label *</label>
                <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} placeholder="10% OFF" className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls} ${errors.label ? "border-red-400" : ""}`} />
                {errors.label && <p className="font-poppins text-red-400 text-xs mt-1">{errors.label}</p>}
              </div>
              <div>
                <label className={`font-poppins font-medium text-[13px] ${labelCls}`}>Description</label>
                <input value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} placeholder="10% off up to 8,000 MMK" className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls}`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`font-poppins font-medium text-[13px] ${labelCls}`}>Value *</label>
                  <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls} ${errors.value ? "border-red-400" : ""}`} />
                  {errors.value && <p className="font-poppins text-red-400 text-xs mt-1">{errors.value}</p>}
                </div>
                <div>
                  <label className={`font-poppins font-medium text-[13px] ${labelCls}`}>Max Discount</label>
                  <input type="number" value={form.maxDiscount} onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })} placeholder="0 = no cap" className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls}`} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`font-poppins font-medium text-[13px] ${labelCls}`}>Min Order</label>
                  <input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} placeholder="0" className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls}`} />
                </div>
                <div>
                  <label className={`font-poppins font-medium text-[13px] ${labelCls}`}>Usage Limit</label>
                  <input type="number" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: Number(e.target.value) })} placeholder="0 = unlimited" className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls}`} />
                </div>
              </div>
              <div>
                <label className={`font-poppins font-medium text-[13px] ${labelCls}`}>Expiry Date</label>
                <input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls}`} />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 accent-primary" />
                <span className={`font-poppins font-medium text-sm ${labelCls}`}>Active</span>
              </label>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModal(null)} className={`flex-1 border-2 font-poppins font-semibold py-3 rounded-full ${isDark ? "bg-transparent border-white/20 text-white hover:bg-white/10" : "bg-white border-dark/10"}`}>Cancel</button>
                <button onClick={handleSave} className="flex-1 bg-primary text-white font-poppins font-semibold py-3 rounded-full hover:bg-primary-hover">{modal.mode === "add" ? "Add" : "Save"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-[100] bg-dark/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-[360px] w-full p-6 text-center shadow-2xl border ${isDark ? "bg-[#1E1E1E] border-white/10" : "bg-white border-transparent"}`}>
            <h3 className={`font-poppins font-bold text-lg ${isDark ? "text-white" : "text-dark"}`}>Delete promo?</h3>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteId(null)} className={`flex-1 border-2 font-poppins font-semibold py-3 rounded-full ${isDark ? "bg-transparent border-white/20 text-white" : "bg-background border-dark/10"}`}>Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-600 text-white font-poppins font-semibold py-3 rounded-full">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}