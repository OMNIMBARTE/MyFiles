import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeDefinition, ThemeId } from '../types/theme';
import { THEMES } from './themeDefinitions';

interface ThemeContextType {
  currentTheme: ThemeDefinition;
  setTheme: (themeId: ThemeId) => void;
  availableThemes: ThemeDefinition[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'aether_theme_id';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<ThemeId>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as ThemeId;
      if (saved && THEMES[saved]) return saved;
    } catch {
      // ignore
    }
    return 'dark-glow'; // Default stunning theme
  });

  const currentTheme = THEMES[themeId] || THEMES['dark-glow'];

  useEffect(() => {
    const root = document.documentElement;
    const { colors } = currentTheme;

    root.style.setProperty('--color-bg-base', colors.bgBase);
    root.style.setProperty('--color-bg-surface', colors.bgSurface);
    root.style.setProperty('--color-bg-card', colors.bgCard);
    root.style.setProperty('--color-bg-hover', colors.bgHover);
    root.style.setProperty('--color-bg-active', colors.bgActive);
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-border-highlight', colors.borderHighlight);
    root.style.setProperty('--color-text-primary', colors.textPrimary);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
    root.style.setProperty('--color-text-muted', colors.textMuted);
    root.style.setProperty('--color-accent', colors.accent);
    root.style.setProperty('--color-accent-subtle', colors.accentSubtle);
    root.style.setProperty('--color-accent-glow', colors.accentGlow);
    root.style.setProperty('--color-glow', colors.glow);

    try {
      localStorage.setItem(STORAGE_KEY, themeId);
    } catch {
      // ignore
    }
  }, [currentTheme, themeId]);

  const setTheme = (id: ThemeId) => {
    if (THEMES[id]) {
      setThemeId(id);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        availableThemes: Object.values(THEMES),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
