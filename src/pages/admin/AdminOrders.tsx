import { useState, useEffect, useRef } from "react";
import { useOrders, type OrderStatus } from "../../context/OrderContext";
import { DataTable } from "../../components/admin/DataTable";
import { useToast } from "../../context/ToastContext";
import { useAudit } from "../../context/AuditContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { exportCSV } from "../../lib/csv";
import { formatMMK } from "../../context/CartContext";
import { Eye, Trash2, Printer, ShoppingBag, Search, Filter } from "lucide-react";
import { StatusBadge, StatusSelect } from "../../components/admin/OrderStatusUI";
import gsap from "gsap";

  const isLoading = false;
export function AdminOrders() {
  const { orders, updateOrderStatus, deleteOrder } = useOrders();
  const { show } = useToast();
  const { addLog } = useAudit();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all");
  const [search, setSearch] = useState("");
  const [viewOrder, setViewOrder] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".order-header", { y: 8 }, { y: 0, duration: 0.4, ease: "power2.out", clearProps: "all" });
      gsap.fromTo(".filter-pills", { y: 6 }, { y: 0, duration: 0.35, ease: "power2.out", clearProps: "all" });
      gsap.fromTo(".order-card", { y: 10 }, { y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out", clearProps: "all" });
    }, containerRef);
    return () => ctx.revert();
  }, [statusFilter, search]);

  const filtered = orders.filter((o) => {
    const matchStatus = statusFilter === "all" ? true : o.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || o.id.toLowerCase().includes(q) || o.customer.name.toLowerCase().includes(q) || o.customer.phone.includes(q);
    return matchStatus && matchSearch;
  });

  const handleStatus = (id: string, status: OrderStatus) => {
    setUpdatingId(id);
    setTimeout(async () => {
      const r = await updateOrderStatus(id, status);
      show(r.msg, r.ok);
      if (r.ok) {
        await addLog("update", "order", id, `Status → ${status}`, user?.name || "admin", user?.email || "");
        // micro animation on success
        gsap.fromTo(`[data-order-id="${id}"]`, { scale: 0.98 }, { scale: 1, duration: 0.3, ease: "back.out(1.5)" });
      }
      setUpdatingId(null);
    }, 450);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const r = await deleteOrder(deleteId);
    show(r.msg, r.ok);
    if (r.ok) await addLog("delete", "order", deleteId, "Deleted order", user?.name || "admin", user?.email || "");
    setDeleteId(null);
  };

  const handleBulkDelete = (ids: string[]) => {
    if (ids.length === 0) return;
    setBulkDeleting(true);
    setTimeout(async () => {
      let count = 0;
      for (const id of ids) {
        const r = await deleteOrder(id);
        if (r.ok) count++;
      }
      await addLog("delete", "order", ids.join(","), `Bulk deleted ${count} orders`, user?.name || "admin", user?.email || "");
      show(`Deleted ${count} orders`, true);
      setSelectedIds(new Set());
      setBulkDeleting(false);
    }, 800);
  };

  const handleExport = () => {
    exportCSV(`orders_${new Date().toISOString().slice(0, 10)}`, filtered.map((o) => ({ id: o.id, customer: o.customer.name, phone: o.customer.phone, items: o.items.length, total: o.total, status: o.status, payment: o.payment, promo: o.promo || "", date: new Date(o.createdAt).toLocaleDateString() })));
    show("CSV exported", true);
  };

  const handlePrint = async (o: any) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.write(`
      <html><head><title>Bill ${o.id}</title>
      <style>body{font-family:Poppins,sans-serif;padding:24px;color:#1A1E1D} h1{color:#C1272E} table{width:100%;border-collapse:collapse;margin:16px 0} th,td{border:1px solid #ddd;padding:8px;text-align:left} th{background:#FFFBF5} .total{font-weight:bold;color:#C1272E;font-size:18px}</style>
      </head><body>
      <h1>BORCELLE — Bill</h1>
      <p><strong>Order:</strong> ${o.id}<br/><strong>Date:</strong> ${new Date(o.createdAt).toLocaleString()}<br/><strong>Customer:</strong> ${o.customer.name} (${o.customer.phone})<br/><strong>Address:</strong> ${o.customer.address}<br/><strong>Payment:</strong> ${o.payment} ${o.promo ? `(Promo ${o.promo})` : ""}</p>
      <table><tr><th>Dish</th><th>Qty</th><th>Price</th><th>Subtotal</th></tr>
      ${o.items.map((it: any) => `<tr><td>${it.name}</td><td>${it.qty}</td><td>${formatMMK(it.price)}</td><td>${formatMMK(it.price * it.qty)}</td></tr>`).join("")}
      </table>
      <p>Subtotal: ${formatMMK(o.subtotal)}<br/>Discount: -${formatMMK(o.discount)}<br/>Delivery: ${formatMMK(o.delivery)}<br/><span class="total">Total: ${formatMMK(o.total)}</span></p>
      <p>Status: ${o.status}</p>
      <script>window.print()</script>
      </body></html>
    `);
    w.document.close();
    await addLog("print", "order", o.id, "Printed bill", user?.name || "admin", user?.email || "");
  };

  return (
    <div ref={containerRef} className="space-y-4">
      <div className="order-header">
        <h2 className={`font-poppins font-bold text-[22px] flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><ShoppingBag size={22} className="text-primary" /> Orders</h2>
        <p className={`font-poppins text-sm flex items-center gap-2 ${isDark ? "text-white/60" : "text-muted"}`}>
          Manage 4 states <span className={`hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] border ${isDark ? "bg-white/10 border-white/10 text-white/70" : "bg-background border-dark/5 text-muted"}`}>pending → confirmed → delivered • canceled</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${isDark ? "bg-white text-dark" : "bg-dark text-white"}`}>{orders.length} total</span>
        </p>
      </div>

      {/* Enhanced filter pills with counts + search */}
      <div className={`filter-pills rounded-2xl border p-3 flex flex-col gap-3 ${isDark ? "bg-[#1E1E1E] border-white/10" : "bg-white border-dark/5"} shadow-sm`}>
        <div className="relative">
          <Search size={16} className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isDark ? "text-white/50" : "text-muted"}`} />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order ID or customer..." className={`w-full pl-9 pr-4 py-2.5 rounded-full border-2 font-poppins text-sm outline-none ${isDark ? "bg-[#101010] border-white/10 text-white placeholder:text-white/40 focus:border-primary/40" : "bg-background border-dark/10 focus:border-primary/30"}`} />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            {[
              { k: "all", label: "All", count: orders.length },
              { k: "pending", label: "Pending", count: orders.filter((o) => o.status === "pending").length },
              { k: "confirmed", label: "Confirmed", count: orders.filter((o) => o.status === "confirmed").length },
              { k: "delivered", label: "Delivered", count: orders.filter((o) => o.status === "delivered").length },
              { k: "canceled", label: "Canceled", count: orders.filter((o) => o.status === "canceled").length },
            ].map((f) => (
              <button
                key={f.k}
                onClick={() => setStatusFilter(f.k as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-poppins font-semibold border inline-flex items-center gap-1.5 capitalize transition-all hover:scale-[1.02] active:scale-[0.98] ${statusFilter === f.k ? (isDark ? "bg-white text-dark border-white shadow" : "bg-dark text-white border-dark shadow") : isDark ? "bg-white/10 text-white border-white/10 hover:bg-white/15" : "bg-background text-dark border-dark/10 hover:border-dark/20"}`}
              >
                {f.label} <span className={`min-w-[18px] h-[18px] px-1 rounded-full text-[10px] flex items-center justify-center ${statusFilter === f.k ? (isDark ? "bg-dark text-white" : "bg-white text-dark") : isDark ? "bg-white/20 text-white" : "bg-dark text-white"}`}>{f.count}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-poppins text-xs px-2 ${isDark ? "text-white/60" : "text-muted"}`}>{filtered.length} items</span>
            <button onClick={handleExport} className={`px-4 py-2 rounded-full border-2 font-poppins font-semibold text-xs flex items-center gap-1.5 ${isDark ? "bg-white text-dark border-white hover:bg-background" : "bg-white border-dark/10 hover:border-dark/20"}`}><Filter size={14} className="w-3.5 h-3.5" /> Export CSV</button>
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading ? (
        <div className={`rounded-2xl border overflow-hidden ${isDark ? "bg-[#1E1E1E] border-white/10" : "bg-white border-dark/5"}`}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className={`p-4 flex gap-4 border-b last:border-0 ${isDark ? "border-white/10" : "border-dark/5"} animate-pulse`}>
              <div className={`w-12 h-12 rounded-xl ${isDark ? "bg-white/10" : "bg-background"}`} />
              <div className="flex-1 space-y-2">
                <div className={`h-4 rounded w-1/4 ${isDark ? "bg-white/10" : "bg-background"}`} />
                <div className={`h-3 rounded w-1/2 ${isDark ? "bg-white/5" : "bg-background/60"}`} />
              </div>
              <div className={`w-20 h-6 rounded-full ${isDark ? "bg-white/10" : "bg-background"}`} />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Desktop table - hidden on mobile */}
          <div className="hidden lg:block relative">
            {bulkDeleting && (
              <div className={`absolute inset-0 z-10 rounded-2xl flex items-center justify-center gap-2 backdrop-blur-sm ${isDark ? "bg-[#0f0f0f]/80" : "bg-white/80"}`}>
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className={`font-poppins font-semibold text-sm ${isDark ? "text-white" : "text-dark"}`}>Deleting...</span>
              </div>
            )}
            <DataTable
              data={filtered}
              hideSearch
              searchKeys={[] as any}
              onExport={undefined}
              selectable
              getRowId={(r: any) => r.id}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onBulkDelete={handleBulkDelete}
              bulkDeleteLabel="Delete selected"
              columns={[
                {
                  key: "id",
                  header: "Order",
                  render: (r: any) => (
                    <div data-order-id={r.id}>
                      <p className="font-poppins font-bold text-primary text-sm flex items-center gap-1.5">{r.id} {r.status === "pending" && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />}</p>
                      <p className={`font-poppins text-xs ${isDark ? "text-white/60" : "text-muted"}`}>{new Date(r.createdAt).toLocaleDateString()} {new Date(r.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                    </div>
                  ),
                },
                {
                  key: "customer",
                  header: "Customer",
                  render: (r: any) => (
                    <div>
                      <p className={`font-poppins font-semibold text-sm ${isDark ? "text-white" : "text-dark"}`}>{r.customer.name}</p>
                      <p className={`font-poppins text-xs ${isDark ? "text-white/60" : "text-muted"}`}>{r.customer.phone}</p>
                      <p className={`font-poppins text-xs truncate max-w-[160px] ${isDark ? "text-white/50" : "text-muted"}`}>{r.customer.address}</p>
                    </div>
                  ),
                },
                { key: "items", header: "Items", render: (r: any) => <span className={`px-2.5 py-1 rounded-full border text-xs font-poppins font-semibold ${isDark ? "bg-white/10 border-white/10 text-white" : "bg-surface border-dark/5 text-dark"}`}>{r.items.length} dishes</span> },
                { key: "total", header: "Total", render: (r: any) => <span className={`font-poppins font-bold ${isDark ? "text-white" : "text-dark"}`}>{formatMMK(r.total)}</span> },
                {
                  key: "status",
                  header: "Status",
                  render: (r: any) => <StatusSelect value={r.status} onChange={(v) => handleStatus(r.id, v)} loading={updatingId === r.id} />,
                },
                { key: "payment", header: "Payment", render: (r: any) => <span className={`px-2 py-1 rounded-full text-[11px] font-poppins font-bold border ${r.payment === "kpay" ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{r.payment}</span> },
                {
                  key: "actions",
                  header: "Actions",
                  render: (r: any) => (
                    <div className="flex gap-1.5">
                      <button onClick={() => setViewOrder(r)} className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? "bg-white/10 border-white/10 text-white hover:bg-white hover:text-dark" : "bg-white border-dark/10 hover:border-primary/30"}`}><Eye size={14} /></button>
                      <button onClick={() => handlePrint(r)} className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? "bg-white/10 border-white/10 text-white hover:bg-white hover:text-dark" : "bg-white border-dark/10 hover:border-primary/30"}`}><Printer size={14} /></button>
                      <button onClick={() => setDeleteId(r.id)} className={`w-8 h-8 rounded-full border flex items-center justify-center ${isDark ? "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500 hover:text-white" : "bg-white border-red-200 text-red-600 hover:bg-red-50"}`}><Trash2 size={14} /></button>
                    </div>
                  ),
                },
              ]}
            />
          </div>

          {/* Mobile cards - visible on mobile */}
          <div className="lg:hidden space-y-3">
            {selectedIds.size > 0 && (
              <div className={`rounded-2xl border p-3 flex items-center justify-between ${isDark ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-200"}`}>
                <span className={`font-poppins font-semibold text-sm ${isDark ? "text-amber-300" : "text-amber-700"}`}>{selectedIds.size} selected</span>
                <div className="flex gap-2">
                  <button onClick={() => setSelectedIds(new Set())} className={`px-3 py-1.5 rounded-full text-xs font-poppins font-semibold border ${isDark ? "bg-white/10 text-white border-white/20" : "bg-white text-dark border-dark/10"}`}>Clear</button>
                  <button onClick={() => handleBulkDelete(Array.from(selectedIds))} className="px-3 py-1.5 rounded-full bg-red-600 text-white text-xs font-poppins font-semibold">Delete ({selectedIds.size})</button>
                </div>
              </div>
            )}
            {filtered.length === 0 ? (
              <div className={`rounded-2xl border p-8 text-center ${isDark ? "bg-[#1E1E1E] border-white/10 text-white/60" : "bg-white border-dark/5 text-muted"}`}>
                <Search size={24} className="mx-auto mb-2 opacity-50" />
                <p className="font-poppins text-sm">No orders found</p>
              </div>
            ) : (
              filtered.map((r: any) => {
                const checked = selectedIds.has(r.id);
                return (
                <div key={r.id} data-order-id={r.id} className={`order-card rounded-2xl border p-4 shadow-sm ${checked ? (isDark ? "bg-primary/10 border-primary/30" : "bg-primary/5 border-primary/20") : isDark ? "bg-[#1E1E1E] border-white/10" : "bg-white border-dark/5"}`}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2">
                      <button onClick={() => { const n = new Set(selectedIds); if (n.has(r.id)) n.delete(r.id); else n.add(r.id); setSelectedIds(n); }} className={`mt-0.5 w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 ${checked ? "bg-primary border-primary text-white" : isDark ? "border-white/20 bg-white/5" : "border-dark/20 bg-white"}`}>
                        {checked && <span className="text-[10px]">✓</span>}
                      </button>
                      <div>
                        <p className="font-poppins font-bold text-primary text-sm">{r.id}</p>
                        <p className={`font-poppins text-xs ${isDark ? "text-white/60" : "text-muted"}`}>{new Date(r.createdAt).toLocaleDateString()} • {r.customer.name}</p>
                      </div>
                    </div>
                    <StatusBadge status={r.status} size="sm" />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className={`font-poppins font-bold ${isDark ? "text-white" : "text-dark"}`}>{formatMMK(r.total)}</span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-poppins font-semibold border ${isDark ? "bg-white/10 border-white/10 text-white" : "bg-surface border-dark/5"}`}>{r.items.length} dishes • {r.payment}</span>
                  </div>
                  <div className="mt-3">
                    <StatusSelect value={r.status} onChange={(v) => handleStatus(r.id, v)} loading={updatingId === r.id} />
                  </div>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => setViewOrder(r)} className={`flex-1 py-2 rounded-full border font-poppins font-semibold text-xs flex items-center justify-center gap-1.5 ${isDark ? "bg-white/10 border-white/10 text-white" : "bg-white border-dark/10"}`}><Eye size={14} /> View</button>
                      <button onClick={() => handlePrint(r)} className={`flex-1 py-2 rounded-full border font-poppins font-semibold text-xs flex items-center justify-center gap-1.5 ${isDark ? "bg-white text-dark border-white" : "bg-dark text-white border-dark"}`}><Printer size={14} /> Print</button>
                      <button onClick={() => setDeleteId(r.id)} className={`w-10 h-10 rounded-full border flex items-center justify-center ${isDark ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-white border-red-200 text-red-600"}`}><Trash2 size={14} /></button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {viewOrder && (
        <div className="fixed inset-0 z-[100] bg-dark/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`rounded-3xl max-w-[560px] w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border ${isDark ? "bg-[#1E1E1E] border-white/10" : "bg-white border-transparent"}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-poppins font-bold text-lg ${isDark ? "text-white" : "text-dark"}`}>{viewOrder.id}</h3>
              <button onClick={() => setViewOrder(null)} className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-white/10 text-white" : "bg-dark/5"}`}>✕</button>
            </div>
            <div className="space-y-3">
              <div className={`rounded-2xl p-4 border ${isDark ? "bg-white/5 border-white/10" : "bg-background border-dark/5"}`}>
                <p className={`font-poppins font-semibold text-sm ${isDark ? "text-white" : "text-dark"}`}>Customer</p>
                <p className={`font-poppins text-sm ${isDark ? "text-white" : "text-dark"}`}>{viewOrder.customer.name} • {viewOrder.customer.phone}</p>
                <p className={`font-poppins text-xs ${isDark ? "text-white/60" : "text-muted"}`}>{viewOrder.customer.address}</p>
                {viewOrder.customer.note && <p className={`font-poppins text-xs italic ${isDark ? "text-white/60" : "text-muted"}`}>Note: {viewOrder.customer.note}</p>}
              </div>
              <div className="space-y-2">
                {viewOrder.items.map((it: any) => (
                  <div key={it.id} className={`flex gap-3 rounded-xl p-2 border ${isDark ? "bg-white/5 border-white/10" : "bg-background/40 border-dark/5"}`}>
                    <img src={it.image} alt={it.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className={`font-poppins font-semibold text-xs ${isDark ? "text-white" : "text-dark"}`}>{it.name}</p>
                      <p className={`font-poppins text-xs ${isDark ? "text-white/60" : "text-muted"}`}>Qty {it.qty} × {formatMMK(it.price)}</p>
                    </div>
                    <p className={`font-poppins font-bold text-xs ${isDark ? "text-white" : "text-dark"}`}>{formatMMK(it.price * it.qty)}</p>
                  </div>
                ))}
              </div>
              <div className={`rounded-xl p-4 border space-y-1 font-poppins text-sm ${isDark ? "bg-white/5 border-white/10" : "bg-background/60 border-dark/5"}`}>
                <div className="flex justify-between"><span className={isDark ? "text-white/60" : "text-muted"}>Subtotal</span><span className={`font-semibold ${isDark ? "text-white" : ""}`}>{formatMMK(viewOrder.subtotal)}</span></div>
                <div className="flex justify-between"><span className={isDark ? "text-white/60" : "text-muted"}>Discount {viewOrder.promo ? `(${viewOrder.promo})` : ""}</span><span className="font-semibold text-green-400">-{formatMMK(viewOrder.discount)}</span></div>
                <div className="flex justify-between"><span className={isDark ? "text-white/60" : "text-muted"}>Delivery</span><span className={`font-semibold ${isDark ? "text-white" : ""}`}>{formatMMK(viewOrder.delivery)}</span></div>
                <div className={`flex justify-between font-bold text-lg border-t pt-2 ${isDark ? "text-white border-white/10" : "text-primary border-dark/10"}`}><span>Total</span><span>{formatMMK(viewOrder.total)}</span></div>
                <p className={`font-poppins text-xs ${isDark ? "text-white/60" : "text-muted"}`}>Payment: {viewOrder.payment} • Status: {viewOrder.status}</p>
              </div>
              {viewOrder.kpayScreenshot && <div><p className={`font-poppins font-semibold text-sm ${isDark ? "text-white" : "text-dark"}`}>KPay Screenshot</p><img src={viewOrder.kpayScreenshot} alt="kpay" className={`w-full max-h-[320px] object-contain rounded-xl border mt-2 ${isDark ? "border-white/10" : "border-dark/10"}`} /></div>}
              <div className="flex gap-3">
                <button onClick={() => handlePrint(viewOrder)} className="flex-1 bg-primary text-white font-poppins font-semibold py-3 rounded-full flex items-center justify-center gap-2"><Printer size={16} /> Print Bill</button>
                <button onClick={() => setViewOrder(null)} className={`flex-1 border-2 font-poppins font-semibold py-3 rounded-full ${isDark ? "bg-transparent border-white/20 text-white hover:bg-white/10" : "bg-white border-dark/10"}`}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 z-[100] bg-dark/50 backdrop-blur-md flex items-center justify-center p-4">
          <div className={`rounded-2xl max-w-[360px] w-full p-6 text-center shadow-2xl border ${isDark ? "bg-[#1E1E1E] border-white/10" : "bg-white border-transparent"}`}>
            <h3 className={`font-poppins font-bold text-lg ${isDark ? "text-white" : "text-dark"}`}>Delete order?</h3>
            <p className={`font-poppins text-sm mt-2 ${isDark ? "text-white/60" : "text-muted"}`}>{deleteId}</p>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setDeleteId(null)} className={`flex-1 border-2 font-poppins font-semibold py-3 rounded-full ${isDark ? "bg-transparent border-white/20 text-white hover:bg-white/10" : "bg-background border-dark/10"}`}>Cancel</button>
              <button onClick={handleDelete} className="flex-1 bg-red-600 text-white font-poppins font-semibold py-3 rounded-full hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}