"use client";

import { ThemeProvider as NextThemesProvider, ThemeProviderProps } from "next-themes";

export function ThemeProvider({
  children,
  defaultTheme = "system",
  ...props
}: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme={defaultTheme}
      enableSystem
      enableColorScheme
      disableTransitionOnChange
      storageKey="app-theme"
      {...props}
    >
      {children}
    </NextThemesProvider>
  );
}
