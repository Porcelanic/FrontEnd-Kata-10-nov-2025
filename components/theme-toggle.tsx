"use client";

import { useTheme } from "@/components/theme-provider";
import { FiSun, FiMoon } from "react-icons/fi";
import { useState, useEffect } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button
        className="p-2 rounded-lg transition-all duration-300 hover:scale-110 bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10"
        aria-label="Cambiar tema"
      >
        <div className="relative w-5 h-5" />
      </button>
    );
  }

  return (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="p-2 rounded-lg transition-all duration-300 hover:scale-110 bg-white/10 hover:bg-white/20 dark:bg-white/5 dark:hover:bg-white/10"
      aria-label={
        theme === "light" ? "Cambiar a modo oscuro" : "Cambiar a modo claro"
      }
    >
      <div className="relative w-5 h-5">
        <FiSun
          className={`absolute inset-0 text-yellow-300 transition-all duration-300 ${
            theme === "light" ? "rotate-0 opacity-100" : "rotate-90 opacity-0"
          }`}
          size={20}
        />
        <FiMoon
          className={`absolute inset-0 text-blue-200 transition-all duration-300 ${
            theme === "dark" ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"
          }`}
          size={20}
        />
      </div>
    </button>
  );
}
