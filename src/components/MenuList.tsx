import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { useMenu, formatMMKFromNumber } from "../context/MenuContext";
import type { MenuTab } from "../lib/data";

export function MenuList() {
  const { menu, tabs } = useMenu();
  const [active, setActive] = useState<MenuTab>("SPICY NOODLES");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!listRef.current) return;
    gsap.fromTo(
      listRef.current.querySelectorAll(".menu-item"),
      { y: 12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.45, stagger: 0.03, ease: "power2.out", overwrite: true }
    );
  }, [active]);

  const items = (menu[active] || []) as typeof menu[typeof active];

  return (
    <section className="bg-background pt-8 md:pt-10 pb-8">
      <div className="max-w-[1160px] mx-auto px-4 md:px-8">
        <div className="text-center">
          <p className="font-bayon text-primary text-[12px] md:text-[13px] tracking-[0.14em]">BORCELLE SIGNATURE</p>
          <h2 className="font-bayon text-dark text-[30px] md:text-[34px] leading-[1.1] tracking-tight mt-1">THE MENU</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-2 md:gap-3 mt-6">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={`font-bayon text-[12px] md:text-[13px] tracking-[0.06em] px-5 md:px-6 py-2.5 md:py-3 min-h-[44px] rounded-full border transition-all ${
                active === tab
                  ? "bg-primary text-white border-primary"
                  : "bg-transparent text-dark border-dark/20 hover:border-dark/40"
              }`}
            >
              {tab} <span className="opacity-60">({menu[tab]?.length || 0})</span>
            </button>
          ))}
        </div>

        <div
          ref={listRef}
          className="mt-6 bg-surface rounded-xl p-6 md:p-8 grid md:grid-cols-2 gap-x-10 gap-y-6"
        >
          {items.length === 0 ? (
            <div className="col-span-full text-center py-8">
              <p className="font-poppins text-muted text-sm">No items available in {active}</p>
            </div>
          ) : (
            items.map((item) => {
              const isOut = !item.isAvailable || item.stock <= 0;
              return (
              <div key={item.id} className={`menu-item ${isOut ? "opacity-60" : ""}`}>
                <div className="flex items-start gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bayon text-dark text-[14px] md:text-[15px] tracking-[0.02em] leading-[1.3] flex items-center gap-2 flex-wrap">
                      {item.name}
                      {isOut ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-poppins font-bold">Out of Stock</span>
                      ) : item.stock < 5 ? (
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 text-[10px] font-poppins font-bold">Only {item.stock} left</span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200 text-[10px] font-poppins font-bold">Available</span>
                      )}
                    </h4>
                    <p className="font-inria text-muted text-[13px] md:text-[13px] leading-[1.75] mt-1.5 max-w-[340px]">
                      {item.desc}
                    </p>
                  </div>
                  <div className="dotted-line hidden md:block" />
                  <span className={`font-bayon text-[13px] md:text-[14px] shrink-0 ${isOut ? "text-red-500 line-through" : "text-dark"}`}>{formatMMKFromNumber(item.price)}</span>
                </div>
              </div>
            )})
          )}
        </div>
      </div>
    </section>
  );
}
