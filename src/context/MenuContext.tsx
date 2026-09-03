import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { menuData, type MenuTab } from "../lib/data";

export type MenuItemEditable = {
  id: string;
  name: string;
  desc: string;
  price: number; // MMK number
  priceText: string; // "32,000 MMK"
  image?: string; // base64
  isAvailable: boolean;
  stock: number;
};

export type MenuDataEditable = Record<MenuTab, MenuItemEditable[]>;

type BulkResult = { ok: boolean; added: number; skipped: number; msg: string };
type MenuContextType = {
  menu: MenuDataEditable;
  tabs: MenuTab[];
  addItem: (tab: MenuTab, item: Omit<MenuItemEditable, "id">) => { ok: boolean; msg: string };
  updateItem: (tab: MenuTab, id: string, patch: Partial<MenuItemEditable>) => { ok: boolean; msg: string };
  deleteItem: (tab: MenuTab, id: string) => { ok: boolean; msg: string };
  toggleAvailable: (tab: MenuTab, id: string) => void;
  bulkAddItems: (tab: MenuTab, items: Array<Omit<MenuItemEditable, "id">>) => BulkResult;
};

const MenuContext = createContext<MenuContextType | null>(null);

function parsePrice(s: string): number {
  return parseInt(s.replace(/[^0-9]/g, ""), 10) || 0;
}
function formatPrice(n: number): string {
  return new Intl.NumberFormat("en-MM").format(n) + " MMK";
}

function load(): MenuDataEditable {
  try {
    const legacy = localStorage.getItem("seoulk_menu");
    const cur = localStorage.getItem("borcelle_menu");
    const raw = cur || legacy;
    if (legacy && !cur) {
      try { localStorage.setItem("borcelle_menu", legacy); } catch {}
    }
    if (raw) {
      const parsed = JSON.parse(raw) as MenuDataEditable;
      // check if old tabs (NIGIRI etc) exist -> reseed with new Korean tabs
      const hasOld = parsed && typeof parsed === "object" && ("NIGIRI" in (parsed as any) || "SASHIMI" in (parsed as any));
      if (parsed && typeof parsed === "object" && !hasOld) {
        // ensure all new tabs exist
        const hasAllNew = (["SPICY NOODLES","BIBIMBAP","K-BBQ","FRIED","SOUPS","DRINKS"] as MenuTab[]).every((t) => t in parsed);
        if (hasAllNew) return parsed;
      }
      // if old or incomplete, clear and reseed
      localStorage.removeItem("borcelle_menu");
      try { localStorage.removeItem("seoulk_menu"); } catch {}
    }
  } catch {}
  // seed
  const seeded: any = {};
  (Object.keys(menuData) as MenuTab[]).forEach((tab) => {
    seeded[tab] = menuData[tab].map((it, idx) => ({
      id: `${tab.toLowerCase().replace(/\s/g, "-")}-${idx}-${Date.now().toString().slice(-3)}`,
      name: it.name,
      desc: it.desc,
      price: parsePrice(it.price),
      priceText: it.price,
      isAvailable: true,
      stock: 30 + Math.floor(Math.random() * 40),
    }));
  });
  return seeded as MenuDataEditable;
}

const tabsList: MenuTab[] = ["SPICY NOODLES", "BIBIMBAP", "K-BBQ", "FRIED", "SOUPS", "DRINKS"];

