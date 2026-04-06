import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getActiveTheme, CustomTheme } from '@/db/themes';

type Theme = 'light' | 'dark';

interface CustomColors {
  primary: string;
  secondary: string;
  accent: string;
}

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
  customTheme: CustomTheme | null;
  setCustomTheme: (theme: CustomTheme | null) => void;
  applyCustomColors: (colors: CustomColors) => void;
  clearCustomColors: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Helper function to convert hex to HSL
function hexToHSL(hex: string): string {
  // Remove # if present
  hex = hex.replace('#', '');
  
  // Convert hex to RGB
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  const lValue = Math.round(l * 100);
  
  return `${h} ${s}% ${lValue}%`;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    if (savedTheme) {
      return savedTheme;
    }
    
    // Check system preference
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    
    return 'light';
  });

  const [customTheme, setCustomThemeState] = useState<CustomTheme | null>(null);

  // Load active custom theme on mount
  useEffect(() => {
    const loadActiveTheme = async () => {
      const activeTheme = await getActiveTheme();
      if (activeTheme) {
        setCustomThemeState(activeTheme);
        applyCustomColors(activeTheme.colors);
      }
    };
    
    loadActiveTheme();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove both classes first
    root.classList.remove('light', 'dark');
    
    // Add the current theme class
    root.classList.add(theme);
    
    // Save to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setCustomTheme = (theme: CustomTheme | null) => {
    setCustomThemeState(theme);
    if (theme) {
      applyCustomColors(theme.colors);
    } else {
      clearCustomColors();
    }
  };

  const applyCustomColors = (colors: CustomColors) => {
    const root = window.document.documentElement;
    
    // Convert hex colors to HSL and apply as CSS variables
    if (colors.primary) {
      root.style.setProperty('--primary', hexToHSL(colors.primary));
    }
    if (colors.secondary) {
      root.style.setProperty('--secondary', hexToHSL(colors.secondary));
    }
    if (colors.accent) {
      root.style.setProperty('--accent', hexToHSL(colors.accent));
    }
    
    // Save custom colors to localStorage
    localStorage.setItem('customColors', JSON.stringify(colors));
  };

  const clearCustomColors = () => {
    const root = window.document.documentElement;
    
    // Remove custom CSS variables
    root.style.removeProperty('--primary');
    root.style.removeProperty('--secondary');
    root.style.removeProperty('--accent');
    
    // Remove from localStorage
    localStorage.removeItem('customColors');
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      toggleTheme, 
      setTheme, 
      customTheme, 
      setCustomTheme,
      applyCustomColors,
      clearCustomColors
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
