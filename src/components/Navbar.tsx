import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useScrollSpy } from "../hooks/useScrollSpy";
import { HeaderLogo } from "./Logo";
import { useCart, formatMMK } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import gsap from "gsap";
import { ShoppingCart, Plus, Minus, Trash2, X, Loader2 } from "lucide-react";

const navItems = [
  { label: "HOME", id: "home" },
  { label: "MENU", id: "menu" },
  { label: "ABOUT", id: "about" },
  { label: "GALLERY", id: "gallery" },
];

const rightItems = [
  { label: "RESERVATION", id: "reservation" },
  { label: "CONTACT", id: "contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [accOpen, setAccOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/";
  const activeId = useScrollSpy(["home", "menu", "about", "gallery", "reservation", "contact"], 120);
  const { items, count, total, incQty, decQty, removeFromCart } = useCart();
  const { user, logout, openAuth, isAdmin, isLoggingOut } = useAuth();
  const { products } = useProducts();

  const handleLogoutDesktop = async () => {
    setAccOpen(false);
    await logout();
    navigate("/");
  };
  const handleLogoutMobile = async () => {
    setOpen(false);
    await logout();
    navigate("/");
  };

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (count > 0) {
      gsap.fromTo("#cart-icon", { scale: 1 }, { scale: 1.18, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" });
      gsap.fromTo("#cart-icon-mobile", { scale: 1 }, { scale: 1.18, duration: 0.18, yoyo: true, repeat: 1, ease: "power2.out" });
    }
  }, [count]);

  const scrollTo = (id: string) => {
    setOpen(false);
    setCartOpen(false);
    setAccOpen(false);
    if (!isHome) {
      navigate("/");
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 80, behavior: "smooth" });
      }, 100);
      return;
    }
    const el = document.getElementById(id);
    if (el) {
      const y = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md shadow-sm" : "bg-background/85 backdrop-blur-sm"}`}
      >
        {/* Desktop: laptop perfectly centered — grid [1fr_auto_1fr] ensures nav is screen-centered */}
        <div className="hidden lg:grid lg:grid-cols-[1fr_auto_1fr] max-w-[1440px] mx-auto px-4 lg:px-6 xl:px-8 h-[76px] xl:h-[84px] items-center">
          <div className="flex items-center justify-start">
            <button onClick={() => (isHome ? scrollTo("home") : navigate("/"))} className="shrink-0">
              <HeaderLogo />
            </button>
          </div>

          <nav className="flex items-center justify-center gap-3 lg:gap-4 xl:gap-6 2xl:gap-7 justify-self-center">
            {[...navItems, ...rightItems].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`text-[11px] lg:text-[11px] xl:text-[12px] 2xl:text-[13px] tracking-[0.09em] xl:tracking-[0.1em] font-bold transition-colors py-2 px-1 lg:px-1 xl:px-1.5 min-h-[40px] flex items-center whitespace-nowrap ${activeId === item.id ? "text-primary" : "text-dark hover:text-primary"}`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center justify-end gap-2 lg:gap-3 xl:gap-4 shrink-0">

            {/* Desktop Auth - restored */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setAccOpen(!accOpen)}
                  className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-full bg-white border border-dark/10 hover:border-dark/20 shadow-sm transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-poppins font-bold text-xs overflow-hidden">
                    {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user.name[0].toUpperCase()}
                  </div>
                  <span className="font-poppins font-semibold text-dark text-xs max-w-[80px] truncate hidden xl:block">{user.name.split(" ")[0]}</span>
                  {isAdmin && <span className="hidden xl:inline-flex px-1.5 py-0.5 rounded-full bg-dark text-white text-[10px] font-poppins font-bold">ADMIN</span>}
                  <span className="text-dark/60 text-xs">▾</span>
                </button>
                {accOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl border border-dark/5 shadow-xl overflow-hidden z-50">
                    <div className="p-4 bg-background border-b border-dark/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-poppins font-bold overflow-hidden">
                          {user.avatar ? <img src={user.avatar} alt="" className="w-full h-full object-cover" /> : user.name[0].toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-poppins font-bold text-dark text-sm truncate">{user.name}</p>
                          <p className="font-poppins text-muted text-xs truncate">{user.email}</p>
                          {isAdmin && <span className="inline-flex mt-1 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-poppins font-bold">Admin</span>}
                        </div>
                      </div>
                    </div>
                    <div className="p-2 space-y-1">
                      {isAdmin && <Link to="/admin" onClick={() => setAccOpen(false)} className="block px-3 py-2.5 rounded-full bg-dark text-white font-poppins font-medium text-sm hover:bg-primary text-center">Dashboard</Link>}
                      <Link to="/account" onClick={() => setAccOpen(false)} className="block px-3 py-2.5 rounded-full font-poppins font-medium text-dark text-sm hover:bg-background">My Account</Link>
                      <Link to="/account" onClick={() => setAccOpen(false)} className="block px-3 py-2.5 rounded-full font-poppins font-medium text-dark text-sm hover:bg-background">Orders</Link>
                      <button onClick={handleLogoutDesktop} disabled={isLoggingOut} className="w-full text-left px-3 py-2.5 rounded-full font-poppins font-medium text-red-600 text-sm hover:bg-red-50 disabled:opacity-60 flex items-center gap-2">
                        {isLoggingOut ? <><Loader2 size={14} className="animate-spin" /> Logging out...</> : "Logout"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5 xl:gap-2">
                <button
                  onClick={() => openAuth("login", "Please login to continue")}
                  className="font-poppins font-semibold text-dark text-[12px] xl:text-[13px] px-4 xl:px-5 py-2 xl:py-2.5 rounded-full border border-dark/10 bg-white shadow-sm min-h-[36px] xl:min-h-[40px]"
                >
                  Login
                </button>
                <button
                  onClick={() => openAuth("signup")}
                  className="font-poppins font-semibold text-white text-[12px] xl:text-[13px] px-4 xl:px-6 py-2 xl:py-2.5 rounded-full bg-dark hover:bg-primary shadow-md hover:shadow-lg min-h-[36px] xl:min-h-[40px] transition-all"
                >
                  Sign Up
                </button>
              </div>
            )}

            <button
              id="cart-icon"
              onClick={() => setCartOpen(!cartOpen)}
              className="hidden lg:flex relative w-10 h-10 xl:w-11 xl:h-11 rounded-full bg-dark text-white items-center justify-center hover:bg-primary transition-colors shadow-md shrink-0"
              aria-label={`Cart with ${count} items`}
            >
              <ShoppingCart size={20} className="w-5 h-5 text-white" />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-[11px] font-bold min-w-[20px] h-5 px-1 rounded-full flex items-center justify-center border-2 border-background">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile: hamburger + logo left | cart right */}
        <div className="flex lg:hidden max-w-[1440px] mx-auto px-4 h-[64px] items-center gap-3">
          <button
            className="w-10 h-10 flex items-center justify-center shrink-0 -ml-1"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? (
              <X size={20} className="w-5 h-5 text-dark" />
            ) : (
              <span className="flex flex-col gap-1.5">
                <span className="block w-5 h-[2.5px] bg-dark rounded-full" />
                <span className="block w-5 h-[2.5px] bg-dark rounded-full" />
                <span className="block w-5 h-[2.5px] bg-dark rounded-full" />
              </span>
            )}
          </button>

          <button onClick={() => (isHome ? scrollTo("home") : navigate("/"))} className="flex items-center shrink-0">
            <HeaderLogo />
          </button>
          <div className="flex-1" />

          <button
            id="cart-icon-mobile"
            onClick={() => setCartOpen(!cartOpen)}
            className="relative w-10 h-10 rounded-full bg-dark text-white flex items-center justify-center hover:bg-primary transition-colors shadow-md shrink-0"
            aria-label={`Cart with ${count} items`}
          >
            <ShoppingCart size={18} className="w-[18px] h-[18px] text-white" />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-background">
                {count}
              </span>
            )}
          </button>
        </div>

        {/* Mobile drawer */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 border-t border-dark/10 bg-background ${open ? "max-h-[80vh] overflow-y-auto py-4" : "max-h-0"}`}>
          <nav className="px-4 flex flex-col gap-1">
            {[...navItems, ...rightItems].map((item) => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`text-left text-[15px] font-bold tracking-widest py-3.5 min-h-[48px] flex items-center border-b border-dark/5 last:border-0 ${activeId === item.id ? "text-primary" : "text-dark"}`}
              >
                {item.label}
              </button>
            ))}
            {!user ? (
              <div className="flex gap-3 mt-4">
                <button onClick={() => { setOpen(false); openAuth("login"); }} className="flex-1 bg-white border-2 border-dark/10 text-dark font-poppins font-semibold py-3.5 rounded-full min-h-[48px] shadow-sm">Login</button>
                <button onClick={() => { setOpen(false); openAuth("signup"); }} className="flex-1 bg-primary text-white font-poppins font-semibold py-3.5 rounded-full min-h-[48px] hover:bg-primary/90 shadow-md">Sign Up</button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 mt-4">
                {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="w-full bg-dark text-white font-poppins font-semibold py-3.5 rounded-full min-h-[48px] flex items-center justify-center shadow-sm">Dashboard</Link>}
                <div className="flex gap-3">
                  <Link to="/account" onClick={() => setOpen(false)} className="flex-1 bg-white border-2 border-dark/10 text-dark font-poppins font-semibold py-3.5 rounded-full min-h-[48px] flex items-center justify-center shadow-sm">My Account</Link>
                  <button onClick={handleLogoutMobile} disabled={isLoggingOut} className="flex-1 bg-primary text-white font-poppins font-semibold py-3.5 rounded-full min-h-[48px] hover:bg-primary/90 shadow-md flex items-center justify-center gap-2 disabled:opacity-60">
                    {isLoggingOut ? <><Loader2 size={16} className="animate-spin" /> Logging out...</> : "Logout"}
                  </button>
                </div>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Cart Drawer */}
      <div className={`fixed inset-0 z-[60] transition-all duration-300 ${cartOpen ? "visible" : "invisible"}`}>
        <div className={`absolute inset-0 bg-dark/40 backdrop-blur-sm transition-opacity ${cartOpen ? "opacity-100" : "opacity-0"}`} onClick={() => setCartOpen(false)} />
        <div className={`absolute right-0 top-0 h-full w-[92vw] max-w-[420px] bg-background shadow-2xl flex flex-col transition-transform duration-300 ${cartOpen ? "translate-x-0" : "translate-x-full"}`}>
          <div className="p-6 border-b border-dark/10 flex items-center justify-between bg-white">
            <h3 className="font-poppins font-bold text-dark text-[18px] tracking-tight">Your Cart • {count} items</h3>
            <button onClick={() => setCartOpen(false)} className="w-9 h-9 rounded-full bg-dark text-white hover:bg-primary flex items-center justify-center shadow-sm transition-colors">
              <X size={14} className="w-[14px] h-[14px] text-white" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 mx-auto rounded-full bg-surface flex items-center justify-center">
                  <ShoppingCart size={28} className="w-7 h-7 text-muted" />
                </div>
                <p className="font-poppins font-semibold text-dark mt-4">Cart is empty</p>
                <p className="font-poppins text-muted text-sm mt-1 leading-[1.75]">Add delicious Korean fire bowls to get started</p>
                <button onClick={() => { setCartOpen(false); scrollTo("menu"); }} className="mt-6 bg-primary text-white font-poppins font-semibold text-[14px] px-6 py-3 rounded-full hover:bg-primary/90">Explore Menu</button>
              </div>
            ) : (
              items.map((item) => {
                const prod = products.find((p) => p.id === item.id);
                const maxStock = prod?.stock ?? 999;
                const isMax = item.qty >= maxStock;
                return (
                <div key={item.id} className="bg-white rounded-2xl p-3 flex gap-3 border border-dark/5 shadow-sm">
                  <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-poppins font-semibold text-dark text-[13px] leading-[1.3] line-clamp-1">{item.name}</h4>
                    <p className="font-poppins font-bold text-primary text-[13px] mt-1">{formatMMK(item.price)}</p>
                    {prod && <p className={`font-poppins text-[11px] mt-1 ${isMax ? "text-red-500 font-semibold" : "text-muted"}`}>{isMax ? "Max stock reached" : `${maxStock - item.qty} left`}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => decQty(item.id)} className="w-7 h-7 rounded-full border border-dark/15 flex items-center justify-center hover:bg-dark hover:text-white transition-colors">
                        <Minus size={12} className="w-3 h-3" />
                      </button>
                      <span className="font-poppins font-semibold text-dark text-sm min-w-[20px] text-center">{item.qty}</span>
                      <button onClick={() => incQty(item.id)} disabled={isMax} className={`w-7 h-7 rounded-full border flex items-center justify-center transition-colors ${isMax ? "border-dark/5 bg-dark/5 text-muted cursor-not-allowed" : "border-dark/15 hover:bg-dark hover:text-white"}`}>
                        <Plus size={12} className="w-3 h-3" />
                      </button>
                      <button onClick={() => removeFromCart(item.id)} className="ml-auto text-[12px] font-poppins font-medium text-muted hover:text-primary underline flex items-center gap-1">
                        <Trash2 size={12} className="w-3 h-3" /> Remove
                      </button>
                    </div>
                  </div>
                </div>
              )})
            )}
          </div>

          {items.length > 0 && (
            <div className="p-6 border-t border-dark/10 bg-white space-y-4">
              <div className="flex justify-between font-poppins">
                <span className="text-muted text-sm">Subtotal</span>
                <span className="font-bold text-dark text-[18px]">{formatMMK(total)}</span>
              </div>
              <button
                onClick={() => {
                  setCartOpen(false);
                  if (!user) { openAuth("login", "Please login to checkout"); return; }
                  navigate("/checkout");
                }}
                className="w-full bg-primary text-white font-poppins font-bold text-[14px] py-4 rounded-full hover:bg-primary-hover hover:shadow-xl active:scale-[0.98] transition-all shadow-lg"
              >
                Checkout • {formatMMK(total)}
              </button>
              <p className="font-poppins text-muted text-[11px] text-center leading-[1.75]">Delivery in 30-45 min • Cash on delivery available</p>
            </div>
          )}
        </div>
      </div>
      {accOpen && <div className="fixed inset-0 z-40" onClick={() => setAccOpen(false)} />}
    </>
  );
}