"use client";
import { createContext, useContext, useEffect, useMemo, useState } from "react";

type Theme = "light" | "dark";

type ThemeCtx = {
  theme: Theme;
  toggle: () => void;
  set: (t: Theme) => void;
};

const Ctx = createContext<ThemeCtx | null>(null);

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "light";
    const stored = window.localStorage.getItem("theme") as Theme | null;
    if (stored) return stored;
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? "dark" : "light";
  });

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.documentElement.setAttribute("data-theme", theme);
    }
    if (typeof window !== "undefined") {
      window.localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const value = useMemo<ThemeCtx>(() => ({
    theme,
    toggle: () => setTheme(prev => (prev === "light" ? "dark" : "light")),
    set: (t: Theme) => setTheme(t),
  }), [theme]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
