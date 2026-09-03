import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { cuisineCategories as seedCategories } from "../lib/data";

export type Category = {
  id: string;
  name: string;
  slug: string;
  createdAt: number;
};

type CategoryContextType = {
  categories: string[]; // includes "ALL" first
  rawCategories: Category[]; // without ALL
  addCategory: (name: string) => { ok: boolean; msg: string };
  updateCategory: (id: string, name: string) => { ok: boolean; msg: string };
  deleteCategory: (id: string) => { ok: boolean; msg: string };
};

const CategoryContext = createContext<CategoryContextType | null>(null);

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

const OLD_CATEGORIES = ["K-BBQ & BULGOGI", "BIBIMBAP & RICE", "TTEOKBOKKI", "K-FRIED CHICKEN", "SIDES & KIMCHI"] as const;

function loadCategories(): Category[] {
  try {
    const raw = localStorage.getItem("borcelle_categories");
    if (raw) {
      const arr = JSON.parse(raw) as Category[];
      if (Array.isArray(arr) && arr.length > 0) {
        const hasOld = arr.some((c) => (OLD_CATEGORIES as readonly string[]).includes(c.name));
        const hasAllNew = (["SPICY NOODLES", "BIBIMBAP", "K-BBQ", "FRIED", "SOUPS", "DRINKS"] as const).every((n) => arr.some((c) => c.name === n));
        if (!hasOld && hasAllNew) return arr;
        // old or incomplete -> clear and reseed with unified categories
        localStorage.removeItem("borcelle_categories");
      }
    }
  } catch {}
  // seed from cuisineCategories without ALL (now unified with menu tabs)
  const seeded = (seedCategories as readonly string[])
    .filter((c) => c !== "ALL")
    .map((name) => ({
      id: slugify(name) + "-" + Math.random().toString(36).slice(2, 6),
      name,
      slug: slugify(name),
      createdAt: Date.now() - Math.floor(Math.random() * 100000),
    }));
  return seeded;
}

export function CategoryProvider({ children }: { children: ReactNode }) {
  const [rawCategories, setRaw] = useState<Category[]>(() => loadCategories());

  useEffect(() => {
    localStorage.setItem("borcelle_categories", JSON.stringify(rawCategories));
  }, [rawCategories]);

  const categories = ["ALL", ...rawCategories.map((c) => c.name)];

  const addCategory = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, msg: "Category name required" };
    if (trimmed.length < 2) return { ok: false, msg: "Min 2 chars" };
    if (trimmed.length > 24) return { ok: false, msg: "Max 24 chars" };
    if (rawCategories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) return { ok: false, msg: "Category already exists" };
    if (rawCategories.some((c) => c.slug === slugify(trimmed))) return { ok: false, msg: "Slug already exists" };
    const cat: Category = { id: slugify(trimmed) + "-" + Date.now().toString().slice(-4), name: trimmed.toUpperCase(), slug: slugify(trimmed), createdAt: Date.now() };
    setRaw((prev) => [...prev, cat]);
    return { ok: true, msg: "Category added" };
  };

  const updateCategory = (id: string, name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return { ok: false, msg: "Name required" };
    if (trimmed.length < 2) return { ok: false, msg: "Min 2 chars" };
    if (rawCategories.some((c) => c.id !== id && c.name.toLowerCase() === trimmed.toLowerCase())) return { ok: false, msg: "Category already exists" };
    setRaw((prev) => prev.map((c) => (c.id === id ? { ...c, name: trimmed.toUpperCase(), slug: slugify(trimmed) } : c)));
    return { ok: true, msg: "Category updated" };
  };

  const deleteCategory = (id: string) => {
    const cat = rawCategories.find((c) => c.id === id);
    if (!cat) return { ok: false, msg: "Category not found" };
    // prevent delete if products exist — check via localStorage
    try {
      const rawProd = localStorage.getItem("borcelle_products") || localStorage.getItem("seoulk_products");
      if (rawProd) {
        const prods = JSON.parse(rawProd) as any[];
        if (prods.some((p) => p.category === cat.name)) return { ok: false, msg: `Cannot delete — ${prods.filter((p) => p.category === cat.name).length} products use this category` };
      }
    } catch {}
    setRaw((prev) => prev.filter((c) => c.id !== id));
    return { ok: true, msg: "Category deleted" };
  };

  return <CategoryContext.Provider value={{ categories, rawCategories, addCategory, updateCategory, deleteCategory }}>{children}</CategoryContext.Provider>;
}

export function useCategories() {
  const ctx = useContext(CategoryContext);
  if (!ctx) throw new Error("useCategories must be within CategoryProvider");
  return ctx;
}
