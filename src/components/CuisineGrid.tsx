import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useCategories } from "../context/CategoryContext";
import { useCart, formatMMK } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useProducts } from "../context/ProductContext";
import { useSettings } from "../context/SettingsContext";
import { Utensils, Circle, ShoppingCart, AlertCircle } from "lucide-react";

function flyToCart(sourceEl: HTMLElement) {
  const desktopCart = document.getElementById("cart-icon");
  const mobileCart = document.getElementById("cart-icon-mobile");
  // pick visible cart (desktop hidden on mobile, mobile hidden on desktop)
  let cart: HTMLElement | null = null;
  if (desktopCart && desktopCart.getBoundingClientRect().width > 0) cart = desktopCart;
  else if (mobileCart && mobileCart.getBoundingClientRect().width > 0) cart = mobileCart;
  else cart = desktopCart || mobileCart;
  if (!cart || !sourceEl) return;
  const srcRect = sourceEl.getBoundingClientRect();
  const cartRect = cart.getBoundingClientRect();

  // small waste-like particle - NOT big image
  const dot = document.createElement("div");
  // center of source (button/card)
  const startX = srcRect.left + srcRect.width / 2;
  const startY = srcRect.top + srcRect.height / 2;
  dot.style.position = "fixed";
  dot.style.left = startX - 7 + "px";
  dot.style.top = startY - 7 + "px";
  dot.style.width = "14px";
  dot.style.height = "14px";
  dot.style.borderRadius = "50%";
  dot.style.background = "#C1272E";
  dot.style.border = "2px solid white";
  dot.style.boxShadow = "0 2px 10px rgba(193,39,46,0.35)";
  dot.style.zIndex = "9999";
  dot.style.pointerEvents = "none";
  // inner little highlight to look like trash/food crumb
  dot.innerHTML = `<span style="display:block;width:4px;height:4px;background:white;border-radius:50%;margin:2px 0 0 2px;opacity:0.9"></span>`;
  document.body.appendChild(dot);

  // secondary tiny crumbs following
  const crumbs: HTMLElement[] = [];
  for (let i = 0; i < 2; i++) {
    const c = document.createElement("div");
    c.style.position = "fixed";
    c.style.left = startX - 3 + Math.random() * 6 + "px";
    c.style.top = startY - 3 + Math.random() * 6 + "px";
    c.style.width = "6px";
    c.style.height = "6px";
    c.style.borderRadius = "50%";
    c.style.background = i === 0 ? "#6B7280" : "#FFF0E6";
    c.style.border = "1px solid white";
    c.style.zIndex = "9999";
    c.style.pointerEvents = "none";
    c.style.opacity = "0.9";
    document.body.appendChild(c);
    crumbs.push(c);
  }

  const deltaX = cartRect.left - startX + cartRect.width / 2;
  const deltaY = cartRect.top - startY + cartRect.height / 2;

  const tl = gsap.timeline({
    onComplete: () => {
      dot.remove();
      crumbs.forEach((c) => c.remove());
      // cart bounce both ids
      gsap.timeline()
        .to("#cart-icon, #cart-icon-mobile", { scale: 1.25, rotation: -8, duration: 0.18, ease: "power2.out" })
        .to("#cart-icon, #cart-icon-mobile", { scale: 1, rotation: 0, duration: 0.4, ease: "elastic.out(1,0.4)" });
      // slight burst at cart
      for (let i = 0; i < 5; i++) {
        const burst = document.createElement("div");
        burst.style.position = "fixed";
        burst.style.left = cartRect.left + cartRect.width / 2 + "px";
        burst.style.top = cartRect.top + cartRect.height / 2 + "px";
        burst.style.width = "5px";
        burst.style.height = "5px";
        burst.style.borderRadius = "50%";
        burst.style.background = i % 2 === 0 ? "#C1272E" : "#6B7280";
        burst.style.pointerEvents = "none";
        burst.style.zIndex = "9999";
        document.body.appendChild(burst);
        gsap.to(burst, {
          x: (Math.random() - 0.5) * 40,
          y: (Math.random() - 0.5) * 40,
          opacity: 0,
          scale: 0,
          duration: 0.5,
          ease: "power2.out",
          onComplete: () => burst.remove(),
        });
      }
    },
  });

  // 1s slow motion - tiny waste arc
  tl.to(
    dot,
    {
      x: deltaX,
      duration: 1,
      ease: "power1.inOut",
    },
    0
  )
    .to(
      dot,
      {
        y: deltaY,
        duration: 1,
        ease: "power1.inOut",
      },
      0
    )
    .to(
      dot,
      {
        scale: 0.35,
        rotation: 540,
        opacity: 0,
        duration: 1,
        ease: "power1.inOut",
      },
      0
    );

  // crumbs follow with slight delay and different arc
  crumbs.forEach((c, idx) => {
    const offsetX = (Math.random() - 0.5) * 20;
    const offsetY = -15 - Math.random() * 20;
    gsap.to(c, {
      x: deltaX + offsetX,
      y: deltaY + offsetY,
      scale: 0,
      opacity: 0,
      rotation: 360 + Math.random() * 360,
      duration: 1,
      delay: idx * 0.06,
      ease: "power1.inOut",
      onComplete: () => c.remove(),
    });
  });
}

