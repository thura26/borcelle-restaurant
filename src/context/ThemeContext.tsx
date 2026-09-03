import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggle: () => void;
  setTheme: (t: Theme) => void;
};

const ThemeContext = createContext<ThemeContextType | null>(null);

function loadTheme(): Theme {
  try {
    // migrate legacy seoulk_ prefix
    const legacy = localStorage.getItem("seoulk_admin_theme") as Theme | null;
    const s = (localStorage.getItem("borcelle_admin_theme") as Theme | null) || legacy;
    if (legacy && !localStorage.getItem("borcelle_admin_theme")) {
      try { localStorage.setItem("borcelle_admin_theme", legacy); localStorage.removeItem("seoulk_admin_theme"); } catch {}
    }
    if (s === "dark" || s === "light") return s;
    // system preference
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
  } catch {}
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    return loadTheme();
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try { localStorage.setItem("borcelle_admin_theme", t); localStorage.removeItem("seoulk_admin_theme"); } catch {}
  };

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  // Dark mode is admin-only. Global html.dark toggle is now handled by AdminLayout.
  // Keep documentElement clean on public pages to enforce light theme.
  useEffect(() => {
    const isAdminPath = typeof window !== "undefined" && window.location.pathname.startsWith("/admin");
    const root = document.documentElement;
    if (!isAdminPath) {
      root.classList.remove("dark");
    }
    // AdminLayout will sync dark class when mounted; no global sync here.
  }, []);

  return <ThemeContext.Provider value={{ theme, isDark: theme === "dark", toggle, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be within ThemeProvider");
  return ctx;
}