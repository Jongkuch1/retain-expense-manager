import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

type Mode = "light" | "dark";

interface ThemeModeContextValue {
  mode: Mode;
  toggleMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextValue | undefined>(undefined);

const STORAGE_KEY = "retain_theme_mode";

function getInitialMode(): Mode {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark") return stored;
  } catch {
    // ignore storage errors
  }
  return "light";
}

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(getInitialMode);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {
      // ignore storage errors
    }
  }, [mode]);

  const value = useMemo(
    () => ({
      mode,
      toggleMode: () => setMode((m) => (m === "light" ? "dark" : "light")),
    }),
    [mode],
  );

  return <ThemeModeContext.Provider value={value}>{children}</ThemeModeContext.Provider>;
}

export function useThemeMode() {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) {
    throw new Error("useThemeMode must be used within a ThemeModeProvider");
  }
  return ctx;
}
