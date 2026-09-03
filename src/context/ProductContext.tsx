import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { cuisineItems } from "../lib/data";

export type Product = {
  id: string;
  name: string;
  price: number; // discount / selling price
  originalPrice: number; // normal price (strikethrough)
  category: string;
  image: string;
  description: string;
  isAvailable: boolean;
  stock: number;
  createdAt: number;
};

type ProductContextType = {
  products: Product[];
  addProduct: (p: Omit<Product, "id" | "createdAt">) => { ok: boolean; msg: string };
  updateProduct: (id: string, patch: Partial<Product>) => { ok: boolean; msg: string };
  deleteProduct: (id: string) => { ok: boolean; msg: string };
  toggleAvailable: (id: string) => void;
  lowStock: Product[];
};

const ProductContext = createContext<ProductContextType | null>(null);

const CATEGORY_MIGRATE: Record<string, string> = {
  "K-BBQ & BULGOGI": "K-BBQ",
  "BIBIMBAP & RICE": "BIBIMBAP",
  "TTEOKBOKKI": "FRIED",
  "K-FRIED CHICKEN": "FRIED",
  "SIDES & KIMCHI": "FRIED",
};

function loadProducts(): Product[] {
  try {
    const legacy = localStorage.getItem("seoulk_products");
    const cur = localStorage.getItem("borcelle_products");
    const s = cur || legacy;
    if (legacy && !cur) {
      try { localStorage.setItem("borcelle_products", legacy); } catch {}
    }
    if (s) {
      const arr = JSON.parse(s) as Product[];
      if (Array.isArray(arr) && arr.length > 0) {
        let migrated = false;
        const mapped = arr.map((p: any) => {
          const origCat = p.category as string;
          const newCat = (CATEGORY_MIGRATE as any)[origCat] || origCat;
          if (newCat !== origCat) migrated = true;
          return {
            ...p,
            category: newCat,
            price: p.price ?? p.discountPrice ?? 0,
            originalPrice: p.originalPrice ?? (p.price ? Math.round(p.price * 1.15) : p.price),
          };
        });
        if (migrated) {
          try { localStorage.setItem("borcelle_products", JSON.stringify(mapped)); localStorage.removeItem("seoulk_products"); } catch {}
        }
        return mapped;
      }
    }
  } catch {}
  // seed from cuisineItems
  return cuisineItems.map((c) => ({
    id: c.id,
    name: c.name,
    price: c.price,
    originalPrice: Math.round(c.price * 1.15),
    category: c.category,
    image: c.image,
    description: "Authentic Korean recipe with seasonal ingredients",
    isAvailable: true,
    stock: 50,
    createdAt: Date.now() - Math.floor(Math.random() * 1000000),
  }));
}

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => loadProducts());

  useEffect(() => {
    localStorage.setItem("borcelle_products", JSON.stringify(products));
    try { localStorage.removeItem("seoulk_products"); } catch {}
  }, [products]);

  const addProduct = (p: Omit<Product, "id" | "createdAt">) => {
    if (!p.name.trim()) return { ok: false, msg: "Name required" };
    if (products.some((x) => x.name.toLowerCase() === p.name.toLowerCase())) return { ok: false, msg: "Product name already exists" };
    if (p.price < 1000) return { ok: false, msg: "Discount price must be >= 1000 MMK" };
    if (p.originalPrice < 1000) return { ok: false, msg: "Normal price must be >= 1000 MMK" };
    if (p.price > p.originalPrice) return { ok: false, msg: "Discount price must be ≤ Normal price" };
    if (p.image && p.image.length > 5 * 1024 * 1024) return { ok: false, msg: "Image too large (max 5MB base64)" };
    const np: Product = { ...p, id: p.name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now().toString().slice(-4), createdAt: Date.now() };
    // ensure unique id
    if (products.some((x) => x.id === np.id)) np.id += "-" + Math.random().toString().slice(2, 4);
    setProducts((prev) => [np, ...prev]);
    return { ok: true, msg: "Product added" };
  };

  const updateProduct = (id: string, patch: Partial<Product>) => {
    const idx = products.findIndex((x) => x.id === id);
    if (idx === -1) return { ok: false, msg: "Product not found" };
    if (patch.image && patch.image.length > 5 * 1024 * 1024) return { ok: false, msg: "Image too large (max 5MB)" };
    if (patch.price !== undefined && patch.price < 1000) return { ok: false, msg: "Discount price must be >= 1000" };
    if (patch.originalPrice !== undefined && patch.originalPrice < 1000) return { ok: false, msg: "Normal price must be >= 1000" };
    if (patch.name && products.some((x) => x.name.toLowerCase() === patch.name!.toLowerCase() && x.id !== id)) return { ok: false, msg: "Name already exists" };
    if (patch.stock !== undefined && (patch.stock < 0 || patch.stock > 999)) return { ok: false, msg: "Stock 0-999" };
    // validate price relation with existing
    const cur = products[idx];
    const newPrice = patch.price ?? cur.price;
    const newOriginal = patch.originalPrice ?? cur.originalPrice ?? cur.price;
    if (newPrice > newOriginal) return { ok: false, msg: "Discount must be ≤ Normal price" };
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
    return { ok: true, msg: "Product updated" };
  };

  const deleteProduct = (id: string) => {
    if (!products.some((x) => x.id === id)) return { ok: false, msg: "Not found" };
    setProducts((prev) => prev.filter((x) => x.id !== id));
    return { ok: true, msg: "Product deleted" };
  };

  const toggleAvailable = (id: string) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, isAvailable: !p.isAvailable } : p)));
  };

  const lowStock = products.filter((p) => p.stock < 5);

  return <ProductContext.Provider value={{ products, addProduct, updateProduct, deleteProduct, toggleAvailable, lowStock }}>{children}</ProductContext.Provider>;
}

export function useProducts() {
  const ctx = useContext(ProductContext);
  if (!ctx) throw new Error("useProducts must be within ProductProvider");
  return ctx;
}