export function MenuProvider({ children }: { children: ReactNode }) {
  const [menu, setMenu] = useState<MenuDataEditable>(() => load());

  useEffect(() => {
    localStorage.setItem("borcelle_menu", JSON.stringify(menu));
    try { localStorage.removeItem("seoulk_menu"); } catch {}
  }, [menu]);

  const addItem = (tab: MenuTab, item: Omit<MenuItemEditable, "id">) => {
    if (!item.name.trim()) return { ok: false, msg: "Name required" };
    if (menu[tab].some((x) => x.name.toLowerCase() === item.name.toLowerCase())) return { ok: false, msg: "Name exists in this tab" };
    if (item.price < 1000) return { ok: false, msg: "Price >= 1000" };
    if (item.image && item.image.length > 5 * 1024 * 1024) return { ok: false, msg: "Image too large (max 5MB)" };
    const nid = `${tab.toLowerCase().replace(/\s/g, "-")}-${Date.now().toString().slice(-5)}`;
    const entry: MenuItemEditable = { ...item, id: nid, priceText: formatPrice(item.price) };
    setMenu((prev) => ({ ...prev, [tab]: [entry, ...prev[tab]] }));
    return { ok: true, msg: "Menu item added" };
  };

  const updateItem = (tab: MenuTab, id: string, patch: Partial<MenuItemEditable>) => {
    const list = menu[tab];
    if (!list.some((x) => x.id === id)) return { ok: false, msg: "Not found" };
    if (patch.image && patch.image.length > 5 * 1024 * 1024) return { ok: false, msg: "Image too large" };
    if (patch.price !== undefined && patch.price < 1000) return { ok: false, msg: "Price >= 1000" };
    if (patch.name && list.some((x) => x.name.toLowerCase() === patch.name!.toLowerCase() && x.id !== id)) return { ok: false, msg: "Name exists" };
    setMenu((prev) => ({
      ...prev,
      [tab]: prev[tab].map((it) => (it.id === id ? { ...it, ...patch, priceText: patch.price !== undefined ? formatPrice(patch.price) : it.priceText } : it)),
    }));
    return { ok: true, msg: "Menu item updated" };
  };

  const deleteItem = (tab: MenuTab, id: string) => {
    if (!menu[tab].some((x) => x.id === id)) return { ok: false, msg: "Not found" };
    setMenu((prev) => ({ ...prev, [tab]: prev[tab].filter((x) => x.id !== id) }));
    return { ok: true, msg: "Deleted" };
  };

  const toggleAvailable = (tab: MenuTab, id: string) => {
    setMenu((prev) => ({ ...prev, [tab]: prev[tab].map((it) => (it.id === id ? { ...it, isAvailable: !it.isAvailable } : it)) }));
  };

  const bulkAddItems = (tab: MenuTab, items: Array<Omit<MenuItemEditable, "id">>): BulkResult => {
    let added = 0;
    let skipped = 0;
    const newEntries: MenuItemEditable[] = [];
    // use current menu snapshot for dup check
    const existingNames = new Set(menu[tab].map((x) => x.name.toLowerCase()));
    const seenInBatch = new Set<string>();
    for (const it of items) {
      const nameTrim = it.name.trim();
      if (!nameTrim) { skipped++; continue; }
      const low = nameTrim.toLowerCase();
      if (existingNames.has(low) || seenInBatch.has(low)) { skipped++; continue; }
      if (it.price < 1000 || it.price > 500000) { skipped++; continue; }
      if (it.image && it.image.length > 5 * 1024 * 1024) { skipped++; continue; }
      if (it.stock < 0 || it.stock > 999) { skipped++; continue; }
      seenInBatch.add(low);
      const nid = `${tab.toLowerCase().replace(/\s/g, "-")}-${Date.now().toString().slice(-5)}-${Math.random().toString(36).slice(2, 4)}`;
      newEntries.push({ ...it, name: nameTrim, id: nid, priceText: formatPrice(it.price), price: Math.round(it.price), isAvailable: it.isAvailable ?? true, stock: Math.round(it.stock) });
      added++;
    }
    if (added > 0) {
      setMenu((prev) => ({ ...prev, [tab]: [...newEntries, ...prev[tab]] }));
    }
    const msg = added > 0 ? `${added} items added to ${tab}${skipped ? `, ${skipped} skipped` : ""}` : skipped ? `All ${skipped} skipped (duplicates/invalid)` : "No items to add";
    return { ok: added > 0, added, skipped, msg };
  };

  return <MenuContext.Provider value={{ menu, tabs: tabsList, addItem, updateItem, deleteItem, toggleAvailable, bulkAddItems }}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be within MenuProvider");
  return ctx;
}

export function formatMMKFromNumber(n: number) {
  return new Intl.NumberFormat("en-MM").format(n) + " MMK";
}
