import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { CartItem } from "./CartContext";

export type OrderStatus = "pending" | "confirmed" | "delivered" | "canceled";

export type Order = {
  id: string;
  userId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  delivery: number;
  total: number;
  promo: string | null;
  payment: "kpay" | "cod";
  kpayScreenshot?: string | null;
  customer: { name: string; phone: string; address: string; note?: string };
  status: OrderStatus;
  createdAt: number;
};

type OrderContextType = {
  orders: Order[];
  createOrder: (order: Omit<Order, "id" | "createdAt" | "status">) => Order;
  getUserOrders: (userId: string) => Order[];
  allOrders: Order[];
  cancelOrder: (orderId: string, userId: string) => { ok: boolean; msg: string };
  confirmOrder: (orderId: string) => { ok: boolean; msg: string };
  confirmAllPending: () => number;
  updateOrderStatus: (orderId: string, status: OrderStatus) => { ok: boolean; msg: string };
  deleteOrder: (orderId: string) => { ok: boolean; msg: string };
};

const OrderContext = createContext<OrderContextType | null>(null);

function normalizeStatus(s: string): OrderStatus {
  const v = (s || "pending").toLowerCase();
  if (v === "cancelled" || v === "canceled") return "canceled";
  if (v === "preparing" || v === "delivering" || v === "delivered") return "delivered";
  if (v === "confirmed") return "confirmed";
  return "pending";
}
function loadOrders(): Order[] {
  try {
    const legacy = localStorage.getItem("seoulk_orders");
    const cur = localStorage.getItem("borcelle_orders");
    const s = cur || legacy;
    if (legacy && !cur) {
      try { localStorage.setItem("borcelle_orders", legacy); localStorage.removeItem("seoulk_orders"); } catch {}
    }
    const arr: Order[] = s ? JSON.parse(s) : [];
    return arr.map((o: any) => ({ ...o, status: normalizeStatus(o.status) }));
  } catch { return []; }
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>(() => loadOrders());

  useEffect(() => { localStorage.setItem("borcelle_orders", JSON.stringify(orders)); try { localStorage.removeItem("seoulk_orders"); } catch {} }, [orders]);

  // no auto flow for simplified 4-status; manual only (pending -> confirmed -> delivered)

  const createOrder = (data: Omit<Order, "id" | "createdAt" | "status">) => {
    const order: Order = { id: "RZ" + Date.now().toString().slice(-6), createdAt: Date.now(), status: "pending", ...data };
    setOrders((prev) => [order, ...prev]);
    return order;
  };

  const getUserOrders = (userId: string) => orders.filter((o) => o.userId === userId).sort((a, b) => b.createdAt - a.createdAt);

  const cancelOrder = (orderId: string, userId: string) => {
    const o = orders.find((x) => x.id === orderId && x.userId === userId);
    if (!o) return { ok: false, msg: "Order not found" };
    if (o.status !== "pending") return { ok: false, msg: "Admin confirmed — cannot cancel" };
    setOrders((prev) => prev.map((x) => (x.id === orderId ? { ...x, status: "canceled" as OrderStatus } : x)));
    return { ok: true, msg: "Order canceled" };
  };

  const confirmOrder = (orderId: string) => {
    const o = orders.find((x) => x.id === orderId);
    if (!o) return { ok: false, msg: "Order not found" };
    if (o.status !== "pending") return { ok: false, msg: "Only pending can be confirmed" };
    setOrders((prev) => prev.map((x) => (x.id === orderId ? { ...x, status: "confirmed" as OrderStatus } : x)));
    return { ok: true, msg: "Order confirmed" };
  };

  const confirmAllPending = () => {
    let count = 0;
    setOrders((prev) => prev.map((o) => {
      if (o.status === "pending") { count++; return { ...o, status: "confirmed" as OrderStatus }; }
      return o;
    }));
    return count;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus) => {
    const o = orders.find((x) => x.id === orderId);
    if (!o) return { ok: false, msg: "Order not found" };
    if (o.status === "delivered" || o.status === "canceled") return { ok: false, msg: `Cannot change ${o.status} order` };
    // valid forward flow: pending -> confirmed -> delivered, or any -> canceled
    const allowed: Record<OrderStatus, OrderStatus[]> = {
      pending: ["confirmed", "canceled"],
      confirmed: ["delivered", "canceled"],
      delivered: [],
      canceled: [],
    };
    if (status !== "canceled" && !allowed[o.status].includes(status) && o.status !== status) {
      // allow direct pending->delivered? keep strict but allow if admin wants jump
      if (!(o.status === "pending" && status === "delivered")) {
        // still allow but warn; we allow any non-locked to any for flexibility
      }
    }
    setOrders((prev) => prev.map((x) => (x.id === orderId ? { ...x, status } : x)));
    return { ok: true, msg: `Order ${status}` };
  };

  const deleteOrder = (orderId: string) => {
    if (!orders.some((x) => x.id === orderId)) return { ok: false, msg: "Not found" };
    setOrders((prev) => prev.filter((x) => x.id !== orderId));
    return { ok: true, msg: "Order deleted" };
  };

  return (
    <OrderContext.Provider value={{ orders, createOrder, getUserOrders, allOrders: orders, cancelOrder, confirmOrder, confirmAllPending, updateOrderStatus, deleteOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrders() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrders must be within OrderProvider");
  return ctx;
}
