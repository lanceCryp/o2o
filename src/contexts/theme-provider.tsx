'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('auto');
  const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    // 检测系统主题偏好和保存的主题
    const savedTheme = localStorage.getItem('o2o_theme') as Theme | null;
    const initialTheme = savedTheme || 'auto';
    setThemeState(initialTheme);

    // 计算实际主题
    const computeTheme = (t: Theme): 'light' | 'dark' => {
      if (t === 'light') return 'light';
      if (t === 'dark') return 'dark';
      // auto: 根据系统偏好
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    setActualTheme(computeTheme(initialTheme));

    // 监听系统主题变化
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'auto') {
        setActualTheme(computeTheme('auto'));
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    // 当 theme 状态变化时，更新实际主题和 localStorage
    const computeTheme = (t: Theme): 'light' | 'dark' => {
      if (t === 'light') return 'light';
      if (t === 'dark') return 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    };

    setActualTheme(computeTheme(theme));
    localStorage.setItem('o2o_theme', theme);
  }, [theme]);

  useEffect(() => {
    // 更新 document 的 class
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(actualTheme);
  }, [actualTheme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, actualTheme }}>
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
