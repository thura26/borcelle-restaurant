import { useMemo, lazy, Suspense, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { StatsCard } from "../../components/admin/StatsCard";
import { useOrders } from "../../context/OrderContext";
import { useReservations } from "../../context/ReservationContext";
import { useProducts } from "../../context/ProductContext";
import { usePromos } from "../../context/PromoContext";
import { useAuth } from "../../context/AuthContext";
import { useSettings } from "../../context/SettingsContext";
import { useAudit } from "../../context/AuditContext";
import { formatMMK } from "../../context/CartContext";
import { ShoppingBag, CalendarDays, Package, Ticket, AlertTriangle, TrendingUp, Clock, Users, BarChart3, Activity, History, Loader2 } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { StatusBadge } from "../../components/admin/OrderStatusUI";
import gsap from "gsap";

const AdminCharts = lazy(() => import("../../components/admin/AdminCharts"));

export function DashboardOverview() {
  const { orders } = useOrders();
  const { reservations } = useReservations();
  const { products, lowStock } = useProducts();
  const { promos } = usePromos();
  const { users } = useAuth();
  const { settings } = useSettings();
  const { logs } = useAudit();

  const stats = useMemo(() => {
    const today = new Date().toDateString();
    const isCanceled = (s: string) => s === "canceled" || s === "cancelled";
    const todayOrders = orders.filter((o) => new Date(o.createdAt).toDateString() === today && !isCanceled(o.status));
    const revenue = orders.filter((o) => !isCanceled(o.status)).reduce((s, o) => s + o.total, 0);
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const pendingRes = reservations.filter((r) => r.status === "pending").length;
    return {
      todayOrders: todayOrders.length,
      todayRevenue: todayOrders.reduce((s, o) => s + o.total, 0),
      totalRevenue: revenue,
      pendingOrders,
      pendingRes,
      totalProducts: products.length,
      activePromos: promos.filter((p) => p.isActive).length,
      totalUsers: users.length,
    };
  }, [orders, reservations, products, promos, users]);

  const recentOrders = orders.slice(0, 5);
  const recentLogs = logs.slice(0, 10);
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(".dash-header", { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out", clearProps: "all" });
      gsap.fromTo(".stat-card", { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, stagger: 0.05, ease: "power2.out", clearProps: "all" });
      gsap.fromTo(".dash-chart", { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "power2.out", clearProps: "all" });
      gsap.fromTo(".dash-bottom", { y: 8, opacity: 0 }, { y: 0, opacity: 1, duration: 0.35, ease: "power2.out", clearProps: "all" });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="space-y-6">
      <div className="dash-header flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className={`font-poppins font-bold text-[22px] flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><BarChart3 size={22} className="text-primary" /> Overview</h2>
          <p className={`font-poppins text-sm mt-1 ${isDark ? "text-white/60" : "text-muted"}`}>Welcome back — here’s what’s happening today.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className={`px-3 py-1.5 rounded-full text-xs font-poppins font-bold border ${settings.isOpen ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
            {settings.isOpen ? "● Store Open" : "● Store Closed"} {settings.openTime}-{settings.closeTime}
          </span>
          {settings.announcement && <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-poppins font-medium truncate max-w-[260px]">{settings.announcement}</span>}
        </div>
      </div>

      {/* Stats grid - laptop: 2 cols on md, 4 cols on xl for breathing room */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div className="stat-card"><StatsCard label="Today Orders" value={stats.todayOrders} sub={`${formatMMK(stats.todayRevenue)} today`} icon={ShoppingBag} color="primary" /></div>
        <div className="stat-card"><StatsCard label="Pending Orders" value={stats.pendingOrders} sub="Needs confirm" icon={Clock} color="amber" badge={stats.pendingOrders > 0 ? "Action needed" : "All clear"} /></div>
        <div className="stat-card"><StatsCard label="Products" value={stats.totalProducts} sub={`${lowStock.length} low stock`} icon={Package} color="dark" /></div>
        <div className="stat-card"><StatsCard label="Active Promos" value={stats.activePromos} sub={`${promos.length} total`} icon={Ticket} color="green" /></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        <div className="stat-card"><StatsCard label="Reservations Pending" value={stats.pendingRes} icon={CalendarDays} color="blue" /></div>
        <div className="stat-card"><StatsCard label="Total Revenue" value={formatMMK(stats.totalRevenue)} icon={TrendingUp} color="primary" /></div>
        <div className="stat-card"><StatsCard label="Users" value={stats.totalUsers} icon={Users} color="dark" /></div>
        <div className="stat-card"><StatsCard label="Delivery Fee" value={formatMMK(settings.deliveryFee)} sub={settings.deliveryTime} icon={Package} color="amber" /></div>
      </div>

      {lowStock.length > 0 && (
        <div className={`rounded-2xl p-4 flex flex-col gap-2 border ${isDark ? "bg-amber-500/10 border-amber-500/20" : "bg-amber-50 border-amber-200"}`}>
          <p className={`font-poppins font-bold flex items-center gap-2 ${isDark ? "text-amber-400" : "text-amber-800"}`}><AlertTriangle size={16} /> Low Stock Alert ({lowStock.length})</p>
          <div className="flex flex-wrap gap-2">
            {lowStock.map((p) => (
              <span key={p.id} className={`px-3 py-1.5 rounded-full border text-xs font-poppins font-semibold ${isDark ? "bg-white/10 border-white/20 text-white" : "bg-white border-amber-200 text-amber-800"}`}>{p.name} — {p.stock} left</span>
            ))}
          </div>
          <Link to="/admin/products" className={`font-poppins text-xs font-semibold hover:underline flex items-center gap-1 ${isDark ? "text-amber-400" : "text-primary"}`}><Package size={14} /> Manage products →</Link>
        </div>
      )}

      {/* Charts - responsive: 1 col mobile, 2 col laptop, 3 col xl */}
      <div className="dash-chart">
        <Suspense fallback={<div className={`rounded-2xl border p-6 text-center font-poppins text-sm flex items-center justify-center gap-2 ${isDark ? "bg-[#1a1a1a] border-white/10 text-white/60" : "bg-white border-dark/5 text-muted"}`}><Loader2 size={16} className="animate-spin" /> Loading charts...</div>}>
          <AdminCharts />
        </Suspense>
      </div>

      <div className="dash-bottom grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5 xl:gap-6">
        {/* Recent orders */}
        <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-dark/5"}`}>
          <div className={`p-4 border-b flex items-center justify-between ${isDark ? "border-white/10" : "border-dark/5"}`}>
            <h3 className={`font-poppins font-bold text-sm flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><ShoppingBag size={16} className="text-primary" /> Recent Orders</h3>
            <Link to="/admin/orders" className="font-poppins font-semibold text-primary text-xs hover:underline flex items-center gap-1"><Activity size={14} /> View all</Link>
          </div>
          <div className={`divide-y ${isDark ? "divide-white/10" : "divide-dark/5"}`}>
            {recentOrders.length === 0 ? <p className={`font-poppins text-sm text-center py-8 ${isDark ? "text-white/60" : "text-muted"}`}>No orders yet</p> : recentOrders.map((o) => (
              <div key={o.id} className={`p-3 sm:p-4 flex items-center justify-between ${isDark ? "hover:bg-white/5" : "hover:bg-background/40"}`}>
                <div className="min-w-0 flex-1">
                  <p className="font-poppins font-bold text-primary text-sm truncate">{o.id}</p>
                  <p className={`font-poppins text-xs truncate ${isDark ? "text-white/60" : "text-muted"}`}>{o.customer.name} • {o.items.length} items • {o.payment}</p>
                </div>
                <div className="text-right shrink-0 ml-3">
                  <p className={`font-poppins font-bold text-sm ${isDark ? "text-white" : "text-dark"}`}>{formatMMK(o.total)}</p>
                  <StatusBadge status={o.status} size="sm" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit log */}
        <div className={`rounded-2xl border shadow-sm overflow-hidden ${isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-dark/5"}`}>
          <div className={`p-4 border-b flex items-center justify-between ${isDark ? "border-white/10" : "border-dark/5"}`}>
            <h3 className={`font-poppins font-bold text-sm flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><History size={16} className="text-primary" /> Recent Activity (Audit)</h3>
            <Link to="/admin/audit" className="font-poppins font-semibold text-primary text-xs hover:underline">View all</Link>
          </div>
          <div className={`divide-y max-h-[320px] overflow-y-auto ${isDark ? "divide-white/10" : "divide-dark/5"}`}>
            {recentLogs.length === 0 ? <p className={`font-poppins text-sm text-center py-8 ${isDark ? "text-white/60" : "text-muted"}`}>No activity yet</p> : recentLogs.map((l) => (
              <div key={l.id} className={`p-3 flex gap-3 ${isDark ? "hover:bg-white/5" : ""}`}>
                <div className="w-8 h-8 rounded-full bg-dark text-white flex items-center justify-center font-poppins font-bold text-xs shrink-0 border border-white/10">{l.by[0]?.toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  <p className={`font-poppins font-semibold text-xs truncate ${isDark ? "text-white" : "text-dark"}`}>{l.action} — {l.target} <span className="text-primary">#{l.targetId}</span></p>
                  <p className={`font-poppins text-[11px] truncate ${isDark ? "text-white/60" : "text-muted"}`}>{l.detail} • by {l.byEmail}</p>
                  <p className={`font-poppins text-[11px] ${isDark ? "text-white/40" : "text-muted"}`}>{new Date(l.at).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}