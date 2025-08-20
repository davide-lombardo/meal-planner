import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    // Get saved theme from localStorage or default to 'system'
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    return savedTheme || 'system';
  });

  const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>(() => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  // Update actual theme based on system preference or user choice
  const actualTheme = theme === 'system' ? systemTheme : theme;

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.remove('light-theme', 'dark-theme');
    document.documentElement.classList.add(`${actualTheme}-theme`);
    
    // Also set a data attribute for easier CSS targeting
    document.documentElement.setAttribute('data-theme', actualTheme);
  }, [actualTheme]);

  // Save theme preference to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  return { 
    theme, 
    setTheme, 
    actualTheme,
    isSystemTheme: theme === 'system',
    isDarkTheme: actualTheme === 'dark'
  };
}
