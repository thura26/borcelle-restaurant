import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react";
import { useToast } from "./ToastContext";
import { useAuth } from "./AuthContext";

export type CartItem = {
  id: string;
  name: string;
  price: number; // MMK
  image: string;
  qty: number;
};

type CartContextType = {
  items: CartItem[];
  count: number;
  total: number;
  addToCart: (item: Omit<CartItem, "qty">) => void;
  removeFromCart: (id: string) => void;
  incQty: (id: string) => void;
  decQty: (id: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const legacy = localStorage.getItem("seoulk_cart");
      const cur = localStorage.getItem("borcelle_cart");
      const saved = cur || legacy;
      if (legacy && !cur) { try { localStorage.setItem("borcelle_cart", legacy); localStorage.removeItem("seoulk_cart"); } catch {} }
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const { show: toastShow } = useToast();
  // Clear cart UI on logout — account cart must not persist for guest (kept improvement even in localStorage mode)
  const prevUserIdRef = useRef<string | null>(null);
  useEffect(() => {
    const curId = user?.id ?? null;
    const prevId = prevUserIdRef.current;
    if (prevId && curId !== prevId) {
      setItems([]);
      try {
        localStorage.removeItem("borcelle_cart");
        localStorage.removeItem("seoulk_cart");
      } catch {}
    }
    prevUserIdRef.current = curId;
  }, [user?.id]);

  // helper to get product stock from localStorage (ProductProvider persists there)
  const getProductStock = (id: string): { stock: number; isAvailable: boolean } | null => {
    try {
      const raw = localStorage.getItem("borcelle_products") || localStorage.getItem("seoulk_products");
      if (raw) {
        const arr = JSON.parse(raw);
        const p = arr.find((x: any) => x.id === id);
        if (p) return { stock: p.stock ?? 0, isAvailable: p.isAvailable ?? true };
      }
      // also check menu stock for menu items (if cart ever holds menu ids)
      const rawMenu = localStorage.getItem("borcelle_menu") || localStorage.getItem("seoulk_menu");
      if (rawMenu) {
        const menu = JSON.parse(rawMenu);
        for (const tab of Object.keys(menu)) {
          const found = (menu[tab] as any[]).find((x: any) => x.id === id);
          if (found) return { stock: found.stock ?? 0, isAvailable: found.isAvailable ?? true };
        }
      }
    } catch {}
    return null;
  };

  useEffect(() => {
    localStorage.setItem("borcelle_cart", JSON.stringify(items));
    try { localStorage.removeItem("seoulk_cart"); } catch {}
  }, [items]);

  const addToCart = (item: Omit<CartItem, "qty">) => {
    const info = getProductStock(item.id);
    const maxStock = info ? info.stock : Infinity;
    const isAvailable = info ? info.isAvailable : true;
    if (!isAvailable || maxStock <= 0) {
      toastShow("Out of Stock", false);
      return;
    }
    setItems((prev) => {
      const existing = prev.find((p) => p.id === item.id);
      const currentQty = existing ? existing.qty : 0;
      if (currentQty + 1 > maxStock) {
        toastShow(`Only ${maxStock} left in stock`, false);
        return prev;
      }
      if (existing) {
        return prev.map((p) => (p.id === item.id ? { ...p, qty: p.qty + 1 } : p));
      }
      return [...prev, { ...item, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => setItems((prev) => prev.filter((p) => p.id !== id));
  const incQty = (id: string) => {
    const info = getProductStock(id);
    const maxStock = info ? info.stock : Infinity;
    let hitLimit = false;
    setItems((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          if (p.qty + 1 > maxStock) {
            hitLimit = true;
            return p;
          }
          return { ...p, qty: p.qty + 1 };
        }
        return p;
      })
    );
    if (hitLimit) toastShow(`Only ${maxStock} left in stock`, false);
  };
  const decQty = (id: string) =>
    setItems((prev) => prev.map((p) => (p.id === id ? { ...p, qty: Math.max(1, p.qty - 1) } : p)));
  const clearCart = () => setItems([]);

  const count = items.reduce((s, i) => s + i.qty, 0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, count, total, addToCart, removeFromCart, incQty, decQty, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

export function formatMMK(price: number) {
  return new Intl.NumberFormat("en-MM").format(price) + " MMK";
}
