import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type PromoType = "percent" | "fixed" | "freeship";

export type Promo = {
  id: string;
  code: string; // uppercase
  label: string;
  desc: string;
  type: PromoType;
  value: number; // percent 10 or fixed 5000
  maxDiscount?: number;
  minOrder?: number;
  usageLimit?: number;
  usedCount: number;
  expiresAt?: string; // ISO date
  isActive: boolean;
  createdAt: number;
};

type PromoContextType = {
  promos: Promo[];
  addPromo: (p: Omit<Promo, "id" | "createdAt" | "usedCount">) => { ok: boolean; msg: string };
  updatePromo: (id: string, patch: Partial<Promo>) => { ok: boolean; msg: string };
  deletePromo: (id: string) => { ok: boolean; msg: string };
  toggleActive: (id: string) => void;
  validatePromo: (code: string, subtotal: number) => { ok: boolean; discount: number; promo?: Promo; msg?: string };
  incrementUsage: (code: string) => void;
};

const PromoContext = createContext<PromoContextType | null>(null);

function seed(): Promo[] {
  const now = Date.now();
  return [
    { id: "P1", code: "ZEN10", label: "10% OFF", desc: "10% off up to 8,000 MMK", type: "percent", value: 10, maxDiscount: 8000, usedCount: 0, isActive: true, createdAt: now },
    { id: "P2", code: "ZEN20", label: "20% OFF", desc: "20% off max 15,000 MMK (min 40,000)", type: "percent", value: 20, maxDiscount: 15000, minOrder: 40000, usedCount: 0, isActive: true, createdAt: now },
    { id: "P3", code: "WELCOME5K", label: "5,000 MMK OFF", desc: "5,000 MMK off min 30,000", type: "fixed", value: 5000, minOrder: 30000, usedCount: 0, isActive: true, createdAt: now },
    { id: "P4", code: "SEOUL15", label: "15% OFF", desc: "15% off no cap", type: "percent", value: 15, usedCount: 0, isActive: true, createdAt: now },
    { id: "P5", code: "FREESHIP", label: "Free Delivery", desc: "Delivery fee waived", type: "freeship", value: 3000, usedCount: 0, isActive: true, createdAt: now },
  ];
}

function load(): Promo[] {
  try {
    const legacy = localStorage.getItem("seoulk_promos");
    const cur = localStorage.getItem("borcelle_promos");
    const s = cur || legacy;
    if (legacy && !cur) { try { localStorage.setItem("borcelle_promos", legacy); localStorage.removeItem("seoulk_promos"); } catch {} }
    if (s) {
      const arr = JSON.parse(s) as Promo[];
      if (Array.isArray(arr) && arr.length > 0) return arr;
    }
  } catch {}
  return seed();
}

export function PromoProvider({ children }: { children: ReactNode }) {
  const [promos, setPromos] = useState<Promo[]>(() => load());

  useEffect(() => {
    localStorage.setItem("borcelle_promos", JSON.stringify(promos));
    try { localStorage.removeItem("seoulk_promos"); } catch {}
  }, [promos]);

  const addPromo = (p: Omit<Promo, "id" | "createdAt" | "usedCount">) => {
    const code = p.code.trim().toUpperCase();
    if (!code) return { ok: false, msg: "Code required" };
    if (!/^[A-Z0-9]{3,12}$/.test(code)) return { ok: false, msg: "Code 3-12 alphanumeric uppercase" };
    if (promos.some((x) => x.code === code)) return { ok: false, msg: "Code already exists" };
    if (p.type === "percent" && (p.value <= 0 || p.value > 100)) return { ok: false, msg: "Percent 1-100" };
    if (p.type === "fixed" && p.value < 1000) return { ok: false, msg: "Fixed >=1000" };
    const np: Promo = { ...p, code, id: "P" + Date.now(), createdAt: Date.now(), usedCount: 0 };
    setPromos((prev) => [np, ...prev]);
    return { ok: true, msg: "Promo added" };
  };

  const updatePromo = (id: string, patch: Partial<Promo>) => {
    const idx = promos.findIndex((x) => x.id === id);
    if (idx === -1) return { ok: false, msg: "Not found" };
    if (patch.code) {
      const c = patch.code.trim().toUpperCase();
      if (!/^[A-Z0-9]{3,12}$/.test(c)) return { ok: false, msg: "Invalid code format" };
      if (promos.some((x) => x.code === c && x.id !== id)) return { ok: false, msg: "Code exists" };
      patch.code = c;
    }
    setPromos((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    return { ok: true, msg: "Promo updated" };
  };

  const deletePromo = (id: string) => {
    if (!promos.some((x) => x.id === id)) return { ok: false, msg: "Not found" };
    setPromos((prev) => prev.filter((x) => x.id !== id));
    return { ok: true, msg: "Promo deleted" };
  };

  const toggleActive = (id: string) => {
    setPromos((prev) => prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)));
  };

  const validatePromo = (code: string, subtotal: number) => {
    const c = code.trim().toUpperCase();
    const promo = promos.find((x) => x.code === c);
    if (!promo) return { ok: false, discount: 0, msg: "Invalid promo code" };
    if (!promo.isActive) return { ok: false, discount: 0, msg: "Promo is inactive" };
    if (promo.expiresAt && new Date(promo.expiresAt).getTime() < Date.now()) return { ok: false, discount: 0, msg: "Promo expired" };
    if (promo.usageLimit && promo.usedCount >= promo.usageLimit) return { ok: false, discount: 0, msg: "Usage limit reached" };
    if (promo.minOrder && subtotal < promo.minOrder) return { ok: false, discount: 0, msg: `Min order ${promo.minOrder} MMK` };
    let discount = 0;
    if (promo.type === "percent") {
      discount = Math.round((subtotal * promo.value) / 100);
      if (promo.maxDiscount) discount = Math.min(discount, promo.maxDiscount);
    } else if (promo.type === "fixed") {
      discount = promo.value;
    } else if (promo.type === "freeship") {
      discount = 3000; // delivery fee
    }
    if (discount === 0) return { ok: false, discount: 0, msg: "No discount for this order" };
    return { ok: true, discount, promo };
  };

  const incrementUsage = (code: string) => {
    const c = code.trim().toUpperCase();
    setPromos((prev) => prev.map((p) => (p.code === c ? { ...p, usedCount: p.usedCount + 1 } : p)));
  };

  return <PromoContext.Provider value={{ promos, addPromo, updatePromo, deletePromo, toggleActive, validatePromo, incrementUsage }}>{children}</PromoContext.Provider>;
}

export function usePromos() {
  const ctx = useContext(PromoContext);
  if (!ctx) throw new Error("usePromos must be within PromoProvider");
  return ctx;
}
