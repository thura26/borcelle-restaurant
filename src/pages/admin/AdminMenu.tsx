import { useState } from "react";
import { useMenu, type MenuItemEditable, type MenuDataEditable } from "../../context/MenuContext";
import { DataTable } from "../../components/admin/DataTable";
import { ImageUploader } from "../../components/admin/ImageUploader";
import { useToast } from "../../context/ToastContext";
import { useAudit } from "../../context/AuditContext";
import { useAuth } from "../../context/AuthContext";
import { exportCSV } from "../../lib/csv";
import { formatMMK } from "../../context/CartContext";
import { Plus, Pencil, Trash2, X, Utensils, Sparkles, Loader2, Wand2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import type { MenuTab } from "../../lib/data";
import { lazy, Suspense } from "react";

const AIMenuGenerator = lazy(() => import("../../components/admin/AIMenuGenerator").then((m) => ({ default: m.AIMenuGenerator })));

  const isLoading = false;
export function AdminMenu() {
  const { menu, tabs, addItem, updateItem, deleteItem, toggleAvailable } = useMenu();
  const { show } = useToast();
  const { addLog } = useAudit();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [activeTab, setActiveTab] = useState<MenuTab>("SPICY NOODLES");
  const [modal, setModal] = useState<null | { mode: "add" | "edit"; item?: MenuItemEditable }>(null);
  const [form, setForm] = useState({ name: "", desc: "", price: 0, image: null as string | null, stock: 30, isAvailable: true });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [aiOpen, setAiOpen] = useState(false);

  const items = menu[activeTab] || [];

  const openAdd = () => {
    setForm({ name: "", desc: "", price: 22000, image: null, stock: 30, isAvailable: true });
    setErrors({});
    setModal({ mode: "add" });
  };
  const openEdit = (it: MenuItemEditable) => {
    setForm({ name: it.name, desc: it.desc, price: it.price, image: it.image || null, stock: it.stock, isAvailable: it.isAvailable });
    setErrors({});
    setModal({ mode: "edit", item: it });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name required";
    if (!form.price || form.price < 1000) e.price = "Price >= 1000";
    if (form.stock < 0 || form.stock > 999) e.stock = "Stock 0-999";
    if (form.image && form.image.length > 5 * 1024 * 1024) e.image = "Image too large";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (modal?.mode === "add") {
      const r = await addItem(activeTab, { name: form.name.trim(), desc: form.desc.trim(), price: Number(form.price), priceText: `${form.price} MMK`, image: form.image || undefined, stock: Number(form.stock), isAvailable: form.isAvailable });
      show(r.msg, r.ok);
      if (r.ok) { await addLog("create", "menu", activeTab, `Added ${form.name} to ${activeTab}`, user?.name || "admin", user?.email || ""); setModal(null); }
    } else if (modal?.mode === "edit" && modal.item) {
      const r = await updateItem(activeTab, modal.item.id, { name: form.name.trim(), desc: form.desc.trim(), price: Number(form.price), image: form.image || undefined, stock: Number(form.stock), isAvailable: form.isAvailable });
      show(r.msg, r.ok);
      if (r.ok) { await addLog("update", "menu", modal.item.id, `Updated ${form.name}`, user?.name || "admin", user?.email || ""); setModal(null); }
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const it = items.find((x) => x.id === deleteId);
    const r = await deleteItem(activeTab, deleteId);
    show(r.msg, r.ok);
    if (r.ok) await addLog("delete", "menu", deleteId, `Deleted ${it?.name}`, user?.name || "admin", user?.email || "");
    setDeleteId(null);
  };

  const handleBulkDelete = (ids: string[]) => {
    if (ids.length === 0) return;
    setBulkDeleting(true);
    setTimeout(async () => {
      let count = 0;
      for (const id of ids) {
        const r = await deleteItem(activeTab, id);
        if (r.ok) count++;
      }
      await addLog("delete", "menu", ids.join(","), `Bulk deleted ${count} items from ${activeTab}`, user?.name || "admin", user?.email || "");
      show(`Deleted ${count} items`, true);
      setSelectedIds(new Set());
      setBulkDeleting(false);
    }, 800);
  };

  const handleExport = () => {
    const all = Object.entries(menu as MenuDataEditable).flatMap(([tab, arr]) => arr.map((it: any) => ({ tab, id: it.id, name: it.name, price: it.price, stock: it.stock, available: it.isAvailable })));
    exportCSV(`menu_${new Date().toISOString().slice(0, 10)}`, all);
    show("CSV exported", true);
  };

  const inputCls = isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50" : "bg-background border-dark/10 text-dark focus:border-primary/40";
  const labelCls = isDark ? "text-white" : "text-dark";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className={`font-poppins font-bold text-[20px] flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><Utensils size={20} className="text-primary" /> Menu Management</h2>
          <p className={`font-poppins text-sm flex items-center gap-1.5 ${isDark ? "text-white/60" : "text-muted"}`}><Sparkles size={14} /> CRUD connected to MenuList • Borcelle AI generate</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setAiOpen(true)} className={`border-2 font-poppins font-semibold px-5 py-3 rounded-full flex items-center gap-2 shadow-sm transition-colors ${isDark ? "bg-white text-dark border-white hover:bg-background" : "bg-white text-primary border-primary/20 hover:border-primary hover:bg-primary/5"}`}><Wand2 size={16} className="text-primary" /> <Sparkles size={16} /> AI Generate</button>
          <button onClick={openAdd} className="bg-primary text-white font-poppins font-semibold px-5 py-3 rounded-full flex items-center gap-2 hover:bg-primary-hover shadow-md"><Plus size={16} /> Add Item to {activeTab}</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`font-bayon text-[12px] tracking-[0.06em] px-5 py-2.5 rounded-full border transition-all ${activeTab === tab ? "bg-primary text-white border-primary" : isDark ? "bg-white/10 text-white border-white/10 hover:bg-white/20" : "bg-white text-dark border-dark/10 hover:border-dark/20"}`}>{tab} <span className="ml-1 opacity-70">({menu[tab].length})</span></button>
        ))}
      </div>

      {isLoading ? (
        <div className={`rounded-2xl border p-8 flex flex-col items-center justify-center gap-3 ${isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-dark/5"}`}>
          <Loader2 size={24} className="animate-spin text-primary" />
          <p className={`font-poppins font-semibold text-sm ${isDark ? "text-white" : "text-dark"}`}>Loading menu...</p>
        </div>
      ) : (
        <div className="relative">
          {bulkDeleting && (
            <div className={`absolute inset-0 z-10 rounded-2xl flex items-center justify-center gap-2 backdrop-blur-sm ${isDark ? "bg-[#0f0f0f]/80" : "bg-white/80"}`}>
              <Loader2 size={20} className="animate-spin text-primary" />
              <span className={`font-poppins font-semibold text-sm ${isDark ? "text-white" : "text-dark"}`}>Deleting...</span>
            </div>
          )}
          <DataTable
            data={items}
            searchKeys={["name", "desc"]}
            searchPlaceholder={`Search in ${activeTab}...`}
            onExport={handleExport}
            selectable
            getRowId={(r: MenuItemEditable) => r.id}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onBulkDelete={handleBulkDelete}
            bulkDeleteLabel="Delete selected"
            isLoading={isLoading}
            columns={[
              { key: "name", header: "Name", render: (r: MenuItemEditable) => <div><p className={`font-poppins font-semibold text-sm ${isDark ? "text-white" : "text-dark"}`}>{r.name}</p><p className={`font-poppins text-xs line-clamp-1 max-w-[280px] ${isDark ? "text-white/60" : "text-muted"}`}>{r.desc}</p></div> },
              { key: "price", header: "Price", render: (r: MenuItemEditable) => <span className={`font-poppins font-bold ${isDark ? "text-[#FF8A80]" : "text-primary"}`}>{formatMMK(r.price)}</span> },
              { key: "stock", header: "Stock", render: (r: MenuItemEditable) => <span className={`px-2.5 py-1 rounded-full text-xs font-poppins font-bold border ${r.stock < 5 ? (isDark ? "bg-red-500/15 text-red-400 border-red-500/20" : "bg-red-50 text-red-700 border-red-200") : (isDark ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-green-50 text-green-700 border-green-200")}`}>{r.stock}</span> },
              { key: "available", header: "Available", render: (r: MenuItemEditable) => <button onClick={async () => { await toggleAvailable(activeTab, r.id); await addLog("update", "menu", r.id, `Toggled ${r.name} available`, user?.name || "admin", user?.email || ""); }} className={`px-3 py-1 rounded-full text-xs font-poppins font-bold border ${r.isAvailable ? "bg-green-500 text-white border-green-500" : isDark ? "bg-white/10 text-white/60 border-white/10" : "bg-dark/5 text-muted border-dark/10"}`}>{r.isAvailable ? "Yes" : "No"}</button> },
              {
                key: "actions", header: "Actions", render: (r: MenuItemEditable) => (
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(r)} className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? "bg-white/10 border-white/10 text-white hover:bg-white hover:text-dark" : "bg-white border-dark/10 hover:border-primary/30"}`}><Pencil size={14} /></button>
                    <button onClick={() => setDeleteId(r.id)} className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white" : "bg-white border-red-200 text-red-600 hover:bg-red-50"}`}><Trash2 size={14} /></button>
                  </div>
                )
              },
            ]}
          />
        </div>
      )}

      {modal && (
        <div className="fixed inset-0 z-[100] bg-dark/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-[560px] w-full max-h-[90vh] overflow-y-auto shadow-2xl border ${isDark ? "bg-[#1E1E1E] border-white/10" : "bg-white"}`}>
            <div className={`sticky top-0 p-6 border-b flex items-center justify-between rounded-t-3xl ${isDark ? "bg-[#1E1E1E] border-white/10" : "bg-white border-dark/5"}`}>
              <h3 className={`font-poppins font-bold text-lg flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><Utensils size={18} className="text-primary" /> {modal.mode === "add" ? `Add to ${activeTab}` : "Edit Item"}</h3>
              <button onClick={() => setModal(null)} className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-white/10 text-white" : "bg-dark/5"}`}><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`font-poppins font-medium text-[13px] ${labelCls}`}>Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="OTORO NIGIRI" className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls} ${errors.name ? "border-red-400" : ""}`} />
                {errors.name && <p className="font-poppins text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className={`font-poppins font-medium text-[13px] ${labelCls}`}>Description</label>
                <textarea value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} rows={2} placeholder="Premium fatty tuna..." className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls}`} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`font-poppins font-medium text-[13px] ${labelCls}`}>Price MMK *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls} ${errors.price ? "border-red-400" : ""}`} />
                  {errors.price && <p className="font-poppins text-red-400 text-xs mt-1">{errors.price}</p>}
                </div>
                <div>
                  <label className={`font-poppins font-medium text-[13px] ${labelCls}`}>Stock *</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls} ${errors.stock ? "border-red-400" : ""}`} />
                  {errors.stock && <p className="font-poppins text-red-400 text-xs mt-1">{errors.stock}</p>}
                </div>
              </div>
              <ImageUploader value={form.image} onChange={(v) => setForm({ ...form, image: v })} label="Menu Image (optional)" />
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="w-4 h-4 accent-primary" />
                <span className={`font-poppins font-medium text-sm ${labelCls}`}>Available</span>
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
          <div className={`rounded-2xl max-w-[360px] w-full p-6 text-center shadow-2xl border ${isDark ? "bg-[#1E1E1E] border-white/10" : "bg-white"}`}>
            <h3 className={`font-poppins font-bold text-lg ${isDark ? "text-white" : "text-dark"}`}>Delete item?</h3>
            <p className={`font-poppins text-sm mt-2 ${isDark ? "text-white/60" : "text-muted"}`}>Cannot be undone.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteId(null)} className={`flex-1 border-2 font-poppins font-semibold py-3 rounded-full ${isDark ? "bg-transparent border-white/20 text-white" : "bg-background border-dark/10"}`}>Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-600 text-white font-poppins font-semibold py-3 rounded-full hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}

      {aiOpen && (
        <Suspense fallback={<div className={`fixed inset-0 z-[100] bg-dark/50 backdrop-blur-md flex items-center justify-center p-4 ${isDark ? "text-white" : "text-dark"}`}><div className={`rounded-2xl p-6 flex items-center gap-3 border ${isDark ? "bg-[#1E1E1E] border-white/10" : "bg-white"}`}><Loader2 size={20} className="animate-spin text-primary" /> Loading AI...</div></div>}>
          <AIMenuGenerator open={aiOpen} onClose={() => setAiOpen(false)} activeTab={activeTab} />
        </Suspense>
      )}
    </div>
  );
}