export function CuisineGrid() {
  const [active, setActive] = useState<string>("ALL");
  const gridRef = useRef<HTMLDivElement>(null);
  const { addToCart, items: cartItems } = useCart();
  const { user, openAuth } = useAuth();
  const { products } = useProducts();
  const { settings, isStoreOpenNow } = useSettings();
  const { categories } = useCategories();

  const storeStatus = isStoreOpenNow();
  const filtered = active === "ALL" ? products.slice(0, 6) : products.filter((i) => i.category === active);

  useEffect(() => {
    if (!gridRef.current) return;
    gsap.fromTo(
      gridRef.current.querySelectorAll(".cuisine-card"),
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.07, ease: "power2.out", overwrite: true }
    );
  }, [active]);

  const handleAdd = (item: typeof products[0], e: React.MouseEvent) => {
    if (!storeStatus.open) {
      return;
    }
    const cartQty = cartItems.find((c) => c.id === item.id)?.qty || 0;
    const isOutOfStock = !item.isAvailable || item.stock <= 0 || cartQty >= item.stock;
    if (isOutOfStock) return;
    if (!user) {
      openAuth("login", "Please login to add to cart — signup if you don't have an account");
      return;
    }
    const card = (e.currentTarget as HTMLElement).closest(".cuisine-card")?.querySelector("img") as HTMLElement;
    if (card) flyToCart(card);
    addToCart({ id: item.id, name: item.name, price: item.price, image: item.image });
  };

  return (
    <section id="menu" className="bg-background pt-6 md:pt-10 pb-8 relative overflow-hidden">
      {/* bamboo leaf decor */}
      <div className="absolute right-0 top-6 w-16 md:w-20 opacity-30 pointer-events-none hidden md:block">
        <svg viewBox="0 0 80 120" className="w-full">
          <path d="M70 10 Q50 20 40 40 Q30 50 10 55 M70 25 Q45 35 35 55 M70 40 Q50 50 30 75 M70 55 Q45 70 30 95" stroke="#171717" strokeWidth="1.2" fill="none" />
          <ellipse cx="10" cy="55" rx="12" ry="5" fill="#171717" />
          <ellipse cx="35" cy="55" rx="10" ry="4" fill="#171717" />
        </svg>
      </div>

      <div className="max-w-[1160px] mx-auto px-4 md:px-8">
        <p className="font-poppins font-semibold text-primary text-[12px] md:text-[13px] tracking-[0.14em]">7 LEVELS • 1 SOUL</p>
        <h2 className="font-poppins font-bold text-dark text-[28px] md:text-[32px] leading-[1.1] tracking-tight mt-1">KOREAN SPICY NOODLE HOUSE</h2>
        {!storeStatus.open && (
          <div className="mt-3 bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-2">
            <AlertCircle size={16} className="text-red-600" />
            <p className="font-poppins font-semibold text-red-700 text-sm">Store is closed — {storeStatus.reason} • Hours {settings.openTime} - {settings.closeTime}</p>
          </div>
        )}
        {settings.announcement && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3">
            <p className="font-poppins font-medium text-amber-800 text-sm">📢 {settings.announcement}</p>
          </div>
        )}

        {/* filters - dynamic from CategoryContext */}
        <div className="mt-5 flex flex-wrap gap-2 md:gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
              className={`font-poppins font-semibold text-[12px] md:text-[13px] tracking-[0.04em] px-5 py-2.5 md:py-3 min-h-[44px] rounded-full border-2 transition-all ${active === cat
                  ? "bg-dark text-white border-dark shadow-md scale-[1.02]"
                  : "bg-white text-dark border-dark/10 hover:border-dark/25 hover:shadow-sm"
                }`}
            >
              <span className="flex items-center gap-1.5">
                {cat === "ALL" ? null : <Utensils size={14} className="w-3.5 h-3.5" />}
                {cat}
              </span>
            </button>
          ))}
        </div>

        {/* grid - NEW card design - responsive 1 col mobile, 2 col tablet, 3 col laptop */}
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6 mt-7">
          {filtered.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-2xl border border-dark/5">
              <p className="font-poppins text-muted text-sm">No dishes in this category yet — please try another.</p>
            </div>
          ) : (
            filtered.map((item) => {
              const cartQty = cartItems.find((c) => c.id === item.id)?.qty || 0;
              const isOutOfStock = !item.isAvailable || item.stock <= 0;
              const isMaxReached = cartQty >= item.stock;
              const showOut = isOutOfStock || isMaxReached;
              return (
              <div
                key={item.id}
                className="cuisine-card bg-white rounded-2xl overflow-hidden border border-dark/5 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col"
              >
                <div className="relative aspect-[1.2] overflow-hidden bg-surface">
                  <img
                    src={item.image}
                    alt={item.name}
                    className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ${isOutOfStock ? "grayscale opacity-70" : ""}`}
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=600&fit=crop"; }}
                  />
                  <div className={`absolute top-3 left-3 backdrop-blur px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm ${showOut ? "bg-red-500 text-white" : "bg-white/95"}`}>
                    <Circle size={8} className={`w-2 h-2 ${showOut ? "fill-white text-white" : "fill-green-500 text-green-500 animate-pulse"}`} />
                    <span className={`font-poppins font-semibold text-[11px] tracking-wide ${showOut ? "text-white" : "text-dark"}`}>{showOut ? "Out of Stock" : item.stock < 5 ? `Only ${item.stock} left` : "Available"}</span>
                  </div>
                  {item.stock < 5 && item.stock > 0 && !showOut && (
                    <div className="absolute top-3 right-3 bg-amber-500 text-white px-2.5 py-1 rounded-full text-xs font-poppins font-bold shadow-sm">Low Stock</div>
                  )}
                </div>

                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-poppins font-bold text-dark text-[16px] md:text-[17px] leading-[1.3] tracking-tight line-clamp-1">{item.name}</h3>
                  <p className="font-poppins text-muted text-[12px] mt-1 leading-[1.6] line-clamp-2">{item.description || "Authentic Korean recipe with seasonal ingredients"}</p>

                  <div className="flex items-center justify-between mt-auto pt-4 gap-3">
                    <p className="font-poppins font-bold text-primary text-[18px] md:text-[19px] leading-none shrink-0">{formatMMK(item.price)}</p>
                    <button
                      onClick={(e) => handleAdd(item, e)}
                      disabled={showOut || !storeStatus.open}
                      className={`font-poppins font-semibold text-[13px] tracking-wide px-5 py-3 rounded-full active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[44px] shrink-0 whitespace-nowrap ${showOut || !storeStatus.open ? "bg-dark/10 text-muted cursor-not-allowed" : "bg-primary text-white hover:bg-primary-hover hover:shadow-lg"}`}
                    >
                      <ShoppingCart size={16} className="w-4 h-4 shrink-0" />
                      {!storeStatus.open ? "Closed" : showOut ? "Out of Stock" : "Add to cart"}
                    </button>
                  </div>
                </div>
              </div>
            )})
          )}
        </div>
      </div>

      {/* faint mountain bg */}
      <div className="absolute bottom-0 inset-x-0 h-24 opacity-[0.04] pointer-events-none">
        <svg viewBox="0 0 1440 100" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0 80 L200 30 L400 70 L600 20 L800 60 L1000 15 L1200 50 L1440 30 L1440 100 L0 100 Z" fill="#171717" />
        </svg>
      </div>
    </section>
  );
}
