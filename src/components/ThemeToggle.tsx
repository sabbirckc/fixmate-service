"use client";

import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark =
      document.documentElement.classList.contains("dark") ||
      document.documentElement.getAttribute("data-theme") === "dark" ||
      localStorage.getItem("fixmate_theme") === "dark";

    setTheme(isDark ? "dark" : "light");

    const syncTheme = () => {
      const activeIsDark = document.documentElement.classList.contains("dark");
      setTheme(activeIsDark ? "dark" : "light");
    };

    window.addEventListener("fixmate-theme-change", syncTheme);
    window.addEventListener("storage", syncTheme);
    return () => {
      window.removeEventListener("fixmate-theme-change", syncTheme);
      window.removeEventListener("storage", syncTheme);
    };
  }, []);

  const toggleTheme = () => {
    const isDark = document.documentElement.classList.contains("dark");
    const next = isDark ? "light" : "dark";

    if (next === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.style.colorScheme = "dark";
    } else {
      document.documentElement.classList.remove("dark");
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.style.colorScheme = "light";
    }

    localStorage.setItem("fixmate_theme", next);
    setTheme(next);
    window.dispatchEvent(new Event("fixmate-theme-change"));
  };

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-zinc-400 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
      title={`Switch to ${theme === "light" ? "Dark" : "Light"} Mode`}
    >
      {!mounted ? (
        <span className="w-4 h-4 block" />
      ) : theme === "light" ? (
        <Moon className="w-4 h-4" />
      ) : (
        <Sun className="w-4 h-4 text-amber-400" />
      )}
    </button>
  );
}
