import { useState } from "react";
import { useProducts, type Product } from "../../context/ProductContext";
import { DataTable } from "../../components/admin/DataTable";
import { ImageUploader } from "../../components/admin/ImageUploader";
import { useToast } from "../../context/ToastContext";
import { useAudit } from "../../context/AuditContext";
import { useAuth } from "../../context/AuthContext";
import { exportCSV } from "../../lib/csv";
import { useCategories } from "../../context/CategoryContext";
import { formatMMK } from "../../context/CartContext";
import { Plus, Pencil, Trash2, X, Package, Sparkles, Loader2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

  const isLoading = false;
export function AdminProducts() {
  const { products, addProduct, updateProduct, deleteProduct, toggleAvailable } = useProducts();
  const { categories } = useCategories();
  const { show } = useToast();
  const { addLog } = useAudit();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [modal, setModal] = useState<null | { mode: "add" | "edit"; product?: Product }>(null);
  const [form, setForm] = useState({ name: "", price: 26000, originalPrice: 30000, category: "ALL", image: null as string | null, description: "", stock: 50, isAvailable: true });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const openAdd = () => {
    const defaultCat = categories.find((c) => c !== "ALL") || categories[0] || "ALL";
    setForm({ name: "", price: 26000, originalPrice: 30000, category: defaultCat, image: null, description: "Authentic Korean recipe with seasonal ingredients", stock: 50, isAvailable: true });
    setErrors({});
    setModal({ mode: "add" });
  };
  const openEdit = (p: Product) => {
    setForm({ name: p.name, price: p.price, originalPrice: p.originalPrice ?? Math.round(p.price * 1.15), category: p.category, image: p.image, description: p.description, stock: p.stock, isAvailable: p.isAvailable });
    setErrors({});
    setModal({ mode: "edit", product: p });
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name required";
    else if (form.name.trim().length < 2) e.name = "Min 2 chars";
    if (!form.price || form.price < 1000) e.price = "Discount price >= 1000";
    if (!form.originalPrice || form.originalPrice < 1000) e.originalPrice = "Normal price >= 1000";
    if (form.price > form.originalPrice) e.price = "Discount must be ≤ Normal";
    if (form.stock < 0 || form.stock > 999) e.stock = "Stock 0-999";
    if (form.image && form.image.length > 5 * 1024 * 1024) e.image = "Image too large (max 5MB)";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    if (modal?.mode === "add") {
      const r = await addProduct({ name: form.name.trim(), price: Number(form.price), originalPrice: Number(form.originalPrice), category: form.category, image: form.image || "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=600&fit=crop", description: form.description, isAvailable: form.isAvailable, stock: Number(form.stock) });
      show(r.msg, r.ok);
      if (r.ok) {
        await addLog("create", "product", form.name, `Created product ${form.name} ${form.price}/${form.originalPrice}`, user?.name || "admin", user?.email || "");
        setModal(null);
      }
    } else if (modal?.mode === "edit" && modal.product) {
      const r = await updateProduct(modal.product.id, { name: form.name.trim(), price: Number(form.price), originalPrice: Number(form.originalPrice), category: form.category, image: form.image || modal.product.image, description: form.description, stock: Number(form.stock), isAvailable: form.isAvailable });
      show(r.msg, r.ok);
      if (r.ok) {
        await addLog("update", "product", modal.product.id, `Updated ${form.name} ${form.price}/${form.originalPrice}`, user?.name || "admin", user?.email || "");
        setModal(null);
      }
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const p = products.find((x) => x.id === deleteId);
    const r = await deleteProduct(deleteId);
    show(r.msg, r.ok);
    if (r.ok) await addLog("delete", "product", deleteId, `Deleted ${p?.name}`, user?.name || "admin", user?.email || "");
    setDeleteId(null);
  };

  const handleBulkDelete = (ids: string[]) => {
    if (ids.length === 0) return;
    setBulkDeleting(true);
    setTimeout(async () => {
      let count = 0;
      for (const id of ids) {
        const r = await deleteProduct(id);
        if (r.ok) count++;
      }
      await addLog("delete", "product", ids.join(","), `Bulk deleted ${count} products`, user?.name || "admin", user?.email || "");
      show(`Deleted ${count} products`, true);
      setSelectedIds(new Set());
      setBulkDeleting(false);
    }, 800);
  };

  const handleExport = () => {
    exportCSV(`products_${new Date().toISOString().slice(0, 10)}`, products.map((p) => ({ id: p.id, name: p.name, category: p.category, normalPrice: (p as any).originalPrice ?? p.price, discountPrice: p.price, stock: p.stock, available: p.isAvailable, createdAt: new Date(p.createdAt).toLocaleDateString() })));
    show("CSV exported", true);
  };

  const inputCls = isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50" : "bg-background border-dark/10 text-dark focus:border-primary/40";
  const labelCls = isDark ? "text-white" : "text-dark";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={`font-poppins font-bold text-[20px] flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><Package size={20} className="text-primary" /> Products <span className={`font-normal text-sm px-2.5 py-1 rounded-full border ${isDark ? "bg-white/10 text-white/70 border-white/10" : "bg-background text-muted border-dark/5"}`}>{products.length} items</span></h2>
          <p className={`font-poppins text-sm flex items-center gap-1.5 mt-1 ${isDark ? "text-white/60" : "text-muted"}`}><Sparkles size={14} className={isDark ? "text-white/40" : "text-muted"} /> CRUD connected to frontend CuisineGrid • base64 5MB • stock tracking</p>
        </div>
        <button onClick={openAdd} className="bg-primary text-white font-poppins font-semibold px-5 py-3 rounded-full flex items-center gap-2 hover:bg-primary-hover shadow-md hover:shadow-lg transition-all">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {isLoading ? (
        <div className={`rounded-2xl border p-8 flex flex-col items-center justify-center gap-3 ${isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-dark/5"}`}>
          <Loader2 size={24} className="animate-spin text-primary" />
          <p className={`font-poppins font-semibold text-sm ${isDark ? "text-white" : "text-dark"}`}>Loading products...</p>
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
            data={products}
            searchKeys={["name", "category"]}
            searchPlaceholder="Search name or category..."
            onExport={handleExport}
            emptyText="No products"
            selectable
            getRowId={(r: Product) => r.id}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onBulkDelete={handleBulkDelete}
            bulkDeleteLabel="Delete selected"
            isLoading={false}
            columns={[
              { key: "image", header: "Image", render: (r: Product) => <img src={r.image} alt={r.name} className={`w-12 h-12 rounded-xl object-cover border ${isDark ? "border-white/10" : "border-dark/5"}`} /> },
              { key: "name", header: "Name", render: (r: Product) => <div><p className={`font-poppins font-semibold text-sm ${isDark ? "text-white" : "text-dark"}`}>{r.name}</p><p className={`font-poppins text-xs ${isDark ? "text-white/60" : "text-muted"}`}>{r.category}</p></div> },
              { key: "price", header: "Price", render: (r: Product) => {
                const orig = (r as any).originalPrice ?? r.price;
                const hasDiscount = orig > r.price;
                return (
                  <div className="flex flex-col">
                    <span className={`font-poppins font-bold text-sm ${isDark ? "text-[#FF8A80]" : "text-primary"}`}>{formatMMK(r.price)}</span>
                    {hasDiscount && <span className={`font-poppins text-xs line-through ${isDark ? "text-white/50" : "text-muted"}`}>{formatMMK(orig)}</span>}
                  </div>
                );
              } },
              { key: "stock", header: "Stock", render: (r: Product) => <span className={`px-2.5 py-1 rounded-full text-xs font-poppins font-bold border ${r.stock < 5 ? (isDark ? "bg-red-500/15 text-red-400 border-red-500/20" : "bg-red-50 text-red-700 border-red-200") : r.stock < 10 ? (isDark ? "bg-amber-500/15 text-amber-400 border-amber-500/20" : "bg-amber-50 text-amber-700 border-amber-200") : (isDark ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-green-50 text-green-700 border-green-200")}`}>{r.stock} {r.stock < 5 ? "• Low" : ""}</span> },
              { key: "available", header: "Available", render: (r: Product) => <button onClick={async () => { await toggleAvailable(r.id); await addLog("update", "product", r.id, `Toggled available to ${!r.isAvailable}`, user?.name || "admin", user?.email || ""); }} className={`px-3 py-1 rounded-full text-xs font-poppins font-bold border transition-colors ${r.isAvailable ? "bg-emerald-500 text-white border-emerald-500" : isDark ? "bg-white/10 text-white/60 border-white/10 hover:bg-white/15" : "bg-dark/5 text-muted border-dark/10"}`}>{r.isAvailable ? "Yes" : "No"}</button> },
              {
                key: "actions", header: "Actions", render: (r: Product) => (
                  <div className="flex gap-2">
                    <button onClick={() => openEdit(r)} className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${isDark ? "bg-white/10 border-white/10 text-white hover:bg-white hover:text-dark" : "bg-white border-dark/10 text-dark hover:border-primary/30"}`}><Pencil size={14} /></button>
                    <button onClick={() => setDeleteId(r.id)} className={`w-8 h-8 rounded-full border flex items-center justify-center transition-colors ${isDark ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white" : "bg-white border-red-200 text-red-600 hover:bg-red-50"}`}><Trash2 size={14} /></button>
                  </div>
                )
              },
            ]}
          />
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-[100] bg-dark/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-[560px] w-full max-h-[90vh] overflow-y-auto shadow-2xl border ${isDark ? "bg-[#1E1E1E] border-white/10" : "bg-white border-transparent"}`}>
            <div className={`sticky top-0 p-6 border-b flex items-center justify-between rounded-t-3xl ${isDark ? "bg-[#1E1E1E] border-white/10" : "bg-white border-dark/5"}`}>
              <h3 className={`font-poppins font-bold text-lg flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><Package size={18} className="text-primary" /> {modal.mode === "add" ? "Add Product" : "Edit Product"}</h3>
              <button onClick={() => setModal(null)} className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-white/10 text-white hover:bg-white/20" : "bg-dark/5 hover:bg-dark/10"}`}><X size={16} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className={`font-poppins font-medium text-[13px] ${labelCls}`}>Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="SUSHI PLATTER" className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls} ${errors.name ? "border-red-400" : ""}`} />
                {errors.name && <p className="font-poppins text-red-400 text-xs mt-1">{errors.name}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`font-poppins font-medium text-[13px] ${labelCls}`}>Normal Price MMK *</label>
                  <input type="number" value={form.originalPrice} onChange={(e) => setForm({ ...form, originalPrice: Number(e.target.value) })} className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls} ${errors.originalPrice ? "border-red-400" : ""}`} />
                  {errors.originalPrice && <p className="font-poppins text-red-400 text-xs mt-1">{errors.originalPrice}</p>}
                </div>
                <div>
                  <label className={`font-poppins font-medium text-[13px] ${labelCls}`}>Discount Price MMK *</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls} ${errors.price ? "border-red-400" : ""}`} />
                  {errors.price && <p className="font-poppins text-red-400 text-xs mt-1">{errors.price}</p>}
                  {form.originalPrice > form.price && (
                    <p className="font-poppins text-green-600 text-[11px] mt-1">{Math.round(((form.originalPrice - form.price) / form.originalPrice) * 100)}% OFF</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`font-poppins font-medium text-[13px] ${labelCls}`}>Stock *</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls} ${errors.stock ? "border-red-400" : ""}`} />
                  {errors.stock && <p className="font-poppins text-red-400 text-xs mt-1">{errors.stock}</p>}
                </div>
                <div>
                  <label className={`font-poppins font-medium text-[13px] ${labelCls}`}>Category *</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls}`}>
                    {categories.filter((c) => c !== "ALL").map((c) => <option key={c} value={c} className={isDark ? "bg-[#1E1E1E]" : ""}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className={`font-poppins font-medium text-[13px] ${labelCls}`}>Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Seasonal ingredients..." className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls}`} />
              </div>
              <ImageUploader value={form.image} onChange={(v) => setForm({ ...form, image: v })} label="Product Image" />
              {errors.image && <p className={`font-poppins text-xs border rounded-xl px-3 py-2 ${isDark ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-red-50 text-red-500 border-red-200"}`}>{errors.image}</p>}
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isAvailable} onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })} className="w-4 h-4 accent-primary" />
                <span className={`font-poppins font-medium text-sm ${labelCls}`}>Available for order</span>
              </label>
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
            <h3 className={`font-poppins font-bold text-lg ${isDark ? "text-white" : "text-dark"}`}>Delete product?</h3>
            <p className={`font-poppins text-sm mt-2 ${isDark ? "text-white/60" : "text-muted"}`}>This cannot be undone.</p>
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