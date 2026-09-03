import type { LucideIcon } from "lucide-react";
import { useTheme } from "../../context/ThemeContext";

export function StatsCard({
  label,
  value,
  sub,
  icon: Icon,
  color = "primary",
  badge,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: LucideIcon;
  color?: "primary" | "dark" | "green" | "amber" | "blue";
  badge?: string;
}) {
  const colorMap: Record<string, string> = {
    primary: "bg-primary text-white",
    dark: "bg-dark text-white",
    green: "bg-green-500 text-white",
    amber: "bg-amber-500 text-white",
    blue: "bg-blue-500 text-white",
  };
  const { isDark } = useTheme();
  return (
    <div className={`rounded-2xl border p-4 lg:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between h-full min-h-[118px] lg:min-h-[126px] ${isDark ? "bg-[#1a1a1a] border-white/10" : "bg-white border-dark/5"}`}>
      <div className="flex items-start justify-between gap-3 flex-1">
        <div className="min-w-0 flex-1 flex flex-col">
          <p className={`font-poppins font-semibold text-[11px] tracking-[0.08em] uppercase truncate ${isDark ? "text-white/60" : "text-muted"}`}>{label}</p>
          <p className={`font-poppins font-bold text-[20px] lg:text-[22px] xl:text-[24px] leading-none mt-1.5 truncate ${isDark ? "text-white" : "text-dark"}`}>{value}</p>
          <p className={`font-poppins text-xs mt-1 truncate min-h-[16px] ${isDark ? "text-white/60" : "text-muted"}`}>{sub || "\u00A0"}</p>
        </div>
        <div className={`w-10 h-10 lg:w-11 lg:h-11 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${colorMap[color]}`}>
          <Icon size={18} className="w-[18px] h-[18px]" />
        </div>
      </div>
      <div className="mt-3 min-h-[22px] flex items-start">
        {badge ? (
          <span className={`inline-flex px-2.5 py-1 rounded-full border text-[11px] font-poppins font-semibold ${isDark ? "bg-white/10 border-white/10 text-white" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{badge}</span>
        ) : (
          <span className="inline-flex px-2.5 py-1 text-[11px] opacity-0 select-none">placeholder</span>
        )}
      </div>
    </div>
  );
}