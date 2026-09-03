import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useOrders } from "../../context/OrderContext";
import { useReservations } from "../../context/ReservationContext";
import { useProducts } from "../../context/ProductContext";
import { useTheme } from "../../context/ThemeContext";
import { Logo } from "../../components/Logo";
import gsap from "gsap";
import {
  LayoutDashboard,
  Package,
  Utensils,
  Ticket,
  ShoppingBag,
  CalendarDays,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  FileText,
  Sun,
  Moon,
  User,
  Shield,
  Loader2,
  Tags,
} from "lucide-react";

const nav = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/admin/products", label: "Products", icon: Package },
  { to: "/admin/categories", label: "Categories", icon: Tags },
  { to: "/admin/menu", label: "Menu", icon: Utensils },
  { to: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { to: "/admin/reservations", label: "Reservations", icon: CalendarDays },
  { to: "/admin/promos", label: "Promo Codes", icon: Ticket },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/settings", label: "Store Settings", icon: Settings },
  { to: "/admin/audit", label: "Audit Log", icon: FileText },
  { to: "/admin/account", label: "Account", icon: User },
];

export function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout, isLoggingOut } = useAuth();
  const { orders } = useOrders();
  const { reservations } = useReservations();
  const { lowStock } = useProducts();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();
  const sidebarRef = useRef<HTMLElement>(null);
  const topbarRef = useRef<HTMLElement>(null);

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const pendingRes = reservations.filter((r) => r.status === "pending").length;
  const totalNotifs = pendingOrders + pendingRes + lowStock.length;

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // admin-only dark class sync - keeps public site always light
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) root.classList.add("dark");
    else root.classList.remove("dark");
    return () => {
      // when leaving admin, ensure dark is removed (public is light-only)
      root.classList.remove("dark");
    };
  }, [isDark]);

  // subtle entrance - keep visible by default, animate without leaving opacity 0
  useEffect(() => {
    if (!sidebarRef.current || !topbarRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(sidebarRef.current, { x: -12 }, { x: 0, duration: 0.4, ease: "power2.out", clearProps: "all" });
      gsap.fromTo(topbarRef.current, { y: -8 }, { y: 0, duration: 0.35, ease: "power2.out", clearProps: "all" });
    });
    return () => ctx.revert();
  }, []);

  return (
    <div className={`min-h-screen flex ${isDark ? "bg-[#0f0f0f] text-background" : "bg-background text-dark"}`}>
      {/* Sidebar desktop */}
      <aside ref={sidebarRef} className={`hidden lg:flex w-[280px] flex-col sticky top-0 h-screen overflow-hidden border-r ${isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-dark/5"}`}>
        <div className={`h-[64px] flex items-center px-4 border-b ${isDark ? "border-white/10" : "border-dark/5"}`}>
          <Link to="/admin" className="shrink-0"><Logo variant="admin" light={isDark} /></Link>
          <span className={`ml-2 px-2 py-1 rounded-full text-[10px] font-poppins font-bold ${isDark ? "bg-white text-dark" : "bg-dark text-white"}`}>ADMIN</span>
          <span className={`ml-auto w-7 h-7 rounded-full flex items-center justify-center ${isDark ? "bg-white/10 text-white" : "bg-dark/5 text-dark"}`}><Shield size={14} /></span>
        </div>
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 no-scrollbar">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
                    className={({ isActive }) =>
                `nav-item flex items-center gap-3 px-4 py-3 rounded-full font-poppins font-semibold text-sm transition-all ${isActive ? (isDark ? "bg-white text-dark shadow-md" : "bg-dark text-white shadow-md") : isDark ? "text-white/80 hover:bg-white/10 hover:text-white" : "text-dark hover:bg-background"}`
              }
            >
              <item.icon size={16} className="w-4 h-4 shrink-0" />
              {item.label}
              {item.label === "Orders" && pendingOrders > 0 && <span className="ml-auto bg-primary text-white text-xs min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center animate-pulse">{pendingOrders}</span>}
              {item.label === "Reservations" && pendingRes > 0 && <span className="ml-auto bg-amber-500 text-white text-xs min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center animate-pulse">{pendingRes}</span>}
              {item.label === "Products" && lowStock.length > 0 && <span className="ml-auto bg-red-500 text-white text-xs min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center animate-pulse">{lowStock.length}</span>}
            </NavLink>
          ))}
        </div>
        <div className={`p-4 border-t ${isDark ? "border-white/10" : "border-dark/5"}`}>
          <div className={`rounded-2xl p-3 flex items-center gap-3 ${isDark ? "bg-white/5" : "bg-background"}`}>
            <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-poppins font-bold text-sm overflow-hidden">
              {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user?.name[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className={`font-poppins font-bold text-xs truncate ${isDark ? "text-white" : "text-dark"}`}>{user?.name}</p>
              <p className={`font-poppins text-[11px] truncate ${isDark ? "text-white/60" : "text-muted"}`}>{user?.email}</p>
            </div>
            <span className={`px-2 py-1 rounded-full text-[10px] font-poppins font-bold ${isDark ? "bg-primary text-white" : "bg-dark text-white"}`}>{user?.role}</span>
          </div>
          {/* Theme toggle inside sidebar */}
          <button onClick={toggle} className={`w-full mt-3 flex items-center justify-center gap-2 py-2.5 rounded-full font-poppins font-semibold text-sm border-2 transition-colors ${isDark ? "bg-white text-dark border-white hover:bg-background" : "bg-white border-dark/10 text-dark hover:border-dark/20"}`}>
            {isDark ? <Sun size={14} /> : <Moon size={14} />} {isDark ? "Light Mode" : "Dark Mode"}
          </button>
          <button onClick={handleLogout} disabled={isLoggingOut} className={`w-full mt-2 flex items-center justify-center gap-2 py-2.5 rounded-full font-poppins font-semibold text-sm border-2 disabled:opacity-60 ${isDark ? "bg-transparent border-white/20 text-white hover:bg-white/10" : "bg-white border-dark/10 hover:border-red-200 hover:text-red-600"}`}>
            {isLoggingOut ? <><Loader2 size={14} className="animate-spin" /> Logging out...</> : <><LogOut size={14} /> Logout</>}
          </button>
          <Link to="/" className={`block text-center mt-2 font-poppins text-xs hover:underline ${isDark ? "text-white/60 hover:text-white" : "text-muted hover:text-dark"}`}>← Back to Website</Link>
        </div>
      </aside>

      {/* Mobile overlay */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header ref={topbarRef} className={`sticky top-0 z-30 backdrop-blur border-b h-[64px] flex items-center justify-between px-4 lg:px-6 ${isDark ? "bg-[#1a1a1a]/90 border-white/10" : "bg-background/95 border-dark/5"}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setOpen(!open)} className={`lg:hidden w-10 h-10 flex items-center justify-center -ml-1 ${isDark ? "text-white" : "text-dark"}`}>
              {open ? <X size={20} /> : <Menu size={20} />}
            </button>
            <Link to="/admin" className="lg:hidden flex items-center gap-2"><Logo variant="admin" light={isDark} /><span className={`font-poppins font-bold text-xs ${isDark ? "text-white" : "text-primary"}`}>ADMIN</span></Link>
            <h1 className={`hidden lg:flex items-center gap-2 font-poppins font-bold text-lg ${isDark ? "text-white" : "text-dark"}`}><LayoutDashboard size={18} /> Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full border ${isDark ? "bg-white/5 border-white/10 text-white" : "bg-white border-dark/5 text-dark"}`}>
              <span className={`w-2 h-2 rounded-full ${totalNotifs > 0 ? "bg-amber-500 animate-pulse" : "bg-green-500"}`} />
              <span className="font-poppins font-semibold text-xs">{pendingOrders} pending • {pendingRes} reserv</span>
            </div>
            {/* Theme toggle topbar */}
            <button onClick={toggle} aria-label="Toggle theme" className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-colors ${isDark ? "bg-white text-dark border-white" : "bg-white border-dark/10 text-dark hover:border-dark/20"}`}>
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <div className="relative">
              <div className={`w-9 h-9 rounded-full flex items-center justify-center relative ${isDark ? "bg-white text-dark" : "bg-dark text-white"}`}>
                <Bell size={16} />
                {totalNotifs > 0 && <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 font-bold" style={{ borderColor: isDark ? "#1a1a1a" : "#FFFBF5" }}>{totalNotifs}</span>}
              </div>
            </div>
            <Link to="/admin/account" className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-poppins font-bold text-xs overflow-hidden hidden sm:flex">
              {user?.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user?.name[0].toUpperCase()}
            </Link>
          </div>
        </header>

        {/* Mobile drawer */}
        {open && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div className="absolute inset-0 bg-dark/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
            <div className={`mobile-drawer absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] shadow-2xl flex flex-col overflow-hidden ${isDark ? "bg-[#1a1a1a] text-white" : "bg-white text-dark"}`}>
              <div className={`h-[64px] flex items-center justify-between px-4 border-b ${isDark ? "border-white/10" : "border-dark/5"}`}>
                <Logo variant="admin" light={isDark} />
                <button onClick={() => setOpen(false)} className={`w-8 h-8 rounded-full flex items-center justify-center ${isDark ? "bg-white/10 text-white" : "bg-dark/5"}`}><X size={16} /></button>
              </div>
              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {nav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    onClick={() => setOpen(false)}
                     className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-full font-poppins font-semibold text-sm ${isActive ? (isDark ? "bg-white text-dark" : "bg-dark text-white") : isDark ? "text-white/80 hover:bg-white/10" : "text-dark hover:bg-background"}`}
                  >
                    <item.icon size={16} /> {item.label}
                  </NavLink>
                ))}
              </div>
              <div className={`p-4 border-t space-y-2 ${isDark ? "border-white/10" : "border-dark/5"}`}>
                <button onClick={toggle} className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-full font-poppins font-semibold text-sm border-2 ${isDark ? "bg-white text-dark border-white" : "bg-background border-dark/10 text-dark"}`}>
                  {isDark ? <Sun size={14} /> : <Moon size={14} />} {isDark ? "Light Mode" : "Dark Mode"}
                </button>
                <button onClick={handleLogout} disabled={isLoggingOut} className={`w-full flex items-center justify-center gap-2 py-3 rounded-full font-poppins font-semibold text-sm disabled:opacity-60 ${isDark ? "bg-white text-dark" : "bg-dark text-white"}`}>{isLoggingOut ? <><Loader2 size={14} className="animate-spin" /> Logging out...</> : <><LogOut size={14} /> Logout</>}</button>
              </div>
            </div>
          </div>
        )}

        {/* Main - responsive padding - laptop optimized */}
        <main className={`flex-1 p-3 sm:p-4 md:p-5 lg:p-6 xl:p-7 w-full pb-20 lg:pb-8 ${isDark ? "text-white" : ""}`}>
          <div className="w-full max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>

        {/* Bottom nav for mobile - responsive */}
        <nav className={`lg:hidden fixed bottom-0 inset-x-0 z-30 border-t backdrop-blur flex items-center justify-around px-2 py-2 safe-pb ${isDark ? "bg-[#1a1a1a]/95 border-white/10" : "bg-white/95 border-dark/5"}`}>
          {[
            { to: "/admin", icon: LayoutDashboard, label: "Home" },
            { to: "/admin/orders", icon: ShoppingBag, label: "Orders", badge: pendingOrders },
            { to: "/admin/products", icon: Package, label: "Products" },
            { to: "/admin/account", icon: User, label: "Account" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/admin"}
              className={({ isActive }) => `flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl font-poppins text-[10px] font-semibold transition-all ${isActive ? (isDark ? "bg-white text-dark" : "bg-dark text-white") : isDark ? "text-white/60 hover:text-white" : "text-muted hover:text-dark"}`}
            >
              <span className="relative">
                <item.icon size={18} />
                {(item as any).badge > 0 && <span className="absolute -top-1 -right-2 w-4 h-4 bg-primary text-white text-[9px] rounded-full flex items-center justify-center">{(item as any).badge}</span>}
              </span>
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
}