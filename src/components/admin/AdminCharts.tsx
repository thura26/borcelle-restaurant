import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { useOrders } from "../../context/OrderContext";
import { useTheme } from "../../context/ThemeContext";
import { formatMMK } from "../../context/CartContext";
import { BarChart3, PieChart as PieIcon, TrendingUp } from "lucide-react";

const COLORS = ["#C1272E", "#1A1E1D", "#6B7280", "#FFF0E6", "#FFD8B8", "#22c55e"];

export default function AdminCharts() {
  const { orders } = useOrders();
  const { isDark } = useTheme();
  const tickColor = isDark ? "#a1a1aa" : "#6B7280";

  const last7 = useMemo(() => {
    const days: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      days[key] = 0;
    }
    orders.forEach((o) => {
      if ((o.status as string) === "cancelled" || o.status === "canceled") return;
      const key = new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (key in days) days[key] += o.total;
    });
    return Object.entries(days).map(([name, revenue]) => ({ name, revenue }));
  }, [orders]);

  const byStatus = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => { map[o.status] = (map[o.status] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const topProducts = useMemo(() => {
    const map: Record<string, number> = {};
    orders.forEach((o) => o.items.forEach((it) => { map[it.name] = (map[it.name] || 0) + it.qty; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, qty]) => ({ name: name.slice(0, 14), qty }));
  }, [orders]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
      <div className={`rounded-2xl border p-4 lg:p-5 shadow-sm flex flex-col ${isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-dark/5"}`}>
        <h4 className={`font-poppins font-bold text-sm flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><BarChart3 size={16} className="text-primary" /> Revenue Last 7 Days</h4>
        <p className={`font-poppins text-xs ${isDark ? "text-white/60" : "text-muted"}`}>Canceled excluded</p>
        <div className="h-[200px] lg:h-[220px] mt-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={last7} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: tickColor }} interval={0} angle={-12} dy={8} height={36} />
              <YAxis tick={{ fontSize: 11, fill: tickColor }} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} width={38} />
              <Tooltip formatter={(v: any) => formatMMK(v as number)} contentStyle={{ backgroundColor: isDark ? "#1E1E1E" : "#fff", borderColor: isDark ? "#333" : "#eee", color: isDark ? "#fff" : "#171717", borderRadius: "12px", fontSize: "12px" }} cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)" }} />
              <Bar dataKey="revenue" fill="#C1272E" radius={[8, 8, 0, 0]} barSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className={`rounded-2xl border p-4 lg:p-5 shadow-sm flex flex-col ${isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-dark/5"}`}>
        <h4 className={`font-poppins font-bold text-sm flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><PieIcon size={16} className="text-primary" /> Orders by Status</h4>
        <div className="h-[200px] lg:h-[220px] mt-3">
          {byStatus.length === 0 ? <p className={`font-poppins text-sm text-center py-12 ${isDark ? "text-white/60" : "text-muted"}`}>No data</p> : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={byStatus} cx="50%" cy="48%" innerRadius={42} outerRadius={72} dataKey="value" paddingAngle={2} labelLine={false} label={({ cx, cy, midAngle, outerRadius, name, value }) => {
                  const RAD = Math.PI/180; const r = outerRadius + 14; const x = cx + r*Math.cos(-midAngle*RAD); const y = cy + r*Math.sin(-midAngle*RAD);
                  return <text x={x} y={y} fill={isDark ? "#fff" : "#171717"} textAnchor={x>cx?"start":"end"} dominantBaseline="central" fontSize={11} fontWeight={600}>{`${name}:${value}`}</text>;
                }}>
                  {byStatus.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} stroke={isDark ? "#1a1a1a" : "#fff"} strokeWidth={2} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: isDark ? "#1E1E1E" : "#fff", borderColor: isDark ? "#333" : "#eee", borderRadius: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className={`rounded-2xl border p-4 lg:p-5 shadow-sm flex flex-col md:col-span-2 xl:col-span-1 ${isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-dark/5"}`}>
        <h4 className={`font-poppins font-bold text-sm flex items-center gap-2 ${isDark ? "text-white" : "text-dark"}`}><TrendingUp size={16} className="text-primary" /> Top 5 Products (qty)</h4>
        <div className="h-[200px] lg:h-[220px] mt-3">
          {topProducts.length === 0 ? <p className={`font-poppins text-sm text-center py-12 ${isDark ? "text-white/60" : "text-muted"}`}>No sales</p> : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: 6, right: 12 }}>
                <XAxis type="number" tick={{ fontSize: 11, fill: tickColor }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" width={108} tick={{ fontSize: 11, fill: tickColor, width: 100 }} tickFormatter={(v) => v.length > 14 ? v.slice(0,14)+'…' : v} />
                <Tooltip contentStyle={{ backgroundColor: isDark ? "#1E1E1E" : "#fff", borderColor: isDark ? "#333" : "#eee", borderRadius: "12px" }} cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)" }} />
                <Bar dataKey="qty" fill={isDark ? "#fff" : "#171717"} radius={[0, 8, 8, 0]} barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}