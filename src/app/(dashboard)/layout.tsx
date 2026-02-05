"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeProvider } from "@/context/ThemeContext";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Create a separate component for the loading state that has access to theme
  const LoadingContent = () => {
    const { effectiveTheme } = useTheme();
    const isDark = effectiveTheme === "dark";

    return (
      <ThemeProvider>
        <div
          className={`min-h-screen flex items-center justify-center transition-colors ${isDark ? "bg-slate-950" : "bg-white"}`}
        >
          <div
            className={`text-xl font-semibold flex flex-col items-center gap-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}
          >
            <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-blue-600 animate-spin"></div>
            <span>Loading...</span>
          </div>
        </div>
      </ThemeProvider>
    );
  };

  const RedirectContent = () => {
    const { effectiveTheme } = useTheme();
    const isDark = effectiveTheme === "dark";

    return (
      <ThemeProvider>
        <div
          className={`min-h-screen flex items-center justify-center transition-colors ${isDark ? "bg-slate-950" : "bg-white"}`}
        >
          <div
            className={`text-xl font-semibold flex flex-col items-center gap-4 ${isDark ? "text-slate-300" : "text-slate-700"}`}
          >
            <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-blue-600 animate-spin"></div>
            <span>Redirecting...</span>
          </div>
        </div>
      </ThemeProvider>
    );
  };

  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return;

    // If not authenticated after loading, mark for redirect
    if (!isAuthenticated) {
      setShouldRedirect(true);
    }
  }, [isAuthenticated, isLoading]);

  // Perform redirect in a separate effect to avoid redirect loops
  useEffect(() => {
    if (shouldRedirect && !isLoading && !isAuthenticated) {
      router.push("/auth/signin");
    }
  }, [shouldRedirect, isLoading, isAuthenticated, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return <LoadingContent />;
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return <RedirectContent />;
  }

  return (
    <ThemeProvider>
      <main className="mt-16">{children}</main>
    </ThemeProvider>
  );
}
