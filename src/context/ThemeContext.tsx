"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  ReactNode,
} from "react";

interface ThemeContextType {
  theme: "light" | "dark" | "system";
  effectiveTheme: "light" | "dark";
  toggleTheme: () => void;
  setTheme: (theme: "light" | "dark" | "system") => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_EVENT = "eMineral-theme-change";

function getStoredTheme() {
  if (typeof window === "undefined") {
    return "system" as const;
  }

  const savedTheme = localStorage.getItem("theme");
  if (
    savedTheme === "light" ||
    savedTheme === "dark" ||
    savedTheme === "system"
  ) {
    return savedTheme;
  }

  return "system" as const;
}

function subscribeToThemeChange(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const handleThemeChange = () => onStoreChange();
  window.addEventListener("storage", handleThemeChange);
  window.addEventListener(THEME_STORAGE_EVENT, handleThemeChange);

  return () => {
    window.removeEventListener("storage", handleThemeChange);
    window.removeEventListener(THEME_STORAGE_EVENT, handleThemeChange);
  };
}

function getSystemPrefersDark() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function subscribeToSystemThemeChange(onStoreChange: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
  const handleChange = () => onStoreChange();
  mediaQuery.addEventListener("change", handleChange);

  return () => mediaQuery.removeEventListener("change", handleChange);
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore<"light" | "dark" | "system">(
    subscribeToThemeChange,
    getStoredTheme,
    () => "system",
  );
  const systemPrefersDark = useSyncExternalStore<boolean>(
    subscribeToSystemThemeChange,
    getSystemPrefersDark,
    () => false,
  );

  const effectiveTheme = useMemo<"light" | "dark">(() => {
    if (theme === "system") {
      return systemPrefersDark ? "dark" : "light";
    }

    return theme;
  }, [systemPrefersDark, theme]);

  useEffect(() => {
    const root = document.documentElement;

    if (effectiveTheme === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }

    localStorage.setItem("theme", theme);
  }, [effectiveTheme, theme]);

  const toggleTheme = () => {
    const newTheme = effectiveTheme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  const setTheme = (newTheme: "light" | "dark" | "system") => {
    localStorage.setItem("theme", newTheme);
    window.dispatchEvent(new Event(THEME_STORAGE_EVENT));
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        effectiveTheme,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
