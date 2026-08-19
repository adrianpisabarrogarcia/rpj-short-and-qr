import { useEffect, useState } from 'react';

export type Theme = 'light' | 'dark';

// Single source of truth for the light/dark theme, persisted in localStorage
// and mirrored onto <html class="dark">. Used by ThemeToggle and Dashboard.
export function useTheme() {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null;
    const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(savedTheme || (preferDark ? 'dark' : 'light'));
  }, []);

  const toggleTheme = () => {
    const nextTheme: Theme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  return { theme, toggleTheme };
}
