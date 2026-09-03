import { useState, useEffect } from "react";
import { useMenu } from "../../context/MenuContext";
import { useToast } from "../../context/ToastContext";
import { useAudit } from "../../context/AuditContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useCategories } from "../../context/CategoryContext";
import { useProducts } from "../../context/ProductContext";
import { generateMenuWithAI, type AIGeneratedItem } from "../../lib/aiMenu";
import type { MenuTab } from "../../lib/data";
import { BRAND } from "../../lib/brand";
import { X, Sparkles, Loader2, Wand2, Check, Trash2, Image as ImageIcon, AlertTriangle, RefreshCw } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  activeTab: MenuTab;
};

const TAB_TO_PRODUCT_CATEGORY: Record<MenuTab, string> = {
  "SPICY NOODLES": "SPICY NOODLES",
  BIBIMBAP: "BIBIMBAP",
  "K-BBQ": "K-BBQ",
  FRIED: "FRIED",
  SOUPS: "SOUPS",
  DRINKS: "DRINKS",
};

export function AIMenuGenerator({ open, onClose, activeTab }: Props) {
  const { tabs, bulkAddItems, menu } = useMenu();
  const { categories, addCategory } = useCategories();
  const { products, addProduct } = useProducts();
  const { show } = useToast();
  const { addLog } = useAudit();
  const { user } = useAuth();
  const { isDark } = useTheme();

  const [tab, setTab] = useState<MenuTab>(activeTab);
  const [count, setCount] = useState(3);
  const [prompt, setPrompt] = useState("");
  const [priceMin, setPriceMin] = useState<number | "">("");
  const [priceMax, setPriceMax] = useState<number | "">("");
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<AIGeneratedItem[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [source, setSource] = useState<"mock" | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  // auto-sync always ON — keeps previous clean UI but still creates categories/products
  const autoSync = true;

  useEffect(() => {
    setTab(activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (open) {
      setPreview([]);
      setSelected(new Set());
      setSource(null);
      setInfo(null);
      setError(null);
    }
  }, [open]);

  const handleGenerate = async () => {
    if (count < 1 || count > 10) {
      setError("Count must be 1-10");
      return;
    }
    if (priceMin !== "" && priceMax !== "" && Number(priceMin) >= Number(priceMax)) {
      setError("Min price must be < Max price");
      return;
    }
    setGenerating(true);
    setError(null);
    setInfo(null);
    setSource(null);
    try {
      const res = await generateMenuWithAI({
        tab,
        count,
        prompt,
        priceMin: priceMin === "" ? undefined : Number(priceMin),
        priceMax: priceMax === "" ? undefined : Number(priceMax),
      });
      setPreview(res.items);
      setSelected(new Set(res.items.map((_, i) => i)));
      setSource(res.source);
      setInfo(`Generated ${res.items.length} mock items for ${BRAND.name} ✓ — offline, no API`);
      if (res.items.length === 0) setError("No items generated. Try different prompt.");
    } catch (e: any) {
      setError(e?.message || "Generation failed");
    } finally {
      setGenerating(false);
    }
  };

  const toggleSelect = (i: number) => {
    setSelected((prev) => {
      const n = new Set(prev);
      if (n.has(i)) n.delete(i);
      else n.add(i);
      return n;
    });
  };
  const selectAll = () => setSelected(new Set(preview.map((_, i) => i)));
  const deselectAll = () => setSelected(new Set());

  const updatePreview = (i: number, patch: Partial<AIGeneratedItem>) => {
    setPreview((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  };
  const removeOne = (i: number) => {
    setPreview((prev) => prev.filter((_, idx) => idx !== i));
    setSelected((prev) => {
      const n = new Set<number>();
      prev.forEach((v) => {
        if (v < i) n.add(v);
        else if (v > i) n.add(v - 1);
      });
      return n;
    });
  };

  const handleAdd = async () => {
    const itemsToAdd = preview.filter((_, i) => selected.has(i)).map((it) => ({
      name: it.name.trim(),
      desc: it.desc.trim(),
      price: Math.round(Number(it.price)),
      priceText: `${it.price} MMK`,
      image: it.image,
      isAvailable: true,
      stock: Math.round(Number(it.stock)),
    }));
    if (itemsToAdd.length === 0) {
      show("Select at least one item", false);
      return;
    }
    const r = await bulkAddItems(tab, itemsToAdd as any);
    if (!r.ok && r.added === 0) {
      show(r.msg, false);
      return;
    }

    // --- Auto-sync to Categories & Products ---
    let catCreated = 0;
    let prodAdded = 0;
    let prodSkipped = 0;
    let syncCategory = "";
    if (autoSync) {
      syncCategory = TAB_TO_PRODUCT_CATEGORY[tab] || tab;
      // Heuristic for FRIED: if name contains TTEOK -> use TTEOKBOKKI else K-FRIED
      // For SOUPS/DRINKS ensure category exists
      const needCat = syncCategory;
      const exists = categories.some((c) => c.toLowerCase() === needCat.toLowerCase());
      if (!exists) {
        const cr = await addCategory(needCat);
        if (cr.ok) {
          catCreated = 1;
          await addLog("create", "category", needCat, `Auto-created via AI Menu (${tab} → ${needCat})`, user?.name || "admin", user?.email || "");
        }
      }
      for (const it of itemsToAdd) {
        const prodCat = syncCategory;
        // ensure prodCat fallback exists in categories after creation
        const prodPayload = {
          name: it.name.trim(),
          price: Math.round(Number(it.price)),
          originalPrice: Math.round(Number(it.price) * 1.15),
          category: prodCat,
          image: it.image || "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=600&h=600&fit=crop",
          description: it.desc.trim(),
          isAvailable: true,
          stock: Math.round(Number(it.stock)),
        };
        // skip if already exists in products (case-insensitive)
        if (products.some((p) => p.name.toLowerCase() === prodPayload.name.toLowerCase())) {
          prodSkipped++;
          continue;
        }
        const pr = await addProduct(prodPayload as any);
        if (pr.ok) {
          prodAdded++;
          await addLog("create", "product", prodPayload.name, `Auto-created via AI Menu ${tab} → ${prodCat} ${prodPayload.price} MMK`, user?.name || "admin", user?.email || "");
        } else {
          prodSkipped++;
        }
      }
    }

    const parts = [`${r.added} menu → ${tab}`];
    if (autoSync) {
      if (catCreated) parts.push(`${catCreated} category`);
      parts.push(`${prodAdded} products → ${syncCategory}${prodSkipped ? ` (${prodSkipped} skip)` : ""}`);
    }
    const finalMsg = autoSync ? `Added ${parts.join(" • ")}` : r.msg;
    show(finalMsg, true);
    if (r.ok) {
      await addLog("create", "menu", tab, `AI mock ${r.added} items to ${tab}${prompt ? ` — "${prompt.slice(0, 40)}"` : ""} [mock]${autoSync ? ` + ${prodAdded} products${catCreated ? ` + ${catCreated} cat` : ""}` : ""}`, user?.name || "admin", user?.email || "");
      onClose();
    }
  };

  const inputCls = isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50" : "bg-background border-dark/10 text-dark focus:border-primary/40";
  const labelCls = isDark ? "text-white" : "text-dark";
  const cardCls = isDark ? "bg-[#252525] border-white/10" : "bg-white border-dark/5";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-dark/60 backdrop-blur-md flex items-center justify-center p-3 sm:p-4">
      <div className={`rounded-3xl max-w-[860px] w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border ${isDark ? "bg-[#1E1E1E] border-white/10" : "bg-white"}`}>
        {/* Header */}
        <div className={`sticky top-0 p-5 sm:p-6 border-b flex items-start justify-between gap-3 ${isDark ? "bg-[#1E1E1E] border-white/10" : "bg-white border-dark/5"}`}>
          <div className="flex-1 min-w-0">
            <h3 className={`font-poppins font-bold text-lg flex items-center gap-2 flex-wrap ${isDark ? "text-white" : "text-dark"}`}>
              <span className="w-9 h-9 rounded-xl bg-primary text-white flex items-center justify-center"><Sparkles size={18} /></span>
              AI Menu Generate — {BRAND.name}
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${source === "mock" ? "bg-emerald-500 text-white border-emerald-500" : isDark ? "bg-white/10 text-white/70 border-white/10" : "bg-dark/5 text-muted border-dark/10"}`}>
                {source === "mock" ? "● Mock Ready" : "● Offline Mock"}
              </span>
            </h3>
            <p className={`font-poppins text-xs mt-1.5 flex items-center gap-1.5 flex-wrap ${isDark ? "text-white/60" : "text-muted"}`}>
              <Wand2 size={12} /> Generate {count} items for <b className={isDark ? "text-white" : "text-dark"}>{tab}</b> • Offline mock • Name / desc / price / image
            </p>
          </div>
          <button onClick={onClose} className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isDark ? "bg-white/10 text-white hover:bg-white hover:text-dark" : "bg-dark/5 hover:bg-dark/10"}`}><X size={16} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 no-scrollbar">
          <div className={`rounded-xl border px-4 py-3 flex items-center gap-2 text-xs font-poppins ${isDark ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-green-50 border-green-200 text-green-700"}`}><Check size={14} /> {BRAND.name} Mock mode — no API key needed, instant offline generation.</div>

          {/* Form */}
          <div className={`rounded-2xl border p-4 sm:p-5 space-y-4 ${cardCls}`}>
            <div>
              <label className={`font-poppins font-semibold text-[13px] ${labelCls}`}>Category (Tab) *</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {tabs.map((t) => (
                  <button key={t} onClick={() => setTab(t)} className={`font-bayon text-[12px] tracking-[0.06em] px-4 py-2 rounded-full border transition-all ${tab === t ? "bg-primary text-white border-primary shadow-md" : isDark ? "bg-white/10 text-white border-white/10 hover:bg-white/20" : "bg-white text-dark border-dark/10 hover:border-dark/20"}`}>
                    {t} <span className="opacity-60">({menu[t]?.length || 0})</span>
                  </button>
                ))}
              </div>
              <p className={`font-poppins text-[11px] mt-2 ${isDark ? "text-white/40" : "text-muted"}`}>AI will generate items ONLY for {tab} category.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-[120px_1fr] gap-4">
              <div>
                <label className={`font-poppins font-semibold text-[13px] ${labelCls}`}>Count (1-10) *</label>
                <div className="flex items-center gap-2 mt-1.5">
                  <button onClick={() => setCount((c) => Math.max(1, c - 1))} className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold ${isDark ? "bg-white/10 border-white/10 text-white hover:bg-white hover:text-dark" : "bg-white border-dark/10 hover:border-dark/20"}`}>−</button>
                  <input type="number" min={1} max={10} value={count} onChange={(e) => setCount(Math.min(10, Math.max(1, Number(e.target.value) || 1)))} className={`flex-1 text-center px-2 py-2.5 rounded-xl border text-sm font-poppins font-bold outline-none ${inputCls}`} />
                  <button onClick={() => setCount((c) => Math.min(10, c + 1))} className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold ${isDark ? "bg-white/10 border-white/10 text-white hover:bg-white hover:text-dark" : "bg-white border-dark/10 hover:border-dark/20"}`}>+</button>
                </div>
              </div>
              <div>
                <label className={`font-poppins font-semibold text-[13px] ${labelCls}`}>Prompt / Theme (optional)</label>
                <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} rows={2} placeholder={`e.g. extra cheesy for students, truffle premium, vegan garden, summer cold, Borcelle inferno twist...`} className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none resize-none ${inputCls}`} />
                <p className={`font-poppins text-[11px] mt-1 ${isDark ? "text-white/40" : "text-muted"}`}>English prompt → English menu. Leave empty for classic {BRAND.name} style.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className={`font-poppins font-medium text-xs ${labelCls}`}>Min Price (MMK)</label>
                <input type="number" value={priceMin} onChange={(e) => setPriceMin(e.target.value === "" ? "" : Number(e.target.value))} placeholder="e.g. 15000" className={`mt-1 w-full px-3 py-2.5 rounded-xl border text-sm font-poppins outline-none ${inputCls}`} />
              </div>
              <div>
                <label className={`font-poppins font-medium text-xs ${labelCls}`}>Max Price (MMK)</label>
                <input type="number" value={priceMax} onChange={(e) => setPriceMax(e.target.value === "" ? "" : Number(e.target.value))} placeholder="e.g. 35000" className={`mt-1 w-full px-3 py-2.5 rounded-xl border text-sm font-poppins outline-none ${inputCls}`} />
              </div>
            </div>

            <button onClick={handleGenerate} disabled={generating} className="w-full bg-primary text-white font-poppins font-bold py-3.5 rounded-full flex items-center justify-center gap-2 hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed shadow-md">
              {generating ? <><Loader2 size={18} className="animate-spin" /> Generating Mock...</> : <><Sparkles size={18} /> Generate {count} items for {tab}</>}
            </button>

            {error && <p className={`font-poppins text-sm px-4 py-3 rounded-xl border flex items-center gap-2 ${isDark ? "bg-red-500/15 text-red-400 border-red-500/20" : "bg-red-50 text-red-700 border-red-200"}`}><AlertTriangle size={14} /> {error}</p>}
            {info && !error && <p className={`font-poppins text-sm px-4 py-3 rounded-xl border flex items-center gap-2 ${isDark ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-green-50 text-green-700 border-green-200"}`}><Check size={14} /> {info}</p>}
          </div>

          {/* Preview */}
          {preview.length > 0 && (
            <div className={`rounded-2xl border overflow-hidden ${cardCls}`}>
              <div className={`p-4 border-b flex flex-wrap items-center justify-between gap-3 ${isDark ? "border-white/10" : "border-dark/5"}`}>
                <h4 className={`font-poppins font-bold text-sm flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><Wand2 size={16} className="text-primary" /> Preview — Edit before add</h4>
                <div className="flex gap-2">
                  <button onClick={selectAll} className={`px-3 py-1.5 rounded-full text-xs font-poppins font-semibold border ${isDark ? "bg-white/10 text-white border-white/10 hover:bg-white hover:text-dark" : "bg-white border-dark/10 hover:border-dark/20"}`}>Select all</button>
                  <button onClick={deselectAll} className={`px-3 py-1.5 rounded-full text-xs font-poppins font-semibold border ${isDark ? "bg-transparent text-white/60 border-white/10 hover:text-white" : "bg-background border-dark/10 text-muted hover:text-dark"}`}>Clear</button>
                  <button onClick={handleGenerate} disabled={generating} className="px-3 py-1.5 rounded-full bg-primary text-white text-xs font-poppins font-semibold flex items-center gap-1 hover:bg-primary-hover disabled:opacity-50"><RefreshCw size={12} className={generating ? "animate-spin" : ""} /> Regenerate</button>
                </div>
              </div>

              <div className="divide-y max-h-[360px] overflow-y-auto no-scrollbar">
                {preview.map((it, idx) => (
                  <div key={idx} className={`p-4 flex gap-3 ${selected.has(idx) ? (isDark ? "bg-primary/10" : "bg-primary/5") : ""} ${isDark ? "border-white/5" : "border-dark/5"}`}>
                    <label className="pt-1 cursor-pointer">
                      <input type="checkbox" checked={selected.has(idx)} onChange={() => toggleSelect(idx)} className="w-4 h-4 accent-primary rounded" />
                    </label>
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-background border border-dark/5 shrink-0 flex items-center justify-center">
                      {it.image ? <img src={it.image} alt="" className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=600&fit=crop"; }} /> : <ImageIcon size={20} className="text-muted" />}
                    </div>
                    <div className="flex-1 min-w-0 space-y-2">
                      <input value={it.name} onChange={(e) => updatePreview(idx, { name: e.target.value.toUpperCase() })} placeholder="NAME" className={`w-full px-3 py-2 rounded-xl border text-sm font-poppins font-bold outline-none ${inputCls}`} />
                      <textarea value={it.desc} onChange={(e) => updatePreview(idx, { desc: e.target.value })} rows={2} placeholder="Description" className={`w-full px-3 py-2 rounded-xl border text-xs font-poppins outline-none resize-none ${inputCls}`} />
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className={`font-poppins text-[11px] ${isDark ? "text-white/60" : "text-muted"}`}>Price MMK</label>
                          <input type="number" value={it.price} onChange={(e) => updatePreview(idx, { price: Number(e.target.value) })} className={`mt-1 w-full px-2 py-2 rounded-xl border text-xs font-poppins outline-none ${inputCls}`} />
                        </div>
                        <div>
                          <label className={`font-poppins text-[11px] ${isDark ? "text-white/60" : "text-muted"}`}>Stock</label>
                          <input type="number" value={it.stock} onChange={(e) => updatePreview(idx, { stock: Number(e.target.value) })} className={`mt-1 w-full px-2 py-2 rounded-xl border text-xs font-poppins outline-none ${inputCls}`} />
                        </div>
                        <div className="sm:col-span-1 col-span-1">
                          <label className={`font-poppins text-[11px] ${isDark ? "text-white/60" : "text-muted"}`}>Image URL</label>
                          <input value={it.image} onChange={(e) => updatePreview(idx, { image: e.target.value })} placeholder="https://..." className={`mt-1 w-full px-2 py-2 rounded-xl border text-[11px] font-poppins outline-none truncate ${inputCls}`} />
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeOne(idx)} className={`w-8 h-8 rounded-full border flex items-center justify-center shrink-0 self-start ${isDark ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white" : "bg-white border-red-200 text-red-600 hover:bg-red-50"}`}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>

              <div className={`p-4 border-t flex flex-col sm:flex-row gap-3 ${isDark ? "bg-[#1E1E1E] border-white/10" : "bg-background/50 border-dark/5"}`}>
                <button onClick={onClose} className={`flex-1 border-2 font-poppins font-semibold py-3 rounded-full ${isDark ? "bg-transparent border-white/20 text-white hover:bg-white/10" : "bg-white border-dark/10 hover:border-dark/20"}`}>Cancel</button>
                <button onClick={handleAdd} className="flex-1 bg-primary text-white font-poppins font-bold py-3 rounded-full hover:bg-primary-hover shadow-md flex items-center justify-center gap-2">
                  <Check size={18} /> Add Selected ({selected.size}) to {tab}
                </button>
              </div>
              <p className={`font-poppins text-[11px] text-center pb-3 ${isDark ? "text-white/40" : "text-muted"}`}>{selected.size} selected • will be added to <b>{tab}</b> • auto-creates <b>{TAB_TO_PRODUCT_CATEGORY[tab] || tab}</b> products • duplicates skipped</p>
            </div>
          )}

          {preview.length === 0 && !generating && (
            <div className={`rounded-2xl border border-dashed p-8 text-center ${isDark ? "border-white/10 bg-white/5" : "border-dark/10 bg-background"}`}>
              <Sparkles size={28} className="mx-auto text-primary/60" />
              <p className={`font-poppins font-semibold text-sm mt-3 ${isDark ? "text-white" : "text-dark"}`}>No preview yet</p>
              <p className={`font-poppins text-xs mt-1 ${isDark ? "text-white/60" : "text-muted"}`}>Choose category, count & prompt then Generate. You can edit every field before adding to {tab}.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}