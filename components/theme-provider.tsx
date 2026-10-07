'use client';

import { createContext, useContext, useEffect, useLayoutEffect, useMemo, useState } from 'react';

export const DEFAULT_THEME = 'postwar_cha_chaan_teng_1950_1999';
export const THEME_STORAGE_KEY = 'hong-kong-through-film-theme';
const FOXFIRE_THEME = 'printed_hong_kong_1910_1949';

type ThemeContextValue = {
  activeTheme: string;
  setActiveTheme: (theme: string) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [activeTheme, setActiveTheme] = useState(DEFAULT_THEME);
  const [ready, setReady] = useState(false);

  useLayoutEffect(() => {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (storedTheme === FOXFIRE_THEME || storedTheme === DEFAULT_THEME) setActiveTheme(storedTheme);
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.dataset.theme = activeTheme;
    window.localStorage.setItem(THEME_STORAGE_KEY, activeTheme);
  }, [activeTheme, ready]);

  const value = useMemo(() => ({ activeTheme, setActiveTheme }), [activeTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
