import { useState } from "react";
import { useSettings } from "../../context/SettingsContext";
import { useToast } from "../../context/ToastContext";
import { useAudit } from "../../context/AuditContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { Clock, Calendar, Truck, Megaphone, Settings as SettingsIcon, Save, RotateCcw, Store, Sparkles, Check } from "lucide-react";
import { BRAND } from "../../lib/brand";

const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export function AdminSettings() {
  const { settings, updateSettings } = useSettings();
  const { show } = useToast();
  const { addLog } = useAudit();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [form, setForm] = useState(settings);
  const [msg, setMsg] = useState<string | null>(null);

  const handleSave = async () => {
    await updateSettings(form);
    await addLog("update", "settings", "store", `Updated store settings`, user?.name || "admin", user?.email || "");
    show("Settings saved", true);
    setMsg("Saved");
    setTimeout(() => setMsg(null), 2000);
  };

  const toggleDay = (d: string) => {
    setForm((prev) => ({ ...prev, closedDays: prev.closedDays.includes(d) ? prev.closedDays.filter((x) => x !== d) : [...prev.closedDays, d] }));
  };

  const inputCls = isDark ? "bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-primary/50" : "bg-background border-dark/10 text-dark focus:border-primary/40";
  const labelCls = isDark ? "text-white" : "text-dark";
  const cardCls = isDark ? "bg-[#1E1E1E] border-white/10" : "bg-white border-dark/5";
return (
    <div className="space-y-6 max-w-[720px]">
      <div>
        <h2 className={`font-poppins font-bold text-[20px] flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><SettingsIcon size={20} className="text-primary" /> Store Settings</h2>
        <p className={`font-poppins text-sm flex items-center gap-1.5 ${isDark ? "text-white/60" : "text-muted"}`}><Store size={14} /> Control opening hours, open/close, announcement • Frontend checks this</p>
      </div>

      <div className={`rounded-2xl border p-6 shadow-sm space-y-6 ${cardCls}`}>
        <div className="flex items-center justify-between">
          <div>
            <p className={`font-poppins font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><Store size={16} className="text-primary" /> Store Open / Close</p>
            <p className={`font-poppins text-xs ${isDark ? "text-white/60" : "text-muted"}`}>Force close overrides hours</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" checked={form.isOpen} onChange={(e) => setForm({ ...form, isOpen: e.target.checked })} className="sr-only peer" />
            <div className="w-14 h-8 bg-dark/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`font-poppins font-medium text-[13px] flex items-center gap-1.5 ${labelCls}`}><Clock size={14} className="text-primary" /> Open Time</label>
            <input type="time" value={form.openTime} onChange={(e) => setForm({ ...form, openTime: e.target.value })} className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls}`} />
          </div>
          <div>
            <label className={`font-poppins font-medium text-[13px] flex items-center gap-1.5 ${labelCls}`}><Clock size={14} className="text-primary" /> Close Time</label>
            <input type="time" value={form.closeTime} onChange={(e) => setForm({ ...form, closeTime: e.target.value })} className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls}`} />
          </div>
        </div>

        <div>
          <label className={`font-poppins font-medium text-[13px] flex items-center gap-1.5 ${labelCls}`}><Calendar size={14} className="text-primary" /> Closed Days (weekly)</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {days.map((d) => (
              <button key={d} onClick={() => toggleDay(d)} className={`px-4 py-2 rounded-full text-xs font-poppins font-semibold border transition-colors ${form.closedDays.includes(d) ? (isDark ? "bg-white text-dark border-white" : "bg-dark text-white border-dark") : isDark ? "bg-white/10 text-white border-white/10 hover:bg-white/20" : "bg-white text-dark border-dark/10 hover:border-dark/20"}`}>{d}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={`font-poppins font-medium text-[13px] flex items-center gap-1.5 ${labelCls}`}><Truck size={14} className="text-primary" /> Delivery Fee (MMK)</label>
            <input type="number" value={form.deliveryFee} onChange={(e) => setForm({ ...form, deliveryFee: Number(e.target.value) })} className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls}`} />
          </div>
          <div>
            <label className={`font-poppins font-medium text-[13px] flex items-center gap-1.5 ${labelCls}`}><Clock size={14} className="text-primary" /> Delivery Time Text</label>
            <input value={form.deliveryTime} onChange={(e) => setForm({ ...form, deliveryTime: e.target.value })} placeholder="30-45 min" className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls}`} />
          </div>
        </div>

        <div>
          <label className={`font-poppins font-medium text-[13px] flex items-center gap-1.5 ${labelCls}`}><Megaphone size={14} className="text-primary" /> Announcement Banner (frontend)</label>
          <input value={form.announcement} onChange={(e) => setForm({ ...form, announcement: e.target.value })} placeholder="e.g., Closed for holiday on 2026-09-03" className={`mt-1.5 w-full px-4 py-3 rounded-xl border text-sm font-poppins outline-none ${inputCls}`} />
          <p className={`font-poppins text-xs mt-1 ${isDark ? "text-white/60" : "text-muted"}`}>Shown on website if not empty</p>
        </div>

        {msg && <p className={`font-poppins text-sm border rounded-xl px-4 py-2.5 ${isDark ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" : "bg-green-50 text-green-700 border-green-200"}`}>{msg}</p>}

        <div className="flex gap-3">
          <button onClick={handleSave} className="bg-primary text-white font-poppins font-semibold px-8 py-3 rounded-full hover:bg-primary-hover shadow-md flex items-center gap-2"><Save size={16} /> Save Settings</button>
          <button onClick={() => setForm(settings)} className={`border-2 font-poppins font-semibold px-8 py-3 rounded-full flex items-center gap-2 ${isDark ? "bg-transparent border-white/20 text-white hover:bg-white/10" : "bg-white border-dark/10 hover:border-dark/20"}`}><RotateCcw size={16} /> Reset</button>
        </div>

        <div className={`rounded-xl p-4 border ${isDark ? "bg-white/5 border-white/10" : "bg-background border-dark/5"}`}>
          <p className={`font-poppins font-semibold text-sm flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><Store size={14} className="text-primary" /> Current Preview</p>
          <p className={`font-poppins text-xs mt-1 ${isDark ? "text-white/70" : "text-muted"}`}>Status: {form.isOpen ? "Open" : "Closed"} • Hours {form.openTime} - {form.closeTime} • Closed on: {form.closedDays.length ? form.closedDays.join(", ") : "None"} • Fee {form.deliveryFee} MMK</p>
        </div>
      </div>

      {/* Borcelle AI — Mock info */}
      <div className={`rounded-2xl border p-6 shadow-sm space-y-3 ${cardCls}`}>
        <div>
          <h3 className={`font-poppins font-bold text-[16px] flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><Sparkles size={18} className="text-primary" /> Borcelle AI — Mock Mode</h3>
          <p className={`font-poppins text-xs mt-1 ${isDark ? "text-white/60" : "text-muted"}`}>Menu AI Generate is offline mock — no API key needed. Generates Borcelle-style items with name / desc / price / image instantly.</p>
        </div>
        <div className={`rounded-xl border px-4 py-3 flex items-center gap-2 text-xs font-poppins ${isDark ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" : "bg-green-50 border-green-200 text-green-700"}`}><Check size={14} /> Mock ready — go to <b>Admin → Menu → AI Generate</b> to test. Choose tab + count 1-10 + prompt.</div>
        <p className={`font-poppins text-[11px] ${isDark ? "text-white/40" : "text-muted"}`}>Brand: {BRAND.name} • Templates cover all 6 tabs • Price auto-clamps 1000–500000 MMK • Image from Unsplash</p>
      </div>
    </div>
  );
}