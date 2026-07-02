import React, { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const preferDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (preferDark ? 'dark' : 'light');
    setTheme(initialTheme);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 bg-[#f5f7f2] dark:bg-[#1c1d1a] hover:bg-[#edf0e8] dark:hover:bg-[#22231f] text-[#6d7067] dark:text-[#d4d8cc] border border-[#edf0e8] dark:border-[#2b2d28] rounded-xl cursor-pointer transition"
      title="Cambiar tema"
    >
      {theme === 'dark' ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-indigo-600" />}
    </button>
  );
}
