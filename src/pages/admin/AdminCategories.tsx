import { useState } from "react";
import { useCategories } from "../../context/CategoryContext";
import { useProducts } from "../../context/ProductContext";
import { useToast } from "../../context/ToastContext";
import { useAudit } from "../../context/AuditContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Tags, Plus, Pencil, Trash2, X, Search, Package } from "lucide-react";

export function AdminCategories() {
  const { rawCategories, addCategory, updateCategory, deleteCategory } = useCategories();
  const { products } = useProducts();
  const { show } = useToast();
  const { addLog } = useAudit();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState<null | { mode: "add" } | { mode: "edit"; id: string; name: string }>(null);
  const [formName, setFormName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = rawCategories.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));

  const openAdd = () => {
    setFormName("");
    setError(null);
    setModal({ mode: "add" });
  };
  const openEdit = (id: string, name: string) => {
    setFormName(name);
    setError(null);
    setModal({ mode: "edit", id, name });
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      setError("Name required");
      return;
    }
    if (modal?.mode === "add") {
      const r = await addCategory(formName);
      show(r.msg, r.ok);
      if (r.ok) {
        await addLog("create", "category", formName, `Created category ${formName}`, user?.name || "admin", user?.email || "");
        setModal(null);
      } else setError(r.msg);
    } else if (modal?.mode === "edit") {
      const r = await updateCategory(modal.id, formName);
      show(r.msg, r.ok);
      if (r.ok) {
        await addLog("update", "category", modal.id, `Updated category ${formName}`, user?.name || "admin", user?.email || "");
        setModal(null);
      } else setError(r.msg);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const r = await deleteCategory(deleteId);
    show(r.msg, r.ok);
    if (r.ok) await addLog("delete", "category", deleteId, `Deleted category`, user?.name || "admin", user?.email || "");
    setDeleteId(null);
  };

  const getCount = (name: string) => products.filter((p) => p.category === name).length;

  const inputCls = isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50" : "bg-background border-dark/10 text-dark focus:border-primary/40";
  const cardCls = isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-dark/5";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={`font-poppins font-bold text-[20px] flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}>
            <Tags size={20} className="text-primary" /> Categories <span className={`font-normal text-sm px-2.5 py-1 rounded-full border ${isDark ? "bg-white/10 text-white/70 border-white/10" : "bg-background text-muted border-dark/5"}`}>{rawCategories.length} total</span>
          </h2>
          <p className={`font-poppins text-sm mt-1 ${isDark ? "text-white/60" : "text-muted"}`}>Create, rename or remove product categories — changes reflect instantly on client menu & product form.</p>
        </div>
        <button onClick={openAdd} className="bg-primary text-white font-poppins font-semibold px-5 py-3 rounded-full flex items-center gap-2 hover:bg-primary-hover shadow-md transition-all">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className={`rounded-2xl border p-4 flex flex-col sm:flex-row gap-3 ${cardCls}`}>
        <div className="relative flex-1">
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? "text-white/40" : "text-muted"}`} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search category..." className={`w-full pl-10 pr-4 py-3 rounded-full border text-sm font-poppins outline-none ${inputCls}`} />
        </div>
        <div className={`px-4 py-3 rounded-full border text-sm font-poppins font-semibold flex items-center gap-2 ${isDark ? "bg-white/5 border-white/10 text-white/70" : "bg-background border-dark/5 text-muted"}`}>
          <Package size={14} /> {products.length} products
        </div>
      </div>

      <div className={`rounded-2xl border overflow-hidden shadow-sm ${cardCls}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className={`border-b ${isDark ? "bg-white/5 border-white/10" : "bg-background border-dark/5"}`}>
              <tr className={`font-poppins font-bold text-xs tracking-widest ${isDark ? "text-white/60" : "text-muted"}`}>
                <th className="px-4 md:px-6 py-3">NAME</th>
                <th className="px-4 py-3 hidden sm:table-cell">SLUG</th>
                <th className="px-4 py-3 text-center">PRODUCTS</th>
                <th className="px-4 py-3 hidden md:table-cell">CREATED</th>
                <th className="px-4 md:px-6 py-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? "divide-white/5" : "divide-dark/5"}`}>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className={`px-6 py-12 text-center font-poppins text-sm ${isDark ? "text-white/60" : "text-muted"}`}>No categories found</td>
                </tr>
              ) : (
                filtered.map((cat) => {
                  const count = getCount(cat.name);
                  return (
                    <tr key={cat.id} className={`${isDark ? "hover:bg-white/5" : "hover:bg-background/50"} transition-colors`}>
                      <td className="px-4 md:px-6 py-3">
                        <div className="flex items-center gap-3">
                          <span className={`w-9 h-9 rounded-full flex items-center justify-center font-poppins font-bold text-xs ${isDark ? "bg-primary text-white" : "bg-primary text-white"}`}>{cat.name[0]}</span>
                          <span className={`font-poppins font-semibold text-sm ${isDark ? "text-white" : "text-dark"}`}>{cat.name}</span>
                        </div>
                      </td>
                      <td className={`px-4 py-3 font-poppins text-xs hidden sm:table-cell ${isDark ? "text-white/50" : "text-muted"}`}>{cat.slug}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-poppins font-bold border ${count > 0 ? (isDark ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-green-50 text-green-700 border-green-200") : (isDark ? "bg-white/5 text-white/60 border-white/10" : "bg-background text-muted border-dark/5")}`}>{count}</span>
                      </td>
                      <td className={`px-4 py-3 font-poppins text-xs hidden md:table-cell ${isDark ? "text-white/40" : "text-muted"}`}>{new Date(cat.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 md:px-6 py-3">
                        <div className="flex justify-end gap-2">
                          <button onClick={() => openEdit(cat.id, cat.name)} className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${isDark ? "bg-white/10 border-white/10 text-white hover:bg-white hover:text-dark" : "bg-white border-dark/10 text-dark hover:border-primary/30"}`}><Pencil size={14} /></button>
                          <button onClick={() => setDeleteId(cat.id)} className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${isDark ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white" : "bg-white border-red-200 text-red-600 hover:bg-red-50"}`}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-[100] bg-dark/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-[440px] w-full shadow-2xl border ${isDark ? "bg-[#1E1E1E] border-white/10" : "bg-white border-transparent"}`}>
            <div className={`p-6 border-b flex items-center justify-between ${isDark ? "border-white/10" : "border-dark/5"}`}>
              <h3 className={`font-poppins font-bold text-lg flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><Tags size={18} className="text-primary" /> {modal.mode === "add" ? "Add Category" : "Edit Category"}</h3>
              <button onClick={() => setModal(null)} className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-dark/5 hover:bg-dark/10"}`}><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`font-poppins font-medium text-[13px] ${isDark ? "text-white" : "text-dark"}`}>Category Name *</label>
                <input value={formName} onChange={(e) => setFormName(e.target.value)} placeholder="e.g. K-BBQ & BULGOGI" className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls} ${error ? "border-red-400" : ""}`} />
                {error && <p className="font-poppins text-red-400 text-xs mt-1">{error}</p>}
                <p className={`font-poppins text-xs mt-2 ${isDark ? "text-white/40" : "text-muted"}`}>Will be uppercased. 2-24 chars. Must be unique.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => setModal(null)} className={`flex-1 border-2 font-poppins font-semibold py-3 rounded-full ${isDark ? "bg-transparent border-white/20 text-white hover:bg-white/10" : "bg-white border-dark/10 hover:border-dark/20"}`}>Cancel</button>
                <button onClick={handleSave} className="flex-1 bg-primary text-white font-poppins font-semibold py-3 rounded-full hover:bg-primary-hover">{modal.mode === "add" ? "Add" : "Save"}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-[100] bg-dark/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-[360px] w-full p-6 text-center shadow-2xl border ${isDark ? "bg-[#1E1E1E] border-white/10" : "bg-white border-transparent"}`}>
            <h3 className={`font-poppins font-bold text-lg ${isDark ? "text-white" : "text-dark"}`}>Delete category?</h3>
            <p className={`font-poppins text-sm mt-2 ${isDark ? "text-white/60" : "text-muted"}`}>This cannot be undone. Products using this category will block deletion.</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteId(null)} className={`flex-1 border-2 font-poppins font-semibold py-3 rounded-full ${isDark ? "bg-transparent border-white/20 text-white hover:bg-white/10" : "bg-background border-dark/10 hover:border-dark/20"}`}>Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-600 text-white font-poppins font-semibold py-3 rounded-full hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}