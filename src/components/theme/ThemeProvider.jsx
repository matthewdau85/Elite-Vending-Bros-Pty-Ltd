import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(null);

const STORAGE_KEYS = {
  mode: 'evb.theme.mode',         // 'system' | 'light' | 'dark'
  sidebar: 'evb.theme.sidebar',   // 'slate' | 'indigo' | 'emerald' | 'rose' | 'zinc'
};

function getSystemDark() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

function applyTheme(mode, sidebar) {
  const root = document.documentElement;
  // Mode resolution
  const isDark = mode === 'dark' || (mode === 'system' && getSystemDark());

  // Tailwind dark-mode class
  root.classList.toggle('dark', isDark);
  // Data attributes for CSS variables
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  root.setAttribute('data-sidebar', sidebar);
}

export function ThemeProvider({ children }) {
  const [mode, setMode] = useState(() => localStorage.getItem(STORAGE_KEYS.mode) || 'system');
  const [sidebar, setSidebar] = useState(() => localStorage.getItem(STORAGE_KEYS.sidebar) || 'slate');

  // Apply on mount and when deps change
  useEffect(() => {
    applyTheme(mode, sidebar);
    localStorage.setItem(STORAGE_KEYS.mode, mode);
    localStorage.setItem(STORAGE_KEYS.sidebar, sidebar);
  }, [mode, sidebar]);

  // react to OS change if in 'system'
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = () => { if (mode === 'system') applyTheme(mode, sidebar); };
    mq.addEventListener?.('change', handler);
    return () => mq.removeEventListener?.('change', handler);
  }, [mode, sidebar]);

  const value = useMemo(() => ({
    mode, setMode,
    sidebar, setSidebar,
  }), [mode, sidebar]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}