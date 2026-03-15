"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="relative flex h-9 w-22 rounded-full border bg-muted/50" />
    );
  }

  const activeTheme = theme === "system" ? resolvedTheme : theme;

  return (
    <div className="relative flex h-9 w-22 rounded-full border bg-muted/50">
      {/* Active pill */}
      <motion.div
        className="absolute inset-y-1 left-1 w-10 rounded-full bg-background shadow-sm"
        animate={{ x: activeTheme === "dark" ? 40 : 0 }}
        initial={false}
        transition={{
          type: "spring",
          stiffness: 280,
          damping: 24,
          mass: 0.6,
        }}
      />

      {/* Light */}
      <button
        onClick={() => setTheme("light")}
        className="relative z-10 flex h-full w-1/2 items-center justify-center cursor-pointer"
        aria-label="Switch to light mode"
      >
        <Sun
          className={`h-4 w-4 transition-colors ${
            activeTheme === "light"
              ? "text-foreground"
              : "text-muted-foreground"
          }`}
        />
      </button>

      {/* Dark */}
      <button
        onClick={() => setTheme("dark")}
        className="relative z-10 flex h-full w-1/2 items-center justify-center cursor-pointer"
        aria-label="Switch to dark mode"
      >
        <Moon
          className={`h-4 w-4 transition-colors ${
            activeTheme === "dark" ? "text-foreground" : "text-muted-foreground"
          }`}
        />
      </button>
    </div>
  );
}
