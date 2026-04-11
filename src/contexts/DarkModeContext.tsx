import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface DarkModeContextValue {
  isDark: boolean;
  toggle: () => void;
}

const DarkModeContext = createContext<DarkModeContextValue>({ isDark: false, toggle: () => {} });

export const useDarkMode = () => useContext(DarkModeContext);

export const DarkModeProvider = ({ children }: { children: ReactNode }) => {
  const [isDark, setIsDark] = useState(() => {
    try {
      const stored = localStorage.getItem("vgc-dark");
      if (stored !== null) return stored === "1";
    } catch {}
    return true; // default to dark for new visitors
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    try {
      localStorage.setItem("vgc-dark", isDark ? "1" : "0");
    } catch {}
  }, [isDark]);

  return (
    <DarkModeContext.Provider value={{ isDark, toggle: () => setIsDark((p) => !p) }}>
      {children}
    </DarkModeContext.Provider>
  );
};
