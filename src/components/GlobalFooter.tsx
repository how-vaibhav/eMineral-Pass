"use client";

import { useTheme } from "@/context/ThemeContext";

export function GlobalFooter() {
  const { effectiveTheme } = useTheme();
  const isDark = effectiveTheme === "dark";

  return (
    <footer
      className={`${
        isDark
          ? "border-slate-800 text-slate-400 bg-slate-950"
          : "border-slate-200 text-slate-700 bg-white"
      } border-t py-12 px-6 transition-colors`}
    >
      <div className="max-w-7xl mx-auto text-center text-sm">
        <p>
          &copy; 2026 eMineral Pass. Digital pass system under Uttar Pradesh
          Minerals Rules, 2018.
        </p>
      </div>
    </footer>
  );
}
