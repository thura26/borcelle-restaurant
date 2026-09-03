import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type StoreSettings = {
  isOpen: boolean;
  openTime: string; // "09:00"
  closeTime: string; // "21:00"
  closedDays: string[]; // ["Sunday"]
  announcement: string;
  deliveryFee: number;
  deliveryTime: string; // "30-45 min"
  kpayQr?: string;
  updatedAt: number;
};

const defaults: StoreSettings = {
  isOpen: true,
  openTime: "09:00",
  closeTime: "21:00",
  closedDays: [],
  announcement: "",
  deliveryFee: 3000,
  deliveryTime: "30-45 min",
  updatedAt: Date.now(),
};

type SettingsContextType = {
  settings: StoreSettings;
  updateSettings: (patch: Partial<StoreSettings>) => void;
  isStoreOpenNow: () => { open: boolean; reason?: string };
};

const SettingsContext = createContext<SettingsContextType | null>(null);

function load(): StoreSettings {
  try {
    const legacy = localStorage.getItem("seoulk_settings");
    const s = localStorage.getItem("borcelle_settings") || legacy;
    if (legacy && !localStorage.getItem("borcelle_settings")) {
      try { localStorage.setItem("borcelle_settings", legacy); localStorage.removeItem("seoulk_settings"); } catch {}
    }
    if (!s) return defaults;
    const p = JSON.parse(s);
    return { ...defaults, ...p };
  } catch {
    return defaults;
  }
}

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<StoreSettings>(() => load());

  useEffect(() => {
    localStorage.setItem("borcelle_settings", JSON.stringify(settings));
    try { localStorage.removeItem("seoulk_settings"); } catch {}
  }, [settings]);

  const updateSettings = (patch: Partial<StoreSettings>) => {
    setSettings((prev) => ({ ...prev, ...patch, updatedAt: Date.now() }));
  };

  const isStoreOpenNow = () => {
    if (!settings.isOpen) return { open: false, reason: "Admin has closed the store" };
    const now = new Date();
    const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
    if (settings.closedDays.includes(dayName)) return { open: false, reason: `Closed on ${dayName}` };
    const [oh, om] = settings.openTime.split(":").map(Number);
    const [ch, cm] = settings.closeTime.split(":").map(Number);
    const mins = now.getHours() * 60 + now.getMinutes();
    const openMins = oh * 60 + om;
    const closeMins = ch * 60 + cm;
    if (mins < openMins || mins > closeMins) return { open: false, reason: `Open ${settings.openTime} - ${settings.closeTime} only` };
    return { open: true };
  };

  return <SettingsContext.Provider value={{ settings, updateSettings, isStoreOpenNow }}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be within SettingsProvider");
  return ctx;
}
