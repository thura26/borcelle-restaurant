import { useState, useRef, useEffect } from "react";
import { Clock, CheckCircle, Truck, XCircle, ChevronDown, Loader2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import type { OrderStatus } from "../../context/OrderContext";
import gsap from "gsap";

export const statusMeta: Record<OrderStatus, { label: string; icon: any; light: string; dark: string; dot: string }> = {
  pending: {
    label: "Pending",
    icon: Clock,
    light: "bg-amber-100 text-amber-700 border-amber-200",
    dark: "bg-amber-500/15 text-amber-300 border-amber-500/25",
    dot: "bg-amber-500",
  },
  confirmed: {
    label: "Confirmed",
    icon: CheckCircle,
    light: "bg-sky-100 text-sky-700 border-sky-200",
    dark: "bg-sky-500/15 text-sky-300 border-sky-500/25",
    dot: "bg-sky-500",
  },
  delivered: {
    label: "Delivered",
    icon: Truck,
    light: "bg-emerald-100 text-emerald-700 border-emerald-200",
    dark: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25",
    dot: "bg-emerald-500",
  },
  canceled: {
    label: "Canceled",
    icon: XCircle,
    light: "bg-red-100 text-red-700 border-red-200",
    dark: "bg-red-500/15 text-red-400 border-red-500/25",
    dot: "bg-red-500",
  },
};

// For backward compat, map cancelled -> canceled
function normalize(s: string): OrderStatus {
  if (s === "cancelled") return "canceled";
  return s as OrderStatus;
}

export function StatusBadge({ status, size = "sm", withDot = true }: { status: string; size?: "sm" | "md"; withDot?: boolean }) {
  const { isDark } = useTheme();
  const s = normalize(status);
  const meta = statusMeta[s] || statusMeta.pending;
  const Icon = meta.icon;
  const cls = isDark ? meta.dark : meta.light;
  const sizeCls = size === "sm" ? "text-[11px] px-2.5 py-1" : "text-xs px-3 py-1.5";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-poppins font-bold border ${cls} ${sizeCls}`}>
      {withDot && <span className={`w-1.5 h-1.5 rounded-full ${meta.dot} ${s === "pending" ? "animate-pulse" : ""}`} />}
      <Icon size={13} className="w-3 h-3" />
      {meta.label}
    </span>
  );
}

export function StatusSelect({
  value,
  onChange,
  loading,
}: {
  value: string;
  onChange: (v: OrderStatus) => void;
  loading?: boolean;
}) {
  const { isDark } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const s = normalize(value);
  const meta = statusMeta[s] || statusMeta.pending;
  const Icon = meta.icon;

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  useEffect(() => {
    if (!menuRef.current) return;
    if (open) {
      gsap.fromTo(menuRef.current, { opacity: 0, y: 6, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 0.18, ease: "power2.out" });
    }
  }, [open]);

  const options: OrderStatus[] = ["pending", "confirmed", "delivered", "canceled"];

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={loading}
        className={`inline-flex items-center gap-1.5 rounded-full font-poppins font-bold border text-[11px] px-3 py-1.5 pr-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${isDark ? meta.dark : meta.light} ${loading ? "opacity-60 cursor-wait" : "cursor-pointer"}`}
      >
        {loading ? <Loader2 size={13} className="w-3 h-3 animate-spin" /> : <Icon size={13} className="w-3 h-3" />}
        {meta.label}
        <ChevronDown size={12} className={`w-3 h-3 ml-0.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          ref={menuRef}
          className={`absolute z-20 top-full mt-2 left-0 min-w-[180px] rounded-2xl border shadow-xl overflow-hidden origin-top-left ${isDark ? "bg-[#1E1E1E] border-white/10" : "bg-white border-dark/10"}`}
        >
          <div className={`px-3 py-2 border-b ${isDark ? "border-white/10 bg-white/5" : "border-dark/5 bg-background/60"}`}>
            <p className={`font-poppins font-bold text-[11px] ${isDark ? "text-white/70" : "text-muted"}`}>Change status</p>
          </div>
          {options.map((opt) => {
            const m = statusMeta[opt];
            const I = m.icon;
            const isActive = s === opt;
            return (
              <button
                key={opt}
                onClick={() => {
                  setOpen(false);
                  if (opt !== s) onChange(opt);
                }}
                className={`w-full text-left px-3 py-2.5 flex items-center gap-2.5 font-poppins text-xs transition-colors ${isActive ? (isDark ? "bg-white text-dark" : "bg-dark text-white") : isDark ? "text-white hover:bg-white/10" : "text-dark hover:bg-background"}`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center ${isActive ? (isDark ? "bg-dark text-white" : "bg-white text-dark") : m.light} ${isDark && !isActive ? m.dark : ""} border`}>
                  <I size={12} />
                </span>
                <span className="font-semibold">{m.label}</span>
                {isActive && <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded-full ${isDark ? "bg-dark text-white" : "bg-white text-dark"}`}>Active</span>}
              </button>
            );
          })}
          <div className={`px-3 py-2 ${isDark ? "bg-white/5 text-white/50" : "bg-background/40 text-muted"} font-poppins text-[10px]`}>
            pending → confirmed → delivered
          </div>
        </div>
      )}
    </div>
  );
}

export function StatusStepper({ status }: { status: string }) {
  const s = normalize(status);
  const { isDark } = useTheme();
  const steps: OrderStatus[] = ["pending", "confirmed", "delivered"];
  const idx = steps.indexOf(s === "canceled" ? "pending" : s); // canceled shows as pending with red
  const isCanceled = s === "canceled";
  return (
    <div className="flex items-center gap-1">
      {steps.map((step, i) => {
        const m = statusMeta[step];
        const isDone = !isCanceled && i <= idx;
        const isCurrent = !isCanceled && i === idx;
        return (
          <div key={step} className="flex items-center gap-1">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center border text-[10px] font-bold transition-all ${isDone ? `${m.light} ${isDark ? m.dark : ""} border-current` : isDark ? "bg-white/10 border-white/10 text-white/40" : "bg-white border-dark/10 text-muted"} ${isCurrent ? "scale-110 shadow-sm ring-2 ring-primary/20" : ""}`}>
              {isDone ? "✓" : i + 1}
            </div>
            {i < steps.length - 1 && <div className={`w-4 h-0.5 ${!isCanceled && i < idx ? "bg-emerald-500" : isDark ? "bg-white/10" : "bg-dark/10"}`} />}
          </div>
        );
      })}
      {isCanceled && <StatusBadge status="canceled" size="sm" />}
    </div>
  );
}