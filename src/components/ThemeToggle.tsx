"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground opacity-50" />
    );
  }

  const isDark = resolvedTheme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="relative w-9 h-9 rounded-full border border-border hover:border-brand-sage/50 bg-card hover:bg-accent/40 flex items-center justify-center transition-all duration-200 active:scale-95 text-foreground shadow-sm"
      title={isDark ? "Переключить на светлую тему" : "Переключить на тёмную тему"}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-300 transition-transform duration-300 rotate-0 scale-100" />
      ) : (
        <Moon className="h-4 w-4 text-brand-dark transition-transform duration-300 rotate-0 scale-100" />
      )}
    </button>
  );
}
