import { tickerItems } from "../lib/data";
import { Fish, Soup, Package, Utensils } from "lucide-react";

const tickerIconMap: Record<string, React.ElementType> = {
  "SUSHI ROLL": Fish,
  SASHIMI: Fish,
  RAMEN: Soup,
  UDON: Soup,
  BENTO: Package,
  "MISO SOUP": Soup,
  "CURRY RICE": Utensils,
  ONIGIRI: Package,
  TAIYAKI: Fish,
};

export function Ticker() {
  const items = [...tickerItems, ...tickerItems, ...tickerItems];
  return (
    <div className="w-full bg-dark overflow-hidden py-2.5 md:py-3 relative z-20">
      <div className="flex w-max marquee">
        {items.map((item, i) => {
          const Icon = tickerIconMap[item.label] || Fish;
          return (
            <div key={i} className="flex items-center gap-2 md:gap-3 px-4 md:px-6 shrink-0">
              <Icon size={14} className="w-3.5 h-3.5 text-white/90 shrink-0" />
              <span className="font-bayon text-white text-[13px] md:text-[14px] tracking-[0.08em] whitespace-nowrap">
                {item.label}
              </span>
              <span className="w-1 h-1 rounded-full bg-white/40 ml-2 md:ml-3 hidden md:block" />
            </div>
          );
        })}
      </div>
    </div>
  );
}